import React, { useState } from 'react';
import useAppStore from '../store/useAppStore';

const TestGLMOutput = () => {
  const { generateTodoList, architectureData, loading } = useAppStore();
  const [testResult, setTestResult] = useState(null);

  const handleTest = async () => {
    setTestResult("测试中...");
    
    try {
      // 直接调用generateTodoList，使用一个简单的测试需求
      await generateTodoList("我想做一个恋爱记录软件");
      setTestResult("测试完成，请查看下方的架构设计数据");
    } catch (error) {
      setTestResult(`测试失败: ${error.message}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">GLM输出测试</h2>
      
      <button 
        onClick={handleTest}
        disabled={loading.todo}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading.todo ? "测试中..." : "测试GLM输出"}
      </button>
      
      {testResult && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>{testResult}</p>
        </div>
      )}
      
      {architectureData && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">架构设计数据:</h3>
          <div className="border p-4 rounded bg-gray-50">
            <pre className="whitespace-pre-wrap text-sm">
              {typeof architectureData === 'string' 
                ? architectureData 
                : JSON.stringify(architectureData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestGLMOutput;