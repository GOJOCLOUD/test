# Local API 使用指南

本文档介绍如何使用Local API接口层，这些接口专门为IDE调用设计，提供文档转换、表格处理和文档分析功能。

## 目录结构

```
backend/
├── localApi/
│   ├── convertLocal.js    # 文档转换接口
│   ├── tableLocal.js      # 表格处理接口
│   ├── analyzeLocal.js    # 文档分析接口
│   ├── testLocalApi.js    # 测试文件
│   └── workspace/         # 输出文件目录
```

## 接口说明

### 1. 文档转换接口 (convertLocal.js)

#### 功能
- Word文档转换为文本
- PDF文档转换为文本
- 批量文档转换

#### 主要方法
```javascript
// 从文件路径转换Word文档
const result = await convertWordFromPath(filePath);

// 从文件路径转换PDF文档
const result = await convertPdfFromPath(filePath);

// 从文本内容转换Word文档
const result = await convertWordFromText(rawText, fileName);

// 批量转换Word文档
const result = await convertWordBatch(filePaths);

// 批量转换PDF文档
const result = await convertPdfBatch(filePaths);
```

#### 返回格式
```javascript
{
  success: true,           // 操作是否成功
  data: {
    fileId: "uuid",        // 生成的文件ID
    textLength: 1000,      // 提取的文本长度
    outputPath: "path"      // 输出文件路径
  },
  error: null              // 错误信息（如果有）
}
```

### 2. 表格处理接口 (tableLocal.js)

#### 功能
- 解析表格文本
- 生成Word表格
- 提供多种输出格式

#### 主要方法
```javascript
// 解析表格文本
const result = parseTableText(tableText);

// 从文本生成Word表格
const result = await generateWordTableFromText(tableText, options);

// 从数据生成Word表格
const result = await generateWordTableFromData(tableData, options);

// 生成Base64编码的Word表格
const result = await generateWordTableBase64(tableData, options);
```

#### 返回格式
```javascript
{
  success: true,           // 操作是否成功
  data: {
    fileId: "uuid",        // 生成的文件ID
    fileName: "table.docx", // 文件名
    fileSize: 5000,        // 文件大小（字节）
    base64: "base64string", // Base64编码（仅限base64方法）
    tableData: [...]       // 表格数据（仅限解析方法）
  },
  error: null              // 错误信息（如果有）
}
```

### 3. 文档分析接口 (analyzeLocal.js)

#### 功能
- 文档结构分析
- 语言检测
- 基本统计信息

#### 主要方法
```javascript
// 从文件路径分析文档
const result = await analyzeDocumentFromPath(filePath);

// 从文本内容分析文档
const result = analyzeDocumentFromText(rawText, fileName);

// 批量分析文档
const result = await analyzeDocumentsBatch(filePaths);
```

#### 返回格式
```javascript
{
  success: true,           // 操作是否成功
  data: {
    fileId: "uuid",        // 生成的文件ID
    fileInfo: {
      fileName: "doc.docx", // 文件名
      fileSize: 5000,      // 文件大小
      fileType: "docx"     // 文件类型
    },
    analysis: {
      basicStats: {
        paragraphs: 10,    // 段落数
        words: 100,         // 词数
        characters: 500     // 字符数
      },
      language: {
        primary: "chinese", // 主要语言
        confidence: 0.95    // 置信度
      }
    }
  },
  error: null              // 错误信息（如果有）
}
```

## 输出文件路径

所有输出文件都保存在 `backend/workspace/{fileId}/` 目录下，文件命名规则如下：

- 文档转换：`{fileId}.txt`
- 表格生成：`{fileId}.docx`
- 文档分析：`{fileId}_analysis.json`

## 使用示例

### 基本使用

```javascript
const { convertWordFromPath } = require('./localApi/convertLocal.js');
const { parseTableText } = require('./localApi/tableLocal.js');
const { analyzeDocumentFromPath } = require('./localApi/analyzeLocal.js');

// 转换Word文档
const wordResult = await convertWordFromPath('path/to/document.docx');
if (wordResult.success) {
  console.log('转换成功，文件ID:', wordResult.data.fileId);
  console.log('文本长度:', wordResult.data.textLength);
}

// 解析表格
const tableText = `姓名\t年龄\t职业\n张三\t25\t工程师\n李四\t30\t设计师`;
const tableResult = parseTableText(tableText);
if (tableResult.success) {
  console.log('表格解析成功，行数:', tableResult.data.rowCount);
}

// 分析文档
const analysisResult = await analyzeDocumentFromPath('path/to/document.pdf');
if (analysisResult.success) {
  console.log('分析成功，段落数:', analysisResult.data.analysis.basicStats.paragraphs);
}
```

### 错误处理

```javascript
try {
  const result = await convertWordFromPath('path/to/document.docx');
  if (result.success) {
    // 处理成功结果
    console.log('输出文件路径:', result.data.outputPath);
  } else {
    // 处理业务错误
    console.error('转换失败:', result.error);
  }
} catch (error) {
  // 处理异常错误
  console.error('系统错误:', error.message);
}
```

## 注意事项

1. 所有接口都是异步函数，使用时需要使用 `await` 或 `.then()`
2. 文件路径可以是绝对路径或相对路径
3. 批量操作方法接受文件路径数组
4. 所有输出文件都会生成唯一的fileId，避免文件名冲突
5. 错误信息包含在返回对象的 `error` 字段中

## 测试

运行测试文件验证功能：

```bash
cd backend
node localApi/testLocalApi.js
```

测试文件会验证所有Local API功能是否正常工作。