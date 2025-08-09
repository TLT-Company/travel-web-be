import Document from "../models/Document.js";
import DocumentCustomer from "../models/DocumentCustomer.js";
import Customer from "../models/Customer.js"
import { Op, Sequelize } from "sequelize";
import fs from 'fs';
import path from "path";
import { fileURLToPath } from "url";
import { LicenseManager, CaptureVisionRouter, EnumPresetTemplate } from "dynamsoft-capture-vision-for-node"
LicenseManager.initLicense('');

export const addCustomer = async (req, res) => {
  try {
    const document_id = Number(req.params.id);
    if (isNaN(document_id)) {
      return res.status(400).json({ success: false, message: "ID thông hành không hợp lệ" });
    }

    // find document by document_id
    const document = await Document.findByPk(document_id)

    if (!document) {
      return res.status(404).json({ message: "không tồn tại số thông hành "});
    }

    const files = req.files;
    if (files.length == 0) {
      return res.status(400).json({ message: "không có file nào được tải lên "});
    }
    const maps = new Map();
    const mapsValue = new Map();
    for (const file of files) {
      const fileBuffer = await fs.readFileSync(file.path);
      let result = await CaptureVisionRouter.captureAsync(fileBuffer, EnumPresetTemplate.PT_READ_BARCODES_READ_RATE_FIRST);

      if (result.barcodeResultItems.length > 0) {
        maps.set(file.filename, result.barcodeResultItems[0].text);
      } else {
        maps.set(file.filename, "-1");
      }
    }

    let count = 0;
    for (const [key, value] of maps) {
      if (value == '-1') {
        mapsValue.set(key, "lỗi không thể giải mã file");
        continue;
      }

      const items = value.split('|');

      if (items.length < 7) {
        mapsValue.set(key, "Dữ liệu QR không đủ để phân tích");
        continue;
      }

      const parts = items[5].split(',').map(p => p.trim());
      let province = '';
      let commune = '';
      let village = '';
      if (parts.length >= 4) {
        province = parts[parts.length - 1];
        commune = parts[parts.length - 3];
        village = parts[parts.length - 4];
      } else {
        mapsValue.set(key, "Địa chỉ không đầy đủ để phân tích");
        continue;
      }

      const provinceAfterMerge = findAfterMerge(province)

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

        // If the customer exists in the document but has been soft-deleted -> restore it
        if (exists && exists.deleted_at) {
          await exists.restore();
        }

        // update customer
        await customer.update({
          full_name: items[2],
          day_of_birth: parseDateDDMMYYYY(items[3]),
          card_created_at: parseDateDDMMYYYY(items[6]),
          gender: items[4],
          province: cleanLocationName(provinceAfterMerge),
          commune: commune,
          village: village,
          address: items[5]
        });

        // If not found, insert a new record.
        if (!exists) {
          await DocumentCustomer.create({
            document_id: document.id,
            customer_id: customer.id,
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
          province: cleanLocationName(provinceAfterMerge),
          commune: commune,
          village: village,
          address: items[5]
        });

        // If not found, insert a new record.
        await DocumentCustomer.create({
          document_id: document.id,
          customer_id: customer.id,
        });
      }
      mapsValue.set(key, "xử lý thành công")
      count++;
    }

    res.status(200).json({ success: true, message: count + "/" + maps.size, data: Array.from(mapsValue, ([key, value]) => ({ [key]: value })) })

  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: false, message: "Lỗi xử lý ảnh." });
  }
}

const parseDateDDMMYYYY = (str) => {
  const day = str.substring(0, 2);
  const month = str.substring(2, 4);
  const year = str.substring(4, 8);

  return new Date(year, month - 1, day);
}

// Đọc file JSON
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tinhFilePath = path.join(__dirname, "..", "data", "tinh_rutgon.json");
const data = JSON.parse(fs.readFileSync(tinhFilePath, 'utf8'));

const findAfterMerge = (provinceName) => {

  let result = data.find(item =>
    item.truocsapnhap.toLowerCase().includes(provinceName.toLowerCase())
  );

  if (!result) {
    result = data.find(item =>
      item.tentinh.toLowerCase().includes(provinceName.toLowerCase())
    );
  }

  if (!result) {
    return provinceName;
  }

  return result.tentinh;
}

const cleanLocationName = (name) => {
  return name.replace(/^(Thủ đô |tỉnh |Tỉnh |thành phố |Thành phố |Quận |Huyện |Thị xã |Phường |Xã |Thị trấn )/, '').trim();
}

export const addDocument = async (req, res) => {
  try {
    const document_number = req.body.document_number.trim();
    if (!document_number) {
      return res.status(400).json({ success: false, message: "thiếu số thông hành" });
    }

    const existing = await Document.findOne({ where: { document_number: document_number } });

    if (existing) {
       return res.status(409).json({ message: "số thông hành " + document_number + " đã tồn tại" });
    }

    const newDocument = await Document.create({ document_number });

    res.status(200).json({ success: true, message: 'Thêm khách số thông hành thành công', data: newDocument })
  } catch (error) {
    console.error("Create document error:", error);
    res.status(500).json({
      success: false,
      message: "lỗi thêm số thoong hành",
    });
  }
}

// Get list documents
export const getAllDocuments = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const pageSize = req.query.limit ? parseInt(req.query.limit) : 20;
    const offset = (page - 1) * pageSize;
    const whereCondition = buildDocumentFilter(req.query);

    const documents = await Document.findAll({
        attributes: [
          'id',
          'document_number',
          [Sequelize.fn('MIN', Sequelize.col('Document.created_at')), 'created_at'],
          [Sequelize.fn('COUNT', Sequelize.col('documentCustomers.customer_id')), 'customer_count'],
        ],
        include: [
          {
            model: DocumentCustomer,
            as: 'documentCustomers',
            attributes: [],
          },
        ],
        where: whereCondition,
        group: ['document_number','id'],
        raw: true,
    });

    const count = documents.length

    const sorted = documents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 20;
   const offset = (page - 1) * limit;
   const whereCondition = buildCustomerFilter(req.query);

   try {
      if (isNaN(document_id)) {
        return res.status(400).json({ success: false, message: "ID thông hành không hợp lệ" });
      }

      const document = await Document.findByPk(document_id);
      if (!document) {
        return res.status(404).json({ message: "Không tìm thấy công văn" });
      }

      const totalCustomers = await DocumentCustomer.count({
        where: { document_id: document_id },
      });

      const {rows, count} = await Customer.findAndCountAll({
        include: [{
          model: DocumentCustomer,
          required: true,
          as: "documentCustomers",
          attributes: [],
          where: {
              document_id: document_id
          }
        }],
        where: whereCondition,
        order: [['created_at', 'DESC']],
        raw: true,
      });

      const customers = rows.slice(offset, offset + limit);

      res.status(200).json({
         success: true, 
         count: count, 
         message: 'lấy thông tin chi tiết số thông hành thành công', 
         data: 
          {
            id: document_id,
            document_number: document.document_number,
            created_at: document.created_at,
            customer_count: totalCustomers,
            customers
          } 
        })
   } catch (error) {
      console.error("Get single document customers error:", error);
      res.status(500).json({ success: false, message: 'lỗi lấy thông tin chi tiết số thông hành' })
   }
}


const buildDocumentFilter = (query) => {
  const {
    document_number, start_date, end_date
  } = query;

  const where = {};

  if (document_number) {
    where.document_number = { [Op.iLike]: `%${document_number.trim()}%`}
  }

  if (start_date && end_date) {
    where.created_at = { [Op.between]: [start_date, end_date] };
  }

  return where;
}

const buildCustomerFilter = (query) => {
  const {
    card_id, full_name
  } = query;

  const where = {};

  if (card_id) {
    where.card_id = { [Op.like]: `%${card_id}%`}
  }

  if (full_name) {
    where.full_name = { [Op.iLike]: `%${full_name.trim()}%`};
  }

  return where;
}

// addCustomerToDocument
export const addCustomerToDocument = async (req, res) => {
    try {
      const { card_id, ...customerData } = req.body;
      const document_id = Number(req.params.id);

      if (isNaN(document_id)) {
        return res.status(400).json({ success: false, message: "ID thông hành không hợp lệ" });
      }

      if (!card_id) {
        return res.status(404).json({ message: "Thiếu ID thẻ" });
      }

      if (!document_id) {
        return res.status(404).json({ message: "Thiếu số thông hành" });
      }

      // find document by document_id
      const document = await Document.findByPk(document_id)

      if (!document) {
        return res.status(404).json({ message: "không tồn tại số thông hành "});
      }

      // find customer by card_id
      let customer = await Customer.findOne({ where: { card_id: card_id } });

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
          return res.status(409).json({message: "Khách hàng có CCCD " + card_id + " đã tồn tại trong số thông hành " + document.document_number})
        }

        // If the customer exists in the document but has been soft-deleted -> restore it
        if (exists && exists.deleted_at) {
          await exists.restore();
        }

        // update customer
        await customer.update(customerData);

        // If not found, insert a new record.
        if (!exists) {
          await DocumentCustomer.create({
            document_id: document.id,
            customer_id: customer.id,
          });
        }
      } else {
        //  If the customer doesn't exist -> create a new one and link it to the document
        customer = await Customer.create({ card_id, ...customerData });

        // If not found, insert a new record.
        await DocumentCustomer.create({
          document_id: document.id,
          customer_id: customer.id,
        });
      }

      res.status(200).json({ success: true, message: 'Thêm khách hàng thành công', data: customer })
    } catch (error) {
        console.error("create customers error:", error);
        res.status(500).json({ success: true, message: 'Đã xảy ra lỗi. Vui lòng thử lại sau!' })
    }
}

//Get single Customer
export const getSingleCustomer = async (req, res) => {
   try {

      const { customer_id } = req.params;

      const customer = await Customer.findByPk(customer_id);

      if (!customer) {
        return res.status(404).json({
          status: "error",
          message: "Không tìm thấy khách hàng",
        });
      }

      res.status(200).json({ success: true, count: 1, message: 'lấy thông tin khách hàng thành công', data: customer })
   } catch (error) {
      console.error("Get single document customers error:", error);
      res.status(500).json({ success: false, message: 'Lỗi lấy thông tin khách hàng' })
   }
}

//update Customer
export const updateCustomer = async (req, res) => {
   try {
      const { customer_id } = req.params;

      const updateData = { ...req.body };

      const [updatedCount, updatedRows] = await Customer.update(updateData, {
         where: { id: customer_id },
         returning: true,
      });

      if (updatedCount === 0) {
         return res.status(404).json({
            success: false,
            message: "Không tìm thấy khách hàng để cập nhật",
         });
      }

      res.status(200).json({ success: true, count: 1, message: 'Successfully', data: updatedRows[0] })
   } catch (error) {
      console.error("Get single document customers error:", error);
      res.status(500).json({ success: false, message: 'Đã xảy ra lỗi. Vui lòng thử lại sau!' })
   }
}

export const deleteCustomer = async (req, res) => {
   try {
    const {id, customer_id} = req.params;

    const document_customer = await DocumentCustomer.findOne({
      where: {
        document_id: id,
        customer_id: customer_id
      }
    });

    if (!document_customer) {
      return res.status(404).json({ message: 'Không tìm thấy customer' });
    }

    await document_customer.destroy();

    return res.status(200).json({ message: 'Xóa thành công khách hàng' });
  } catch (error) {
    console.error('Lỗi xóa:', error);
    return res.status(500).json({ message: 'Lỗi khi xóa khách hàng' });
  }
}