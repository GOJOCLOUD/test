const { promises: fs } = require('fs');
const path = require('path');
const { extractTextFromPDF } = require('../services/pdfToTxt.js');
const { extractTextFromWord } = require('../services/wordToTxt.js');

const { existsSync, mkdirSync } = require('fs');
const { safeFileName } = require('../utils/safeFileName.js');
const { fixEncoding } = require('../utils/fixEncoding.js');
const TableTextParser = require('../services/tableTextParser.js');
const WordTableGenerator = require('../services/wordTableGenerator.js');

// 处理路径中的双引号问题
function preservePathFormat(inputPath) {
  if (inputPath.startsWith('"') && inputPath.endsWith('"')) {
    return inputPath;
  }
  return `"${inputPath}"`;
}

// 获取不带双引号的路径，用于文件系统操作
function getCleanPath(inputPath) {
  if (inputPath.startsWith('"') && inputPath.endsWith('"')) {
    return inputPath.slice(1, -1);
  }
  return inputPath;
}

// 文档转换函数 - 支持批量转换Word/PDF
const convertDocuments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No files uploaded' 
      });
    }

    let { outputPath } = req.body;
    if (!outputPath) {
      return res.status(400).json({ 
        success: false, 
        message: 'Output path is required' 
      });
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
        return res.status(400).json({ 
          success: false, 
          message: `Cannot create output directory: ${error.message}` 
        });
      }
    }

    const results = [];
    const errors = [];

    // 处理每个文件
    for (const file of req.files) {
      try {
        const fileExtension = path.extname(file.originalname).toLowerCase();
        let text;
        
        // 根据文件类型提取文本
        if (fileExtension === '.pdf') {
          text = await extractTextFromPDF(file.path);
        } else if (fileExtension === '.docx' || fileExtension === '.doc') {
          text = await extractTextFromWord(file.path);
        } else {
          throw new Error(`Unsupported file format: ${fileExtension}`);
        }
        
        // 生成输出文件名
        const originalName = safeFileName(path.parse(file.originalname).name);
        const outputFileName = `${originalName}.txt`;
        const outputFilePath = path.join(cleanOutputPath, outputFileName);
        
        // 写入文件
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
    console.error('Error in document conversion:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to process documents: ${error.message}` 
    });
  }
};



// 表格转换函数
const convertTable = async (req, res) => {
  try {
    const { tableText, options = {} } = req.body;
    
    if (!tableText) {
      return res.status(400).json({
        success: false,
        message: '表格文本不能为空'
      });
    }
    
    // 解析表格文本
    const { rows, columnCount, rowCount } = TableTextParser.parseTableText(tableText);
    
    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: '无法解析表格文本，请检查输入格式'
      });
    }
    
    // 生成Word表格
    const { fileName, filePath, buffer } = await WordTableGenerator.generateWordTable(rows, {
      boldHeader: options.boldHeader !== false, // 默认为true
      outputDir: './uploads'
    });
    
    // 返回成功响应
    res.json({
      success: true,
      data: {
        fileName,
        filePath,
        columnCount,
        rowCount,
        parsedRows: rows
      },
      message: '表格转换成功'
    });
  } catch (error) {
    console.error('Error converting table:', error);
    res.status(500).json({
      success: false,
      message: `表格转换失败: ${error.message}`
    });
  }
};

// 文档分析函数
const analyzeDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // 提取文本
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let text;
    
    if (fileExtension === '.pdf') {
      text = await extractTextFromPDF(req.file.path);
    } else if (fileExtension === '.docx' || fileExtension === '.doc') {
      text = await extractTextFromWord(req.file.path);
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Unsupported file format' 
      });
    }

    // 这里应该调用AI服务来分析文档结构
    // 为了简化，我们返回一个基本的结构分析
    const structure = {
      paragraphs: text.split('\n\n').length,
      sentences: text.split(/[.!?]+/).length - 1,
      words: text.split(/\s+/).filter(word => word.length > 0).length,
      characters: text.length,
      estimatedReadingTime: Math.ceil(text.split(/\s+/).filter(word => word.length > 0).length / 200) // 假设每分钟200词
    };

    res.json({
      success: true,
      message: 'Document analyzed successfully',
      data: {
        structure,
        textLength: text.length
      }
    });
  } catch (error) {
    console.error('Error analyzing document:', error);
    res.status(500).json({
      success: false,
      message: `Document analysis failed: ${error.message}`
    });
  }
};

// 预览转换后文本函数
const previewConvertedText = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID is required'
      });
    }

    // 这里应该根据ID从存储中获取转换后的文本
    // 为了简化，我们返回一个示例预览
    res.json({
      success: true,
      data: {
        id,
        preview: 'This is a preview of the converted text. In a real implementation, this would fetch the actual converted text from storage.',
        format: 'text'
      }
    });
  } catch (error) {
    console.error('Error previewing text:', error);
    res.status(500).json({
      success: false,
      message: `Text preview failed: ${error.message}`
    });
  }
};

module.exports = {
  convertDocuments,
  convertTable,
  analyzeDocument,
  previewConvertedText
};