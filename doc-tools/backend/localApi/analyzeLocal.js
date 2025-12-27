const { promises: fs } = require('fs');
const path = require('path');
const { extractTextFromPDF } = require('../services/pdfToTxt.js');
const { extractTextFromWord } = require('../services/wordToTxt.js');
const { existsSync, mkdirSync } = require('fs');
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

// 文档结构分析函数
const analyzeDocumentStructure = (text) => {
  // 基本文本统计
  const lines = text.split('\n');
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
  const sentences = text.split(/[.!?。！？]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  
  // 估算阅读时间（假设每分钟200词）
  const estimatedReadingTime = Math.ceil(words.length / 200);
  
  // 检测可能的标题（全大写或以数字开头的行）
  const potentialHeadings = lines.filter(line => {
    const trimmed = line.trim();
    return trimmed.length > 0 && trimmed.length < 100 && (
      /^[A-Z\s]+$/.test(trimmed) || // 全大写
      /^\d+\./.test(trimmed) || // 数字开头
      /^[一二三四五六七八九十]+[、\.]/.test(trimmed) // 中文数字开头
    );
  });
  
  // 检测可能的列表项（以-、*、+或数字开头的行）
  const potentialListItems = lines.filter(line => {
    const trimmed = line.trim();
    return /^[-*+]\s/.test(trimmed) || // 符号开头
      /^\d+\.\s/.test(trimmed) || // 数字加点
      /^[a-zA-Z]\.\s/.test(trimmed); // 字母加点
  });
  
  // 检测表格（包含制表符或多个连续空格的行）
  const potentialTableRows = lines.filter(line => {
    return /\t/.test(line) || // 包含制表符
      / {3,}/.test(line); // 包含3个以上连续空格
  });
  
  // 语言检测（简单版）
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const primaryLanguage = chineseChars > englishWords ? 'chinese' : 'english';
  
  return {
    basicStats: {
      lines: lines.length,
      paragraphs: paragraphs.length,
      sentences: sentences.length,
      words: words.length,
      characters,
      charactersNoSpaces,
      estimatedReadingTime
    },
    structure: {
      potentialHeadings: potentialHeadings.length,
      potentialListItems: potentialListItems.length,
      potentialTableRows: potentialTableRows.length
    },
    language: {
      primary: primaryLanguage,
      chineseChars,
      englishWords
    },
    contentSample: {
      firstParagraph: paragraphs[0] || '',
      lastParagraph: paragraphs[paragraphs.length - 1] || ''
    }
  };
};

// 从文件路径分析文档
const analyzeDocumentFromPath = async (filePath) => {
  try {
    // 检查文件是否存在
    if (!existsSync(filePath)) {
      return createResponse(false, null, `File not found: ${filePath}`);
    }

    // 获取文件信息
    const fileStats = await fs.stat(filePath);
    const fileExtension = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);
    
    // 根据文件类型提取文本
    let text;
    if (fileExtension === '.pdf') {
      text = await extractTextFromPDF(filePath);
    } else if (fileExtension === '.docx' || fileExtension === '.doc') {
      text = await extractTextFromWord(filePath);
    } else if (fileExtension === '.txt') {
      text = await fs.readFile(filePath, 'utf8');
    } else {
      return createResponse(false, null, `Unsupported file format: ${fileExtension}`);
    }

    // 分析文档结构
    const analysis = analyzeDocumentStructure(text);
    
    // 创建输出目录并保存分析结果
    const { fileDir, fileId } = createFileDir();
    const analysisFileName = `${path.parse(fileName).name}_analysis.json`;
    const analysisFilePath = path.join(fileDir, analysisFileName);
    
    // 保存分析结果
    const analysisData = {
      fileInfo: {
        fileName,
        filePath,
        fileSize: fileStats.size,
        fileExtension,
        lastModified: fileStats.mtime
      },
      analysis,
      extractedText: {
        length: text.length,
        preview: text.substring(0, 500) + (text.length > 500 ? '...' : '')
      }
    };
    
    await fs.writeFile(analysisFilePath, JSON.stringify(analysisData, null, 2), 'utf8');
    
    // 保存提取的文本
    const textFileName = `${path.parse(fileName).name}.txt`;
    const textFilePath = path.join(fileDir, textFileName);
    await fs.writeFile(textFilePath, text, 'utf8');
    
    return createResponse(true, {
      fileId,
      fileInfo: analysisData.fileInfo,
      analysis: analysisData.analysis,
      extractedText: analysisData.extractedText,
      outputPath: analysisFilePath,
      textOutputPath: textFilePath
    });
  } catch (error) {
    console.error('Error analyzing document:', error);
    return createResponse(false, null, `Failed to analyze document: ${error.message}`);
  }
};

// 从文本内容分析文档
const analyzeDocumentFromText = (text, fileName = 'document.txt') => {
  try {
    if (!text || typeof text !== 'string') {
      return createResponse(false, null, 'Invalid text parameter');
    }

    // 分析文档结构
    const analysis = analyzeDocumentStructure(text);
    
    return createResponse(true, {
      fileName,
      analysis,
      textLength: text.length
    });
  } catch (error) {
    console.error('Error analyzing text:', error);
    return createResponse(false, null, `Failed to analyze text: ${error.message}`);
  }
};

// 批量分析文档
const analyzeDocumentsBatch = async (filePaths) => {
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

        // 分析文档
        const analysisResult = await analyzeDocumentFromPath(filePath);
        
        if (analysisResult.success) {
          results.push({
            filePath,
            fileId: analysisResult.data.fileId,
            analysis: analysisResult.data.analysis,
            success: true
          });
        } else {
          errors.push({
            filePath,
            error: analysisResult.error,
            success: false
          });
        }
      } catch (error) {
        console.error(`Error analyzing ${filePath}:`, error);
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
    console.error('Error in batch document analysis:', error);
    return createResponse(false, null, `Batch analysis failed: ${error.message}`);
  }
};

module.exports = {
  analyzeDocumentFromPath,
  analyzeDocumentFromText,
  analyzeDocumentsBatch
};