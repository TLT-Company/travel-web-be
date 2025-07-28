import multer from 'multer';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function handleUploadErrors(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: `Kích thước file vượt quá giới hạn ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
            });
        }

        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
    }

    return res.status(500).json({
        success: false,
        message: 'Lỗi server khi upload file',
    });
}
