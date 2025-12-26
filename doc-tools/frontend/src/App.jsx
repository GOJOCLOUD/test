/* 文件位置: frontend/src/App.jsx */
import React, { useState } from 'react';
import './index.css';
import NewsPage from './pages/NewsPage';
import BusinessPage from './pages/BusinessPage';

function App() {
  // 语言切换状态
  const [isChinese, setIsChinese] = useState(false);
  
  // 当前活动页面
  const [activePage, setActivePage] = useState('news'); // 'news' | 'business' | 'translate'
  
  // 切换语言
  const toggleLanguage = () => {
    setIsChinese(!isChinese);
  };

  // 切换页面
  const navigateToPage = (page) => {
    setActivePage(page);
  };

  // 渲染当前页面内容
  const renderCurrentPage = () => {
    switch(activePage) {
      case 'news':
        return <NewsPage isChinese={isChinese} />;
      case 'business':
        return <BusinessPage isChinese={isChinese} />;
      case 'translate':
        return <div className="layout-grid">
          <div className="main-content">
            <div className="headline-block">
              <h1 className="headline-text">{isChinese ? '翻译功能' : 'Translation Feature'}</h1>
              <p className="headline-lead">
                {isChinese ? '翻译功能正在开发中，敬请期待！' : 'Translation feature is under development, stay tuned!'}
              </p>
            </div>
          </div>
        </div>;
      default:
        return <NewsPage isChinese={isChinese} />;
    }
  };

  return (
    <div className="newspaper-wrapper">
      
      {/* 1. Masthead (报头) */}
      <header className="masthead">
        <div className="masthead-top">
          <span>London, Friday November 28 2025</span>
          <span>No. 74,102</span>
          <span>£3.50 or Subscribe</span>
        </div>
        
        <div className={`the-times-logo ${isChinese ? 'chinese-title' : ''}`}>{isChinese ? '工程时报' : 'Engineering Times'}</div>
        
        <div className="motto">{isChinese ? '工程资讯，专业报道' : 'Engineering News, Professional Reporting'}</div>
      </header>

      {/* 2. Navigation (新闻分类) */}
      <nav className="nav-strip">
        <span 
          className={`nav-link ${activePage === 'news' ? 'active' : ''}`}
          onClick={() => navigateToPage('news')}
        >
          {isChinese ? '新闻' : 'News'}
        </span>
        <span 
          className={`nav-link ${activePage === 'business' ? 'active' : ''}`}
          onClick={() => navigateToPage('business')}
        >
          {isChinese ? '商业' : 'Business'}
        </span>
        <span className="nav-link" onClick={toggleLanguage}>
          {isChinese ? '翻译' : 'translate'}
        </span>
      </nav>

      {/* 3. Main Content - 根据当前活动页面渲染不同内容 */}
      {renderCurrentPage()}
      
    </div>
  );
}

export default App;