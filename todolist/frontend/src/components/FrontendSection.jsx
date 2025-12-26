import React, { useState, useEffect } from 'react';
import { 
  FileText,
  BookOpen,
  Cpu,
  Code,
  GripVertical,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  RefreshCw
} from 'lucide-react';

const FrontendSection = () => {
  // 组件库中的组件类型
  const componentTypes = [
    { id: 'button', name: '按钮', icon: <Code className="w-4 h-4" />, color: 'bg-blue-100' },
    { id: 'input', name: '输入框', icon: <FileText className="w-4 h-4" />, color: 'bg-green-100' },
    { id: 'card', name: '卡片', icon: <BookOpen className="w-4 h-4" />, color: 'bg-yellow-100' },
    { id: 'chart', name: '图表', icon: <Cpu className="w-4 h-4" />, color: 'bg-purple-100' }
  ];

  // 页面管理状态
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState('');
  const [draggedComponent, setDraggedComponent] = useState(null);
  const [isOverDropZone, setIsOverDropZone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false); // 放大模式状态

  // 从后端获取页面数据
  const fetchPages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/pages');
      const data = await response.json();
      if (data.success) {
        setPages(data.data);
        if (data.data.length > 0) {
          setCurrentPage(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('获取页面数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchPages();
  }, []);

  // 新增页面
  const createPage = async (newPage) => {
    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPage)
      });
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
    } catch (error) {
      console.error('创建页面失败:', error);
    }
    return null;
  };

  // 更新页面
  const updatePage = async (pageId, pageData) => {
    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pageData)
      });
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
    } catch (error) {
      console.error('更新页面失败:', error);
    }
    return null;
  };

  // 更新页面缩放
  const updatePageScale = async (pageId, scale) => {
    try {
      const response = await fetch(`/api/pages/${pageId}/scale`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ scale })
      });
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
    } catch (error) {
      console.error('更新页面缩放失败:', error);
    }
    return null;
  };

  // 获取当前页面的组件
  const currentPageComponents = pages.find(p => p.id === currentPage)?.components || [];
  const currentScale = pages.find(p => p.id === currentPage)?.scale || 1;

  // 拖拽开始事件
  const handleDragStart = (e, componentType) => {
    setDraggedComponent(componentType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // 拖拽结束事件
  const handleDragEnd = () => {
    setDraggedComponent(null);
    setIsOverDropZone(false);
  };

  // 拖拽进入事件
  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsOverDropZone(true);
  };

  // 拖拽离开事件
  const handleDragLeave = () => {
    setIsOverDropZone(false);
  };

  // 拖拽放置事件
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsOverDropZone(false);

    if (draggedComponent) {
      // 创建新组件
      const newComponent = {
        id: `comp-${Date.now()}`,
        type: draggedComponent.id,
        name: `${draggedComponent.name} ${currentPageComponents.filter(c => c.type === draggedComponent.id).length + 1}`,
        position: currentPageComponents.length + 1,
        x: e.clientX - e.currentTarget.getBoundingClientRect().left - 50,
        y: e.clientY - e.currentTarget.getBoundingClientRect().top - 50
      };

      // 更新当前页面的组件
      const updatedComponents = [...currentPageComponents, newComponent];
      const updatedPage = await updatePage(currentPage, { components: updatedComponents });
      if (updatedPage) {
        const updatedPages = pages.map(page => {
          if (page.id === currentPage) {
            return updatedPage;
          }
          return page;
        });
        setPages(updatedPages);
      }
    }
  };

  // 允许拖拽
  const allowDrop = (e) => {
    e.preventDefault();
  };

  // 删除组件
  const handleDeleteComponent = async (id) => {
    const updatedComponents = currentPageComponents.filter(c => c.id !== id);
    const updatedPage = await updatePage(currentPage, { components: updatedComponents });
    if (updatedPage) {
      const updatedPages = pages.map(page => {
        if (page.id === currentPage) {
          return updatedPage;
        }
        return page;
      });
      setPages(updatedPages);
    }
  };

  // 新增页面
  const handleAddPage = async () => {
    const newPage = {
      name: `页面 ${pages.length + 1}`,
      components: [],
      scale: 1
    };

    const createdPage = await createPage(newPage);
    if (createdPage) {
      setPages([...pages, createdPage]);
      setCurrentPage(createdPage.id);
    }
  };

  // 切换页面
  const handleSwitchPage = (pageId) => {
    setCurrentPage(pageId);
  };

  // 缩放控制
  const handleZoomIn = async () => {
    if (currentScale < 3) {
      const newScale = Math.min(currentScale + 0.1, 3);
      const updatedPage = await updatePageScale(currentPage, newScale);
      if (updatedPage) {
        const updatedPages = pages.map(page => {
          if (page.id === currentPage) {
            return updatedPage;
          }
          return page;
        });
        setPages(updatedPages);
      }
    }
  };

  const handleZoomOut = async () => {
    if (currentScale > 0.1) {
      const newScale = Math.max(currentScale - 0.1, 0.1);
      const updatedPage = await updatePageScale(currentPage, newScale);
      if (updatedPage) {
        const updatedPages = pages.map(page => {
          if (page.id === currentPage) {
            return updatedPage;
          }
          return page;
        });
        setPages(updatedPages);
      }
    }
  };

  const handleResetZoom = async () => {
    const updatedPage = await updatePageScale(currentPage, 1);
    if (updatedPage) {
      const updatedPages = pages.map(page => {
        if (page.id === currentPage) {
          return updatedPage;
        }
        return page;
      });
      setPages(updatedPages);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 mb-12">
      {/* 左侧主版面 - 编辑区域 */}
      <div className="lg:w-3/4">
        <div className="bg-white border-t-4 border-t-china-red border-l border-r border-b border-gray-200 p-6 shadow-paper">
          {/* 报纸栏目标题 */}
          <div className="flex items-center justify-between mb-6 border-b-2 border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Code className="text-china-red w-6 h-6" />
              <h2 className="text-2xl font-black text-ink tracking-tight font-serif">
                前端拖拽编辑器
              </h2>
            </div>
            <div className="text-xs text-gray-400 font-serif border border-gray-200 px-2 py-1 rounded bg-gray-50">
              第 B-01 版：拖拽界面雏形
            </div>
          </div>

          {/* 页面管理栏 */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            {/* 页面切换 */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-gray-700">页面：</span>
              {pages.map(page => (
                <button
                  key={page.id}
                  onClick={() => handleSwitchPage(page.id)}
                  className={`
                    px-4 py-1.5 rounded-sm text-sm font-serif transition-all
                    ${currentPage === page.id
                      ? 'bg-china-red text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                  `}
                >
                  {page.name}
                </button>
              ))}
              <button
                onClick={handleAddPage}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-sm text-sm font-serif hover:border-china-red hover:text-china-red transition-all"
              >
                <Plus className="w-4 h-4" />
                新增
              </button>
            </div>

            {/* 缩放控制 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-700">缩放：</span>
              <button
                onClick={handleZoomOut}
                className="p-1.5 bg-white border border-gray-300 rounded-sm hover:border-china-red hover:text-china-red transition-all"
                title="缩小"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 min-w-[50px] text-center">
                {Math.round(currentScale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 bg-white border border-gray-300 rounded-sm hover:border-china-red hover:text-china-red transition-all"
                title="放大"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1.5 bg-white border border-gray-300 rounded-sm hover:border-china-red hover:text-china-red transition-all"
                title="重置缩放"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              {/* 全屏放大按钮 */}
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className={`p-1.5 rounded-sm transition-all ${isZoomed ? 'bg-china-red text-white' : 'bg-white border border-gray-300 hover:border-china-red hover:text-china-red'}`}
                title={isZoomed ? '退出全屏' : '全屏放大'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isZoomed ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* 拖拽说明 */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 mb-6 rounded-sm">
            <h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
              <GripVertical className="w-4 h-4" />
              拖拽提示
            </h3>
            <p className="text-sm text-yellow-700">
              从右侧组件库拖拽组件到左侧空白编辑区，可创建新组件。
            </p>
          </div>

          {/* 编辑区域 */}
          <div
            className={`
              relative w-full h-[500px] border-2 rounded-sm transition-all duration-300 overflow-hidden
              ${isOverDropZone ? 'border-china-red bg-red-50' : 'border-dashed border-gray-300 bg-gray-50'}
            `}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={allowDrop}
            onDrop={handleDrop}
          >
            {/* 缩放容器 */}
            <div
              className="absolute inset-0"
              style={{ transform: `scale(${currentScale})`, transformOrigin: 'top left' }}
            >
              {/* 编辑区域提示文字 */}
              {currentPageComponents.length === 0 && !isOverDropZone && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <GripVertical className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-lg font-serif">拖拽组件到此处开始设计</p>
                  <p className="text-sm mt-2">从右侧组件库选择组件拖拽到这里</p>
                </div>
              )}

              {/* 已添加的组件 */}
              {currentPageComponents.map(component => (
                <div
                  key={component.id}
                  className={`
                    absolute p-4 rounded-sm shadow-sm cursor-move
                    ${component.type === 'button' ? 'bg-blue-100 border border-blue-300' : ''}
                    ${component.type === 'input' ? 'bg-green-100 border border-green-300' : ''}
                    ${component.type === 'card' ? 'bg-yellow-100 border border-yellow-300' : ''}
                    ${component.type === 'chart' ? 'bg-purple-100 border border-purple-300' : ''}
                  `}
                  style={{ left: component.x, top: component.y, width: 150, height: 80 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-ink text-sm">{component.name}</h3>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteComponent(component.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">类型：{component.type}</p>
                  <p className="text-xs text-gray-600 mt-1">位置：{component.position}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 组件列表 */}
          {currentPageComponents.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold text-ink font-serif mb-3">已添加组件 ({currentPageComponents.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentPageComponents.map(component => (
                  <div key={component.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${component.type === 'button' ? 'bg-blue-500' : component.type === 'input' ? 'bg-green-500' : component.type === 'card' ? 'bg-yellow-500' : 'bg-purple-500'}`}></span>
                      <span className="text-sm font-serif text-ink">{component.name}</span>
                    </div>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteComponent(component.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 右侧侧边栏 - 组件库 */}
      <aside className="lg:w-1/4 space-y-6">
        {/* 组件库 */}
        <div className="bg-white border-t-4 border-t-china-red border-l border-r border-b border-gray-200 p-5 shadow-paper">
          <div className="text-china-red font-bold text-lg mb-4 pb-2 border-b border-gray-100 font-serif">
            组件库
          </div>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-3">拖拽组件到左侧编辑区：</p>
            {componentTypes.map(component => (
              <div
                key={component.id}
                draggable
                onDragStart={(e) => handleDragStart(e, component)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 p-4 border border-gray-200 rounded-sm hover:border-china-red hover:bg-red-50 cursor-move transition-all ${component.color}`}
              >
                <div className="text-china-red">{component.icon}</div>
                <div>
                  <h4 className="font-bold text-ink font-serif text-sm">{component.name}</h4>
                  <p className="text-xs text-gray-500">拖拽到编辑区创建</p>
                </div>
                <div className="ml-auto text-gray-400">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 页面管理 */}
        <div className="bg-white border-t-4 border-t-china-red border-l border-r border-b border-gray-200 p-5 shadow-paper">
          <div className="text-china-red font-bold text-lg mb-4 pb-2 border-b border-gray-100 font-serif">
            页面管理
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-sm">
              <div>
                <p className="text-sm font-bold text-ink">当前页面</p>
                <p className="text-xs text-gray-500">{pages.find(p => p.id === currentPage)?.name}</p>
              </div>
              <span className="text-xs text-gray-500">ID: {currentPage}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-sm">
              <div>
                <p className="text-sm font-bold text-ink">页面数量</p>
                <p className="text-xs text-gray-500">共 {pages.length} 个页面</p>
              </div>
              <button
                onClick={handleAddPage}
                className="px-3 py-1 bg-china-red text-white text-xs rounded-sm hover:bg-red-700 transition-colors"
              >
                新增页面
              </button>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-sm">
              <p className="text-sm font-bold text-ink mb-2">缩放控制</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 bg-white border border-gray-300 rounded-sm hover:border-china-red hover:text-china-red transition-all"
                  title="缩小"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-600 min-w-[50px] text-center">
                  {Math.round(currentScale * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 bg-white border border-gray-300 rounded-sm hover:border-china-red hover:text-china-red transition-all"
                  title="放大"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-1.5 bg-white border border-gray-300 rounded-sm hover:border-china-red hover:text-china-red transition-all"
                  title="重置缩放"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 拖拽指南 */}
        <div className="bg-white border-t-4 border-t-china-red border-l border-r border-b border-gray-200 p-5 shadow-paper">
          <div className="text-china-red font-bold text-lg mb-4 pb-2 border-b border-gray-100 font-serif">
            拖拽指南
          </div>
          <ul className="space-y-3 text-sm font-serif text-ink leading-snug">
            <li className="flex items-start gap-2">
              <span className="text-china-red font-bold">1.</span>
              <span>从右侧组件库拖拽组件到左侧空白编辑区</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-china-red font-bold">2.</span>
              <span>组件将显示在拖拽位置</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-china-red font-bold">3.</span>
              <span>点击组件右上角的删除按钮可移除组件</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-china-red font-bold">4.</span>
              <span>使用顶部缩放控制调整编辑区大小</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-china-red font-bold">5.</span>
              <span>点击"新增"按钮创建新页面</span>
            </li>
          </ul>
        </div>

        {/* 引用装饰 */}
        <div className="bg-china-red p-4 text-center">
          <p className="italic text-white font-serif text-xs leading-loose">
            "拖拽式界面设计，让前端开发更直观、更高效。"
            <br/>
            <span className="not-italic text-red-200 mt-1 block transform scale-90">—— 前端开发理念</span>
          </p>
        </div>
      </aside>

      {/* 放大模式 - 全屏叠加层 */}
      {isZoomed && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto">
          {/* 放大模式头部 */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 shadow-sm z-10">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-2">
                <Code className="text-china-red w-6 h-6" />
                <h2 className="text-2xl font-black text-ink tracking-tight font-serif">
                  前端拖拽编辑器 - 全屏模式
                </h2>
              </div>
              <div className="flex items-center gap-4">
                {/* 页面切换 */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-700">页面：</span>
                  {pages.map(page => (
                    <button
                      key={page.id}
                      onClick={() => handleSwitchPage(page.id)}
                      className={`
                        px-4 py-1.5 rounded-sm text-sm font-serif transition-all
                        ${currentPage === page.id
                          ? 'bg-china-red text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                      `}
                    >
                      {page.name}
                    </button>
                  ))}
                </div>
                {/* 缩放控制 */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-700">缩放：</span>
                  <button
                    onClick={handleZoomOut}
                    className="p-1.5 bg-white border border-gray-300 rounded-sm hover:border-china-red hover:text-china-red transition-all"
                    title="缩小"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 min-w-[50px] text-center">
                    {Math.round(currentScale * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-1.5 bg-white border border-gray-300 rounded-sm hover:border-china-red hover:text-china-red transition-all"
                    title="放大"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="p-1.5 bg-white border border-gray-300 rounded-sm hover:border-china-red hover:text-china-red transition-all"
                    title="重置缩放"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                {/* 退出全屏按钮 */}
                <button
                  onClick={() => setIsZoomed(false)}
                  className="px-4 py-2 bg-china-red text-white rounded-sm hover:bg-red-700 transition-all font-serif"
                >
                  退出全屏
                </button>
              </div>
            </div>
          </div>

          {/* 放大模式编辑区域 */}
          <div className="max-w-7xl mx-auto p-6">
            <div
              className={`
                relative w-full h-[80vh] border-2 rounded-sm transition-all duration-300 overflow-hidden
                ${isOverDropZone ? 'border-china-red bg-red-50' : 'border-dashed border-gray-300 bg-gray-50'}
              `}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={allowDrop}
              onDrop={handleDrop}
            >
              {/* 缩放容器 */}
              <div
                className="absolute inset-0"
                style={{ transform: `scale(${currentScale})`, transformOrigin: 'top left' }}
              >
                {/* 编辑区域提示文字 */}
                {currentPageComponents.length === 0 && !isOverDropZone && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <GripVertical className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-lg font-serif">拖拽组件到此处开始设计</p>
                    <p className="text-sm mt-2">从右侧组件库选择组件拖拽到这里</p>
                  </div>
                )}

                {/* 已添加的组件 */}
                {currentPageComponents.map(component => (
                  <div
                    key={component.id}
                    className={`
                      absolute p-4 rounded-sm shadow-sm cursor-move
                      ${component.type === 'button' ? 'bg-blue-100 border border-blue-300' : ''}
                      ${component.type === 'input' ? 'bg-green-100 border border-green-300' : ''}
                      ${component.type === 'card' ? 'bg-yellow-100 border border-yellow-300' : ''}
                      ${component.type === 'chart' ? 'bg-purple-100 border border-purple-300' : ''}
                    `}
                    style={{ left: component.x, top: component.y, width: 150, height: 80 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-ink text-sm">{component.name}</h3>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteComponent(component.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600">类型：{component.type}</p>
                    <p className="text-xs text-gray-600 mt-1">位置：{component.position}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 组件库 */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <div className="bg-white border-t-4 border-t-china-red border-l border-r border-b border-gray-200 p-5 shadow-paper">
                  <div className="text-china-red font-bold text-lg mb-4 pb-2 border-b border-gray-100 font-serif">
                    组件库
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-3">拖拽组件到上方编辑区：</p>
                    {componentTypes.map(component => (
                      <div
                        key={component.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, component)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-3 p-4 border border-gray-200 rounded-sm hover:border-china-red hover:bg-red-50 cursor-move transition-all ${component.color}`}
                      >
                        <div className="text-china-red">{component.icon}</div>
                        <div>
                          <h4 className="font-bold text-ink font-serif text-sm">{component.name}</h4>
                          <p className="text-xs text-gray-500">拖拽到编辑区创建</p>
                        </div>
                        <div className="ml-auto text-gray-400">
                          <Plus className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 组件列表 */}
              <div className="md:col-span-3">
                <div className="bg-white border-t-4 border-t-china-red border-l border-r border-b border-gray-200 p-5 shadow-paper">
                  <h3 className="font-bold text-ink font-serif mb-3">已添加组件 ({currentPageComponents.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {currentPageComponents.map(component => (
                      <div key={component.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-sm">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${component.type === 'button' ? 'bg-blue-500' : component.type === 'input' ? 'bg-green-500' : component.type === 'card' ? 'bg-yellow-500' : 'bg-purple-500'}`}></span>
                          <span className="text-sm font-serif text-ink">{component.name}</span>
                        </div>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteComponent(component.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {currentPageComponents.length === 0 && (
                      <div className="col-span-full text-center py-8 text-gray-400">
                        <p className="text-sm font-serif">暂无组件，从左侧拖拽组件到编辑区</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrontendSection;