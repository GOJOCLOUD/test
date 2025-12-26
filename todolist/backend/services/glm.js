const axios = require('axios');
const config = require('../config');

// 调用 GLM API
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
    
    // 创建 AbortController 用于请求取消
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.glm.timeout);
    
    // 准备请求数据
    const requestData = {
      model: config.glm.model,
      messages,
      temperature: 0.7,
      max_tokens: config.glm.maxTokens
    };
    
    console.log(`[GLM] 发送请求到 ${config.glm.baseUrl}/chat/completions`);
    
    // 发送请求
    const response = await axios.post(
      `${config.providers.glm.baseUrl}/chat/completions`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        signal: controller.signal,
        timeout: config.glm.timeout
      }
    );
    
    // 清除超时定时器
    clearTimeout(timeoutId);
    
    // 提取响应内容
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('GLM API 返回了无效的响应格式');
    }
  } catch (error) {
    // 处理 AbortError
    if (error.name === 'AbortError') {
      throw new Error('GLM API 请求超时，请稍后再试');
    }
    
    // 根据错误类型进行分类
    if (error.code === 'ECONNABORTED') {
      throw new Error('GLM API 请求超时，请稍后再试');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('无法连接到 GLM API 服务器');
    } else if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        throw new Error('GLM API 密钥无效或已过期');
      } else if (status === 429) {
        throw new Error('GLM API 请求频率超限');
      } else if (status >= 500) {
        throw new Error('GLM API 服务器错误');
      } else {
        throw new Error(`GLM API 请求失败: ${error.response.data?.error?.message || error.message}`);
      }
    } else {
      throw new Error(`无法连接到 GLM API 服务器: ${error.message}`);
    }
  }
};

// 重试机制的辅助函数
const callWithRetry = async (apiKey, prompt, conversation = null, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[GLM] 尝试第 ${attempt} 次调用`);
      return await call(apiKey, prompt, conversation);
    } catch (error) {
      lastError = error;
      console.error(`[GLM] 第 ${attempt} 次调用失败:`, error.message);
      
      // 如果是认证错误，不进行重试
      if (error.message.includes('API 密钥无效') || error.message.includes('API 密钥已过期') || error.message.includes('认证失败')) {
        throw error;
      }
      
      // 如果是最后一次尝试，直接抛出错误
      if (attempt === maxRetries) {
        throw error;
      }
      
      // 计算延迟时间（指数退避）
      const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      console.log(`[GLM] 等待 ${delayMs}ms 后重试`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  throw lastError;
};

// 流式响应调用（未来扩展用）
const callStream = async (apiKey, prompt, conversation = null, onChunk) => {
  try {
    // 构建请求消息
    let messages = [];
    
    if (conversation && Array.isArray(conversation)) {
      messages = conversation.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
    } else if (prompt) {
      messages = [
        {
          role: 'user',
          content: prompt
        }
      ];
    } else {
      throw new Error('必须提供 prompt 或 conversation 参数');
    }

    // 创建 AbortController 用于请求取消
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.glm.timeout);

    console.log(`[GLM] 发送流式请求到 ${config.glm.baseUrl}/chat/completions`);

    // 发送流式请求
    const response = await axios.post(
      `${config.glm.baseUrl}/chat/completions`,
      {
        model: config.glm.model,
        messages,
        temperature: 0.7,
        max_tokens: config.glm.maxTokens,
        stream: true
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        responseType: 'stream',
        signal: controller.signal,
        timeout: config.glm.timeout
      }
    );

    // 清除超时定时器
    clearTimeout(timeoutId);

    // 处理流式响应
    return new Promise((resolve, reject) => {
      let fullResponse = '';
      
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              resolve(fullResponse);
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              
              if (content) {
                fullResponse += content;
                if (onChunk) {
                  onChunk(content);
                }
              }
            } catch (e) {
              console.error('[GLM] 解析流式响应失败:', e);
            }
          }
        }
      });
      
      response.data.on('error', (error) => {
        reject(new Error(`GLM 流式响应错误: ${error.message}`));
      });
      
      response.data.on('end', () => {
        resolve(fullResponse);
      });
    });
  } catch (error) {
    // 处理错误（与普通调用相同的错误处理逻辑）
    if (error.name === 'AbortError') {
      throw new Error('GLM API 请求超时，请稍后再试');
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('GLM API 请求超时，请稍后再试');
    }
    
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        throw new Error('GLM API 认证失败，请检查 API 密钥');
      } else if (status === 429) {
        throw new Error('GLM API 请求频率过高，请稍后再试');
      } else if (status >= 500) {
        throw new Error('GLM API 服务器错误，请稍后再试');
      } else {
        throw new Error(`GLM API 请求失败: ${data.error?.message || data.message || '未知错误'}`);
      }
    } else if (error.request) {
      throw new Error('GLM API 服务器无响应，请检查网络连接');
    } else {
      throw new Error(`GLM API 调用失败: ${error.message}`);
    }
  }
};

module.exports = {
  call,
  callWithRetry,
  callStream
};