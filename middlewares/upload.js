// middlewares/upload.js (hoặc bạn có thể để ngay trong route)
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Tạo thư mục uploads nếu chưa có
const uploadPath = 'uploads';
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// Cấu hình multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Lưu vào thư mục uploads
  },
  filename: function (req, file, cb) {
    // Đổi tên file để tránh trùng (timestamp + tên gốc)
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}-${Date.now()}${ext}`);
  },
});

export const upload = multer({ storage });
