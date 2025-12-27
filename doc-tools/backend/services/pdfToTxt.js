const { promises: fs } = require('fs');
const path = require('path');

/* ------------------------------
 * 不可修改区域开始
 * 功能：PDF文本提取服务
 * 核心逻辑：使用pdfjs-dist从PDF文件中提取文本内容
 * ------------------------------ */
const extractTextFromPDF = async (filePath) => {
  try {
    // 动态导入pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    
    // 设置worker路径
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.mjs';
    
    // 读取PDF文件
    const data = await fs.readFile(filePath);
    // 将Buffer转换为Uint8Array
    const dataUint8Array = new Uint8Array(data);
    
    // 设置标准字体数据URL为绝对路径，确保有尾部斜杠
    const standardFontDataUrl = path.join(process.cwd(), 'node_modules/pdfjs-dist/standard_fonts/') + '/';
    
    // 加载PDF文档，设置标准字体数据URL
    const loadingTask = pdfjsLib.getDocument({
      data: dataUint8Array,
      standardFontDataUrl: standardFontDataUrl
    });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // 逐页提取文本
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    // 检查是否成功提取到文本
    if (!fullText || fullText.trim() === '') {
      throw new Error('No text could be extracted from the PDF file');
    }
    
    console.log(`Successfully extracted ${fullText.length} characters from PDF`);
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    
    // 添加更详细的错误信息
    if (error.message.includes('Invalid PDF')) {
      throw new Error('The uploaded file is not a valid PDF file');
    } else if (error.message.includes('ENAMETOOLONG') || error.message.includes('ENOENT')) {
      throw new Error('File path error - the file may not exist or the path is too long');
    } else if (error.message.includes('EACCES') || error.message.includes('EPERM')) {
      throw new Error('Permission denied - unable to read the file');
    } else {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }
};
/* ------------------------------
 * 不可修改区域结束
 * ------------------------------ */

module.exports = {
  extractTextFromPDF
};