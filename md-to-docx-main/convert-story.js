// 导入必要的模块
import { parseToDocxOptions } from './dist/index.js';
import { Document, Packer } from 'docx';
import fs from 'fs';

// 读取Markdown文件
async function convertMarkdownToDocxFile() {
    try {
        // 读取story.md文件内容
        const markdownContent = fs.readFileSync('./story.md', 'utf8');
        
        console.log('开始转换Markdown到DOCX...');
        
        // 先获取DOCX选项
        const docxOptions = await parseToDocxOptions(markdownContent, {
            documentType: 'document',
            style: {
                titleSize: 32,
                heading1Size: 28,
                heading2Size: 24,
                paragraphSize: 20,
                lineSpacing: 1.5,
                paragraphAlignment: 'JUSTIFIED'
            }
        });
        
        // 创建Document实例
        const doc = new Document(docxOptions);
        
        // 使用Packer直接生成Buffer
        const buffer = await Packer.toBuffer(doc);
        
        console.log('转换完成！');
        
        // 保存为DOCX文件
        const outputPath = './story.docx';
        fs.writeFileSync(outputPath, buffer);
        
        console.log(`DOCX文件已保存到: ${outputPath}`);
        console.log(`文件大小: ${buffer.length} 字节`);
        
    } catch (error) {
        console.error('转换失败:', error);
        console.error('错误堆栈:', error.stack);
    }
}

// 执行转换
convertMarkdownToDocxFile();