// 导入必要的模块
import { parseToDocxOptions } from './dist/index.js';
import { Document, Packer } from 'docx';
import fs from 'fs';

// 读取Markdown文件并转换为完整功能的DOCX
async function convertAllFeatures() {
    try {
        // 读取包含所有功能的Markdown文件
        const markdownContent = fs.readFileSync('./all-features.md', 'utf8');
        
        console.log('开始转换包含所有功能的Markdown到DOCX...');
        
        // 调用转换函数，使用完整的样式配置
        const docxOptions = await parseToDocxOptions(markdownContent, {
            documentType: 'document',
            style: {
                // 基本样式
                titleSize: 36,
                heading1Size: 32,
                heading2Size: 28,
                heading3Size: 24,
                heading4Size: 22,
                heading5Size: 20,
                paragraphSize: 18,
                listItemSize: 18,
                codeBlockSize: 16,
                blockquoteSize: 18,
                
                // 间距设置
                headingSpacing: 240,
                paragraphSpacing: 180,
                lineSpacing: 1.5,
                
                // 对齐方式
                paragraphAlignment: 'JUSTIFIED',
                heading1Alignment: 'CENTER',
                heading2Alignment: 'LEFT',
                heading3Alignment: 'LEFT',
                blockquoteAlignment: 'LEFT',
                
                // TOC样式
                tocFontSize: 22,
                tocHeading1FontSize: 24,
                tocHeading1Bold: true,
                tocHeading2FontSize: 22,
                tocHeading2Bold: true,
                tocHeading3FontSize: 20,
                
                // 方向
                direction: 'LTR'
            },
            
            // 文本替换功能
            textReplacements: [
                { find: /旧文本/g, replace: '新文本' },
                { find: '公司名称', replace: '示例公司' },
                { find: /(\d+)/g, replace: (match) => `数字: ${match}` }
            ]
        });
        
        // 创建Document实例
        const doc = new Document(docxOptions);
        
        // 使用Packer直接生成Buffer
        const buffer = await Packer.toBuffer(doc);
        
        console.log('转换完成！');
        
        // 保存为DOCX文件
        const outputPath = './all-features.docx';
        fs.writeFileSync(outputPath, buffer);
        
        console.log(`完整功能测试DOCX文件已保存到: ${outputPath}`);
        console.log(`文件大小: ${buffer.length} 字节`);
        
    } catch (error) {
        console.error('转换失败:', error);
        console.error('错误堆栈:', error.stack);
    }
}

// 执行转换
convertAllFeatures();