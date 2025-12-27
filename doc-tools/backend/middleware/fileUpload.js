const multer = require('multer');
const { UPLOAD_DIR } = require('../config');
const { existsSync, mkdirSync } = require('fs');
const { safeFileName } = require('../utils/safeFileName');

if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // 使用safeFileName工具清洗文件名，确保中文文件名正确且安全
    const sanitizedFileName = safeFileName(file.originalname);
    cb(null, sanitizedFileName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  }
});

// 单文件上传中间件
const singleUpload = upload.single('file');

// 多文件上传中间件
const uploadMultiple = upload.array('files', 50); // 最多50个文件

module.exports = {
  singleUpload,
  uploadMultiple
};