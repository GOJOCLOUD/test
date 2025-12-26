const axios = require('axios');
const config = require('../config');

// 调用 Kimi API
const call = async (apiKey, prompt, conversation = null) => {
  try {
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
    
    // 添加调试日志
    console.log('Kimi API 请求消息:', messages);
    
    // 准备请求数据
    const requestData = {
      model: config.providers.kimi.model,
      messages,
      temperature: 0.7,
      max_tokens: config.providers.kimi.maxTokens
    };
    
    console.log('Kimi API 请求数据:', JSON.stringify(requestData, null, 2));
    
    // 发送请求
    const response = await axios.post(
      `${config.providers.kimi.baseUrl}/chat/completions`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: config.providers.kimi.timeout
      }
    );
    
    console.log('Kimi API 响应状态:', response.status);
    console.log('Kimi API 响应数据:', JSON.stringify(response.data, null, 2));
    
    // 提取响应内容
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('Kimi API 返回了无效的响应格式');
    }
  } catch (error) {
    console.error('Kimi API 调用错误:', error);
    
    // 处理不同类型的错误
    if (error.response) {
      // 服务器返回了错误响应
      const status = error.response.status;
      const message = error.response.data?.error?.message || error.response.data?.message || '未知错误';
      
      if (status === 401) {
        throw new Error('Kimi API 密钥无效或已过期');
      } else if (status === 429) {
        throw new Error('Kimi API 请求频率过高，请稍后再试');
      } else if (status >= 500) {
        throw new Error(`Kimi API 服务器错误: ${message}`);
      } else {
        throw new Error(`Kimi API 错误 (${status}): ${message}`);
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      throw new Error('无法连接到 Kimi API 服务器');
    } else {
      // 设置请求时发生错误
      throw new Error(`Kimi API 请求错误: ${error.message}`);
    }
  }
};

// 重试机制的辅助函数
const callWithRetry = async (apiKey, prompt, conversation = null, retries = 3) => {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await call(apiKey, prompt, conversation);
    } catch (error) {
      lastError = error;
      console.warn(`Kimi API 调用失败，尝试 ${i + 1}/${retries}:`, error.message);
      
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