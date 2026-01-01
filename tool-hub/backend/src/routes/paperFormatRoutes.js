const express = require('express');
const multer = require('multer');
const path = require('path');
const PaperFormatController = require('../controllers/PaperFormatController');

const router = express.Router();

// 配置multer存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 设置临时存储目录
    cb(null, path.join(__dirname, '../../tmp'));
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 文件过滤函数
const fileFilter = (req, file, cb) => {
  // 检查文件类型
  const filetypes = /docx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('只支持 .docx 格式的Word文档!'), false);
  }
};

// 创建multer上传实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 限制文件大小为10MB
  }
});

/**
 * 论文排版API端点
 * POST /api/tools/paper-format
 * 上传Word文档并获取排版后的文档
 */
router.post('/paper-format', upload.single('file'), PaperFormatController.formatPaper);

module.exports = router;