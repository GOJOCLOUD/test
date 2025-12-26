const path = require('path');
const fs = require('fs');
const { 
  convertWordFromPath, 
  convertPdfFromPath,
  convertWordBatch,
  convertPdfBatch
} = require('./convertLocal.js');

const { 
  parseTableText,
  generateWordTableFromText,
  generateWordTableFromData,
  generateWordTableBase64
} = require('./tableLocal.js');

const {
  analyzeDocumentFromPath,
  analyzeDocumentFromText,
  analyzeDocumentsBatch
} = require('./analyzeLocal.js');

// 测试文档转换功能
async function testConvertLocal() {
  console.log('\n=== 测试文档转换功能 ===');
  
  try {
    // 获取uploads目录中的第一个Word文档
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const wordFiles = fs.readdirSync(uploadsDir).filter(file => file.endsWith('.docx'));
    const pdfFiles = fs.readdirSync(uploadsDir).filter(file => file.endsWith('.pdf'));
    
    // 测试Word转换
    if (wordFiles.length > 0) {
      console.log('测试Word文档转换...');
      const wordPath = path.join(uploadsDir, wordFiles[0]);
      const wordResult = await convertWordFromPath(wordPath);
      console.log('Word转换结果:', wordResult.success ? '成功' : '失败');
      if (wordResult.success) {
        console.log('文件ID:', wordResult.data.fileId);
        console.log('文本长度:', wordResult.data.textLength);
      } else {
        console.log('错误:', wordResult.error);
      }
    } else {
      console.log('没有找到Word文档，跳过测试');
    }
    
    // 测试PDF转换
    if (pdfFiles.length > 0) {
      console.log('\n测试PDF文档转换...');
      const pdfPath = path.join(uploadsDir, pdfFiles[0]);
      const pdfResult = await convertPdfFromPath(pdfPath);
      console.log('PDF转换结果:', pdfResult.success ? '成功' : '失败');
      if (pdfResult.success) {
        console.log('文件ID:', pdfResult.data.fileId);
        console.log('文本长度:', pdfResult.data.textLength);
      } else {
        console.log('错误:', pdfResult.error);
      }
    } else {
      console.log('没有找到PDF文档，跳过测试');
    }
  } catch (error) {
    console.error('文档转换测试出错:', error.message);
  }
}

// 测试表格功能
async function testTableLocal() {
  console.log('\n=== 测试表格功能 ===');
  
  try {
    // 测试表格文本解析
    console.log('测试表格文本解析...');
    const tableText = `姓名\t年龄\t职业
张三\t25\t工程师
李四\t30\t设计师
王五\t28\t教师`;
    
    const parseResult = parseTableText(tableText);
    console.log('表格解析结果:', parseResult.success ? '成功' : '失败');
    if (parseResult.success) {
      console.log('行数:', parseResult.data.rowCount);
      console.log('列数:', parseResult.data.columnCount);
    } else {
      console.log('错误:', parseResult.error);
    }
    
    // 测试Word表格生成
    console.log('\n测试Word表格生成...');
    const generateResult = await generateWordTableFromText(tableText);
    console.log('Word表格生成结果:', generateResult.success ? '成功' : '失败');
    if (generateResult.success) {
      console.log('文件名:', generateResult.data.fileName);
      console.log('文件大小:', generateResult.data.fileSize);
    } else {
      console.log('错误:', generateResult.error);
    }
  } catch (error) {
    console.error('表格功能测试出错:', error.message);
  }
}

// 测试文档分析功能
async function testAnalyzeLocal() {
  console.log('\n=== 测试文档分析功能 ===');
  
  try {
    // 测试从文本分析
    console.log('测试从文本分析...');
    const sampleText = `这是一个示例文档。
它包含多个段落。

这是第二个段落，包含一些示例内容。
我们可以用它来测试文档分析功能。

最后一段。`;
    
    const textAnalysisResult = analyzeDocumentFromText(sampleText, 'sample.txt');
    console.log('文本分析结果:', textAnalysisResult.success ? '成功' : '失败');
    if (textAnalysisResult.success) {
      console.log('段落数:', textAnalysisResult.data.analysis.basicStats.paragraphs);
      console.log('词数:', textAnalysisResult.data.analysis.basicStats.words);
      console.log('主要语言:', textAnalysisResult.data.analysis.language.primary);
    } else {
      console.log('错误:', textAnalysisResult.error);
    }
    
    // 测试从文件路径分析
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const wordFiles = fs.readdirSync(uploadsDir).filter(file => file.endsWith('.docx'));
    
    if (wordFiles.length > 0) {
      console.log('\n测试从文件路径分析...');
      const wordPath = path.join(uploadsDir, wordFiles[0]);
      const fileAnalysisResult = await analyzeDocumentFromPath(wordPath);
      console.log('文件分析结果:', fileAnalysisResult.success ? '成功' : '失败');
      if (fileAnalysisResult.success) {
        console.log('文件ID:', fileAnalysisResult.data.fileId);
        console.log('文件大小:', fileAnalysisResult.data.fileInfo.fileSize);
        console.log('段落数:', fileAnalysisResult.data.analysis.basicStats.paragraphs);
      } else {
        console.log('错误:', fileAnalysisResult.error);
      }
    } else {
      console.log('没有找到Word文档，跳过测试');
    }
  } catch (error) {
    console.error('文档分析测试出错:', error.message);
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('开始运行Local API测试...');
  
  await testConvertLocal();
  await testTableLocal();
  await testAnalyzeLocal();
  
  console.log('\n测试完成！');
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testConvertLocal,
  testTableLocal,
  testAnalyzeLocal,
  runAllTests
};