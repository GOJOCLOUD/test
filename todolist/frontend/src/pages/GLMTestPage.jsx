import React, { useState } from 'react';
import { generateAPI } from '../api/generate';

const GLMTestPage = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('c8b50bb7e7d342edb66b293636342059.VpGbzEj6uamxt01l');
  const [prompt, setPrompt] = useState('请简单介绍一下React框架');

  const testDirectAPI = async () => {
    setLoading(true);
    setTestResult('测试中...');
    
    try {
      const response = await generateAPI.generateArchitectureWithGLM(prompt, apiKey);
      console.log('API响应:', response);
      setTestResult(`成功: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      console.error('API错误:', error);
      setTestResult(`错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testProviderAPI = async () => {
    setLoading(true);
    setTestResult('测试中...');
    
    try {
      const response = await generateAPI.callAIProvider('glm', prompt, 'normal', apiKey);
      console.log('Provider API响应:', response);
      setTestResult(`成功: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      console.error('Provider API错误:', error);
      setTestResult(`错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6">GLM API 测试页面</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">API Key:</label>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">测试提示词:</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-2 border rounded h-24"
        />
      </div>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={testDirectAPI}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? '测试中...' : '测试架构API'}
        </button>
        
        <button
          onClick={testProviderAPI}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {loading ? '测试中...' : '测试Provider API'}
        </button>
      </div>
      
      {testResult && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">测试结果:</h2>
          <div className="border p-4 rounded bg-gray-50">
            <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96">
              {testResult}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default GLMTestPage;