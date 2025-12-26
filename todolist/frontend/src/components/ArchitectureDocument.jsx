import React from 'react';

const ArchitectureDocument = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <article className="official-card p-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </article>
    );
  }

  if (!data) {
    return (
      <article className="official-card p-10">
        <p className="text-gray-500 text-center">暂无架构设计数据</p>
      </article>
    );
  }

  // 解析架构设计数据
  const parseArchitectureData = (data) => {
    // 如果数据已经是对象，直接返回
    if (typeof data === 'object') {
      return data;
    }
    
    // 如果是字符串，直接作为原始内容返回，不再尝试解析为JSON
    if (typeof data === 'string') {
      return {
        rawContent: data,
        sections: []
      };
    }
    
    // 其他情况，返回空对象
    return { sections: [] };
  };

  const parsedData = parseArchitectureData(data);

  // 如果有原始内容但无法解析为结构化数据，则显示原始内容
  if (parsedData.rawContent && !parsedData.sections.length) {
    return (
      <article className="official-card p-10">
        {/* 模拟红头文件头部 */}
        <div className="text-center mb-10 pb-6 border-b border-red-100">
          <h2 className="text-3xl md:text-4xl font-black text-china-red mb-4 tracking-wide">
            项目架构设计文档
          </h2>
          <div className="flex justify-center gap-8 text-sm text-gray-500 font-sans">
            <span>发文单位：智能生成中心</span>
            <span>编号：架设〔2025〕1号</span>
          </div>
        </div>

        {/* 正文内容 */}
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-ink leading-relaxed font-serif text-lg">
            {parsedData.rawContent}
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
  }

  // 处理结构化数据，将其转换为文档格式
  const renderDocumentContent = () => {
    if (parsedData.rawContent) {
      return (
        <div className="whitespace-pre-wrap text-ink leading-relaxed font-serif text-lg">
          {parsedData.rawContent}
        </div>
      );
    }

    // 如果有结构化数据，将其转换为文档格式
    let content = "";
    
    if (parsedData.overview) {
      content += `## 1. 项目概述\n\n${parsedData.overview}\n\n`;
    }
    
    if (parsedData.userFlow) {
      content += `## 2. 用户流程\n\n${parsedData.userFlow}\n\n`;
    }
    
    if (parsedData.technicalRequirements) {
      content += `## 3. 技术需求\n\n${parsedData.technicalRequirements}\n\n`;
    }
    
    if (parsedData.fileStructure) {
      content += `## 4. 文件结构\n\n${parsedData.fileStructure}\n\n`;
    }
    
    if (parsedData.sections && parsedData.sections.length > 0) {
      parsedData.sections.forEach((section, index) => {
        content += `## ${index + 5}. ${section.title}\n\n${section.content}\n\n`;
        
        if (section.items && section.items.length > 0) {
          section.items.forEach(item => {
            content += `- ${item}\n`;
          });
          content += "\n";
        }
      });
    }

    return (
      <div className="whitespace-pre-wrap text-ink leading-relaxed font-serif text-lg">
        {content}
      </div>
    );
  };

  return (
    <article className="official-card p-10">
      {/* 模拟红头文件头部 */}
      <div className="text-center mb-10 pb-6 border-b border-red-100">
        <h2 className="text-3xl md:text-4xl font-black text-china-red mb-4 tracking-wide">
          项目架构设计文档
        </h2>
        <div className="flex justify-center gap-8 text-sm text-gray-500 font-sans">
          <span>发文单位：智能生成中心</span>
          <span>编号：架设〔2025〕1号</span>
        </div>
      </div>

      {/* 正文内容 */}
      <div className="prose max-w-none">
        {renderDocumentContent()}
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

export default ArchitectureDocument;