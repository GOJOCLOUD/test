import React from 'react';

const ArchitectureDisplay = ({ architectureData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!architectureData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-gray-500 text-center">暂无架构设计数据</p>
      </div>
    );
  }

  // 解析架构设计数据
  const parseArchitectureData = (data) => {
    // 如果数据已经是对象，直接返回
    if (typeof data === 'object') {
      return data;
    }
    
    // 如果是字符串，尝试解析
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        // 如果无法解析为JSON，返回包含原始字符串的对象
        return {
          rawContent: data,
          sections: []
        };
      }
    }
    
    // 其他情况，返回空对象
    return { sections: [] };
  };

  const parsedData = parseArchitectureData(architectureData);

  // 如果有原始内容但无法解析为结构化数据，则显示原始内容
  if (parsedData.rawContent && !parsedData.sections.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-center">项目架构设计</h2>
        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap text-sm">{parsedData.rawContent}</pre>
        </div>
      </div>
    );
  }

  // 显示结构化的架构设计
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-center">项目架构设计</h2>
      
      {parsedData.overview && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">项目概述</h3>
          <p className="text-gray-700">{parsedData.overview}</p>
        </div>
      )}

      {parsedData.userFlow && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">用户流程</h3>
          <p className="text-gray-700">{parsedData.userFlow}</p>
        </div>
      )}

      {parsedData.technicalRequirements && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">技术需求</h3>
          <p className="text-gray-700">{parsedData.technicalRequirements}</p>
        </div>
      )}

      {parsedData.fileStructure && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">文件结构</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <pre className="text-sm overflow-x-auto">{parsedData.fileStructure}</pre>
          </div>
        </div>
      )}

      {parsedData.sections && parsedData.sections.length > 0 && (
        <div>
          {parsedData.sections.map((section, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
              <p className="text-gray-700">{section.content}</p>
              {section.items && section.items.length > 0 && (
                <ul className="list-disc list-inside mt-2 ml-4">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-gray-600">{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchitectureDisplay;