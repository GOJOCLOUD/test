const axios = require('axios');
const config = require('../config');

// 调用自定义 API
const call = async (apiKey, customUrl, prompt, conversation = null) => {
  try {
    // 验证自定义 URL
    if (!customUrl) {
      throw new Error('必须提供 customUrl 参数');
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
      model: config.providers.customAPI.model,
      messages,
      temperature: 0.7,
      max_tokens: config.providers.customAPI.maxTokens
    };
    
    // 发送请求
    const response = await axios.post(
      customUrl,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: config.providers.customAPI.timeout
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
      throw new Error('自定义 API 返回了无法识别的响应格式');
    }
    
    return content;
  } catch (error) {
    console.error('自定义 API 调用错误:', error);
    
    // 处理不同类型的错误
    if (error.response) {
      // 服务器返回了错误响应
      const status = error.response.status;
      const message = error.response.data?.error?.message || error.response.data?.message || '未知错误';
      
      if (status === 401) {
        throw new Error('自定义 API 密钥无效或已过期');
      } else if (status === 429) {
        throw new Error('自定义 API 请求频率过高，请稍后再试');
      } else if (status >= 500) {
        throw new Error(`自定义 API 服务器错误: ${message}`);
      } else {
        throw new Error(`自定义 API 错误 (${status}): ${message}`);
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      throw new Error('无法连接到自定义 API 服务器');
    } else {
      // 设置请求时发生错误
      throw new Error(`自定义 API 请求错误: ${error.message}`);
    }
  }
};

// 重试机制的辅助函数
const callWithRetry = async (apiKey, customUrl, prompt, conversation = null, retries = 3) => {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await call(apiKey, customUrl, prompt, conversation);
    } catch (error) {
      lastError = error;
      console.warn(`自定义 API 调用失败，尝试 ${i + 1}/${retries}:`, error.message);
      
      // 如果是认证错误，不重试
      if (error.message.includes('API 密钥无效') || error.message.includes('API 密钥已过期')) {
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

module.exports = {
  call,
  callWithRetry
};