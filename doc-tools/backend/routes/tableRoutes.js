/**
 * 表格转换路由
 * 处理表格文本解析和Word表格生成的路由
 */

const express = require('express');
const TableController = require('../controllers/tableController.js');

const router = express.Router();

// 将表格文本转换为Word表格
router.post('/convert', TableController.convertTableToWord);

// 仅解析表格文本，不生成Word文档
router.post('/parse', TableController.parseTableText);

// 下载生成的Word文档
router.get('/download/:fileName', TableController.downloadWordTable);

module.exports = router;