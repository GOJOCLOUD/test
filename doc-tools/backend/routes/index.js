const express = require('express');
const router = express.Router();
const {
  convertDocuments,
  convertTable,
  analyzeDocument,
  previewConvertedText
} = require('../controllers/documentController');
const { singleUpload, uploadMultiple } = require('../middleware/fileUpload');

// 文档转换路由 - 支持批量转换Word/PDF
router.post('/convert/documents', uploadMultiple, convertDocuments);



// 表格转换路由
router.post('/convert/table', convertTable);

// 文档分析路由
router.post('/analyze', singleUpload, analyzeDocument);

// 预览转换后的文本
router.get('/preview/:id', previewConvertedText);

module.exports = router;