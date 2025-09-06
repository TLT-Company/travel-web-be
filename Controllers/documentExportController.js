import DocumentExportHistory from "../models/DocumentExportHistory.js";
import Customer from "../models/Customer.js";
import DocumentCustomer from "../models/DocumentCustomer.js";
import Document from "../models/Document.js";
import AddressMapping from "../models/AddressMapping.js";
import ExcelJS from "exceljs";
import fs from "fs";
import archiver from "archiver";
import moment from "moment";
import path from "path";
import { fileURLToPath } from "url";
import { Op } from "sequelize";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_HEADERS = [
  "document_number",
  "full_name",
  "gender",
  "day_of_birth",
  "address",
  "village",
  "place_of_birth",
  "phone_number",
  "id_card_number",
  "card_created_at",
  "province_new",
  "commune_new",
];

// Get all document export histories
export const getAllDocumentExportHistories = async (req, res) => {
  try {
    const histories = await DocumentExportHistory.findAll({
      order: [["created_at", "DESC"]],
    });
    res.status(200).json({
      success: true,
      message: "Successfully retrieved document export histories",
      data: histories,
    });
  } catch (error) {
    console.error("Get all document export histories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve document export histories",
    });
  }
};

// Get document export history by ID
export const getDocumentExportHistoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await DocumentExportHistory.findByPk(id);

    if (!history) {
      return res.status(404).json({
        success: false,
        message: "Document export history not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Successfully retrieved document export history",
      data: history,
    });
  } catch (error) {
    console.error("Get document export history by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve document export history",
    });
  }
};

// Create new document export history
export const createDocumentExportHistory = async (req, res) => {
  try {
    const { kind, file_path, file_name, status } = req.body;

    const newHistory = await DocumentExportHistory.create({
      kind,
      file_path,
      file_name,
      status: status || "pending",
    });

    res.status(201).json({
      success: true,
      message: "Successfully created document export history",
      data: newHistory,
    });
  } catch (error) {
    console.error("Create document export history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create document export history",
    });
  }
};

// Update document export history
export const updateDocumentExportHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { kind, file_path, file_name, status } = req.body;

    const history = await DocumentExportHistory.findByPk(id);

    if (!history) {
      return res.status(404).json({
        success: false,
        message: "Document export history not found",
      });
    }

    await history.update({
      kind,
      file_path,
      file_name,
      status,
    });

    res.status(200).json({
      success: true,
      message: "Successfully updated document export history",
      data: history,
    });
  } catch (error) {
    console.error("Update document export history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update document export history",
    });
  }
};

// Delete document export history
export const deleteDocumentExportHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const history = await DocumentExportHistory.findByPk(id);

    if (!history) {
      return res.status(404).json({
        success: false,
        message: "Document export history not found",
      });
    }

    await history.destroy();

    res.status(200).json({
      success: true,
      message: "Successfully deleted document export history",
    });
  } catch (error) {
    console.error("Delete document export history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete document export history",
    });
  }
};

// Get document export histories by status
export const getDocumentExportHistoriesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const histories = await DocumentExportHistory.findAll({
      where: { status },
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: `Successfully retrieved document export histories with status: ${status}`,
      data: histories,
    });
  } catch (error) {
    console.error("Get document export histories by status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve document export histories by status",
    });
  }
};

// Perform analysis file - Main function
export const performAnalysisFile = async (req, res) => {
  // let documentExportTxt = null;
  let documentExportDeclaration = null;
  let documentExportGroupVN = null;
  let documentExportGroupCN = null;

  try {
    let errorsInfo = [];
    if (!req.body.file_name) {
      errorsInfo.push({ message: "Vui lòng nhập file name." });
    }
    if (errorsInfo.length !== 0) {
      throw { errors: errorsInfo, isValidateRequired: true };
    }

    const fileName = req.body.file_name;
    console.log("Name file", fileName);

    // Create document export history records
    // documentExportTxt = await DocumentExportHistory.create({
    //   kind: "encryptedList",
    //   file_name: fileName,
    //   status: "processing",
    // });
    documentExportDeclaration = await DocumentExportHistory.create({
      kind: "declarationList",
      file_name: fileName,
      status: "processing",
    });
    documentExportGroupVN = await DocumentExportHistory.create({
      kind: "groupListVN",
      file_name: fileName,
      status: "processing",
    });
    documentExportGroupCN = await DocumentExportHistory.create({
      kind: "groupListCN",
      file_name: fileName,
      status: "processing",
    });

    // Define file paths
    const txtFilePath = `./public/export/encrypted_list/${fileName}.txt`;
    const declarationListFilePath = `./public/export/declaration_list/${fileName}_form.zip`;
    const groupVNFilePath = `./public/export/group_list_vn/${fileName}_danh_sach_vn.xlsx`;
    const groupCNFilePath = `./public/export/group_list_cn/${fileName}_danh_sach_cn.xlsx`;

    // Update file paths in database
    // documentExportTxt.file_path = txtFilePath;
    documentExportDeclaration.file_path = declarationListFilePath;
    documentExportGroupVN.file_path = groupVNFilePath;
    documentExportGroupCN.file_path = groupCNFilePath;

    // Get customer data through DocumentCustomer table
    const usersInfo2 = await Customer.findAll({
      include: [
        {
          model: DocumentCustomer,
          as: "documentCustomers",
          include: [
            {
              model: Document,
              as: "document",
              where: {
                document_number: fileName,
              },
              required: true,
            },
          ],
          required: true,
        },
      ],
    }).then((results) => results.map((item) => item.dataValues));

    // Create ZIP file for declaration list
    const output = fs.createWriteStream(declarationListFilePath);
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    output.on("close", function () {
      for (const user of usersInfo2) {
        const filePath = `./public/export/declaration_list/${fileName}_${user.card_id}.xlsx`;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    });

    archive.on("error", function (err) {
      throw err;
    });

    archive.pipe(output);

    // Process each user
    for (let i = 0; i < usersInfo2.length; i++) {
      let userInfo = usersInfo2[i];

      const new_address = await AddressMapping.findAll({
        attributes: ["id", "province_new", "commune_new"],
        where: {
          id: userInfo.address_mapping_id,
        },
      });

      if (new_address && new_address.length > 0) {
        userInfo.province_new = new_address[0].province_new || "";
        userInfo.commune_new = new_address[0].commune_new || "";
      } else {
        userInfo.province_new = "";
        userInfo.commune_new = "";
      }
      // Create declaration file for each user
      const filePathDeclaration = await exportDeclarationFile(
        userInfo,
        fileName
      );
      archive.file(filePathDeclaration, {
        name: `${i + 1}.${userInfo.full_name.toUpperCase()}.${fileName}.${
          userInfo.card_id
        }.xlsx`,
      });
    }

    // Export group lists
    await exportGroupVN(usersInfo2, fileName);
    await exportGroupCN(usersInfo2, fileName);

    // Update status to success
    // documentExportTxt.status = "success";
    // await documentExportTxt.save();

    await archive.finalize();
    documentExportDeclaration.status = "success";
    await documentExportDeclaration.save();

    documentExportGroupVN.status = "success";
    await documentExportGroupVN.save();

    documentExportGroupCN.status = "success";
    await documentExportGroupCN.save();

    return res
      .status(200)
      .json({ success: true, message: "Trích xuất thông tin thành công!" });
  } catch (error) {
    // Update status to failed for all records
    // if (documentExportTxt) {
    //   documentExportTxt.status = "failed";
    //   await documentExportTxt.save();
    // }
    if (documentExportDeclaration) {
      documentExportDeclaration.status = "failed";
      await documentExportDeclaration.save();
    }
    if (documentExportGroupVN) {
      documentExportGroupVN.status = "failed";
      await documentExportGroupVN.save();
    }
    if (documentExportGroupCN) {
      documentExportGroupCN.status = "failed";
      await documentExportGroupCN.save();
    }

    console.error("Error during file upload:", error);

    return res.status(500).json({
      success: false,
      errors: error.errors,
      isValidateRequired: error.isValidateRequired,
    });
  }
};

// Helper function to export declaration file
async function exportDeclarationFile(user, fileName) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(
    path.join(
      __dirname,
      "../public/export/declaration_list/declaration_tmp.xlsx"
    )
  );
  const worksheet = workbook.getWorksheet(1);

  worksheet.pageSetup = {
    paperSize: 9, // A4 size
    orientation: "portrait",
    margins: {
      top: 1,
      bottom: 1,
      left: 0.5,
      right: 0.5,
      header: 0.5,
      footer: 0.5,
    },
    fitToPage: true,
    fitToHeight: 1,
    fitToWidth: 1,
  };

  const sourceCell = worksheet.getCell("A1");
  const targetCell = worksheet.getCell("B2");

  targetCell.value = sourceCell.value;
  targetCell.fill = sourceCell.fill;
  targetCell.font = sourceCell.font;
  targetCell.alignment = sourceCell.alignment;
  targetCell.numberFormat = sourceCell.numberFormat;

  const dayOfBirths = moment(user.day_of_birth).format("DD-MM-YYYY").split("-");
  const createdAts = moment(user.card_created_at)
    .format("DD-MM-YYYY")
    .split("-");

  worksheet.getCell("H8").value = user.full_name.toUpperCase();
  worksheet.getCell("U8").value = user.gender === "Nữ" ? "X" : "";
  worksheet.getCell("S8").value = user.gender === "Nam" ? "X" : "";
  worksheet.getCell("E9").value = dayOfBirths[0];
  worksheet.getCell("I9").value = dayOfBirths[1];
  worksheet.getCell("L9").value = dayOfBirths[2];
  worksheet.getCell("R9").value = user.place_of_birth;
  worksheet.getCell("F11").value = createdAts[0];
  worksheet.getCell("H11").value = createdAts[1];
  worksheet.getCell("J11").value = createdAts[2];
  worksheet.getCell("S11").value = user.place_of_birth;
  worksheet.getCell("E12").value = "Kinh";
  worksheet.getCell("K12").value = "Không";
  worksheet.getCell("S13").value = user.village;
  worksheet.getCell("F14").value = user.commune_new;
  worksheet.getCell("L14").value = "";
  worksheet.getCell("S14").value = user.province_new;

  const digits = user.card_id.split("");
  let startRow = 10;
  let startCol = "G".charCodeAt(0);

  // Set font size 12 for data cells
  const cellsToFormat = [
    "H8",
    "U8",
    "S8",
    "E9",
    "I9",
    "L9",
    "R9",
    "F11",
    "H11",
    "J11",
    "S11",
    "E12",
    "K12",
    "S13",
    "F14",
    "L14",
    "S14",
    "L28",
  ];

  cellsToFormat.forEach((cellAddress) => {
    const cell = worksheet.getCell(cellAddress);
    cell.font = {
      ...cell.font,
      size: 12,
      name: "Times New Roman",
    };
  });

  digits.forEach((digit, index) => {
    const cellAddress = String.fromCharCode(startCol + index) + startRow;
    const cellcc = worksheet.getCell(cellAddress);
    cellcc.value = digit;
    cellcc.font = {
      bold: true,
      size: 12,
      name: "Times New Roman",
    };
    cellcc.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  const outputPath = `./public/export/declaration_list/${fileName}_${user.card_id}.xlsx`;
  await workbook.xlsx.writeFile(outputPath);
  return outputPath;
}

// Helper function to export group CN
async function exportGroupCN(users, fileName) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(
    path.join(
      __dirname,
      "../public/export/group_list_cn/group_list_cn_tmp_v2.xlsx"
    )
  );
  const worksheet = workbook.getWorksheet(1);

  const sourceCell = worksheet.getCell("A1");
  const targetCell = worksheet.getCell("A1");

  targetCell.value = sourceCell.value;
  targetCell.fill = sourceCell.fill;
  targetCell.font = sourceCell.font;
  targetCell.alignment = sourceCell.alignment;
  targetCell.numberFormat = sourceCell.numberFormat;

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const numOrder = i + 6;
    const englishName = user.full_name
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const dayOfBirth = moment(user.day_of_birth).format("YYYYMMDD");

    const cells = [
      worksheet.getCell(`A${numOrder}`),
      worksheet.getCell(`B${numOrder}`),
      worksheet.getCell(`C${numOrder}`),
      worksheet.getCell(`D${numOrder}`),
      worksheet.getCell(`E${numOrder}`),
      worksheet.getCell(`F${numOrder}`),
    ];

    const genderCode = user.gender === "Nữ" ? "女" : "男";
    cells[0].value = `${i + 1}`;
    cells[1].value = `${englishName}`;
    cells[2].value = `${genderCode}`;
    cells[3].value = `${dayOfBirth}`;
    cells[4].value = "";
    cells[5].value = "";

    cells.forEach((cell, index) => {
      cell.font = {
        size: 16,
        name: "SimSun",
      };
      if (index === 1 || index === 3) {
        cell.font = { bold: true };
      }
    });
    setRowBorder(worksheet, numOrder);
  }
  const outputPath = `./public/export/group_list_cn/${fileName}_danh_sach_cn.xlsx`;
  await workbook.xlsx.writeFile(outputPath);
}
function setRowBorder(worksheet, rowNumber, columns = "ABCDEF") {
  for (const col of columns.split("")) {
    const cell = worksheet.getCell(`${col}${rowNumber}`);
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  }
}

// Helper function to export group VN
async function exportGroupVN(users, fileName) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(
    path.join(
      __dirname,
      "../public/export/group_list_vn/group_list_vn_tmp.xlsx"
    )
  );

  const worksheet = workbook.getWorksheet(1);

  const sourceCell = worksheet.getCell("A1");
  const targetCell = worksheet.getCell("B2");

  targetCell.value = sourceCell.value;
  targetCell.fill = sourceCell.fill;
  targetCell.font = sourceCell.font;
  targetCell.alignment = sourceCell.alignment;
  targetCell.numberFormat = sourceCell.numberFormat;

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const numOrder = i + 6;

    const cells = [
      worksheet.getCell(`B${numOrder}`),
      worksheet.getCell(`C${numOrder}`),
      worksheet.getCell(`D${numOrder}`),
      worksheet.getCell(`E${numOrder}`),
      worksheet.getCell(`F${numOrder}`),
      worksheet.getCell(`G${numOrder}`),
      worksheet.getCell(`H${numOrder}`),
    ];
    const genderCode = user.gender === "Nữ" ? "F" : "M";
    const dayOfBirth = moment(user.day_of_birth).format("DD/MM/YYYY");
    cells[0].value = `${i + 1}`;
    cells[1].value = `${user.full_name.toUpperCase()}`;
    cells[2].value = `${genderCode}`;
    cells[3].value = `${dayOfBirth}`;
    cells[4].value = `${user.card_id}`;
    cells[5].value = `${user.place_of_birth}` || "";
    cells[6].value = "";

    cells.forEach((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  }

  const outputPath = `./public/export/group_list_vn/${fileName}_danh_sach_vn.xlsx`;
  await workbook.xlsx.writeFile(outputPath);
}

// Download file by ID
export const downloadFileById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the document export history by ID
    const history = await DocumentExportHistory.findByPk(id);

    if (!history) {
      return res.status(404).json({
        success: false,
        message: "Document export history not found",
      });
    }

    // Check if file exists
    if (!history.file_path || !fs.existsSync(history.file_path)) {
      return res.status(404).json({
        success: false,
        message: "File not found on server",
      });
    }

    // Check if the export was successful
    if (history.status !== "success") {
      return res.status(400).json({
        success: false,
        message:
          "File export was not successful. Current status: " + history.status,
      });
    }

    // Get file stats
    const stats = fs.statSync(history.file_path);

    // Get file extension from file_path
    const fileExtension = path.extname(history.file_path);
    const fileName = history.file_name
      ? `${history.file_name}${fileExtension}`
      : path.basename(history.file_path);

    // Set appropriate Content-Type based on file extension
    let contentType = "application/octet-stream";
    if (fileExtension === ".xlsx") {
      contentType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    } else if (fileExtension === ".zip") {
      contentType = "application/zip";
    } else if (fileExtension === ".txt") {
      contentType = "text/plain";
    }

    // Set headers for file download
    res.setHeader("Content-Length", stats.size);
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(history.file_path);
    fileStream.pipe(res);

    // Handle stream errors
    fileStream.on("error", (error) => {
      console.error("File stream error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Error reading file",
        });
      }
    });
  } catch (error) {
    console.error("Download file by ID error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Failed to download file",
      });
    }
  }
};

const getAllCustomers = async () => {
  return await Customer.findAll({
    include: [
      {
        model: DocumentCustomer,
        as: "documentCustomers",
        include: [
          {
            model: Document,
            as: "document",
            attributes: ["document_number"],
          },
        ],
      },
      {
        model: AddressMapping,
        as: "address_mapping",
        attributes: ["province_new", "commune_new"],
      },
    ],
    order: [["created_at", "DESC"]],
    raw: false,
  });
};

const generateCustomerCSV = (customers) => {
  let csvContent = "\uFEFF";
  csvContent += CSV_HEADERS.join(",") + "\n";

  customers.forEach((customer) => {
    const row = buildCustomerRow(customer);
    csvContent += row.join(",") + "\n";
  });

  return csvContent;
};

const buildCustomerRow = (customer) => {
  const documentNumber = extractDocumentNumber(customer);
  const addressData = extractAddressData(customer);
  const formattedDates = formatCustomerDates(customer);

  return [
    `"${documentNumber}"`,
    `"${customer.full_name || ""}"`,
    `"${customer.gender || ""}"`,
    `"${formattedDates.dayOfBirth}"`,
    `"${customer.address || ""}"`,
    `"${customer.village || ""}"`,
    `"${customer.place_of_birth || ""}"`,
    `"${customer.phone_number || ""}"`,
    `"${customer.card_id || ""}"`,
    `"${formattedDates.cardCreatedAt}"`,
    `"${addressData.provinceNew}"`,
    `"${addressData.communeNew}"`,
  ];
};

const extractDocumentNumber = (customer) => {
  return customer.documentCustomers && customer.documentCustomers.length > 0
    ? customer.documentCustomers[0].document.document_number
    : "";
};

const extractAddressData = (customer) => {
  return {
    provinceNew: customer.address_mapping
      ? customer.address_mapping.province_new
      : "",
    communeNew: customer.address_mapping
      ? customer.address_mapping.commune_new
      : "",
  };
};

const formatCustomerDates = (customer) => {
  return {
    dayOfBirth: customer.day_of_birth
      ? moment(customer.day_of_birth).format("DD/MM/YYYY")
      : "",
    cardCreatedAt: customer.card_created_at
      ? moment(customer.card_created_at).format("DD/MM/YYYY")
      : "",
  };
};

const generateFileName = (prefix, extension = "csv") => {
  const timestamp = moment().format("YYYYMMDD_HHmmss");
  return `${prefix}_${timestamp}.${extension}`;
};

const writeCSVFile = (filePath, csvContent) => {
  createExportDirectory(filePath);
  fs.writeFileSync(filePath, csvContent, "utf8");
};

const createExportDirectory = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const updateExportHistory = async (history, filePath, status = "success") => {
  history.file_path = filePath;
  history.status = status; 
  await history.save();
};

const handleExportError = async (exportHistory, error) => {
  if (exportHistory) {
    await updateExportHistory(exportHistory, null, "failed");
  }
  console.error("Export error:", error);
  throw error;
};

const getAllCustomersByDocumentId = async (documentId, excludedCustomerIds = []) => {

  const whereDocCustomer = {};

  if (excludedCustomerIds.length > 0) {
    whereDocCustomer.customer_id = { [Op.notIn]: excludedCustomerIds };
  }

  return await Customer.findAll({
    include: [
      {
        model: DocumentCustomer,
        as: "documentCustomers",
        where: whereDocCustomer,
        include: [
          {
            model: Document,
            as: "document",
            where: {
              id: documentId,
            },
            attributes: ["document_number"],
            required: true,
          },
        ],
        required: true,
      },
      {
        model: AddressMapping,
        as: "address_mapping",
        attributes: ["province_new", "commune_new"],
      },
    ],
    order: [
      [
        { model: DocumentCustomer, as: "documentCustomers" },
        "created_at",
        "ASC",
      ],
    ],
    raw: false,
  });
};

export const exportAllCustomersToCSV = async (req, res) => {
  let exportHistory = null;

  try {
    const { document_id, customerIds } = req.query;

    // Convert customerIds to an array of strings/numbers
    let excludedCustomerIds = [];
    if (customerIds) {
      excludedCustomerIds = Array.isArray(customerIds) ? customerIds : [customerIds];
    }

    if (!document_id) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp document_id",
      });
    }

    const customers = await getAllCustomersByDocumentId(document_id, excludedCustomerIds);

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không có dữ liệu khách hàng nào để export",
      });
    }

    const csvContent = generateCustomerCSV(customers);
    const documentNumber =
      customers[0].documentCustomers[0].document.document_number;
    const fileName = generateFileName(documentNumber);
    const filePath = `./public/export/customer_csv/${fileName}`;

    // Create export history
    exportHistory = await DocumentExportHistory.create({
      kind: "customer_list_csv",
      file_name: fileName,
      status: "processing",
    });

    // Write CSV file
    writeCSVFile(filePath, csvContent);

    // Update export history
    await updateExportHistory(exportHistory, filePath);

    // update print_flag
    await DocumentCustomer.update(
      { print_flag: "1" },
      {
        where: {
          document_id: document_id,
          ...(excludedCustomerIds.length > 0 && {
            customer_id: { [Op.notIn]: excludedCustomerIds },
          }),
        },
      }
    );

    // Set headers for file download
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(
        fileName
      )}`
    );
    res.setHeader("Content-Length", Buffer.byteLength(csvContent, "utf8"));
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // Send CSV content directly as response
    res.status(200).send(csvContent);
  } catch (error) {
    await handleExportError(exportHistory, error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi export CSV",
    });
  }
};
