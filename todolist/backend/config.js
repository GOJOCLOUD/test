// 配置文件
const config = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost',
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }
  },
  
  // AI Provider 配置
  providers: {
    kimi: {
      name: 'Kimi',
      baseUrl: process.env.KIMI_BASE_URL || 'https://api.moonshot.cn/v1',
      model: process.env.KIMI_MODEL || 'moonshot-v1-8k',
      maxTokens: parseInt(process.env.KIMI_MAX_TOKENS) || 4000,
      timeout: parseInt(process.env.KIMI_TIMEOUT) || 30000
    },
    glm: {
      name: 'GLM',
      baseUrl: process.env.GLM_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
      model: process.env.GLM_MODEL || 'glm-4',
      maxTokens: parseInt(process.env.GLM_MAX_TOKENS) || 4000,
      timeout: parseInt(process.env.GLM_TIMEOUT) || 120000 // 增加到120秒
    },
    customAPI: {
      name: 'Custom API',
      baseUrl: process.env.CUSTOM_API_BASE_URL || '',
      model: process.env.CUSTOM_API_MODEL || 'gpt-3.5-turbo',
      maxTokens: parseInt(process.env.CUSTOM_API_MAX_TOKENS) || 4000,
      timeout: parseInt(process.env.CUSTOM_API_TIMEOUT) || 30000
    },
    thirdParty: {
      name: 'Third Party API',
      baseUrl: process.env.THIRD_PARTY_BASE_URL || '',
      model: process.env.THIRD_PARTY_MODEL || 'gpt-3.5-turbo',
      maxTokens: parseInt(process.env.THIRD_PARTY_MAX_TOKENS) || 4000,
      timeout: parseInt(process.env.THIRD_PARTY_TIMEOUT) || 30000
    }
  },
  
  // 为了向后兼容，保留providers配置，同时添加各provider的直接配置
  kimi: {
    name: 'Kimi',
    baseUrl: process.env.KIMI_BASE_URL || 'https://api.moonshot.cn/v1',
    model: process.env.KIMI_MODEL || 'moonshot-v1-8k',
    maxTokens: parseInt(process.env.KIMI_MAX_TOKENS) || 4000,
    timeout: parseInt(process.env.KIMI_TIMEOUT) || 30000,
    apiKeys: process.env.KIMI_API_KEYS ? process.env.KIMI_API_KEYS.split(',') : [],
    keyCooldownTime: parseInt(process.env.KIMI_KEY_COOLDOWN_TIME) || 60 * 1000,
    maxKeyErrors: parseInt(process.env.KIMI_MAX_KEY_ERRORS) || 3
  },
  
  glm: {
    name: 'GLM',
    baseUrl: process.env.GLM_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
    model: process.env.GLM_MODEL || 'glm-4',
    maxTokens: parseInt(process.env.GLM_MAX_TOKENS) || 4000,
    timeout: parseInt(process.env.GLM_TIMEOUT) || 120000,
    apiKeys: process.env.GLM_API_KEYS ? process.env.GLM_API_KEYS.split(',') : [],
    keyCooldownTime: parseInt(process.env.GLM_KEY_COOLDOWN_TIME) || 60 * 1000,
    maxKeyErrors: parseInt(process.env.GLM_MAX_KEY_ERRORS) || 3
  },
  
  customAPI: {
    name: 'Custom API',
    baseUrl: process.env.CUSTOM_API_BASE_URL || '',
    model: process.env.CUSTOM_API_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.CUSTOM_API_MAX_TOKENS) || 4000,
    timeout: parseInt(process.env.CUSTOM_API_TIMEOUT) || 30000,
    apiKeys: process.env.CUSTOM_API_KEYS ? process.env.CUSTOM_API_KEYS.split(',') : [],
    keyCooldownTime: parseInt(process.env.CUSTOM_API_KEY_COOLDOWN_TIME) || 60 * 1000,
    maxKeyErrors: parseInt(process.env.CUSTOM_API_MAX_KEY_ERRORS) || 3
  },
  
  thirdParty: {
    name: 'Third Party API',
    baseUrl: process.env.THIRD_PARTY_BASE_URL || '',
    model: process.env.THIRD_PARTY_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.THIRD_PARTY_MAX_TOKENS) || 4000,
    timeout: parseInt(process.env.THIRD_PARTY_TIMEOUT) || 30000,
    apiKeys: process.env.THIRD_PARTY_KEYS ? process.env.THIRD_PARTY_KEYS.split(',') : [],
    keyCooldownTime: parseInt(process.env.THIRD_PARTY_KEY_COOLDOWN_TIME) || 60 * 1000,
    maxKeyErrors: parseInt(process.env.THIRD_PARTY_MAX_KEY_ERRORS) || 3
  },
  
  // AI调用配置
  ai: {
    maxConcurrent: parseInt(process.env.AI_MAX_CONCURRENT) || 5,
    maxQueueLength: parseInt(process.env.AI_MAX_QUEUE_LENGTH) || 100,
    timeout: parseInt(process.env.AI_TIMEOUT) || 180000 // 增加到3分钟
  },
  
  // 缓存配置
  cache: {
    maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 1000,
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL) || 30 * 60 * 1000, // 30分钟
    cleanupInterval: parseInt(process.env.CACHE_CLEANUP_INTERVAL) || 5 * 60 * 1000 // 5分钟
  },
  
  // 限流配置
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15分钟
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 每个IP最多100个请求
    message: process.env.RATE_LIMIT_MESSAGE || '请求过于频繁，请稍后再试'
  },
  
  // 需求引擎配置
  requirementEngine: {
    maxConversationTurns: parseInt(process.env.MAX_CONVERSATION_TURNS) || 10,
    finalRequirementThreshold: parseFloat(process.env.FINAL_REQUIREMENT_THRESHOLD) || 0.8,
    promptTemplate: `你是一名"需求完善助手"。请根据以下用户输入判断：
1. 若关键信息不足，请继续提出一个具体明确的问题。
2. 若信息开始逐渐完整，请提出更关键细化的需求问题。
3. 若信息已完整，请输出"FINAL"并以结构化形式输出全部需求。

用户输入：
{{history}}`,
    
    // 智能问题生成提示词模板
    batchQuestionsPromptTemplate: `你是一名"需求分析师"。请先评估用户提供的项目描述，然后根据你的评估结果，生成5-8个最有意义的关键问题来帮助明确和完善项目需求。

项目描述：
{{userInput}}

请按照以下步骤进行：
1. 首先对项目进行简要评估，包括项目类型、复杂度、潜在挑战等
2. 基于评估结果，生成5-8个针对该项目最关键的问题
3. 问题应该涵盖技术、功能、用户体验、业务逻辑等方面
4. 确保问题具体、明确，有助于收集关键信息

请生成一个JSON格式的响应，包含评估和问题两部分，格式如下：
{
  "evaluation": "对项目的简要评估，包括项目类型、复杂度、潜在挑战等",
  "questions": [
    {"id": 1, "text": "根据项目特点生成的第一个关键问题"},
    {"id": 2, "text": "根据项目特点生成的第二个关键问题"}
  ]
}

确保问题能够帮助用户更好地思考和表达他们的需求。`,
    
    // 总结提示词模板
    summaryPromptTemplate: `你是一名"需求总结专家"。请根据用户的原始输入和对问题的回答，整理出一个结构化的需求文档。

原始需求描述：
{{originalInput}}

用户回答：
{{answersText}}

请整理成一个完整的需求文档，包含以下部分：
1. 项目定位
2. 功能范围
3. 用户流程
4. 关键约束
5. 非功能性需求
6. API 需求
7. 输出目标
8. 总结（可直接交给GLM的简洁描述）

请确保内容完整、准确，并且逻辑清晰。`
  },
  
  // 请求配置
  request: {
    retries: parseInt(process.env.REQUEST_RETRIES) || 3,
    retryDelay: parseInt(process.env.RETRY_DELAY) || 1000,
    timeout: parseInt(process.env.REQUEST_TIMEOUT) || 180000 // 增加到3分钟
  },
  
  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json'
  }
};

module.exports = config;