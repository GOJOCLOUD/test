import React from 'react';

const DocumentProgressBar = ({ progress, isVisible, currentStep }) => {
  if (!isVisible) return null;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white py-4">
      <div className="px-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">文档生成进度</span>
          <span className="text-sm text-gray-500">{currentStep}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-china-red h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="mt-2 text-right">
          <span className="text-xs text-gray-500">{progress}%</span>
        </div>
      </div>
    </div>
  );
};

export default DocumentProgressBar;