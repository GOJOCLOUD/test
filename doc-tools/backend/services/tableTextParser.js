/**
 * 表格文本解析器
 * 将乱格式的表格文本转换为结构化数据
 */

/* ------------------------------
 * 不可修改区域开始
 * 功能：表格文本解析服务
 * 核心逻辑：将非结构化表格文本转换为结构化数据，支持多种表格格式
 * ------------------------------ */
class TableTextParser {
  /**
   * 解析表格文本
   * @param {string} text - 原始表格文本
   * @returns {Object} 解析结果 { rows, columnCount, rowCount }
   */
  static parseTableText(text) {
    try {
      // 1. 按行分割并去除空行
      const lines = this._splitAndCleanLines(text);
      
      if (lines.length === 0) {
        return {
          rows: [],
          columnCount: 0,
          rowCount: 0
        };
      }
      
      // 2. 检测表格类型
      const tableType = this._detectTableType(lines);
      
      let result;
      
      // 3. 根据表格类型选择解析方法
      if (tableType === 'grouped') {
        // 分组类型的表格（如用户提供的示例）
        result = this._parseGroupedTable(lines);
      } else {
        // 标准表格（有明确分隔符）
        // 3.1. 自动识别最可能的列分隔符
        const delimiter = this._detectDelimiter(lines);
        
        // 3.2. 根据分隔符分割每行并清洗单元格内容
        const rawRows = lines.map(line => this._splitAndCleanCells(line, delimiter));
        
        // 3.3. 确定标准列数
        const standardColumnCount = this._determineColumnCount(rawRows);
        
        // 3.4. 对齐所有行的列数
        const alignedRows = this._alignColumns(rawRows, standardColumnCount);
        
        result = {
          rows: alignedRows,
          columnCount: standardColumnCount,
          rowCount: alignedRows.length
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error parsing table text:', error);
      // 返回最基本的表格结构
      return {
        rows: [[text || '']],
        columnCount: 1,
        rowCount: 1
      };
    }
  }
  
  /**
   * 检测表格类型
   * @param {Array} lines - 文本行数组
   * @returns {string} 表格类型 ('grouped' 或 'standard')
   */
  static _detectTableType(lines) {
    // 检查是否有明确的分隔符
    let hasExplicitDelimiter = false;
    
    for (const line of lines) {
      if (line.match(/\|/) || line.match(/\t/)) {
        hasExplicitDelimiter = true;
        break;
      }
    }
    
    if (hasExplicitDelimiter) {
      return 'standard';
    }
    
    // 检查是否有缩进模式（分组表格的特征）
    const indentedLines = lines.filter(line => line.length > line.trimLeft().length);
    const nonIndentedLines = lines.filter(line => line.length === line.trimLeft().length);
    
    // 如果有缩进行且非缩进行数量合理（可能是表头），则认为是分组表格
    if (indentedLines.length > 0 && nonIndentedLines.length > 0) {
      console.log('检测到分组表格（基于缩进）:', { 
        indentedLines: indentedLines.length, 
        nonIndentedLines: nonIndentedLines.length,
        totalLines: lines.length
      });
      return 'grouped';
    }
    
    // 检查是否有特殊符号模式（如星号评级）
    const hasSpecialSymbols = lines.some(line => 
      line.match(/[★☆]/) || 
      line.match(/["""]/) ||
      line.match(/[（（]/)
    );
    
    // 检查行数是否符合分组表格的特征（表头+数据行）
    const hasHeaderAndDataPattern = lines.length >= 5 && 
      lines.slice(0, 4).every(line => !line.match(/[★☆]/)) && // 前4行没有特殊符号
      lines.slice(4).some(line => line.match(/[★☆]/)); // 第5行开始有特殊符号
    
    if (hasSpecialSymbols && hasHeaderAndDataPattern) {
      console.log('检测到分组表格（基于特殊符号模式）:', { 
        hasSpecialSymbols,
        hasHeaderAndDataPattern,
        totalLines: lines.length
      });
      return 'grouped';
    }
    
    // 默认认为是标准表格
    return 'standard';
  }
  
  /**
   * 解析分组表格
   * @param {string[]} lines - 分割后的文本行
   * @returns {Object} 解析结果
   * @private
   */
  static _parseGroupedTable(lines) {
    // 分组表格结构：
    // 第一行：主表头
    // 接下来的行：数据行，每行包含多个字段
    // 数据行可能包含特殊符号，需要保留
    
    if (lines.length === 0) {
      return { rows: [], rowCount: 0, columnCount: 0 };
    }
    
    // 分析表格结构
    // 第一行是主表头
    const headerLine = lines[0].trim();
    
    // 其余行是数据行
    const dataLines = lines.slice(1);
    
    // 创建表格行
    const rows = [];
    
    // 第一行：表头行
    const headerRow = [headerLine];
    rows.push(headerRow);
    
    // 处理数据行
    for (const line of dataLines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // 每行作为一个单独的字段
      rows.push([trimmedLine]);
    }
    
    return {
      rows,
      rowCount: rows.length,
      columnCount: 1 // 这种表格结构本质上是一列
    };
  }
  
  /**
   * 分割数据行，识别字段边界
   * @param {string} line - 数据行
   * @returns {string[]} 分割后的字段数组
   * @private
   */
  static _splitDataLine(line) {
    // 对于包含特殊符号的行，我们需要特殊处理
    // 如果行包含特殊符号（如★、引号等），我们将其作为单个字段返回
    if (line.match(/[★☆]/) || line.match(/["""]/) || line.match(/[（（]/)) {
      return [line];
    }
    
    // 否则，尝试按空格分割
    return line.split(/\s+/).filter(f => f.length > 0);
  }
  
  /**
   * 获取行的缩进级别
   * @param {string} line - 文本行
   * @returns {number} 缩进级别（0表示无缩进）
   */
  static _getIndentLevel(line) {
    // 计算行首空格数
    const leadingSpaces = line.length - line.trimLeft().length;
    
    // 对于这种表格，只要有空格就认为是缩进
    // 不再使用每2个空格为一个缩进级别的逻辑
    return leadingSpaces > 0 ? 1 : 0;
  }
  
  /**
   * 分割文本并清理空行
   * @param {string} text - 原始文本
   * @returns {Array} 清理后的行数组
   */
  static _splitAndCleanLines(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }
    
    return text
      .split(/\r?\n/)
      .map(line => line.replace(/[\s]+$/, ''))  // 只移除行尾空格，保留行首空格
      .filter(line => line.trim().length > 0);  // 使用trim()检查是否为空行，但保留原始行
  }
  
  /**
   * 自动检测最可能的列分隔符
   * @param {Array} lines - 文本行数组
   * @returns {RegExp} 分隔符正则表达式
   */
  static _detectDelimiter(lines) {
    // 统计各种分隔符的出现频率
    let pipeCount = 0;
    let tabCount = 0;
    let multipleSpaceCount = 0;
    
    // 检查是否有行首缩进
    const hasIndentation = lines.some(line => line.length > line.trimLeft().length);
    
    lines.forEach(line => {
      // 竖线分隔符
      const pipes = line.match(/\|/g);
      if (pipes) pipeCount += pipes.length;
      
      // Tab分隔符
      const tabs = line.match(/\t/g);
      if (tabs) tabCount += tabs.length;
      
      // 多个空格分隔符（至少2个）
      const multipleSpaces = line.match(/ {2,}/g);
      if (multipleSpaces) multipleSpaceCount += multipleSpaces.length;
    });
    
    // 根据频率决定分隔符，优先级：| > Tab > 多空格 > 单空格
    if (pipeCount > 0) return /\|/;
    if (tabCount > 0) return /\t/;
    if (multipleSpaceCount > 0) return / {2,}/;
    
    // 如果有缩进，使用至少2个空格作为分隔符，避免将单个空格作为分隔符
    if (hasIndentation) return / {2,}/;
    
    // 默认使用至少两个空格作为分隔符
    return / {1,}/;
  }
  
  /**
   * 根据分隔符分割行并清洗单元格
   * @param {string} line - 文本行
   * @param {RegExp} delimiter - 分隔符正则表达式
   * @returns {Array} 清洗后的单元格数组
   */
  static _splitAndCleanCells(line, delimiter) {
    return line
      .split(delimiter)
      .map(cell => this._cleanCell(cell))
      .filter(cell => cell !== null); // 过滤掉完全为空的单元格（除非整行都是空的）
  }
  
  /**
   * 清洗单元格内容
   * @param {string} cell - 原始单元格内容
   * @returns {string} 清洗后的内容
   */
  static _cleanCell(cell) {
    if (!cell) return '';
    
    return cell
      .replace(/[\s]+$/, '')      // 只移除结尾的空格，保留开头的空格（缩进）
      .replace(/\s+/g, ' ')      // 合并中间多个空格为一个
      .replace(/[\r\n\t]/g, '')  // 移除换行符和Tab
      // 保留更多特殊符号，包括星号、引号、破折号等
      .replace(/[^\w\s\u4e00-\u9fff.,;:!?'"()%/\\&@#*+\-=[\]{}|^$~`★☆—–]/g, ''); // 保留基本标点和中英文字符，以及特殊符号
  }
  
  /**
   * 确定标准列数
   * @param {Array} rawRows - 原始行数组
   * @returns {number} 标准列数
   */
  static _determineColumnCount(rawRows) {
    if (rawRows.length === 0) return 0;
    
    // 统计每行的列数
    const columnCounts = rawRows.map(row => row.length);
    
    // 找出最常见的列数
    const frequency = {};
    columnCounts.forEach(count => {
      frequency[count] = (frequency[count] || 0) + 1;
    });
    
    // 返回出现频率最高的列数
    let maxFrequency = 0;
    let standardCount = 1;
    
    Object.keys(frequency).forEach(count => {
      if (frequency[count] > maxFrequency) {
        maxFrequency = frequency[count];
        standardCount = parseInt(count, 10);
      }
    });
    
    return standardCount;
  }
  
  /**
   * 对齐所有行的列数
   * @param {Array} rawRows - 原始行数组
   * @param {number} standardColumnCount - 标准列数
   * @returns {Array} 对齐后的行数组
   */
  static _alignColumns(rawRows, standardColumnCount) {
    return rawRows.map(row => {
      const alignedRow = [...row];
      
      // 如果列数不足，补充空字符串
      while (alignedRow.length < standardColumnCount) {
        alignedRow.push('');
      }
      
      // 如果列数超出，合并最后几个单元格
      if (alignedRow.length > standardColumnCount) {
        const mergedCells = alignedRow.slice(standardColumnCount - 1).join(' ');
        alignedRow.splice(standardColumnCount - 1, alignedRow.length - standardColumnCount + 1, mergedCells);
      }
      
      return alignedRow;
    });
  }
}
/* ------------------------------
 * 不可修改区域结束
 * ------------------------------ */

module.exports = TableTextParser;