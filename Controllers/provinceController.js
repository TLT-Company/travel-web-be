import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tinhFilePath = path.join(__dirname, "..", "data", "tinh_rutgon.json");
const maTinhFilePath = path.join(__dirname, "..", "data", "ma_tinh.json");
const dataDir = path.join(__dirname, "..", "data", "xa");

export const getAllProvinces = async (req, res) => {
  try {
    const data = await readFile(tinhFilePath, "utf8");
    const list = JSON.parse(data);
    res.status(200).json({
      success: true,
      message: "lấy danh sách tỉnh/ thành phố thành công",
      data: list,
    });
  } catch (error) {
    console.error("Lỗi khi đọc JSON:", error);
    res.status(500).json({ error: "Không thể đọc danh sách tỉnh" });
  }
};

export const getAllCommunesOfProvinces = async (req, res) => {
  const id = req.params.id;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Thiếu hoặc sai định dạng 'id'" });
  }

  const filePath = path.join(dataDir, `${id}.json`);

  try {
    const fileContent = await readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);
    res.status(200).json({
      success: true,
      message: "lấy danh sách xã/ phường thành công",
      data: data,
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({ error: `Không tồn tại mã tỉnh ${id}` });
  }
};

// Lấy tỉnh từ 3 số đầu của căn cước công dân
export const getProvinceByCCCD = async (req, res) => {
  try {
    const { cccd } = req.params;

    // Kiểm tra input
    if (!cccd) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp số căn cước công dân",
      });
    }

    // Kiểm tra định dạng CCCD (12 số)
    // if (!/^\d{12}$/.test(cccd)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Số căn cước công dân phải có 12 chữ số",
    //   });
    // }

    // Lấy 3 số đầu làm mã tỉnh
    const maTinh = cccd.substring(0, 3);

    // Đọc file ma_tinh.json
    const data = await readFile(maTinhFilePath, "utf8");
    const listMaTinh = JSON.parse(data);

    // Tìm tỉnh theo mã
    const tinh = listMaTinh.find((item) => item.ma === maTinh);

    if (!tinh) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy tỉnh với mã ${maTinh}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin tỉnh thành công",
      data: {
        ma_tinh: maTinh,
        ten_tinh: tinh.ten,
        ky_tu: tinh.ky_tu,
        cccd: cccd,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy tỉnh từ CCCD:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xử lý yêu cầu",
    });
  }
};
