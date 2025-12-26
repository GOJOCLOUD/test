/* 文件位置: frontend/src/components/ConvertPanel.jsx */
import React, { useState } from 'react';
import { Upload, FileText, Download, Loader2, FolderOpen, X, Plus } from 'lucide-react';
import { uploadWord, uploadPDF, batchUploadWord, batchUploadPDF } from '../services/api';

const ConvertPanel = ({ isChinese }) => {
  const [files, setFiles] = useState([]);
  const [outputPath, setOutputPath] = useState('C:/Users/35129/Desktop/襄州区'); // 使用正斜杠，避免转义字符问题
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [batchMode, setBatchMode] = useState(false);

  // 处理路径中的双引号问题 - 移除不必要的双引号
  const preservePathFormat = (path) => {
    // 如果路径有双引号，移除它们
    if (path.startsWith('"') && path.endsWith('"')) {
      return path.slice(1, -1);
    }
    // 否则保持原样
    return path;
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    // 在批量模式下，添加文件到现有列表，而不是替换
    if (batchMode) {
      setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    } else {
      setFiles(selectedFiles);
    }
    setError(null);
  };

  // 添加更多文件的函数
  const handleAddMoreFiles = () => {
    document.getElementById('add-more-files').click();
  };

  // 处理单个文件移除
  const handleRemoveFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  // 清空所有文件
  const handleClearFiles = () => {
    setFiles([]);
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
        // 保持路径格式（带双引号）
        setOutputPath(preservePathFormat(selectedFolder));
      }
    } catch (error) {
      console.error('Error browsing folder:', error);
      setError(isChinese ? '浏览文件夹失败' : 'Failed to browse folder');
    }
  };

  // 处理单个文件转换
  const handleSingleConvert = async () => {
    if (files.length === 0) {
      setError(isChinese ? '请先选择文件' : 'Please select a file first');
      return;
    }

    if (!outputPath) {
      setError(isChinese ? '请指定输出路径' : 'Please specify output path');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      // 保持路径的双引号格式
      const formattedPath = preservePathFormat(outputPath);
      
      const file = files[0];
      let response;
      if (file.name.endsWith('.pdf')) {
        response = await uploadPDF(file, formattedPath);
      } else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        response = await uploadWord(file, formattedPath);
      } else {
        throw new Error('Unsupported file format');
      }

      // 检查响应结构，确保正确处理数据
      setResults([response.data.data || response.data]);
    } catch (err) {
      setError(err.message || 'Conversion failed');
    } finally {
      setLoading(false);
    }
  };

  // 处理批量文件转换
  const handleBatchConvert = async () => {
    if (files.length === 0) {
      setError(isChinese ? '请先选择文件' : 'Please select files first');
      return;
    }

    if (!outputPath) {
      setError(isChinese ? '请指定输出路径' : 'Please specify output path');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      // 保持路径的双引号格式
      const formattedPath = preservePathFormat(outputPath);
      
      // 按文件类型分组
      const wordFiles = files.filter(file => file.name.endsWith('.docx') || file.name.endsWith('.doc'));
      const pdfFiles = files.filter(file => file.name.endsWith('.pdf'));
      
      const allResults = [];
      
      // 批量处理Word文件
      if (wordFiles.length > 0) {
        const wordResponse = await batchUploadWord(wordFiles, formattedPath);
        if (wordResponse.data && wordResponse.data.data) {
          allResults.push(...wordResponse.data.data);
        }
      }
      
      // 批量处理PDF文件
      if (pdfFiles.length > 0) {
        const pdfResponse = await batchUploadPDF(pdfFiles, formattedPath);
        if (pdfResponse.data && pdfResponse.data.data) {
          allResults.push(...pdfResponse.data.data);
        }
      }
      
      setResults(allResults);
    } catch (err) {
      setError(err.message || 'Batch conversion failed');
    } finally {
      setLoading(false);
    }
  };

  // 统一转换处理函数
  const handleConvert = () => {
    if (batchMode || files.length > 1) {
      handleBatchConvert();
    } else {
      handleSingleConvert();
    }
  };

  return (
    <div className="form-container">
      <div className="form-row">
        <label className="form-label">{isChinese ? '1. 源文档' : '1. Source Document'}</label>
        
        {/* 模式切换 */}
        <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setBatchMode(false)}
            style={{
              padding: '8px 15px',
              background: !batchMode ? '#333' : '#f5f5f5',
              color: !batchMode ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {isChinese ? '单文件模式' : 'Single File Mode'}
          </button>
          <button
            onClick={() => setBatchMode(true)}
            style={{
              padding: '8px 15px',
              background: batchMode ? '#333' : '#f5f5f5',
              color: batchMode ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {isChinese ? '批量模式' : 'Batch Mode'}
          </button>
        </div>
        
        {/* 文件选择区域 */}
        <div className="file-drop">
          <input 
            type="file" 
            accept=".pdf,.docx,.doc" 
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="file-upload"
            multiple={batchMode}
          />
          {/* 隐藏的"添加更多文件"输入框 */}
          <input 
            type="file" 
            accept=".pdf,.docx,.doc" 
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="add-more-files"
            multiple
          />
          <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
            {files.length > 0 ? (
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <FolderOpen size={24} />
                  <span>{isChinese ? `已选择 ${files.length} 个文件` : `${files.length} files selected`}</span>
                  {batchMode && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddMoreFiles();
                      }}
                      style={{
                        marginLeft: 'auto',
                        background: '#1890ff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Plus size={14} />
                      {isChinese ? '添加更多文件' : 'Add More Files'}
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleClearFiles();
                    }}
                    style={{
                      background: '#ff4d4f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {isChinese ? '清空' : 'Clear'}
                  </button>
                </div>
                
                {/* 文件列表 */}
                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '5px' }}>
                  {files.map((file, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      padding: '5px',
                      borderBottom: index < files.length - 1 ? '1px solid #eee' : 'none'
                    }}>
                      <FileText size={16} />
                      <span style={{ fontSize: '14px', flex: 1 }}>{file.name}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveFile(index);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ff4d4f',
                          cursor: 'pointer',
                          padding: '0'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <Upload size={24} style={{ marginBottom: '10px' }} />
                <div style={{ fontFamily: 'Times New Roman', fontStyle: 'italic', fontSize: '1.2rem' }}>
                  {batchMode 
                    ? (isChinese ? '将多个Word或PDF文档拖放到此处' : 'Drag and drop multiple Word or PDF manuscripts here')
                    : (isChinese ? '将Word或PDF文档拖放到此处' : 'Drag and drop Word or PDF manuscripts here')
                  }
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px' }}>
                  {isChinese ? '支持 .docx, .pdf, .doc 格式' : 'Supports .docx, .pdf, .doc'}
                </div>
              </div>
            )}
          </label>
        </div>
      </div>

      <div className="form-row">
        <label className="form-label">{isChinese ? '2. 目标目录' : '2. Destination Directory'}</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            className="input-classic" 
            placeholder={isChinese ? '例如："C:\\Users\\35129\\Desktop\\襄州区"' : 'e.g., "C:\\Users\\Admin\\Documents\\Archive..." or "D:\\path with spaces\\"'}
            value={outputPath}
            onChange={(e) => setOutputPath(e.target.value)}
          />
          <button 
            style={{ 
              padding: '0 15px', 
              background: 'white', 
              border: '1px solid #999', 
              fontFamily: 'Arial', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: 'translateY(0)',
              boxShadow: '0 2px 0 rgba(0,0,0,0.1)'
            }}
            onClick={handleBrowseFolder}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 3px 0 rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 0 rgba(0,0,0,0.1)';
            }}
            onMouseDown={(e) => {
              e.target.style.transform = 'translateY(1px)';
              e.target.style.boxShadow = '0 1px 0 rgba(0,0,0,0.1)';
            }}
            onMouseUp={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 3px 0 rgba(0,0,0,0.15)';
            }}
          >
            {isChinese ? '浏览' : 'BROWSE'}
          </button>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
          地址格式要求：使用双引号包围Windows路径，如："C:\\Users\\35129\\Desktop\\襄州区"
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ color: 'red', marginTop: '10px', fontFamily: 'Times New Roman' }}>
          {error}
        </div>
      )}

      <div style={{ overflow: 'hidden', marginTop: '20px' }}>
        <button 
          className="btn-black" 
          onClick={handleConvert}
          disabled={loading || files.length === 0}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            transition: 'all 0.2s ease',
            transform: 'translateY(0)',
            boxShadow: '0 4px 0 rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            if (!e.target.disabled) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 0 rgba(0,0,0,0.25)';
            }
          }}
          onMouseLeave={(e) => {
            if (!e.target.disabled) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 0 rgba(0,0,0,0.2)';
            }
          }}
          onMouseDown={(e) => {
            if (!e.target.disabled) {
              e.target.style.transform = 'translateY(2px)';
              e.target.style.boxShadow = '0 2px 0 rgba(0,0,0,0.2)';
            }
          }}
          onMouseUp={(e) => {
            if (!e.target.disabled) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 0 rgba(0,0,0,0.25)';
            }
          }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {isChinese ? '处理中...' : 'PROCESSING...'}
            </>
          ) : (
            <>
              <FileText size={18} />
              {batchMode || files.length > 1 
                ? (isChinese ? '批量提取文本' : 'BATCH EXTRACT TEXT')
                : (isChinese ? '提取文本' : 'EXTRACT TEXT')
              }
            </>
          )}
        </button>
      </div>

      {/* 结果展示 */}
      {results.length > 0 && (
        <div className="result-container" style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', fontFamily: 'Times New Roman' }}>
          <h3>{isChinese ? '转换结果' : 'Conversion Result'}</h3>
          
          {results.length === 1 ? (
            // 单个文件结果
            <div>
              <p><strong>{isChinese ? '文件名:' : 'File Name:'}</strong> {results[0].fileName || (isChinese ? '未知' : 'Unknown')}</p>
              <p><strong>{isChinese ? '保存路径:' : 'Save Path:'}</strong> {results[0].outputPath || (isChinese ? '未知' : 'Unknown')}</p>
              <p><strong>{isChinese ? '文本长度:' : 'Text Length:'}</strong> {results[0].textLength || 0} {isChinese ? '字符' : 'characters'}</p>
              <p><strong>{isChinese ? '状态:' : 'Status:'}</strong> {results[0].success ? (isChinese ? '成功' : 'Success') : (isChinese ? '失败' : 'Failed')}</p>
              {results[0].message && <p><strong>{isChinese ? '消息:' : 'Message:'}</strong> {results[0].message}</p>}
            </div>
          ) : (
            // 批量文件结果
            <div>
              <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                <p><strong>{isChinese ? '总文件数:' : 'Total Files:'}</strong> {results.length}</p>
                <p><strong>{isChinese ? '成功:' : 'Success:'}</strong> {results.filter(r => r.success).length}</p>
                <p><strong>{isChinese ? '失败:' : 'Failed:'}</strong> {results.filter(r => !r.success).length}</p>
              </div>
              
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '5px' }}>
                {results.map((result, index) => (
                  <div key={index} style={{ 
                    padding: '8px', 
                    borderBottom: index < results.length - 1 ? '1px solid #eee' : 'none',
                    background: result.success ? '#f6ffed' : '#fff2f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold' }}>{result.fileName || (isChinese ? '未知文件' : 'Unknown file')}</span>
                      <span style={{ 
                        color: result.success ? '#52c41a' : '#ff4d4f',
                        fontSize: '12px'
                      }}>
                        {result.success ? (isChinese ? '成功' : 'Success') : (isChinese ? '失败' : 'Failed')}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      {isChinese ? '文本长度:' : 'Text Length:'} {result.textLength || 0}
                    </div>
                    {result.message && (
                      <div style={{ fontSize: '12px', color: '#ff4d4f', marginTop: '4px' }}>
                        {result.message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 重新生成按钮 */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => {
                setResults([]);
                setError(null);
                handleConvert();
              }}
              disabled={loading || files.length === 0}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                padding: '10px 20px',
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading || files.length === 0 ? 'not-allowed' : 'pointer',
                fontFamily: 'Times New Roman',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                transform: 'translateY(0)',
                boxShadow: '0 4px 0 rgba(0,0,0,0.2)'
              }}
              onMouseEnter={(e) => {
                if (!e.target.disabled) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 0 rgba(0,0,0,0.25)';
                  e.target.style.background = '#1976D2';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.target.disabled) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 0 rgba(0,0,0,0.2)';
                  e.target.style.background = '#2196F3';
                }
              }}
              onMouseDown={(e) => {
                if (!e.target.disabled) {
                  e.target.style.transform = 'translateY(2px)';
                  e.target.style.boxShadow = '0 2px 0 rgba(0,0,0,0.2)';
                  e.target.style.background = '#1565C0';
                }
              }}
              onMouseUp={(e) => {
                if (!e.target.disabled) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 0 rgba(0,0,0,0.25)';
                  e.target.style.background = '#1976D2';
                }
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {isChinese ? '重新生成中...' : 'Regenerating...'}
                </>
              ) : (
                <>
                  <FileText size={18} />
                  {isChinese ? '重新生成' : 'Regenerate'}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConvertPanel;