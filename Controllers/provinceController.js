import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tinhFilePath = path.join(__dirname, "..", "data", "tinh_rutgon.json");
const dataDir = path.join(__dirname, "..","data", "xa");

export const getAllProvinces = async (req, res) => {
  try {
    const data = await readFile(tinhFilePath, "utf8");
    const list = JSON.parse(data);
    res.json(list);
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

  console.log(dataDir)
  const filePath = path.join(dataDir, `${id}.json`);
  console.log(filePath)

  try {
    const fileContent = await readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);
    res.json(data);
  } catch (err) {
    console.log(err)
    res.status(404).json({ error: `Không tồn tại mã tỉnh ${id}` });
  }

};
