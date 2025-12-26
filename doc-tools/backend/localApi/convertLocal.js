const { promises: fs } = require('fs');
const path = require('path');
const { extractTextFromPDF } = require('../services/pdfToTxt.js');
const { extractTextFromWord } = require('../services/wordToTxt.js');
const { existsSync, mkdirSync } = require('fs');
const { safeFileName } = require('../utils/safeFileName.js');
const { fixEncoding } = require('../utils/fixEncoding.js');
const { v4: uuidv4 } = require('uuid');

// 创建workspace目录结构
const ensureWorkspaceDir = () => {
  const workspaceDir = path.join(process.cwd(), 'workspace');
  if (!existsSync(workspaceDir)) {
    mkdirSync(workspaceDir, { recursive: true });
  }
  return workspaceDir;
};

// 创建文件ID目录
const createFileDir = () => {
  const workspaceDir = ensureWorkspaceDir();
  const fileId = uuidv4();
  const fileDir = path.join(workspaceDir, fileId);
  mkdirSync(fileDir, { recursive: true });
  return { workspaceDir, fileDir, fileId };
};

// 统一返回格式
const createResponse = (success, data = null, error = null) => {
  return { success, data, error };
};

// Word文档转换
const convertWordFromPath = async (filePath) => {
  try {
    // 检查文件是否存在
    if (!existsSync(filePath)) {
      return createResponse(false, null, `File not found: ${filePath}`);
    }

    // 创建输出目录
    const { fileDir, fileId } = createFileDir();
    
    // 提取文本
    const text = await extractTextFromWord(filePath);
    
    // 生成输出文件名
    const originalName = safeFileName(path.parse(filePath).name);
    const outputFileName = `${originalName}.txt`;
    const outputFilePath = path.join(fileDir, outputFileName);
    
    // 写入文件，使用UTF-8编码确保中文字符正确保存
    await fs.writeFile(outputFilePath, text, 'utf8');
    
    return createResponse(true, {
      fileId,
      outputPath: fixEncoding(outputFilePath),
      fileName: outputFileName,
      textLength: text.length,
      text: text
    });
  } catch (error) {
    console.error('Error converting Word to text:', error);
    return createResponse(false, null, `Failed to convert Word to text: ${error.message}`);
  }
};

// PDF文档转换
const convertPdfFromPath = async (filePath) => {
  try {
    // 检查文件是否存在
    if (!existsSync(filePath)) {
      return createResponse(false, null, `File not found: ${filePath}`);
    }

    // 创建输出目录
    const { fileDir, fileId } = createFileDir();
    
    // 提取文本
    const text = await extractTextFromPDF(filePath);
    
    // 生成输出文件名
    const originalName = safeFileName(path.parse(filePath).name);
    const outputFileName = `${originalName}.txt`;
    const outputFilePath = path.join(fileDir, outputFileName);
    
    // 写入文件，使用UTF-8编码确保中文字符正确保存
    await fs.writeFile(outputFilePath, text, 'utf8');
    
    return createResponse(true, {
      fileId,
      outputPath: fixEncoding(outputFilePath),
      fileName: outputFileName,
      textLength: text.length,
      text: text
    });
  } catch (error) {
    console.error('Error converting PDF to text:', error);
    return createResponse(false, null, `Failed to convert PDF to text: ${error.message}`);
  }
};

// 批量转换Word文档
const convertWordBatch = async (filePaths) => {
  try {
    if (!Array.isArray(filePaths) || filePaths.length === 0) {
      return createResponse(false, null, 'Invalid file paths array');
    }

    const results = [];
    const errors = [];

    // 创建输出目录
    const { fileDir, fileId } = createFileDir();

    // 处理每个文件
    for (const filePath of filePaths) {
      try {
        // 检查文件是否存在
        if (!existsSync(filePath)) {
          errors.push({
            filePath,
            error: 'File not found',
            success: false
          });
          continue;
        }

        // 提取文本
        const text = await extractTextFromWord(filePath);
        
        // 生成输出文件名
        const originalName = safeFileName(path.parse(filePath).name);
        const outputFileName = `${originalName}.txt`;
        const outputFilePath = path.join(fileDir, outputFileName);
        
        // 写入文件，使用UTF-8编码确保中文字符正确保存
        await fs.writeFile(outputFilePath, text, 'utf8');
        
        results.push({
          filePath,
          outputFileName,
          outputPath: fixEncoding(outputFilePath),
          textLength: text.length,
          success: true
        });
      } catch (error) {
        console.error(`Error converting ${filePath}:`, error);
        errors.push({
          filePath,
          error: error.message,
          success: false
        });
      }
    }

    return createResponse(true, {
      fileId,
      results,
      errors,
      totalProcessed: filePaths.length,
      successCount: results.length,
      errorCount: errors.length
    });
  } catch (error) {
    console.error('Error in batch Word to text conversion:', error);
    return createResponse(false, null, `Batch conversion failed: ${error.message}`);
  }
};

// 批量转换PDF文档
const convertPdfBatch = async (filePaths) => {
  try {
    if (!Array.isArray(filePaths) || filePaths.length === 0) {
      return createResponse(false, null, 'Invalid file paths array');
    }

    const results = [];
    const errors = [];

    // 创建输出目录
    const { fileDir, fileId } = createFileDir();

    // 处理每个文件
    for (const filePath of filePaths) {
      try {
        // 检查文件是否存在
        if (!existsSync(filePath)) {
          errors.push({
            filePath,
            error: 'File not found',
            success: false
          });
          continue;
        }

        // 提取文本
        const text = await extractTextFromPDF(filePath);
        
        // 生成输出文件名
        const originalName = safeFileName(path.parse(filePath).name);
        const outputFileName = `${originalName}.txt`;
        const outputFilePath = path.join(fileDir, outputFileName);
        
        // 写入文件，使用UTF-8编码确保中文字符正确保存
        await fs.writeFile(outputFilePath, text, 'utf8');
        
        results.push({
          filePath,
          outputFileName,
          outputPath: fixEncoding(outputFilePath),
          textLength: text.length,
          success: true
        });
      } catch (error) {
        console.error(`Error converting ${filePath}:`, error);
        errors.push({
          filePath,
          error: error.message,
          success: false
        });
      }
    }

    return createResponse(true, {
      fileId,
      results,
      errors,
      totalProcessed: filePaths.length,
      successCount: results.length,
      errorCount: errors.length
    });
  } catch (error) {
    console.error('Error in batch PDF to text conversion:', error);
    return createResponse(false, null, `Batch conversion failed: ${error.message}`);
  }
};

module.exports = {
  convertWordFromPath,
  convertPdfFromPath,
  convertWordBatch,
  convertPdfBatch
};