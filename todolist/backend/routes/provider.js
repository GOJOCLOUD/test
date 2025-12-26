const express = require('express');
const router = express.Router();
const { callAI } = require('../services/aiProvider');
const {
  processRequirementConversation,
  generateBatchQuestions,
  summarizeUserAnswers
} = require('../logic/requirementEngine');
const { filterCodeBlocks } = require('../utils/textFilter');

// ==========================================
// 模式配置 - 四档模式
// ==========================================
const MODE_CONFIG = {
  simple: {
    questionCount: 3,
    questionDepth: 'basic',
    depthDescription: '【重要指令】快速验证模式：只问核心闭环问题，不问细节。',
    archDetail: 'concise',
    includeExamples: false
  },
  normal: {
    questionCount: 6,
    questionDepth: 'standard',
    depthDescription: '【重要指令】标准模式：覆盖主要模块、用户流程、数据结构。',
    archDetail: 'standard',
    includeExamples: true
  },
  deep: {
    questionCount: 10,
    questionDepth: 'comprehensive',
    depthDescription: '【重要指令】深度工程模式：关注边界条件、性能、并发、安全等复杂需求。',
    archDetail: 'comprehensive',
    includeExamples: true
  },
  keyGoal: {
    questionCount: 0,
    questionDepth: 'none',
    depthDescription: '【重要指令】直接产出模式：不提问、不澄清，直接将用户需求转成工程化语言。',
    archDetail: 'comprehensive',
    includeExamples: true
  }
};

// ==========================================
// 固定架构基准配置
// ==========================================
const ARCHITECTURE_BASELINE = `
前端采用 React + Vite + Tailwind + Zustand + React Query
后端采用 Node.js + Express 分层架构
文件解析模块使用 Word/PDF 解析器
AI Provider 层封装各模型调用
部署方案优先 Railway/Render，其次 Docker + 轻量云
配置文件需包含：AI Keys、Provider URLs、文件大小限制、端口号、临时路径
`;

// ==========================================
// 架构生成 Prompt 模板
// ==========================================
const ARCHITECTURE_PROMPT_TEMPLATE = `
你现在是一名软件架构总工程师，你的任务是：
把用户输入的需求，转化成一份「能直接交给 Cursor / Trae / Windsurf 执行的工程指导文档」。

输出必须满足：
- 不能包含代码
- 不能包含反引号
- 不能包含代码示例
- 全程使用自然语言描述技术方案
- 强调可执行、工程化、可拆解

=========================
用户需求如下：
{{finalRequirement}}
=========================

请按以下结构输出：

## 一、项目总览
说明项目定位、目标用户、核心功能、系统边界。

## 二、默认架构基准
{{architectureBaseline}}

## 三、完整文件结构
详细说明前后端文件结构，每个目录和文件的用途。

## 四、文件用途说明
说明每个关键文件的用途和内含字段要求。

## 五、配置文件要求
列出所有配置项及其说明。

## 六、模块职责
详细说明前端、后端、AI Provider、文件解析器等模块的职责。

## 七、数据流说明
说明系统中的数据流和AI调用链。

## 八、API 自然语言描述
描述主要API的功能、输入输出和用途。

## 九、前端初始化步骤
可执行级别的前端项目初始化步骤。

## 十、后端初始化步骤
可执行级别的后端项目初始化步骤。

## 十一、扩展性策略
说明系统的扩展性设计。

## 十二、性能、安全、AI 调用超时机制
说明性能优化、安全策略和AI调用超时处理。

请确保最终输出是 **可执行、可拆解、可让 IDE 按步骤实现的工程文档**。
`;

// ==========================================
// 路由定义
// ==========================================

// ------------------------------------------
// provider 列表
// ------------------------------------------
router.get('/list', (req, res) => {
  const config = require('../config');
  const providers = Object.keys(config.providers).map((key) => ({
    id: key,
    name: config.providers[key].name
  }));

  res.json({
    success: true,
    data: providers
  });
});

// ------------------------------------------
// 通用 AI 调用接口
// ------------------------------------------
router.post('/call', async (req, res) => {
  try {
    const { provider, apiKey, customUrl, prompt, conversation, mode } = req.body;

    if (!provider) {
      return res.status(400).json({
        success: false,
        error: '缺少 provider 参数'
      });
    }

    // 默认 API Keys 自动注入
    let finalApiKey = apiKey;
    if (!apiKey && provider !== 'thirdParty') {
      const defaultApiKeys = {
        kimi: process.env.KIMI_API_KEY || 'sk-l4sWDbgst16BXm7oNVHyTCLGYKrWz252hvMSSoN5DRgJAzUH',
        glm: 'c8b50bb7e7d342edb66b293636342059.VpGbzEj6uamxt01l'
      };
      finalApiKey = defaultApiKeys[provider];
      if (!finalApiKey) {
        return res.status(400).json({
          success: false,
          error: `未提供 ${provider} 的 API 密钥，且系统未配置默认密钥`
        });
      }
    }

    if (!prompt && !conversation) {
      return res.status(400).json({
        success: false,
        error: '缺少 prompt 或 conversation 参数'
      });
    }

    // 需求完善模式处理
    if (mode === 'requirement' && provider === 'kimi' && conversation) {
      const result = await processRequirementConversation(conversation, finalApiKey);
      return res.json({ success: true, data: result });
    }

    // 直接调用 AI Provider
    const result = await callAI(provider, {
      apiKey: finalApiKey,
      customUrl,
      prompt,
      conversation
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Provider 调用错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || '调用 AI Provider 时发生错误'
    });
  }
});

// ------------------------------------------
// 提问引擎 - 批量生成问题
// ------------------------------------------
router.post('/batch-questions', async (req, res) => {
  try {
    const { userInput, apiKey, questionCount, questionDepth, mode } = req.body;

    if (!userInput) {
      return res.status(400).json({
        success: false,
        error: '缺少 userInput 参数'
      });
    }

    // 默认 API Key
    let finalApiKey = apiKey || 'sk-l4sWDbgst16BXm7oNVHyTCLGYKrWz252hvMSSoN5DRgJAzUH';

    // keyGoal 模式跳过提问
    if (mode === 'keyGoal') {
      return res.json({
        success: true,
        data: {
          questions: [],
          evaluation: 'keyGoal 模式已跳过问题生成'
        }
      });
    }

    // 确定模式配置
    let finalCount = questionCount || 5;
    let finalDepth = questionDepth || 'standard';
    let sysInstruction = '';

    if (mode && MODE_CONFIG[mode]) {
      finalCount = MODE_CONFIG[mode].questionCount;
      finalDepth = MODE_CONFIG[mode].questionDepth;
      sysInstruction = MODE_CONFIG[mode].depthDescription;
    }

    // 增强用户输入
    const enhancedInput = sysInstruction
      ? `${userInput}\n\n===========\n系统指令：${sysInstruction}\n===========`
      : userInput;

    // 生成批量问题
    const result = await generateBatchQuestions(
      enhancedInput,
      finalApiKey,
      finalCount,
      finalDepth
    );

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('批量生成问题错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || '批量生成问题时发生错误'
    });
  }
});

// ------------------------------------------
// 回答总结
// ------------------------------------------
router.post('/summarize-answers', async (req, res) => {
  try {
    const { questions, answers, originalInput, apiKey } = req.body;

    if (!questions || !answers || !originalInput) {
      return res.status(400).json({
        success: false,
        error: '缺少必要字段（questions / answers / originalInput）'
      });
    }

    // 默认 API Key
    let finalApiKey = apiKey || 'sk-l4sWDbgst16BXm7oNVHyTCLGYKrWz252hvMSSoN5DRgJAzUH';

    // 总结用户回答
    const result = await summarizeUserAnswers(
      questions,
      answers,
      originalInput,
      finalApiKey
    );

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('总结用户回答错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || '总结用户回答时发生错误'
    });
  }
});

// ------------------------------------------
// 架构生成接口（全面升级）
// ------------------------------------------
router.post('/glm/architecture', async (req, res) => {
  try {
    const { apiKey, finalRequirement, mode } = req.body;

    if (!finalRequirement) {
      return res.status(400).json({
        success: false,
        error: '缺少 finalRequirement 参数'
      });
    }

    // 默认 API Key
    let finalApiKey = apiKey || 'c8b50bb7e7d342edb66b293636342059.VpGbzEj6uamxt01l';

    // 根据模式调整详细程度
    let prompt = ARCHITECTURE_PROMPT_TEMPLATE
      .replace('{{finalRequirement}}', finalRequirement)
      .replace('{{architectureBaseline}}', ARCHITECTURE_BASELINE);

    // 添加模式特定指令
    if (mode && MODE_CONFIG[mode]) {
      const modeConfig = MODE_CONFIG[mode];
      let modeInstruction = '';

      switch (mode) {
        case 'simple':
          modeInstruction = '\n\n【模式指令】simple 模式：请输出粗略的文件结构、模块级职责概述和简化版项目初始化步骤，无需配置细节。';
          break;
        case 'normal':
          modeInstruction = '\n\n【模式指令】normal 模式：请输出标准详细程度的文件结构、文件用途说明、基础配置文件字段要求、模块关系、前后端初始化步骤和API层说明。';
          break;
        case 'deep':
          modeInstruction = '\n\n【模式指令】deep 模式：请输出完整文件结构、每个文件的用途和内含字段要求、完整配置项清单、数据流说明、AI调用链说明、完整项目初始化步骤、扩展性性能安全性策略和完整模块职责。';
          break;
        case 'keyGoal':
          modeInstruction = '\n\n【模式指令】keyGoal 模式：不澄清，不提问，直接把用户自然语言需求转成工程化语言，包含完整文件结构、配置文件说明、模块职责和初始化步骤，深度与deep模式一致。';
          break;
      }

      prompt += modeInstruction;
    }

    // 限制 prompt 长度
    if (prompt.length > 14000) {
      prompt = prompt.substring(0, 14000);
    }

    // 调用 GLM API
    const result = await callAI('glm', {
      apiKey: finalApiKey,
      prompt
    });

    // 过滤结果
    const filteredResult = filterCodeBlocks(result);

    res.json({
      success: true,
      data: filteredResult
    });
  } catch (error) {
    console.error('GLM 架构设计错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'GLM 架构设计时发生错误'
    });
  }
});

module.exports = router;