/* 文件位置: frontend/src/components/RetroConvert.jsx */
import React, { useState } from 'react';
import { FileText, FolderOpen, ArrowRight, Loader2 } from 'lucide-react';
import { uploadWord, uploadPDF } from '../services/api';

const RetroConvert = () => {
  const [file, setFile] = useState(null);
  const [outputPath, setOutputPath] = useState('C:/Users/Public/Documents'); // 默认路径示例，使用正斜杠避免转义问题
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files[0]) setFile(e.target.files[0]);
  };

  // 处理浏览文件夹
  const handleBrowseFolder = async () => {
    try {
      // 使用HTML5的文件夹选择API
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true;
      input.style.display = 'none';
      
      // 添加到DOM
      document.body.appendChild(input);
      
      // 触发点击事件
      input.click();
      
      // 监听选择结果
      const selectedFolder = await new Promise((resolve) => {
        input.onchange = (e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            // 获取文件夹路径
            const file = files[0];
            if (file && typeof file.path === 'string') {
              let fullPath = file.path;
              
              // 安全处理文件夹路径
              if (typeof file.name === 'string' && typeof fullPath === 'string') {
                fullPath = fullPath.replace(file.name, '');
              }
              
              // 处理webkitRelativePath
              if (file.webkitRelativePath) {
                const folderPath = file.webkitRelativePath.split('/')[0];
                if (typeof folderPath === 'string' && typeof fullPath === 'string') {
                  fullPath = fullPath.replace(folderPath + '/', '');
                }
              }
              
              resolve(fullPath);
            } else {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        };
      });
      
      // 移除临时输入框
      document.body.removeChild(input);
      
      if (selectedFolder) {
        setOutputPath(selectedFolder);
      }
    } catch (error) {
      console.error('Error browsing folder:', error);
      alert('浏览文件夹失败：' + error.message);
    }
  };

  const handleConvert = async () => {
    if (!file) return alert('请先选择一个文档');
    if (!outputPath) return alert('请指定输出目录');

    setLoading(true);
    setStatus('转换引擎正在处理您的文档...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('outputPath', outputPath);

    try {
      let response;
      if (file.type === 'application/pdf') {
        response = await uploadPDF(formData);
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword'
      ) {
        response = await uploadWord(formData);
      } else {
        throw new Error('不支持的文档类型');
      }
      
      // 检查响应结构，确保正确获取输出路径
      const responseData = response.data.data || response.data;
      setStatus(`转换成功！您的文档已转录至：${responseData.outputPath || '未知路径'}`);
    } catch (error) {
      console.error(error);
      setStatus('转换失败：' + (error.response?.data?.message || error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f4f1ea] border-2 border-black p-6 relative">
      {/* 装饰性角落 */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-black"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-black"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-black"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-black"></div>
      
      <div className="relative z-10">
        <h2 className="font-masthead text-2xl font-bold mb-6 text-center border-b-2 border-black pb-2 flex items-center justify-center gap-2">
          <FileText className="text-black" /> 
          <span>文档转录器</span>
        </h2>

        <div className="space-y-6">
          {/* 文件选择区 */}
          <div className="border-2 border-dashed border-black p-6 text-center bg-white/50">
            <input 
              type="file" 
              onChange={handleFileChange} 
              accept=".pdf,.doc,.docx"
              className="hidden" 
              id="convert-upload"
            />
            <label htmlFor="convert-upload" className="cursor-pointer block font-serif">
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText size={20} />
                  <span className="font-bold">{file.name}</span>
                </div>
              ) : (
                <div>
                  <p className="font-bold mb-2">选择您的文档</p>
                  <p className="text-sm italic text-gray-600">点击此处浏览PDF或Word文件</p>
                </div>
              )}
            </label>
          </div>

          {/* 路径输入区 */}
          <div>
            <label className="block font-masthead font-bold text-sm mb-2 uppercase tracking-wider">输出目录</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={outputPath}
                onChange={(e) => setOutputPath(e.target.value)}
                className="flex-1 p-3 border-2 border-black font-mono text-sm bg-white/50"
                placeholder="例如：D:\我的文档"
              />
              <button className="p-2 bg-black text-white border-2 border-black hover:bg-transparent hover:text-black transition-all duration-200 transform hover:-translate-y-1 active:translate-y-0" title="浏览文件夹" onClick={handleBrowseFolder}>
                <FolderOpen size={18}/>
              </button>
            </div>
          </div>

          {/* 按钮 */}
          <button 
            onClick={handleConvert}
            disabled={loading}
            className="btn-times w-full py-3 flex items-center justify-center gap-2 text-base transition-all duration-200 transform hover:-translate-y-1 active:translate-y-0"
            style={{
              boxShadow: loading ? '0 2px 0 rgba(0,0,0,0.2)' : '0 4px 0 rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!e.target.disabled) {
                e.target.style.boxShadow = '0 6px 0 rgba(0,0,0,0.25)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.target.disabled) {
                e.target.style.boxShadow = '0 4px 0 rgba(0,0,0,0.2)';
              }
            }}
            onMouseDown={(e) => {
              if (!e.target.disabled) {
                e.target.style.boxShadow = '0 2px 0 rgba(0,0,0,0.2)';
              }
            }}
            onMouseUp={(e) => {
              if (!e.target.disabled) {
                e.target.style.boxShadow = '0 6px 0 rgba(0,0,0,0.25)';
              }
            }}
          >
            {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
            {loading ? '处理中...' : '开始转录'}
          </button>

          {status && (
            <div className="p-4 border-2 border-black bg-white/50 font-serif text-sm">
              <p className="italic">{status}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RetroConvert;