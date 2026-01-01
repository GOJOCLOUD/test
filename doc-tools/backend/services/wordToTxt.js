const { promises: fs } = require('fs');

/* ------------------------------
 * 不可修改区域开始
 * 功能：Word文本提取服务
 * 核心逻辑：使用mammoth从Word文档中提取文本内容，确保正确处理中文
 * ------------------------------ */
// 使用mammoth提取Word文档文本，确保正确处理中文
const extractTextFromWord = async (filePath) => {
  try {
    // 读取Word文件
    const dataBuffer = await fs.readFile(filePath);
    
    // 动态导入mammoth库
    const mammoth = await import('mammoth');
    
    // 使用mammoth提取文本，确保正确处理中文
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    
    // 确保text是字符串类型
    const text = typeof result?.value === 'string' ? result.value : '';
    
    // 如果文本为空，抛出错误
    if (!text.trim()) {
      throw new Error('Failed to extract text from document');
    }
    
    return text;
  } catch (error) {
    console.error('Error extracting text from Word:', error);
    throw new Error(`Failed to extract text from Word: ${error.message}`);
  }
};
/* ------------------------------
 * 不可修改区域结束
 * ------------------------------ */

module.exports = {
  extractTextFromWord
};