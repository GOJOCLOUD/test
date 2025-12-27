/* 文件位置: frontend/src/pages/NewsPage.jsx */
import React, { useState } from 'react';
import ConvertPanel from '../components/ConvertPanel';
import { QRCodeSVG } from 'qrcode.react';

function NewsPage({ isChinese }) {
  const [activeTab, setActiveTab] = useState('converter'); // 'converter'
  const [filePath, setFilePath] = useState('');
  const [rawText, setRawText] = useState('');
  
  // 二维码状态
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeContent, setQRCodeContent] = useState('');
  
  // 生成随机二维码内容
  const generateQRCode = () => {
    // 生成随机字符串作为二维码内容
    const randomContent = `payment_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    setQRCodeContent(randomContent);
    setShowQRCode(true);
  };

  return (
    <div className="layout-grid">
      
      {/* Left Column: Main Feature (The Tool) */}
      <div className="main-content">
        
        {/* Headline Article */}
        <div className="headline-block">
          <h1 className="headline-text">{isChinese ? '文档格式转换工具' : 'Document Format Converter'}</h1>
          <p className="headline-lead">
            {isChinese ? 
              '高效处理PDF、Word等文档格式转换。支持批量处理，保持原始格式，提升办公效率。' : 
              'Efficiently handle document format conversions for PDF, Word and more. Supports batch processing, maintains original formatting, and improves office productivity.'
            }
          </p>
        </div>

        {/* The Tool Section (Replaces "Work Deployment") */}
        <div className="tool-container">
          <div className="tool-header">
            <span className="tool-label">{isChinese ? '交互式工具' : 'Interactive Tool'}</span>
            <span>{isChinese ? '由智能引擎驱动' : 'POWERED BY INTELLIGENT ENGINE'}</span>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <div 
              className={`tab ${activeTab === 'converter' ? 'active' : ''}`}
              onClick={() => setActiveTab('converter')}
            >
              {isChinese ? '文档转换器' : 'DOCUMENT CONVERTER'}
            </div>

          </div>

          {/* Feature A: PDF/Word to TXT */}
          {activeTab === 'converter' && (
            <div className="tool-body">
              <ConvertPanel isChinese={isChinese} />
            </div>
          )}



        </div>
      </div>

      {/* Right Column: Sidebar */}
      <aside className="sidebar">
        
        {/* Section: Latest News */}
        <div className="sidebar-item">
          <span className="sidebar-header">{isChinese ? '最新头条' : 'Latest Headlines'}</span>
          <ul className="article-list">
            <li><a href="#" className="article-link">{isChinese ? '科技板块稳定，全球市场反弹' : 'Global markets rally as tech sector stabilizes'}</a></li>
            <li><a href="#" className="article-link">{isChinese ? '观点：为什么React仍然是首选框架' : 'Opinion: Why React remains the framework of choice'}</a></li>
            <li><a href="#" className="article-link">{isChinese ? '回顾：2025年最佳PDF解析算法' : 'Review: The best PDF parsing algorithms of 2025'}</a></li>
            <li><a href="#" className="article-link">{isChinese ? '讣告：Internet Explorer的遗产' : 'Obituary: The Legacy of Internet Explorer'}</a></li>
          </ul>
        </div>

        {/* Section: Market/Data (Instead of Core Values) */}
        <div className="sidebar-item">
          <span className="sidebar-header">{isChinese ? '市场观察' : 'Market Watch'}</span>
          <div className="market-data">
            <div className="data-row"><span>{isChinese ? 'TXT指数' : 'TXT Index'}</span> <span>▲ 1.2%</span></div>
            <div className="data-row"><span>{isChinese ? 'PDF期货' : 'PDF Futures'}</span> <span>▼ 0.5%</span></div>
            <div className="data-row"><span>{isChinese ? 'AI收益率' : 'AI Yield'}</span> <span>▲ 4.8%</span></div>
          </div>
        </div>

        {/* Section: Subscription/Payment */}
        <div className="sidebar-item">
          <div className="ad-box">
            <span style={{display:'block', fontWeight:'bold', marginBottom:'10px', textTransform:'uppercase'}}>
              {isChinese ? '解锁全部功能' : 'Unlock Full Access'}
            </span>
            <p style={{fontSize:'0.9rem', marginBottom:'15px', fontStyle:'italic'}}>
              {isChinese ? '立即订阅，享受无限转换和高级AI样式。' : 'Subscribe today for unlimited conversions and advanced AI styling.'}
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
                  {isChinese ? '扫码订阅' : 'Scan to subscribe'}
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
                  <span style={{fontSize:'0.7rem'}}>{isChinese ? '生成二维码' : 'GENERATE QR CODE'}</span>
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
                  {isChinese ? '立即订阅' : 'SUBSCRIBE NOW'}
                </button>
              </div>
            )}
          </div>
        </div>

      </aside>

    </div>
  );
}

export default NewsPage;