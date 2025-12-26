const config = require('../config');
const kimiService = require('./kimi');
const glmService = require('./glm');
const customAPIService = require('./customAPI');
const thirdPartyService = require('./thirdParty');
const RequestQueue = require('./requestQueue');
const ResponseCache = require('./responseCache');
const APIKeyPool = require('./apiKeyPool');

// 初始化请求队列、缓存和密钥池
const requestQueue = new RequestQueue({
  maxConcurrent: config.ai.maxConcurrent || 5,
  maxQueueLength: config.ai.maxQueueLength || 100,
  timeout: config.request.timeout || 180000 // 与GLM服务的超时时间保持一致
});

const responseCache = new ResponseCache({
  maxSize: config.cache.maxSize || 1000,
  defaultTTL: config.cache.defaultTTL || 30 * 60 * 1000 // 30分钟
});

// 启动缓存定时清理
responseCache.startCleanupInterval();

// 初始化API密钥池
const apiKeyPools = {
  kimi: new APIKeyPool(config.kimi.apiKeys ? config.kimi.apiKeys : [], {
    cooldownTime: config.kimi.keyCooldownTime || 60 * 1000,
    maxErrors: config.kimi.maxKeyErrors || 3
  }),
  glm: new APIKeyPool(config.glm.apiKeys ? config.glm.apiKeys : [], {
    cooldownTime: config.glm.keyCooldownTime || 60 * 1000,
    maxErrors: config.glm.maxKeyErrors || 3
  }),
  customAPI: new APIKeyPool(config.customAPI.apiKeys ? config.customAPI.apiKeys : [], {
    cooldownTime: config.customAPI.keyCooldownTime || 60 * 1000,
    maxErrors: config.customAPI.maxKeyErrors || 3
  })
};

// 监听密钥冷却事件
Object.values(apiKeyPools).forEach(pool => {
  pool.on('keyCooldown', (key) => {
    console.warn(`[AI Provider] 密钥 ${key.substring(0, 8)}... 进入冷却期`);
  });
});

// 统一的 AI 调用接口，支持失败自动 fallback
const callAI = async (provider, options) => {
  const { apiKey, customUrl, prompt, conversation } = options;
  
  // 检查缓存
  const cacheOptions = {
    model: options.model || config[provider].model,
    temperature: options.temperature || 0.7,
    max_tokens: options.max_tokens || config[provider].maxTokens
  };
  
  const cachedResponse = responseCache.get(provider, prompt, cacheOptions);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // 使用请求队列处理请求
  const task = async () => {
    try {
      let result;
      let usedApiKey = apiKey;
      
      // 对于支持多密钥的provider，从密钥池获取密钥
      if (apiKeyPools[provider] && !apiKey) {
        try {
          usedApiKey = apiKeyPools[provider].getKey();
        } catch (keyError) {
          console.warn(`[AI Provider] 无法获取${provider}密钥，使用默认密钥:`, keyError.message);
        }
      }
      
      switch (provider) {
        case 'kimi':
          result = await kimiService.call(usedApiKey, prompt, conversation);
          break;
        case 'glm':
          result = await glmService.call(usedApiKey, prompt, conversation);
          break;
        case 'customAPI':
          result = await customAPIService.call(usedApiKey, customUrl, prompt, conversation);
          break;
        case 'thirdParty':
          result = await thirdPartyService.call(prompt, conversation);
          break;
        default:
          throw new Error(`不支持的 provider: ${provider}`);
      }
      
      // 释放密钥并标记成功
      if (apiKeyPools[provider] && !apiKey && usedApiKey) {
        apiKeyPools[provider].releaseKey(usedApiKey, true);
      }
      
      // 缓存成功的结果
      responseCache.set(provider, prompt, result, cacheOptions);
      
      return result;
    } catch (error) {
      // 释放密钥并标记失败
      if (apiKeyPools[provider] && !apiKey && usedApiKey) {
        apiKeyPools[provider].releaseKey(usedApiKey, false);
        apiKeyPools[provider].recordError(usedApiKey, error.message);
      }
      
      console.error(`${provider} 调用失败:`, error.message);
      
      // 如果是 kimi 或 glm 失败，尝试 fallback 到其他可用的 provider
      if (provider === 'kimi' || provider === 'glm') {
        console.log(`尝试使用备用 provider...`);
        
        // 尝试使用 customAPI 作为 fallback
        if (options.customUrl) {
          try {
            console.log(`Fallback 到 customAPI`);
            const fallbackResult = await customAPIService.call(apiKey, customUrl, prompt, conversation);
            // 缓存fallback结果
            responseCache.set('customAPI', prompt, fallbackResult, {
              ...cacheOptions,
              model: config.customAPI.model
            });
            return fallbackResult;
          } catch (fallbackError) {
            console.error(`Fallback 到 customAPI 失败:`, fallbackError.message);
          }
        }
        
        // 尝试使用 thirdParty 作为 fallback
        try {
          console.log(`Fallback 到 thirdParty`);
          const fallbackResult = await thirdPartyService.call(prompt, conversation);
          // 缓存fallback结果
          responseCache.set('thirdParty', prompt, fallbackResult, {
            ...cacheOptions,
            model: config.thirdParty.model
          });
          return fallbackResult;
        } catch (fallbackError) {
          console.error(`Fallback 到 thirdParty 失败:`, fallbackError.message);
        }
      }
      
      // 如果所有 fallback 都失败，抛出原始错误
      throw error;
    }
  };
  
  // 将任务加入队列并返回结果
  return await requestQueue.enqueue(task, { priority: options.priority || 'normal' });
};

// 获取系统状态
const getSystemStatus = () => {
  return {
    queue: requestQueue.getStatus(),
    cache: responseCache.getStats(),
    keyPools: Object.keys(apiKeyPools).reduce((acc, provider) => {
      acc[provider] = apiKeyPools[provider].getStatus();
      return acc;
    }, {})
  };
};

module.exports = {
  callAI,
  getSystemStatus
};