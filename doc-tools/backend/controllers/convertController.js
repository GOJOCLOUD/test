const { promises: fs } = require('fs');
const path = require('path');
const { extractTextFromPDF } = require('../services/pdfToTxt.js');
const { extractTextFromWord } = require('../services/wordToTxt.js');
const { existsSync, mkdirSync } = require('fs');
const { Buffer } = require('buffer');
const { safeFileName } = require('../utils/safeFileName.js');
const { fixEncoding } = require('../utils/fixEncoding.js');

// 处理路径中的双引号问题 - 保留双引号格式但提供不带双引号的版本用于文件操作
function preservePathFormat(inputPath) {
  // 如果路径已经有双引号，保持原样
  if (inputPath.startsWith('"') && inputPath.endsWith('"')) {
    return inputPath;
  }
  // 如果没有双引号，添加双引号
  return `"${inputPath}"`;
}

// 获取不带双引号的路径，用于文件系统操作
function getCleanPath(inputPath) {
  // 移除路径两端的双引号
  if (inputPath.startsWith('"') && inputPath.endsWith('"')) {
    return inputPath.slice(1, -1);
  }
  return inputPath;
}

const wordToTxt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let { outputPath } = req.body;
    if (!outputPath) {
      return res.status(400).json({ error: 'Output path is required' });
    }

    // 处理路径中的双引号
    outputPath = preservePathFormat(outputPath);
    
    // 获取不带双引号的路径用于文件系统操作
    const cleanOutputPath = getCleanPath(outputPath);

    // 确保输出目录存在
    if (!existsSync(cleanOutputPath)) {
      try {
        mkdirSync(cleanOutputPath, { recursive: true });
      } catch (error) {
        return res.status(400).json({ error: `Cannot create output directory: ${error.message}` });
      }
    }

    // 提取文本
    const text = await extractTextFromWord(req.file.path);
    
    // 生成输出文件名，使用safeFileName工具处理
    const originalName = safeFileName(path.parse(req.file.originalname).name);
    const outputFileName = `${originalName}.txt`;
    const outputFilePath = path.join(cleanOutputPath, outputFileName);
    
    // 写入文件，使用UTF-8编码确保中文字符正确保存
    await fs.writeFile(outputFilePath, text, 'utf8');
    
    res.json({
      success: true,
      message: 'Word document converted to text successfully',
      outputPath: encodeURI(fixEncoding(outputFilePath)),
      fileName: outputFileName,
      textLength: text.length
    });
  } catch (error) {
    console.error('Error converting Word to text:', error);
    res.status(500).json({ error: `Failed to convert Word to text: ${error.message}` });
  }
};

const pdfToTxt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let { outputPath } = req.body;
    if (!outputPath) {
      return res.status(400).json({ error: 'Output path is required' });
    }

    // 处理路径中的双引号
    outputPath = preservePathFormat(outputPath);
    
    // 获取不带双引号的路径用于文件系统操作
    const cleanOutputPath = getCleanPath(outputPath);

    // 确保输出目录存在
    if (!existsSync(cleanOutputPath)) {
      try {
        mkdirSync(cleanOutputPath, { recursive: true });
      } catch (error) {
        return res.status(400).json({ error: `Cannot create output directory: ${error.message}` });
      }
    }

    // 提取文本
    const text = await extractTextFromPDF(req.file.path);
    
    // 生成输出文件名，使用safeFileName工具处理
    const originalName = safeFileName(path.parse(req.file.originalname).name);
    const outputFileName = `${originalName}.txt`;
    const outputFilePath = path.join(cleanOutputPath, outputFileName);
    
    // 写入文件，使用UTF-8编码确保中文字符正确保存
    await fs.writeFile(outputFilePath, text, 'utf8');
    
    res.json({
      success: true,
      message: 'PDF document converted to text successfully',
      outputPath: encodeURI(fixEncoding(outputFilePath)),
      fileName: outputFileName,
      textLength: text.length
    });
  } catch (error) {
    console.error('Error converting PDF to text:', error);
    res.status(500).json({ error: `Failed to convert PDF to text: ${error.message}` });
  }
};

// 批量转换Word文档
const batchWordToTxt = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    let { outputPath } = req.body;
    if (!outputPath) {
      return res.status(400).json({ error: 'Output path is required' });
    }

    // 处理路径中的双引号
    outputPath = preservePathFormat(outputPath);
    
    // 获取不带双引号的路径用于文件系统操作
    const cleanOutputPath = getCleanPath(outputPath);

    // 确保输出目录存在
    if (!existsSync(cleanOutputPath)) {
      try {
        mkdirSync(cleanOutputPath, { recursive: true });
      } catch (error) {
        return res.status(400).json({ error: `Cannot create output directory: ${error.message}` });
      }
    }

    const results = [];
    const errors = [];

    // 处理每个文件
    for (const file of req.files) {
      try {
        // 提取文本
        const text = await extractTextFromWord(file.path);
        
        // 生成输出文件名，使用safeFileName工具处理
        const originalName = safeFileName(path.parse(file.originalname).name);
        const outputFileName = `${originalName}.txt`;
        const outputFilePath = path.join(cleanOutputPath, outputFileName);
        
        // 写入文件，使用UTF-8编码确保中文字符正确保存
        await fs.writeFile(outputFilePath, text, 'utf8');
        
        results.push({
          fileName: file.originalname,
          outputFileName: outputFileName,
          outputPath: encodeURI(fixEncoding(outputFilePath)),
          textLength: text.length,
          success: true
        });
      } catch (error) {
        console.error(`Error converting ${file.originalname}:`, error);
        errors.push({
          fileName: file.originalname,
          error: error.message,
          success: false
        });
      }
    }

    res.json({
      success: true,
      message: `Processed ${req.files.length} files. ${results.length} successful, ${errors.length} failed.`,
      results,
      errors,
      totalProcessed: req.files.length,
      successCount: results.length,
      errorCount: errors.length
    });
  } catch (error) {
    console.error('Error in batch Word to text conversion:', error);
    res.status(500).json({ error: `Failed to process batch conversion: ${error.message}` });
  }
};

// 批量转换PDF文档
const batchPdfToTxt = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    let { outputPath } = req.body;
    if (!outputPath) {
      return res.status(400).json({ error: 'Output path is required' });
    }

    // 处理路径中的双引号
    outputPath = preservePathFormat(outputPath);
    
    // 获取不带双引号的路径用于文件系统操作
    const cleanOutputPath = getCleanPath(outputPath);

    // 确保输出目录存在
    if (!existsSync(cleanOutputPath)) {
      try {
        mkdirSync(cleanOutputPath, { recursive: true });
      } catch (error) {
        return res.status(400).json({ error: `Cannot create output directory: ${error.message}` });
      }
    }

    const results = [];
    const errors = [];

    // 处理每个文件
    for (const file of req.files) {
      try {
        // 提取文本
        const text = await extractTextFromPDF(file.path);
        
        // 生成输出文件名，使用safeFileName工具处理
        const originalName = safeFileName(path.parse(file.originalname).name);
        const outputFileName = `${originalName}.txt`;
        const outputFilePath = path.join(cleanOutputPath, outputFileName);
        
        // 写入文件，使用UTF-8编码确保中文字符正确保存
        await fs.writeFile(outputFilePath, text, 'utf8');
        
        results.push({
          fileName: file.originalname,
          outputFileName: outputFileName,
          outputPath: encodeURI(fixEncoding(outputFilePath)),
          textLength: text.length,
          success: true
        });
      } catch (error) {
        console.error(`Error converting ${file.originalname}:`, error);
        errors.push({
          fileName: file.originalname,
          error: error.message,
          success: false
        });
      }
    }

    res.json({
      success: true,
      message: `Processed ${req.files.length} files. ${results.length} successful, ${errors.length} failed.`,
      results,
      errors,
      totalProcessed: req.files.length,
      successCount: results.length,
      errorCount: errors.length
    });
  } catch (error) {
    console.error('Error in batch PDF to text conversion:', error);
    res.status(500).json({ error: `Failed to process batch conversion: ${error.message}` });
  }
};

module.exports = {
  wordToTxt,
  pdfToTxt,
  batchWordToTxt,
  batchPdfToTxt
};