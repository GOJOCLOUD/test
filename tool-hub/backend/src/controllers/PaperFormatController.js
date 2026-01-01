const fs = require('fs');
const path = require('path');
const { PythonShell } = require('python-shell');

class PaperFormatController {
  /**
   * 处理论文排版请求
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  static async formatPaper(req, res) {
    try {
      // 检查是否有文件上传
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '请上传Word文档'
        });
      }

      // 获取上传的文件信息
      const { path: tempFilePath, originalname } = req.file;
      const inputFilePath = tempFilePath;
      
      // 生成输出文件路径
      const outputFileName = `${path.parse(originalname).name}_formatted.docx`;
      const outputFilePath = path.join(__dirname, '../../tmp', outputFileName);

      console.log(`处理文件: ${originalname}`);
      console.log(`输入路径: ${inputFilePath}`);
      console.log(`输出路径: ${outputFilePath}`);

      // 调用Python脚本来处理文档
      const result = await PaperFormatController.runPythonScript(inputFilePath, outputFilePath);

      // 检查处理结果
      if (!result.success || !fs.existsSync(outputFilePath)) {
        // 清理临时文件
        if (fs.existsSync(inputFilePath)) {
          fs.unlinkSync(inputFilePath);
        }
        
        return res.status(500).json({
          success: false,
          message: result.message || '论文排版失败'
        });
      }

      // 设置响应头，提供文件下载
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${outputFileName}"`);
      
      // 发送文件
      const fileStream = fs.createReadStream(outputFilePath);
      fileStream.pipe(res);
      
      // 清理临时文件
      fileStream.on('end', () => {
        try {
          if (fs.existsSync(inputFilePath)) {
            fs.unlinkSync(inputFilePath);
          }
          if (fs.existsSync(outputFilePath)) {
            fs.unlinkSync(outputFilePath);
          }
          console.log('临时文件已清理');
        } catch (error) {
          console.error('清理临时文件失败:', error);
        }
      });
      
    } catch (error) {
      console.error('处理论文排版请求时出错:', error);
      
      // 清理上传的临时文件
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error('清理上传文件失败:', cleanupError);
        }
      }
      
      res.status(500).json({
        success: false,
        message: '服务器处理错误，请稍后重试'
      });
    }
  }

  /**
   * 运行Python排版脚本
   * @param {string} inputFilePath - 输入文件路径
   * @param {string} outputFilePath - 输出文件路径
   * @returns {Promise<Object>} - 处理结果
   */
  static async runPythonScript(inputFilePath, outputFilePath) {
    return new Promise((resolve, reject) => {
      // Python脚本路径
      const pythonScriptPath = path.join(__dirname, '../tools/paper_formatting/paper_formatter.py');
      
      // 检查Python脚本是否存在
      if (!fs.existsSync(pythonScriptPath)) {
        return reject(new Error('Python排版脚本不存在'));
      }

      // 准备PythonShell选项
      const options = {
        mode: 'json',
        args: ['--input', inputFilePath, '--output', outputFilePath]
      };

      console.log(`执行Python脚本: ${pythonScriptPath}`);
      console.log(`参数: ${JSON.stringify(options.args)}`);

      // 执行Python脚本
      PythonShell.run(pythonScriptPath, options, (error, results) => {
        if (error) {
          console.error('Python脚本执行错误:', error);
          resolve({
            success: false,
            message: `Python脚本执行失败: ${error.message}`
          });
        } else {
          // 检查输出文件是否生成
          if (fs.existsSync(outputFilePath)) {
            console.log('论文排版成功');
            resolve({
              success: true,
              message: '论文排版成功'
            });
          } else {
            console.error('输出文件未生成');
            resolve({
              success: false,
              message: '输出文件未生成'
            });
          }
        }
      });
    });
  }
}

module.exports = PaperFormatController;