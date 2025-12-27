/* 文件位置: frontend/src/pages/BusinessPage.jsx */
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

function BusinessPage({ isChinese }) {
  const [tableText, setTableText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [boldHeader, setBoldHeader] = useState(true);
  
  // 二维码状态
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeContent, setQRCodeContent] = useState('');
  
  // 生成随机二维码内容
  const generateQRCode = () => {
    // 生成随机字符串作为二维码内容
    const randomContent = `business_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    setQRCodeContent(randomContent);
    setShowQRCode(true);
  };

  // 处理表格转换
  const handleConvertTable = async () => {
    if (!tableText.trim()) {
      setError(isChinese ? '请输入表格文本' : 'Please enter table text');
      return;
    }

    setIsProcessing(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/table/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableText,
          options: { boldHeader }
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || (isChinese ? '转换失败' : 'Conversion failed'));
      }
    } catch (err) {
      console.error('Error converting table:', err);
      setError(isChinese ? '服务器错误，请稍后再试' : 'Server error, please try again later');
    } finally {
      setIsProcessing(false);
    }
  };

  // 下载Word文档
  const handleDownload = () => {
    if (result && result.fileName) {
      window.open(`http://localhost:3000/api/table/download/${result.fileName}`, '_blank');
    }
  };

  return (
    <div className="layout-grid">
      
      {/* Left Column: Main Feature */}
      <div className="main-content">
        
        {/* Headline Article */}
        <div className="headline-block">
          <h1 className="headline-text">{isChinese ? '表格文本转换工具' : 'Table Text Converter'}</h1>
          <p className="headline-lead">
            {isChinese ? 
              '将乱格式表格文本转换为结构化Word表格。自动识别列结构，支持多种分隔符，一键生成专业表格。' : 
              'Convert messy table text to structured Word tables. Automatically detects column structure, supports multiple separators, and generates professional tables with one click.'
            }
          </p>
        </div>

        {/* Table Converter Tool */}
        <div className="tool-container">
          <div className="tool-header">
            <span className="tool-label">{isChinese ? '表格文本转换器' : 'Table Text Converter'}</span>
            <span>{isChinese ? '将乱格式表格文本转换为结构化Word表格' : 'Convert messy table text to structured Word tables'}</span>
          </div>

          <div className="tool-body">
            {/* Input Section */}
            <div className="input-section" style={{ marginBottom: '20px' }}>
              <label htmlFor="tableText" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                {isChinese ? '输入表格文本:' : 'Enter Table Text:'}
              </label>
              <textarea
                id="tableText"
                value={tableText}
                onChange={(e) => setTableText(e.target.value)}
                placeholder={
                  isChinese 
                    ? '请粘贴从PDF/网页/Excel/聊天复制过来的表格文本...\n支持空格、Tab、竖线(|)多种分隔符'
                    : 'Paste table text from PDF/web/Excel/chat...\nSupports spaces, tabs, pipes (|) and other separators'
                }
                style={{
                  width: '100%',
                  height: '200px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Options Section */}
            <div className="options-section" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={boldHeader}
                  onChange={(e) => setBoldHeader(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                {isChinese ? '第一行作为表头并加粗' : 'First row as header and bold'}
              </label>
            </div>

            {/* Error Display */}
            {error && (
              <div className="error-message" style={{
                color: '#d32f2f',
                backgroundColor: '#ffebee',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '20px'
              }}>
                {error}
              </div>
            )}

            {/* Convert Button */}
            <button
              onClick={handleConvertTable}
              disabled={isProcessing || !tableText.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: isProcessing ? '#ccc' : '#000000',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '20px'
              }}
            >
              {isProcessing 
                ? (isChinese ? '处理中...' : 'Processing...') 
                : (isChinese ? '转换为Word表格' : 'Convert to Word Table')
              }
            </button>

            {/* Result Display */}
            {result && (
              <div className="result-section">
                <div className="result-info" style={{
                  backgroundColor: '#e8f5e9',
                  padding: '15px',
                  borderRadius: '4px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: '10px' }}>
                    {isChinese ? '转换成功!' : 'Conversion Successful!'}
                  </h3>
                  <p style={{ margin: '5px 0' }}>
                    {isChinese ? `行数: ${result.rowCount}` : `Rows: ${result.rowCount}`}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    {isChinese ? `列数: ${result.columnCount}` : `Columns: ${result.columnCount}`}
                  </p>
                </div>

                {/* Preview Table */}
                <div className="table-preview" style={{ marginBottom: '20px' }}>
                  <h4>{isChinese ? '表格预览:' : 'Table Preview:'}</h4>
                  <div style={{
                    overflow: 'auto',
                    maxHeight: '300px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '14px'
                    }}>
                      <tbody>
                        {result.parsedRows.map((row, rowIndex) => (
                          <tr key={rowIndex} style={{
                            backgroundColor: rowIndex === 0 && boldHeader ? '#f5f5f5' : 'transparent'
                          }}>
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} style={{
                                border: '1px solid #ddd',
                                padding: '8px',
                                fontWeight: rowIndex === 0 && boldHeader ? 'bold' : 'normal'
                              }}>
                                {cell || ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  {isChinese ? '下载Word文档' : 'Download Word Document'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Sidebar */}
      <aside className="sidebar">
        
        {/* Section: Usage Tips */}
        <div className="sidebar-item">
          <span className="sidebar-header">{isChinese ? '使用提示' : 'Usage Tips'}</span>
          <ul className="article-list">
            <li><a href="#" className="article-link">{isChinese ? '支持多种分隔符：空格、Tab、竖线(|)' : 'Supports multiple separators: spaces, tabs, pipes (|)'}</a></li>
            <li><a href="#" className="article-link">{isChinese ? '自动识别列结构并对齐' : 'Automatically detects column structure and aligns'}</a></li>
            <li><a href="#" className="article-link">{isChinese ? '生成带全边框的Word表格' : 'Generates Word tables with full borders'}</a></li>
            <li><a href="#" className="article-link">{isChinese ? '表头可设置为加粗样式' : 'Headers can be set to bold style'}</a></li>
          </ul>
        </div>

        {/* Section: Example */}
        <div className="sidebar-item">
          <span className="sidebar-header">{isChinese ? '示例输入' : 'Example Input'}</span>
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap'
          }}>
            {isChinese 
              ? `姓名  年龄  职业
张三  25  工程师
李四  30  设计师
王五  28  产品经理`
              : `Name  Age  Occupation
John  25  Engineer
Jane  30  Designer
Bob   28  Product Manager`
            }
          </div>
        </div>

        {/* Section: Contact */}
        <div className="sidebar-item">
          <div className="ad-box">
            <span style={{display:'block', fontWeight:'bold', marginBottom:'10px', textTransform:'uppercase'}}>
              {isChinese ? '联系我们' : 'Contact Us'}
            </span>
            <p style={{fontSize:'0.9rem', marginBottom:'15px', fontStyle:'italic'}}>
              {isChinese ? '获取企业级解决方案和定制服务。' : 'Get enterprise solutions and customized services.'}
            </p>
            
            {showQRCode ? (
              <div style={{textAlign:'center'}}>
                <div style={{display:'inline-block', padding:'10px', background:'white', borderRadius:'4px', boxShadow:'0 1px 5px rgba(0, 0, 0, 0.1)'}}>
                  <QRCodeSVG 
                    value={qrCodeContent} 
                    size={120} 
                    level="H" 
                    includeMargin={true} 
                  />
                </div>
                <p style={{fontSize:'0.8rem', marginTop:'10px', color:'#666'}}>
                  {isChinese ? '扫码获取报价' : 'Scan for quote'}
                </p>
                <button 
                  onClick={() => setShowQRCode(false)}
                  style={{
                    marginTop:'10px',
                    padding:'5px 10px',
                    background:'#f44336',
                    color:'white',
                    border:'none',
                    borderRadius:'2px',
                    cursor:'pointer',
                    fontSize:'0.7rem',
                    fontFamily:'Arial'
                  }}
                >
                  {isChinese ? '关闭' : 'CLOSE'}
                </button>
              </div>
            ) : (
              <div style={{textAlign:'center'}}>
                <div style={{background:'#eee', width:'80px', height:'80px', margin:'0 auto 10px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid #999', cursor:'pointer'}} onClick={generateQRCode}>
                  <span style={{fontSize:'0.7rem'}}>{isChinese ? '获取二维码' : 'GET QR CODE'}</span>
                </div>
                <button 
                  onClick={generateQRCode}
                  style={{
                    padding:'5px 15px',
                    background:'#000000',
                    color:'white',
                    border:'none',
                    borderRadius:'2px',
                    cursor:'pointer',
                    fontSize:'0.8rem',
                    fontFamily:'Arial'
                  }}
                >
                  {isChinese ? '获取二维码' : 'GET QR CODE'}
                </button>
              </div>
            )}
          </div>
        </div>

      </aside>

    </div>
  );
}

export default BusinessPage;