import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NewsSection from './components/NewsSection';
import SupplementSection from './components/SupplementSection';
import EngineeringSection from './components/EngineeringSection';
import FrontendSection from './components/FrontendSection';
import SettingsPanel from './components/SettingsPanel';
import GLMTestPage from './pages/GLMTestPage';
import useAppStore from './store/useAppStore';
import { Settings } from 'lucide-react';

const Masthead = ({ activeTab, setActiveTab }) => {
  const date = new Date();
  const dateStr = date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  const weekDay = date.toLocaleDateString('zh-CN', { weekday: 'long' });

  return (
    <header className="bg-white pt-6 pb-2 px-4 border-b-4 border-china-red mb-8">
      <div className="max-w-5xl mx-auto">
        {/* 报头区域 */}
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="text-china-red tracking-[0.5em] text-xs font-bold mb-1">工程建设与智能化发展专刊</div>
            {/* 模拟书法字效果，使用特大号宋体加粗 */}
            <h1 className="font-serif font-black text-6xl md:text-7xl text-china-red leading-none" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>
              工程日报
            </h1>
            <div className="text-sm text-gray-500 mt-1 tracking-widest uppercase font-serif">Engineering Daily</div>
          </div>
          
          <div className="text-right hidden md:block">
            <div className="text-china-red font-bold text-lg">{dateStr}</div>
            <div className="text-gray-600 text-sm">{weekDay}</div>
            <div className="text-gray-400 text-xs mt-1">今日 {Math.ceil(Math.random()*20 + 8)} 版</div>
          </div>
        </div>

        {/* 导航栏 - 红色横条 */}
        <div className="bg-china-red text-white flex justify-between items-center px-4 py-1.5 text-sm font-sans font-bold">
            <div className="flex gap-6">
              <span 
                className={`cursor-pointer hover:text-yellow-200 ${activeTab === 'news' ? 'text-yellow-200' : ''}`}
                onClick={() => setActiveTab('news')}
              >
                细化
              </span>
              <span 
                className={`cursor-pointer hover:text-yellow-200 ${activeTab === 'frontend' ? 'text-yellow-200' : ''}`}
                onClick={() => setActiveTab('frontend')}
              >
                前端
              </span>
              <span 
                className={`cursor-pointer hover:text-yellow-200 ${activeTab === 'engineering' ? 'text-yellow-200' : ''}`}
                onClick={() => setActiveTab('engineering')}
              >
                后端
              </span>
              <span 
                className={`cursor-pointer hover:text-yellow-200 ${activeTab === 'supplement' ? 'text-yellow-200' : ''}`}
                onClick={() => setActiveTab('supplement')}
              >
                转译
              </span>
            </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => useAppStore.getState().toggleSettings()}
              className="flex items-center gap-1 hover:text-yellow-200 transition-colors"
              title="系统设置"
            >
              <Settings className="w-4 h-4" />
              <span>设置</span>
            </button>
            <div className="tracking-widest">第 1024 期</div>
          </div>
        </div>
      </div>
    </header>
  );
};

function App() {
  const { showSettings, toggleSettings } = useAppStore();
  const [activeTab, setActiveTab] = useState('news'); // 'news' 或 'supplement'
  
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-news-bg pb-20">
        <Masthead activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="max-w-5xl mx-auto px-4">
          {activeTab === 'news' ? <NewsSection /> : 
           activeTab === 'engineering' ? <EngineeringSection /> : 
           activeTab === 'frontend' ? <FrontendSection /> : 
           <SupplementSection />}
        </main>
        
        {/* 设置面板 */}
        {showSettings && (
          <SettingsPanel onClose={toggleSettings} />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;