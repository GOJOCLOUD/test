const express = require('express');
const router = express.Router();

// 测试GLM API调用和前端过滤
router.post('/test-glm-filtering', async (req, res) => {
  try {
    const { finalRequirement } = req.body;
    
    if (!finalRequirement) {
      return res.status(400).json({
        success: false,
        error: '缺少 finalRequirement 参数'
      });
    }
    
    // 使用默认GLM API密钥
    const apiKey = 'c8b50bb7e7d342edb66b293636342059.VpGbzEj6uamxt01l';
    
    // 构建与provider.js中相同的提示词
    let prompt = `你是一名资深的软件架构师和工程专家。请根据以下最终需求文档，输出适用于 Trae、Cursor 等 AI 编程工具的工程级语言和架构设计文档。

**极其重要的要求：绝对不要包含任何代码块、代码示例、代码片段或任何形式的代码！**
**工程级语言指的是专业的技术描述文档，而不是代码！**

${finalRequirement}

请按照以下结构输出详细内容：

## 1. 项目概述
- 项目名称和定位
- 核心功能描述
- 技术栈选择及理由

## 2. 文件结构
描述项目目录结构和各目录的用途，不要使用代码块格式，而是用文字描述：
- 前端目录结构：包含src/components、src/pages等目录及其用途
- 后端目录结构：包含controllers、models、routes等目录及其用途
- 其他目录：如database、docs等目录的用途说明

## 3. 全局架构说明
### 3.1 系统架构
- 前后端分离架构的设计原则
- 数据流设计说明
- 状态管理方案描述

### 3.2 技术架构
- 前端框架及核心库的选择理由
- 后端框架及核心库的选择理由
- 数据库选择及设计考虑
- 缓存策略说明
- 部署方案描述

## 4. 模块拆解
### 4.1 前端模块
- 页面组件设计原则
- 状态管理设计说明
- 路由设计描述
- API 集成方案说明

### 4.2 后端模块
- API 设计原则
- 数据模型设计说明
- 业务逻辑设计描述
- 中间件设计说明

## 5. API 列表
### 5.1 认证相关
- 用户登录API的功能描述
- 用户注册API的功能描述
- 用户登出API的功能描述

### 5.2 业务相关
根据具体需求描述各业务API的功能和用途

### 5.3 数据格式
描述API请求和响应的数据结构，不要使用代码示例

## 6. 前后端任务清单
### 6.1 前端任务
- 项目初始化的步骤描述
- 开发环境配置说明
- 基础组件库实现说明
- 页面路由实现说明
- 状态管理实现说明
- API服务集成说明
- 业务页面实现说明
- 响应式设计实现说明
- 性能优化策略说明
- 单元测试实施说明

### 6.2 后端任务
- 项目初始化的步骤描述
- 开发环境配置说明
- 数据库模型设计说明
- API路由实现说明
- 业务逻辑实现说明
- 数据验证实现说明
- 错误处理实现说明
- 日志系统实现说明
- 性能优化策略说明
- 单元测试实施说明

## 7. 可交给 Trae 的开发步骤
请提供详细的开发步骤说明，**不要包含任何代码块或代码示例**：

### 7.1 项目初始化
- 创建项目目录结构的步骤说明
- 初始化前端项目的步骤说明
- 初始化后端项目的步骤说明

### 7.2 前端基础结构
- 创建前端目录结构的步骤说明
- 各目录的用途和设计原则

### 7.3 后端基础结构
- 创建后端目录结构的步骤说明
- 各目录的用途和设计原则

### 7.4 核心功能实现
- 前端主要组件的实现思路说明
- 后端API路由的实现思路说明
- 数据模型的实现思路说明
- 配置文件的实现思路说明

### 7.5 数据库初始化
- 数据库初始化的步骤说明
- 表结构设计的思路说明

请确保所有内容都是工程级语言描述，不包含任何代码块或代码示例。输出内容应该详细到可以让开发者理解整个项目的设计思路和实现方法。

极其重要的注意事项：
1. 绝对不要使用任何代码块标记（如三个反引号或单个反引号）
2. 绝对不要包含任何代码示例、代码片段或任何形式的代码
3. 使用自然语言描述所有技术实现思路
4. 确保输出是纯文档格式，适合作为项目架构设计文档
5. 工程级语言指的是专业的技术描述文档，而不是代码！
6. 如果提到任何技术概念，用文字描述其功能和用途，不要提供代码实现`;
    
    // 压缩提示词，确保不超过15000个字符
    if (prompt.length > 15000) {
      prompt = prompt.substring(0, 15000);
      console.log('提示词过长，已裁切至15000字符');
    }
    
    // 调用GLM API
    const glmService = require('../services/glm');
    const result = await glmService.call(apiKey, prompt);
    
    // 检查原始结果中是否包含代码块
    const hasCodeBlock = result.includes('```') || result.includes('`');
    console.log('原始结果是否包含代码块:', hasCodeBlock);
    
    // 应用前端过滤逻辑
    let filteredContent = result
      // 移除HTML标签
      .replace(/<[^>]*>/g, '')
      // 移除代码块（包括多行和单行）
      .replace(/```[\s\S]*?```/g, '[代码块已过滤]')
      // 移除行内代码
      .replace(/`[^`]*`/g, '[代码片段已过滤]')
      // 移除可能的HTML实体
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // 移除可能的markdown代码标记
      .replace(/\\`\\`\\`[\s\S]*?\\`\\`\\`/g, '[代码块已过滤]')
      .replace(/\\`[^\\`]*\\`/g, '[代码片段已过滤]');
    
    // 检查过滤后是否还包含代码块
    const hasCodeBlockAfterFilter = filteredContent.includes('```') || filteredContent.includes('`');
    console.log('过滤后是否包含代码块:', hasCodeBlockAfterFilter);
    
    res.json({
      success: true,
      data: {
        originalResult: result,
        filteredResult: filteredContent,
        hasCodeBlock: hasCodeBlock,
        hasCodeBlockAfterFilter: hasCodeBlockAfterFilter
      }
    });
  } catch (error) {
    console.error('测试GLM过滤错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || '测试GLM过滤时发生错误'
    });
  }
});

module.exports = router;