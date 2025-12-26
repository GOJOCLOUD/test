import React, { useState } from 'react';
import DocumentProgressBar from './DocumentProgressBar';
import ArchitectureDocument from './ArchitectureDocument';
import useAppStore from '../store/useAppStore';

const Section = ({ title, items, order }) => {
  // 空值保护：确保items是数组
  const safeItems = Array.isArray(items) ? items : [];
  
  return (
    <div className="mb-8">
      <h4 className="text-lg font-bold text-china-red mb-3 border-b-2 border-china-red pb-1 inline-block">
        {order}、{title}
      </h4>
      <ul className="list-none space-y-2 text-justify">
        {safeItems.map((item, i) => (
          <li key={i} className="flex items-start text-ink leading-relaxed font-serif text-lg">
            <span className="inline-block w-1.5 h-1.5 bg-china-red mt-2.5 mr-3 flex-shrink-0 rotate-45"></span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const TodoListCard = () => {
  const { 
    todoList, 
    architectureData, 
    loading, 
    documentProgress,
    summarizedRequirement,
    generateTodoList,
    loading: { todo: loadingTodo },
    precisionMode
  } = useAppStore();
  
  const [showSummary, setShowSummary] = useState(false);

  // 如果有架构设计数据，显示架构设计文档和需求总结
  if (architectureData) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        {/* 需求总结模块 */}
        <section className="official-card mb-6">
          <div className="red-header-title flex justify-between items-center">
            <span>需求总结</span>
            <span className="text-sm font-normal text-gray-600">
              当前模式: <span className="text-china-red font-bold">{precisionMode}</span>
            </span>
          </div>
          <p className="text-sub-text text-sm font-serif mb-6 leading-relaxed">
            <strong className="text-ink">系统已根据您的回答整理出以下需求文档</strong>
          </p>
          
          <div className="space-y-4">
            <div>
              <div className="font-bold text-ink mb-2 font-sans text-md">
                需求文档
              </div>
              <textarea
                value={summarizedRequirement}
                readOnly
                className="w-full min-h-[200px] p-4 border border-gray-300 rounded-md font-serif text-ink bg-gray-50"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <button 
              onClick={() => setShowSummary(true)}
              disabled={loadingTodo}
              className="btn-outline text-lg px-6 py-3"
            >
              返回修改需求
            </button>
            <button 
              onClick={generateTodoList}
              disabled={loadingTodo}
              className="btn-official text-lg px-6 py-3"
            >
              {loadingTodo ? '重新生成中...' : '重新生成架构设计'}
            </button>
          </div>
        </section>
        
        {/* 架构设计文档 */}
        <ArchitectureDocument data={architectureData} />
      </div>
    );
  }
  
  // 如果有总结的需求但没有架构设计数据，显示需求总结和生成按钮
  if (summarizedRequirement) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        {/* 需求总结模块 */}
        <section className="official-card mb-6">
          <div className="red-header-title flex justify-between items-center">
            <span>需求总结</span>
            <span className="text-sm font-normal text-gray-600">
              当前模式: <span className="text-china-red font-bold">{precisionMode}</span>
            </span>
          </div>
          <p className="text-sub-text text-sm font-serif mb-6 leading-relaxed">
            <strong className="text-ink">系统已根据您的回答整理出以下需求文档</strong>
          </p>
          
          <div className="space-y-4">
            <div>
              <div className="font-bold text-ink mb-2 font-sans text-md">
                需求文档
              </div>
              <textarea
                value={summarizedRequirement}
                readOnly
                className="w-full min-h-[200px] p-4 border border-gray-300 rounded-md font-serif text-ink bg-gray-50"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <button 
              onClick={() => setShowSummary(true)}
              disabled={loadingTodo}
              className="btn-outline text-lg px-6 py-3"
            >
              返回修改需求
            </button>
            <button 
              onClick={generateTodoList}
              disabled={loadingTodo}
              className="btn-official text-lg px-6 py-3"
            >
              {loadingTodo ? '生成中...' : '生成架构设计'}
            </button>
          </div>
          
          {/* 如果正在生成架构设计，显示进度条 */}
          {loading.todo && documentProgress.isVisible && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">文档生成进度</span>
                <span className="text-sm text-gray-500">{documentProgress.currentStep}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-china-red h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${documentProgress.progress}%` }}
                ></div>
              </div>
              <div className="mt-2 text-right">
                <span className="text-xs text-gray-500">{documentProgress.progress}%</span>
              </div>
            </div>
          )}
        </section>
      </div>
    );
  }
  
  // 如果正在生成架构设计，显示进度条
  if (loading.todo && documentProgress.isVisible) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <DocumentProgressBar 
          progress={documentProgress.progress} 
          isVisible={documentProgress.isVisible} 
          currentStep={documentProgress.currentStep} 
        />
      </div>
    );
  }
  
  // 空值保护：确保todoList存在且有必要的属性
  if (!todoList) return null;
  
  // 空值保护：确保所有属性都是数组
  const safeTodoList = {
    frontend: Array.isArray(todoList.frontend) ? todoList.frontend : [],
    backend: Array.isArray(todoList.backend) ? todoList.backend : [],
    deploy: Array.isArray(todoList.deploy) ? todoList.deploy : [],
    // 如果todoList有items属性（新格式），也进行保护
    items: Array.isArray(todoList.items) ? todoList.items : []
  };

  // 如果是新格式的todoList（有title和items），显示新格式
  if (todoList.title && todoList.items) {
    return (
      <article className="official-card p-10">
        {/* 模拟红头文件头部 */}
        <div className="text-center mb-10 pb-6 border-b border-red-100">
          <h2 className="text-3xl md:text-4xl font-black text-china-red mb-4 tracking-wide">
            {todoList.title}
          </h2>
          <div className="flex justify-center gap-8 text-sm text-gray-500 font-sans">
            <span>发文单位：智能生成中心</span>
            <span>编号：工报〔2025〕1号</span>
          </div>
        </div>

        {/* 正文内容 - 显示items */}
        <div className="prose max-w-none">
          <ul className="list-none space-y-2 text-justify">
            {safeTodoList.items.map((item, i) => (
              <li key={i} className="flex items-start text-ink leading-relaxed font-serif text-lg mb-4">
                <span className="inline-block w-1.5 h-1.5 bg-china-red mt-2.5 mr-3 flex-shrink-0 rotate-45"></span>
                <span>{item.text || item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 模拟文件尾部 */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex justify-end">
          <div className="text-right">
            <div className="font-serif text-lg font-bold text-ink mb-1">工程日报社技术部</div>
            <div className="text-sm text-gray-500">{new Date().toLocaleDateString('zh-CN', {year:'numeric', month:'long', day:'numeric'})}</div>
          </div>
        </div>
      </article>
    );
  }

  // 默认格式：显示frontend、backend、deploy
  return (
    <article className="official-card p-10">
      {/* 模拟红头文件头部 */}
      <div className="text-center mb-10 pb-6 border-b border-red-100">
        <h2 className="text-3xl md:text-4xl font-black text-china-red mb-4 tracking-wide">
          关于推进项目工程建设的实施方案
        </h2>
        <div className="flex justify-center gap-8 text-sm text-gray-500 font-sans">
          <span>发文单位：智能生成中心</span>
          <span>编号：工报〔2025〕1号</span>
        </div>
      </div>

      {/* 正文内容 - 多栏布局 */}
      <div className="columns-1 md:columns-2 gap-10">
        <div className="break-inside-avoid">
            <Section title="前端工程建设" items={safeTodoList.frontend} order="一" />
        </div>
        <div className="break-inside-avoid">
            <Section title="后端架构部署" items={safeTodoList.backend} order="二" />
        </div>
        <div className="break-inside-avoid">
            <Section title="运维与交付保障" items={safeTodoList.deploy} order="三" />
        </div>
      </div>

      {/* 模拟文件尾部 */}
      <div className="mt-12 pt-6 border-t border-gray-200 flex justify-end">
        <div className="text-right">
          <div className="font-serif text-lg font-bold text-ink mb-1">工程日报社技术部</div>
          <div className="text-sm text-gray-500">{new Date().toLocaleDateString('zh-CN', {year:'numeric', month:'long', day:'numeric'})}</div>
        </div>
      </div>
    </article>
  );
};

export default TodoListCard;