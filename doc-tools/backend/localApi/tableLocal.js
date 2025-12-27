const { promises: fs } = require('fs');
const path = require('path');
const TableTextParser = require('../services/tableTextParser.js');
const WordTableGenerator = require('../services/wordTableGenerator.js');
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

// 解析表格文本
const parseTableText = (rawText) => {
  try {
    if (!rawText || typeof rawText !== 'string') {
      return createResponse(false, null, 'Invalid raw text parameter');
    }

    // 调用TableTextParser解析表格文本
    const parsedData = TableTextParser.parseTableText(rawText);
    
    return createResponse(true, {
      rows: parsedData.rows,
      columnCount: parsedData.columnCount,
      rowCount: parsedData.rowCount
    });
  } catch (error) {
    console.error('Error parsing table text:', error);
    return createResponse(false, null, `Failed to parse table text: ${error.message}`);
  }
};

// 从表格文本生成Word表格
const generateWordTableFromText = async (rawText, outputPath = null) => {
  try {
    if (!rawText || typeof rawText !== 'string') {
      return createResponse(false, null, 'Invalid raw text parameter');
    }

    // 如果没有指定输出路径，创建默认路径
    let outputDir = outputPath;
    if (!outputDir) {
      const { fileDir, fileId } = createFileDir();
      outputDir = fileDir;
    } else {
      // 确保指定路径存在
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }
    }

    // 首先解析表格文本
    const parseResult = parseTableText(rawText);
    if (!parseResult.success) {
      return parseResult;
    }

    // 使用WordTableGenerator生成Word表格
    const { fileName, filePath, buffer } = await WordTableGenerator.generateWordTable(
      parseResult.data.rows,
      {
        boldHeader: true,
        autoFit: true,
        outputDir: outputDir
      }
    );

    return createResponse(true, {
      fileName,
      filePath,
      outputPath: filePath,
      fileSize: buffer.length,
      rowCount: parseResult.data.rowCount,
      columnCount: parseResult.data.columnCount
    });
  } catch (error) {
    console.error('Error generating Word table from text:', error);
    return createResponse(false, null, `Failed to generate Word table: ${error.message}`);
  }
};

// 从表格数据生成Word表格
const generateWordTableFromData = async (tableData, outputPath = null) => {
  try {
    if (!tableData || !Array.isArray(tableData.rows) || tableData.rows.length === 0) {
      return createResponse(false, null, 'Invalid table data parameter');
    }

    // 如果没有指定输出路径，创建默认路径
    let outputDir = outputPath;
    if (!outputDir) {
      const { fileDir, fileId } = createFileDir();
      outputDir = fileDir;
    } else {
      // 确保指定路径存在
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }
    }

    // 使用WordTableGenerator生成Word表格
    const { fileName, filePath, buffer } = await WordTableGenerator.generateWordTable(
      tableData.rows,
      {
        boldHeader: true,
        autoFit: true,
        outputDir: outputDir
      }
    );

    return createResponse(true, {
      fileName,
      filePath,
      outputPath: filePath,
      fileSize: buffer.length,
      rowCount: tableData.rowCount || tableData.rows.length,
      columnCount: tableData.columnCount || (tableData.rows[0] ? tableData.rows[0].length : 0)
    });
  } catch (error) {
    console.error('Error generating Word table from data:', error);
    return createResponse(false, null, `Failed to generate Word table: ${error.message}`);
  }
};

// 生成Word表格并返回Base64编码
const generateWordTableBase64 = async (rawText) => {
  try {
    if (!rawText || typeof rawText !== 'string') {
      return createResponse(false, null, 'Invalid raw text parameter');
    }

    // 首先解析表格文本
    const parseResult = parseTableText(rawText);
    if (!parseResult.success) {
      return parseResult;
    }

    // 使用WordTableGenerator生成Base64编码的Word表格
    const base64Data = await WordTableGenerator.generateWordTableBase64(
      parseResult.data.rows,
      {
        boldHeader: true,
        autoFit: true
      }
    );

    return createResponse(true, {
      base64Data,
      rowCount: parseResult.data.rowCount,
      columnCount: parseResult.data.columnCount
    });
  } catch (error) {
    console.error('Error generating Word table base64:', error);
    return createResponse(false, null, `Failed to generate Word table base64: ${error.message}`);
  }
};

module.exports = {
  parseTableText,
  generateWordTableFromText,
  generateWordTableFromData,
  generateWordTableBase64
};