const axios = require('axios');
const config = require('../config');

// 调用第三方 API（无需 API 密钥的公共 API）
const call = async (prompt, conversation = null) => {
  try {
    // 验证基础 URL
    if (!config.providers.thirdParty.baseUrl) {
      throw new Error('未配置第三方 API 基础 URL');
    }
    
    // 构建请求消息
    let messages = [];
    
    if (conversation && Array.isArray(conversation)) {
      // 如果提供了对话历史，使用对话历史
      messages = conversation.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
    } else if (prompt) {
      // 否则使用单个提示词
      messages = [
        {
          role: 'user',
          content: prompt
        }
      ];
    } else {
      throw new Error('必须提供 prompt 或 conversation 参数');
    }
    
    // 准备请求数据
    const requestData = {
      model: config.providers.thirdParty.model,
      messages,
      temperature: 0.7,
      max_tokens: config.providers.thirdParty.maxTokens
    };
    
    // 发送请求
    const response = await axios.post(
      config.providers.thirdParty.baseUrl,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: config.providers.thirdParty.timeout
      }
    );
    
    // 提取响应内容 - 尝试多种可能的响应格式
    let content;
    
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      // OpenAI 兼容格式
      content = response.data.choices[0].message.content;
    } else if (response.data && response.data.data) {
      // 自定义格式
      content = response.data.data;
    } else if (response.data && response.data.content) {
      // 简单格式
      content = response.data.content;
    } else if (response.data && typeof response.data === 'string') {
      // 直接返回字符串
      content = response.data;
    } else {
      throw new Error('第三方 API 返回了无法识别的响应格式');
    }
    
    return content;
  } catch (error) {
    console.error('第三方 API 调用错误:', error);
    
    // 处理不同类型的错误
    if (error.response) {
      // 服务器返回了错误响应
      const status = error.response.status;
      const message = error.response.data?.error?.message || error.response.data?.message || '未知错误';
      
      if (status === 401) {
        throw new Error('第三方 API 需要认证，但未提供认证信息');
      } else if (status === 429) {
        throw new Error('第三方 API 请求频率过高，请稍后再试');
      } else if (status >= 500) {
        throw new Error(`第三方 API 服务器错误: ${message}`);
      } else {
        throw new Error(`第三方 API 错误 (${status}): ${message}`);
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      throw new Error('无法连接到第三方 API 服务器');
    } else {
      // 设置请求时发生错误
      throw new Error(`第三方 API 请求错误: ${error.message}`);
    }
  }
};

// 重试机制的辅助函数
const callWithRetry = async (prompt, conversation = null, retries = 3) => {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await call(prompt, conversation);
    } catch (error) {
      lastError = error;
      console.warn(`第三方 API 调用失败，尝试 ${i + 1}/${retries}:`, error.message);
      
      // 如果是认证错误，不重试
      if (error.message.includes('需要认证')) {
        throw error;
      }
      
      // 如果不是最后一次尝试，等待一段时间后重试
      if (i < retries - 1) {
        const delay = config.request.retryDelay * (i + 1); // 递增延迟
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// 模拟第三方 API 响应（当没有配置第三方 API 时使用）
const mockCall = async (prompt, conversation = null) => {
  // 简单的模拟响应
  const mockResponses = [
    "这是一个模拟的第三方 API 响应。请配置实际的第三方 API URL 以获得真实的响应。",
    "第三方 API 未配置。请在 config.js 中设置 providers.thirdParty.baseUrl。",
    "模拟响应：您的问题已收到，但需要配置第三方 API 才能获得实际答案。"
  ];
  
  // 随机选择一个模拟响应
  const randomIndex = Math.floor(Math.random() * mockResponses.length);
  
  return mockResponses[randomIndex];
};

module.exports = {
  call,
  callWithRetry,
  mockCall
};