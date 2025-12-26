const express = require('express');
const router = express.Router();
const { callAI } = require('../services/aiProvider');
const { filterCodeBlocks } = require('../utils/textFilter');
const config = require('../config');

// 工程语言转译端点
router.post('/translate', async (req, res) => {
  try {
    const { inputText, apiKey, mode } = req.body;
    
    // 如果用户未提供API密钥，使用默认密钥
    let finalApiKey = apiKey;
    if (!apiKey) {
      finalApiKey = config.glm.apiKeys && config.glm.apiKeys.length > 0 
        ? config.glm.apiKeys[0] 
        : 'c8b50bb7e7d342edb66b293636342059.VpGbzEj6uamxt01l';
      console.log('使用默认 GLM API 密钥');
    }
    
    if (!inputText) {
      return res.status(400).json({
        success: false,
        error: '缺少 inputText 参数'
      });
    }
    
    // 根据模式调整提示词
    let modeInstruction = '';
    if (mode === 'simple') {
      modeInstruction = '请提供简洁的工程语言转译，专注于核心概念和基本实现思路。';
    } else if (mode === 'comprehensive') {
      modeInstruction = '请提供极其详细和全面的工程语言转译，包含所有技术细节、实现步骤和最佳实践。';
    } else {
      modeInstruction = '请提供标准详细程度的工程语言转译，确保涵盖所有关键点。';
    }
    
    // 构建给 GLM 的提示词
    let prompt = `你是一名资深的软件架构师和工程专家。请将以下自然语言描述转译为适用于 Trae、Cursor 等 AI 编程工具的工程级语言和架构设计文档。

**极其重要的要求：绝对不要包含任何代码块、代码示例、代码片段或任何形式的代码！**
**工程级语言指的是专业的技术描述文档，而不是代码！**

转译模式：${modeInstruction}

用户输入的自然语言描述：
${inputText}

请按照以下结构输出详细的工程化规约：

## 1. 需求解析
- 核心功能需求分析
- 非功能性需求分析
- 技术约束和限制分析

## 2. 技术架构设计
- 系统架构选择及理由
- 技术栈选择及理由
- 数据流设计说明
- 状态管理方案描述

## 3. 模块拆解
- 前端模块划分及职责
- 后端模块划分及职责
- 数据模型设计说明
- API设计原则说明

## 4. 实现路径
- 项目初始化步骤描述
- 核心功能实现顺序
- 关键技术点实现思路
- 测试策略说明

## 5. 工程化规约
- 代码组织规范
- 命名规范说明
- 文件结构规范
- 注释和文档规范

## 6. 部署与运维
- 部署方案描述
- 监控方案说明
- 日志管理规范
- 性能优化策略

请确保所有内容都是工程级语言描述，不包含任何代码块或代码示例。输出内容应该详细到可以让开发者理解整个项目的设计思路和实现方法。

极其重要的注意事项：
1. 绝对不要使用任何代码块标记（如三个反引号或单个反引号）
2. 绝对不要包含任何代码示例、代码片段或任何形式的代码
3. 使用自然语言描述所有技术实现思路
4. 确保输出是纯文档格式，适合作为项目架构设计文档
5. 工程级语言指的是专业的技术描述文档，而不是代码！`;
    
    // 压缩提示词，确保不超过15000个字符
    if (prompt.length > 15000) {
      prompt = prompt.substring(0, 15000);
      console.log('提示词过长，已裁切至15000字符');
    }
    
    const result = await callAI('glm', {
      apiKey: finalApiKey,
      prompt,
      model: config.glm.model,
      temperature: 0.7,
      max_tokens: config.glm.maxTokens
    });
    
    // 过滤结果中的代码块
    const filteredResult = filterCodeBlocks(result);
    
    res.json({
      success: true,
      data: filteredResult
    });
  } catch (error) {
    console.error('工程语言转译错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || '工程语言转译时发生错误'
    });
  }
});

module.exports = router;