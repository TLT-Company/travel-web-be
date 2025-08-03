import multer from 'multer';
import path from 'path';
import fs from 'fs';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function createUploadMiddleware(customPath = 'uploads') {
  const resolvedPath = path.resolve(customPath);

  if (!fs.existsSync(resolvedPath)) {
    fs.mkdirSync(resolvedPath, { recursive: true });
  }

  const dynamicStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, resolvedPath);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);
      const fileName = `${baseName}-${Date.now()}${ext}`;

      cb(null, fileName);
    },
  });

  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif'];

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (
        allowedMimeTypes.includes(file.mimetype) &&
        allowedExtensions.includes(ext)
    ) {
        cb(null, true);
    } else {
        const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE');
        error.message = 'Chỉ cho phép upload file ảnh (jpeg, jpg, png, gif)';
        cb(error);
    }
  };


  const limits = {
    fileSize: MAX_FILE_SIZE,
  };

  return multer({ storage: dynamicStorage, fileFilter, limits });
}
