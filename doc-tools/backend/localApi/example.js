/**
 * Local API 使用示例
 * 
 * 此文件展示了如何在IDE中使用Local API的各种功能
 */

// 导入Local API - 方式1：直接导入所有功能
const {
  convertWordFromPath,
  parseTableText,
  analyzeDocumentFromPath,
  localApi
} = require('./index.js');

// 导入Local API - 方式2：使用统一API对象
// const localApi = require('./index.js').localApi;

// 示例1：文档转换
async function exampleDocumentConversion() {
  console.log('=== 文档转换示例 ===');
  
  try {
    // 转换Word文档
    const wordResult = await convertWordFromPath('uploads/初稿.docx');
    if (wordResult.success) {
      console.log('Word文档转换成功');
      console.log('文件ID:', wordResult.data.fileId);
      console.log('文本长度:', wordResult.data.textLength);
      console.log('输出路径:', wordResult.data.outputPath);
    } else {
      console.error('Word文档转换失败:', wordResult.error);
    }
    
    // 转换PDF文档
    const pdfResult = await localApi.convert.pdfFromPath('uploads/420607杭州学院文本.pdf');
    if (pdfResult.success) {
      console.log('PDF文档转换成功');
      console.log('文件ID:', pdfResult.data.fileId);
      console.log('文本长度:', pdfResult.data.textLength);
    } else {
      console.error('PDF文档转换失败:', pdfResult.error);
    }
  } catch (error) {
    console.error('文档转换异常:', error.message);
  }
}

// 示例2：表格处理
async function exampleTableProcessing() {
  console.log('\n=== 表格处理示例 ===');
  
  try {
    // 解析表格文本
    const tableText = `姓名\t年龄\t职业\n张三\t25\t工程师\n李四\t30\t设计师`;
    const parseResult = parseTableText(tableText);
    
    if (parseResult.success) {
      console.log('表格文本解析成功');
      console.log('行数:', parseResult.data.rowCount);
      console.log('列数:', parseResult.data.columnCount);
      console.log('表格数据:', parseResult.data.tableData);
    } else {
      console.error('表格文本解析失败:', parseResult.error);
    }
    
    // 生成Word表格
    const generateResult = await localApi.table.generateWordFromText(tableText);
    if (generateResult.success) {
      console.log('Word表格生成成功');
      console.log('文件ID:', generateResult.data.fileId);
      console.log('文件名:', generateResult.data.fileName);
      console.log('文件大小:', generateResult.data.fileSize);
    } else {
      console.error('Word表格生成失败:', generateResult.error);
    }
  } catch (error) {
    console.error('表格处理异常:', error.message);
  }
}

// 示例3：文档分析
async function exampleDocumentAnalysis() {
  console.log('\n=== 文档分析示例 ===');
  
  try {
    // 从文件路径分析文档
    const analysisResult = await analyzeDocumentFromPath('uploads/初稿.docx');
    
    if (analysisResult.success) {
      console.log('文档分析成功');
      console.log('文件ID:', analysisResult.data.fileId);
      console.log('文件信息:', analysisResult.data.fileInfo);
      console.log('分析结果:', analysisResult.data.analysis);
    } else {
      console.error('文档分析失败:', analysisResult.error);
    }
    
    // 从文本内容分析文档
    const textContent = '这是一个测试文档。它包含多个段落。每个段落都有不同的内容。';
    const textAnalysisResult = await localApi.analyze.documentFromText(textContent, 'test.txt');
    
    if (textAnalysisResult.success) {
      console.log('文本分析成功');
      console.log('分析结果:', textAnalysisResult.data.analysis);
    } else {
      console.error('文本分析失败:', textAnalysisResult.error);
    }
  } catch (error) {
    console.error('文档分析异常:', error.message);
  }
}

// 示例4：批量处理
async function exampleBatchProcessing() {
  console.log('\n=== 批量处理示例 ===');
  
  try {
    // 批量转换Word文档
    const wordFiles = ['uploads/初稿.docx', 'uploads/12.1 杭州项目稿.docx'];
    const batchConvertResult = await localApi.convert.wordBatch(wordFiles);
    
    if (batchConvertResult.success) {
      console.log('批量Word转换成功');
      console.log('成功数量:', batchConvertResult.data.successCount);
      console.log('失败数量:', batchConvertResult.data.failureCount);
      console.log('结果:', batchConvertResult.data.results);
    } else {
      console.error('批量Word转换失败:', batchConvertResult.error);
    }
    
    // 批量分析文档
    const analysisFiles = ['uploads/初稿.docx', 'uploads/420607杭州学院文本.pdf'];
    const batchAnalysisResult = await localApi.analyze.documentsBatch(analysisFiles);
    
    if (batchAnalysisResult.success) {
      console.log('批量文档分析成功');
      console.log('成功数量:', batchAnalysisResult.data.successCount);
      console.log('失败数量:', batchAnalysisResult.data.failureCount);
      console.log('结果:', batchAnalysisResult.data.results);
    } else {
      console.error('批量文档分析失败:', batchAnalysisResult.error);
    }
  } catch (error) {
    console.error('批量处理异常:', error.message);
  }
}

// 运行所有示例
async function runAllExamples() {
  await exampleDocumentConversion();
  await exampleTableProcessing();
  await exampleDocumentAnalysis();
  await exampleBatchProcessing();
}

// 如果直接运行此文件，则执行所有示例
if (require.main === module) {
  runAllExamples().catch(console.error);
}

// 导出示例函数
module.exports = {
  exampleDocumentConversion,
  exampleTableProcessing,
  exampleDocumentAnalysis,
  exampleBatchProcessing,
  runAllExamples
};