/**
 * 表格转换控制器
 * 处理表格文本解析和Word表格生成的请求
 */

const TableTextParser = require('../services/tableTextParser.js');
const WordTableGenerator = require('../services/wordTableGenerator.js');
const { promises: fs } = require('fs');
const path = require('path');

class TableController {
  /**
   * 将表格文本转换为Word表格
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async convertTableToWord(req, res) {
    try {
      const { tableText, options = {} } = req.body;
      
      if (!tableText) {
        return res.status(400).json({
          success: false,
          error: '表格文本不能为空'
        });
      }
      
      // 解析表格文本
      const { rows, columnCount, rowCount } = TableTextParser.parseTableText(tableText);
      
      if (rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: '无法解析表格文本，请检查输入格式'
        });
      }
      
      // 生成Word表格
      const { fileName, filePath, buffer } = await WordTableGenerator.generateWordTable(rows, {
        boldHeader: options.boldHeader !== false, // 默认为true
        outputDir: './uploads'
      });
      
      // 返回成功响应
      res.json({
        success: true,
        data: {
          fileName,
          filePath,
          columnCount,
          rowCount,
          parsedRows: rows
        },
        message: '表格转换成功'
      });
    } catch (error) {
      console.error('Error converting table to Word:', error);
      res.status(500).json({
        success: false,
        error: `表格转换失败: ${error.message}`
      });
    }
  }
  
  /**
   * 仅解析表格文本，不生成Word文档
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async parseTableText(req, res) {
    try {
      const { tableText } = req.body;
      
      if (!tableText) {
        return res.status(400).json({
          success: false,
          error: '表格文本不能为空'
        });
      }
      
      // 解析表格文本
      const result = TableTextParser.parseTableText(tableText);
      
      // 返回解析结果
      res.json({
        success: true,
        data: result,
        message: '表格文本解析成功'
      });
    } catch (error) {
      console.error('Error parsing table text:', error);
      res.status(500).json({
        success: false,
        error: `表格文本解析失败: ${error.message}`
      });
    }
  }
  
  /**
   * 下载生成的Word文档
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async downloadWordTable(req, res) {
    try {
      const { fileName } = req.params;
      
      if (!fileName) {
        return res.status(400).json({
          success: false,
          error: '文件名不能为空'
        });
      }
      
      const filePath = path.join('./uploads', fileName);
      
      // 检查文件是否存在
      try {
        await fs.access(filePath);
      } catch (error) {
        return res.status(404).json({
          success: false,
          error: '文件不存在'
        });
      }
      
      // 设置响应头
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
      
      // 发送文件
      const fileBuffer = await fs.readFile(filePath);
      res.send(fileBuffer);
    } catch (error) {
      console.error('Error downloading Word table:', error);
      res.status(500).json({
        success: false,
        error: `文件下载失败: ${error.message}`
      });
    }
  }
}

module.exports = TableController;