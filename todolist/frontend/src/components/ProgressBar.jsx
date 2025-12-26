import React from 'react';

const ProgressBar = ({ progress, isVisible, currentStep }) => {
  if (!isVisible) return null;

  return (
    <div className="w-full mt-4 mb-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-sans text-gray-600">任务进度</span>
        <span className="text-xs font-sans text-gray-600">{currentStep}</span>
      </div>
      <div className="w-full bg-gray-200 h-2 relative">
        <div 
          className="bg-china-red h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">开始</span>
        <span className="text-xs text-gray-400">完成</span>
      </div>
    </div>
  );
};

export default ProgressBar;