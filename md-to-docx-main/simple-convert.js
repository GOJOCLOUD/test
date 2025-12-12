// 使用更简单的方式生成DOCX
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import fs from 'fs';

// 直接读取Markdown并转换为简单的DOCX
async function simpleMarkdownToDocx() {
    try {
        // 读取story.md文件内容
        const markdownContent = fs.readFileSync('./story.md', 'utf8');
        
        console.log('开始转换Markdown到DOCX...');
        
        // 分割内容为段落
        const paragraphs = markdownContent.split('\n\n');
        
        // 创建DOCX文档内容
        const docContent = [];
        
        paragraphs.forEach((para, index) => {
            // 处理标题
            if (para.startsWith('# ')) {
                // 一级标题
                docContent.push(new Paragraph({
                    text: para.replace('# ', ''),
                    heading: HeadingLevel.HEADING_1,
                    spacing: { after: 240 }
                }));
            } else if (para.startsWith('## ')) {
                // 二级标题
                docContent.push(new Paragraph({
                    text: para.replace('## ', ''),
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 180 }
                }));
            } else {
                // 普通段落
                docContent.push(new Paragraph({
                    text: para,
                    spacing: { after: 120 }
                }));
            }
        });
        
        // 创建文档
        const doc = new Document({
            sections: [{
                properties: {},
                children: docContent
            }]
        });
        
        // 生成Buffer
        const buffer = await Packer.toBuffer(doc);
        
        // 保存文件
        const outputPath = './simple-story.docx';
        fs.writeFileSync(outputPath, buffer);
        
        console.log(`简单DOCX文件已保存到: ${outputPath}`);
        console.log(`文件大小: ${buffer.length} 字节`);
        
    } catch (error) {
        console.error('转换失败:', error);
    }
}

simpleMarkdownToDocx();