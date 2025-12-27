/**
 * Word表格生成器
 * 将结构化表格数据转换为带边框的Word文档
 */

const { Packer, Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle } = require('docx');
const { promises: fs } = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/* ------------------------------
 * 不可修改区域开始
 * 功能：Word表格生成服务
 * 核心逻辑：将结构化表格数据转换为带边框的Word文档，支持多种生成选项
 * ------------------------------ */
class WordTableGenerator {
  /**
   * 生成带表格的Word文档
   * @param {Array} rows - 表格数据，二维数组
   * @param {Object} options - 生成选项
   * @returns {Object} 生成的文档信息 { fileName, filePath, buffer }
   */
  static async generateWordTable(rows, options = {}) {
    try {
      const {
        boldHeader = true,
        autoFit = true,
        outputDir = './uploads',
        fileName = null
      } = options;
      
      if (!rows || rows.length === 0) {
        throw new Error('表格数据不能为空');
      }
      
      // 创建表格行
      const tableRows = this._createTableRows(rows, boldHeader);
      
      // 创建Word文档
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Table({
              rows: tableRows,
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                insideVertical: { style: BorderStyle.SINGLE, size: 1 },
              },
            })
          ]
        }]
      });
      
      // 生成文档
      const buffer = await Packer.toBuffer(doc);
      
      // 生成文件名
      const finalFileName = fileName || `table_${uuidv4()}.docx`;
      const filePath = path.join(outputDir, finalFileName);
      
      // 确保输出目录存在
      await fs.mkdir(outputDir, { recursive: true });
      
      // 保存文件
      await fs.writeFile(filePath, buffer);
      
      return {
        fileName: finalFileName,
        filePath: filePath,
        buffer: buffer
      };
    } catch (error) {
      console.error('Error generating Word table:', error);
      throw error;
    }
  }
  
  /**
   * 创建表格行
   * @param {Array} rows - 表格数据
   * @param {boolean} boldHeader - 是否加粗表头
   * @returns {Array} 表格行数组
   */
  static _createTableRows(rows, boldHeader) {
    return rows.map((row, rowIndex) => {
      // 创建表格单元格
      const cells = row.map((cell, cellIndex) => {
        // 确定文本样式
        const isHeader = rowIndex === 0 && boldHeader;
        
        return new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: cell || '',
                  bold: isHeader,
                  size: 24, // 12pt
                })
              ],
              spacing: {
                before: 100,
                after: 100,
              },
            })
          ],
          margins: {
            top: 100,
            bottom: 100,
            left: 200,
            right: 200,
          },
        });
      });
      
      return new TableRow({
        children: cells,
      });
    });
  }
  
  /**
   * 生成表格并返回Base64编码
   * @param {Array} rows - 表格数据
   * @param {Object} options - 生成选项
   * @returns {string} Base64编码的文档
   */
  static async generateWordTableBase64(rows, options = {}) {
    try {
      const { buffer } = await this.generateWordTable(rows, options);
      return buffer.toString('base64');
    } catch (error) {
      console.error('Error generating Word table base64:', error);
      throw error;
    }
  }
  
  /**
   * 生成表格并返回下载URL
   * @param {Array} rows - 表格数据
   * @param {Object} options - 生成选项
   * @param {string} baseUrl - 基础URL
   * @returns {Object} 下载信息 { downloadUrl, fileName }
   */
  static async generateWordTableUrl(rows, options = {}, baseUrl = '') {
    try {
      const { fileName, filePath } = await this.generateWordTable(rows, options);
      
      // 生成下载URL
      const downloadUrl = `${baseUrl}/api/download/${fileName}`;
      
      return {
        downloadUrl: downloadUrl,
        fileName: fileName
      };
    } catch (error) {
      console.error('Error generating Word table URL:', error);
      throw error;
    }
  }
}
/* ------------------------------
 * 不可修改区域结束
 * ------------------------------ */

module.exports = WordTableGenerator;