import Document from "../models/Document.js";
import DocumentCustomer from "../models/DocumentCustomer.js";
import Customer from "../models/Customer.js";
import AddressMapping from "../models/AddressMapping.js";
import { Op, Sequelize, col } from "sequelize";
import { sequelize } from "../config/database.js";
import fs from "fs";
import {
  LicenseManager,
  CaptureVisionRouter,
  EnumPresetTemplate,
} from "dynamsoft-capture-vision-for-node";
import dotenv from "dotenv";
import { TextDecoder } from "util";
import path from "path";

dotenv.config();
// TODO: Uncomment and add valid license key to .env file
LicenseManager.initLicense(process.env.LICENSE_DYNAMSOFT);

// Function to get place of birth from ma_tinh.json
const getPlaceOfBirth = (cardId) => {
  try {
    const maTinhPath = path.join(process.cwd(), "data", "ma_tinh.json");
    const maTinhData = JSON.parse(fs.readFileSync(maTinhPath, "utf8"));

    // Extract first 3 digits from card ID
    const provinceCode = cardId.substring(0, 3);

    // Find matching province in ma_tinh.json
    const province = maTinhData.find((item) => item.ma === provinceCode);

    return province ? province.ten : null;
  } catch (error) {
    console.error("Error reading ma_tinh.json:", error);
    return null;
  }
};

// scan CCCD
export const scanCCCDAndaddCustomer = async (req, res) => {
  try {
    const document_id = Number(req.params.id);
    if (isNaN(document_id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID thông hành không hợp lệ" });
    }

    // find document by document_id
    const document = await Document.findByPk(document_id);

    if (!document) {
      return res.status(404).json({ message: "không tồn tại số thông hành " });
    }

    const files = req.files;
    if (!Array.isArray(files) || files.length === 0) {
      return res
        .status(400)
        .json({ message: "không có file nào được tải lên" });
    }
    const maps = new Map();
    const mapsValue = new Map();
    const filePathMap = new Map(); // Map to store filename -> file path mapping

    for (const file of files) {
      filePathMap.set(file.originalname, file.path); // Store the mapping
      const fileBuffer = await fs.promises.readFile(file.path);
      let result = await CaptureVisionRouter.captureAsync(
        fileBuffer,
        EnumPresetTemplate.PT_READ_BARCODES_READ_RATE_FIRST
      );
      maps.set(file.originalname, result.barcodeResultItems[0]?.text || "-1");
    }

    let count = 0;
    for (const [key, value] of maps) {
      let currentValue = value;

      if (currentValue == "-1") {
        // Try to call the scan-image API as fallback
        try {
          const filePath = filePathMap.get(key);
          if (filePath) {
            console.log("Calling scan-image API for file:", key);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch(
              "https://vsttravel.com/api/scan-image",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  path: filePath,
                }),
                signal: controller.signal,
              }
            );

            clearTimeout(timeoutId);

            if (response.ok) {
              const result = await response.json();
              if (result.data) {
                console.log("Scan-image API success:", result.data);
                // Update the value with the API result
                currentValue = result.data;
                maps.set(key, result.data);
              }
            }
          }
        } catch (apiError) {
          console.error("Error calling scan-image API:", apiError);
        }

        if (currentValue == "-1") {
          mapsValue.set(key, "lỗi không thể giải mã file");
          continue;
        }
      }

      const items = currentValue.split("|");

      if (items.length < 7) {
        mapsValue.set(key, "Dữ liệu QR không đủ để phân tích");
        continue;
      }

      const parts = items[5].split(",").map((p) => p.trim());
      if (parts.length < 4) {
        mapsValue.set(key, "Địa chỉ không đầy đủ để phân tích");
        continue;
      }

      const province = parts[parts.length - 1];
      const district = parts[parts.length - 2];
      const commune = parts[parts.length - 3];
      const village = parts[parts.length - 4];

      const [record] = await AddressMapping.findOrCreate({
        where: {
          commune_old: commune,
          district_old: district,
          province_old: province,
        },
        defaults: {
          commune_old: commune,
          district_old: district,
          province_old: province,
          province_new: null,
          commune_new: null,
        },
      });

      // find customer by card_id
      let customer = await Customer.findOne({ where: { card_id: items[0] } });

      if (customer) {
        const exists = await DocumentCustomer.findOne({
          where: {
            customer_id: customer.id,
            document_id: document.id,
          },
          paranoid: false,
        });

        // check exits customer in Document
        if (exists && !exists.deleted_at) {
          mapsValue.set(key, "khách hàng đã tồn tại ở số thông hành này");
          continue;
        }

        // update customer
        await customer.update({
          full_name: items[2],
          day_of_birth: parseDateDDMMYYYY(items[3]),
          card_created_at: parseDateDDMMYYYY(items[6]),
          gender: items[4],
          address_mapping_id: record.id,
          village: village,
          address: items[5],
          national: "Việt Nam",
          place_of_birth: getPlaceOfBirth(items[0]),
        });

        // If the customer exists in the document but has been soft-deleted -> restore it
        if (exists && exists.deleted_at) {
          await exists.restore();

          exists.file_name = fixEncoding(key);
          await exists.save();
        }
        let display_order = await DocumentCustomer.max("display_order", {
          where: { document_id: document.id },
        });
        if (!display_order) {
          display_order = 0;
        }
        if (!exists) {
          await DocumentCustomer.create({
            document_id: document.id,
            customer_id: customer.id,
            file_name: fixEncoding(key),
            display_order: display_order + 1,
          });
        }
      } else {
        //  If the customer doesn't exist -> create a new one and link it to the document
        customer = await Customer.create({
          card_id: items[0],
          full_name: items[2],
          day_of_birth: parseDateDDMMYYYY(items[3]),
          card_created_at: parseDateDDMMYYYY(items[6]),
          gender: items[4],
          address_mapping_id: record.id,
          village: village,
          address: items[5],
          national: "Việt Nam",
          place_of_birth: getPlaceOfBirth(items[0]),
        });

        let display_order = await DocumentCustomer.max("display_order", {
          where: { document_id: document.id },
        });
        await DocumentCustomer.create({
          document_id: document.id,
          customer_id: customer.id,
          file_name: fixEncoding(key),
          display_order: display_order + 1,
        });
      }
      mapsValue.set(key, "xử lý thành công");
      count++;
    }

    res.status(200).json({
      success: true,
      message: count + "/" + maps.size,
      data: Array.from(mapsValue, ([key, value]) => ({ [key]: value })),
    });
  } catch (error) {
    console.error("scan cccd error:", error);
    return res
      .status(500)
      .json({ error: false, message: "Lỗi xử lý quét căn cước công dân." });
  }
};

const fixEncoding = (str) => {
  const bytes = new Uint8Array([...str].map((ch) => ch.charCodeAt(0)));
  return new TextDecoder("utf-8").decode(bytes);
};

const parseDateDDMMYYYY = (str) => {
  const day = str.substring(0, 2);
  const month = str.substring(2, 4);
  const year = str.substring(4, 8);

  return new Date(year, month - 1, day);
};

// add document
export const addDocument = async (req, res) => {
  try {
    const document_number = req.body.document_number.trim();
    const departure_date = req.body.departure_date;

    if (!document_number) {
      return res
        .status(400)
        .json({ success: false, message: "thiếu số thông hành" });
    }

    if (!departure_date) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu ngày khởi hành" });
    }

    const existing = await Document.findOne({
      where: { document_number: document_number },
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: "số thông hành " + document_number + " đã tồn tại" });
    }

    const newDocument = await Document.create({
      document_number,
      departure_date,
    });

    res.status(200).json({
      success: true,
      message: "Thêm khách số thông hành thành công",
      data: newDocument,
    });
  } catch (error) {
    console.error("Create document error:", error);
    res.status(500).json({
      success: false,
      message: "lỗi thêm số thoong hành",
    });
  }
};

// Get list documents
export const getAllDocuments = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const pageSize = req.query.limit ? parseInt(req.query.limit) : 20;
    const offset = (page - 1) * pageSize;
    const whereCondition = buildDocumentFilter(req.query);

    const documents = await Document.findAll({
      attributes: [
        "id",
        "document_number",
        [
          Sequelize.fn("MIN", Sequelize.col("Document.created_at")),
          "created_at",
        ],
        [
          Sequelize.fn("MIN", Sequelize.col("Document.departure_date")),
          "departure_date",
        ],
        [
          Sequelize.fn("COUNT", Sequelize.col("documentCustomers.customer_id")),
          "customer_count",
        ],
      ],
      include: [
        {
          model: DocumentCustomer,
          as: "documentCustomers",
          attributes: [],
        },
      ],
      where: whereCondition,
      group: ["document_number", "id"],
      raw: true,
    });

    const count = documents.length;

    const sorted = documents.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    const paged = sorted.slice(offset, offset + pageSize);

    res.status(200).json({
      success: true,
      count: count,
      message: "lấy danh sách số thông hành thành công",
      data: paged,
    });
  } catch (error) {
    console.error("Get all documents error:", error);
    res.status(500).json({
      success: false,
      message: "lỗi lấy danh sách số thông hành",
    });
  }
};

//Get single Document
export const getSingleDocument = async (req, res) => {
  const document_id = Number(req.params.id);
  // const page = parseInt(req.query.page) || 1;
  // const limit = parseInt(req.query.limit) || 20;
  // const offset = (page - 1) * limit;
  const whereCondition = buildCustomerFilter(req.query);

  try {
    if (isNaN(document_id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID thông hành không hợp lệ" });
    }

    const document = await Document.findByPk(document_id);
    if (!document) {
      return res.status(404).json({ message: "Không tìm thấy công văn" });
    }

    const totalCustomers = await DocumentCustomer.count({
      where: { document_id: document_id },
    });

    // const { rows, count } = await Customer.findAndCountAll({
    //   include: [
    //     {
    //       model: DocumentCustomer,
    //       required: true,
    //       as: "documentCustomers",
    //       attributes: ["file_name"],
    //       where: {
    //         document_id: document_id,
    //       },
    //     },
    //     {
    //       model: AddressMapping,
    //       as: "address_mapping",
    //       attributes: [
    //         "id",
    //         "province_old",
    //         "district_old",
    //         "commune_old",
    //         "province_new",
    //         "commune_new",
    //       ],
    //     },
    //   ],
    //   where: whereCondition,
    //   order: [["updated_at", "DESC"]],
    //   // raw: true,
    // });

    const { rows, count } = await DocumentCustomer.findAndCountAll({
      attributes: ["file_name", "print_flag", "display_order"],
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: [
            "id",
            "user_id",
            "card_id",
            "full_name",
            "day_of_birth",
            "gender",
            "national",
            "card_created_at",
            "village",
            ["province_code", "province"],
            ["district_code", "district"],
            ["commune_code", "commune"],
          ],
          where: whereCondition,
          include: [
            {
              model: AddressMapping,
              as: "address_mapping",
            },
          ],
        },
      ],
      where: {
        document_id: document_id,
      },
      order: [
        ["display_order", "ASC"],
        [sequelize.col("print_flag"), "ASC NULLS FIRST"],
        ["created_at", "ASC"],
      ],
    });

    // const document_customers = rows.slice(offset, offset + limit);

    res.status(200).json({
      success: true,
      count: count,
      message: "lấy thông tin chi tiết số thông hành thành công",
      data: {
        id: document_id,
        document_number: document.document_number,
        created_at: document.created_at,
        departure_date: document.departure_date,
        customer_count: totalCustomers,
        document_customers: rows,
      },
    });
  } catch (error) {
    console.error("Get single document customers error:", error);
    res.status(500).json({
      success: false,
      message: "lỗi lấy thông tin chi tiết số thông hành",
    });
  }
};

const buildDocumentFilter = (query) => {
  const { document_number, start_date, end_date } = query;

  const where = {};

  if (document_number) {
    where.document_number = { [Op.iLike]: `%${document_number.trim()}%` };
  }

  if (start_date && end_date) {
    where.created_at = { [Op.between]: [start_date, end_date] };
  }

  return where;
};

const buildCustomerFilter = (query) => {
  const { card_id, full_name } = query;

  const where = {};

  if (card_id) {
    where.card_id = { [Op.like]: `%${card_id}%` };
  }

  if (full_name) {
    where.full_name = { [Op.iLike]: `%${full_name.trim()}%` };
  }

  return where;
};

// addCustomerToDocument
export const addCustomerToDocument = async (req, res) => {
  try {
    const { card_id, commune, province, ...customerData } = req.body;
    const document_id = Number(req.params.id);

    if (isNaN(document_id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID thông hành không hợp lệ" });
    }

    if (!card_id) {
      return res.status(404).json({ message: "Thiếu ID thẻ" });
    }

    if (!document_id) {
      return res.status(404).json({ message: "Thiếu số thông hành" });
    }

    // find document by document_id
    const document = await Document.findByPk(document_id);

    if (!document) {
      return res.status(404).json({ message: "không tồn tại số thông hành " });
    }

    // find customer by card_id
    let customer = await Customer.findOne({ where: { card_id: card_id } });

    const [record] = await AddressMapping.findOrCreate({
      where: {
        commune_old: null,
        district_old: null,
        province_old: null,
        commune_new: commune,
        province_new: province,
      },
      defaults: {
        commune_old: null,
        district_old: null,
        province_old: null,
        province_new: province,
        commune_new: commune,
      },
    });

    customerData.address_mapping_id = record.id;

    // Get the maximum display_order for this document
    let display_order = await DocumentCustomer.max("display_order", {
      where: { document_id: document.id },
    });
    if (!display_order) {
      display_order = 0;
    }

    if (customer) {
      const exists = await DocumentCustomer.findOne({
        where: {
          customer_id: customer.id,
          document_id: document.id,
        },
        paranoid: false,
      });

      // check exits customer in Document
      if (exists && !exists.deleted_at) {
        return res.status(409).json({
          message:
            "Khách hàng có CCCD " +
            card_id +
            " đã tồn tại trong số thông hành " +
            document.document_number,
        });
      }

      // If the customer exists in the document but has been soft-deleted -> restore it
      if (exists && exists.deleted_at) {
        await exists.restore();

        exists.file_name = "";
        exists.display_order = display_order + 1;
        await exists.save();
      }

      // update customer
      await customer.update({
        ...customerData,
        place_of_birth: getPlaceOfBirth(card_id),
      });

      // If not found, insert a new record.
      if (!exists) {
        await DocumentCustomer.create({
          document_id: document.id,
          customer_id: customer.id,
          display_order: display_order + 1,
        });
      }
    } else {
      //  If the customer doesn't exist -> create a new one and link it to the document
      customer = await Customer.create({
        card_id,
        ...customerData,
        place_of_birth: getPlaceOfBirth(card_id),
      });

      // If not found, insert a new record.
      await DocumentCustomer.create({
        document_id: document.id,
        customer_id: customer.id,
        display_order: display_order + 1,
      });
    }

    res.status(200).json({
      success: true,
      message: "Thêm khách hàng thành công",
      data: customer,
    });
  } catch (error) {
    console.error("create customers error:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi. Vui lòng thử lại sau!",
    });
  }
};

//Get single Customer
export const getSingleCustomer = async (req, res) => {
  try {
    const { customer_id } = req.params;

    const customer = await Customer.findByPk(customer_id, {
      attributes: {
        include: [
          [col("address_mapping.province_new"), "province"],
          [col("address_mapping.commune_new"), "commune"],
        ],
      },
      include: [
        {
          model: AddressMapping,
          as: "address_mapping",
          attributes: [],
        },
      ],
      raw: true,
    });

    if (!customer) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy khách hàng",
      });
    }

    res.status(200).json({
      success: true,
      count: 1,
      message: "lấy thông tin khách hàng thành công",
      data: customer,
    });
  } catch (error) {
    console.error("Get single document customers error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi lấy thông tin khách hàng" });
  }
};

//update Customer
export const updateCustomer = async (req, res) => {
  try {
    const { customer_id } = req.params;

    if (!customer_id) {
      return res.status(400).json({
        success: false,
        message: "thiếu mã khách hàng",
      });
    }

    const { commune, province, ...updateData } = req.body;

    const customer = await Customer.findByPk(customer_id);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy khách hàng" });
    }

    let newAddressMappingId = customer.address_mapping_id;

    if (newAddressMappingId) {
      const addressMapping = await AddressMapping.findByPk(newAddressMappingId);
      if (!addressMapping) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thông tin địa chỉ của khách hàng",
        });
      } else if (
        customer.address &&
        addressMapping.commune_old &&
        addressMapping.district_old &&
        addressMapping.province_old
      ) {
        await addressMapping.update({
          commune_new: commune,
          province_new: province,
        });
      } else if (commune && province) {
        const exitsAdressMapping = await AddressMapping.findOne({
          where: {
            commune_old: null,
            district_old: null,
            province_old: null,
            commune_new: commune,
            province_new: province,
          },
        });

        if (exitsAdressMapping) {
          newAddressMappingId = exitsAdressMapping.id;
        } else {
          const newMapAddress = await AddressMapping.create({
            commune_new: commune,
            province_new: province,
          });
          newAddressMappingId = newMapAddress.id;
        }
      }
    }

    await customer.update({
      ...updateData,
      address_mapping_id: newAddressMappingId,
      place_of_birth: getPlaceOfBirth(customer.card_id),
    });

    res.status(200).json({
      success: true,
      count: 1,
      message: "Successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Get single document customers error:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi. Vui lòng thử lại sau!",
    });
  }
};

// delete customer from document
export const deleteCustomer = async (req, res) => {
  try {
    const { id, customer_id } = req.params;

    const document_customer = await DocumentCustomer.findOne({
      where: {
        document_id: id,
        customer_id: customer_id,
      },
    });

    if (!document_customer) {
      return res.status(404).json({ message: "Không tìm thấy customer" });
    }

    await document_customer.destroy();

    return res.status(200).json({ message: "Xóa thành công khách hàng" });
  } catch (error) {
    console.error("Lỗi xóa:", error);
    return res.status(500).json({ message: "Lỗi khi xóa khách hàng" });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const { document_customers, document_number, departure_date } = req.body;

    if (document_number) {
      await Document.update({ document_number }, { where: { id } });
    }

    if (departure_date) {
      await Document.update({ departure_date }, { where: { id } });
    }

    // Update display_order for document customers if provided
    if (document_customers && Array.isArray(document_customers)) {
      for (const docCustomer of document_customers) {
        const { customer, display_order } = docCustomer;
        const customer_id = customer.id;
        if (customer_id && display_order !== undefined) {
          const [updated] = await DocumentCustomer.update(
            { display_order },
            {
              where: {
                document_id: id,
                customer_id: customer_id,
              },
            }
          );
          console.log("updated", updated);
          if (updated === 0) {
            console.log(
              `Không tìm thấy customer_id ${customer_id} trong document ${id}`
            );
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật thứ tự hiển thị thành công",
    });
  } catch (e) {
    console.error("Lỗi khi cập nhật thứ tự hiển thị: ", e);
    return res
      .status(500)
      .json({ message: "Lỗi khi cập nhật thứ tự hiển thị" });
  }
};
