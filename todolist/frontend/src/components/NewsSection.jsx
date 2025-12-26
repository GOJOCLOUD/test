import React from 'react';
import InputPanel from './InputPanel';
import QuestionCard from './QuestionCard';
import TodoListCard from './TodoListCard';

const NewsSection = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* 左侧主版面 - 占 75% */}
      <div className="lg:w-3/4">
        <InputPanel />
        <QuestionCard />
        <TodoListCard />
      </div>

      {/* 右侧侧边栏 - 占 25% - 模拟报纸侧边栏 */}
      <aside className="lg:w-1/4 space-y-6">
        
        {/* 侧栏卡片 1 */}
        <div className="bg-white border border-gray-200 p-4 shadow-paper">
          <div className="text-china-red font-bold text-lg mb-3 pb-1 border-b border-gray-200">
            今日要闻
          </div>
          <ul className="space-y-3 text-sm font-serif text-ink leading-snug">
            <li className="hover:text-china-red cursor-pointer">· 深入学习 AI 生成式技术新思想</li>
            <li className="hover:text-china-red cursor-pointer">· 全面提升前端工程化构建效率</li>
            <li className="hover:text-china-red cursor-pointer">· 坚持 React 生态不动摇</li>
          </ul>
        </div>

        {/* 侧栏卡片 2 */}
        <div className="bg-china-red/5 border border-china-red/20 p-4">
          <div className="text-china-red font-bold text-md mb-2">
            核心价值观
          </div>
          <div className="grid grid-cols-2 gap-2 text-center font-bold text-china-red text-sm">
            <div className="bg-white py-1">创新</div>
            <div className="bg-white py-1">协调</div>
            <div className="bg-white py-1">绿色</div>
            <div className="bg-white py-1">开放</div>
          </div>
        </div>

        {/* 引用 */}
        <div className="bg-gray-100 p-4 text-center italic text-gray-500 font-serif text-sm">
          "技术是第一生产力。"
        </div>

      </aside>
    </div>
  );
};

export default NewsSection;