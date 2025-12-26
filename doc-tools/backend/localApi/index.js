/**
 * Local API 统一入口点
 * 
 * 此文件提供了Local API的统一入口，方便IDE开发人员导入和使用所有功能
 * 包括文档转换、表格处理和文档分析功能
 */

// 导入所有Local API模块
const convertLocal = require('./convertLocal.js');
const tableLocal = require('./tableLocal.js');
const analyzeLocal = require('./analyzeLocal.js');

// 导出所有文档转换功能
const convertWordFromPath = convertLocal.convertWordFromPath;
const convertWordFromText = convertLocal.convertWordFromText;
const convertPdfFromPath = convertLocal.convertPdfFromPath;
const convertWordBatch = convertLocal.convertWordBatch;
const convertPdfBatch = convertLocal.convertPdfBatch;

// 导出所有表格处理功能
const parseTableText = tableLocal.parseTableText;
const generateWordTableFromText = tableLocal.generateWordTableFromText;
const generateWordTableFromData = tableLocal.generateWordTableFromData;
const generateWordTableBase64 = tableLocal.generateWordTableBase64;

// 导出所有文档分析功能
const analyzeDocumentFromPath = analyzeLocal.analyzeDocumentFromPath;
const analyzeDocumentFromText = analyzeLocal.analyzeDocumentFromText;
const analyzeDocumentsBatch = analyzeLocal.analyzeDocumentsBatch;

// 统一导出对象
const localApi = {
  // 文档转换
  convert: {
    wordFromPath: convertWordFromPath,
    wordFromText: convertWordFromText,
    pdfFromPath: convertPdfFromPath,
    wordBatch: convertWordBatch,
    pdfBatch: convertPdfBatch
  },
  
  // 表格处理
  table: {
    parseText: parseTableText,
    generateWordFromText: generateWordTableFromText,
    generateWordFromData: generateWordTableFromData,
    generateWordBase64: generateWordTableBase64
  },
  
  // 文档分析
  analyze: {
    documentFromPath: analyzeDocumentFromPath,
    documentFromText: analyzeDocumentFromText,
    documentsBatch: analyzeDocumentsBatch
  }
};

// 便捷导出 - 直接导出所有功能
module.exports = {
  // 文档转换
  convertWordFromPath,
  convertWordFromText,
  convertPdfFromPath,
  convertWordBatch,
  convertPdfBatch,
  
  // 表格处理
  parseTableText,
  generateWordTableFromText,
  generateWordTableFromData,
  generateWordTableBase64,
  
  // 文档分析
  analyzeDocumentFromPath,
  analyzeDocumentFromText,
  analyzeDocumentsBatch,
  
  // 统一API对象
  localApi
};

// 默认导出
module.exports.default = localApi;