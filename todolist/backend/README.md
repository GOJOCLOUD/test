# AI Provider 后端系统

这是一个动态多 AI Provider 后端系统，支持需求完善对话引擎。系统集成了 Kimi 和 GLM 两个 AI Provider，并支持自定义 API 和第三方 API。

## 功能特点

- **多 AI Provider 支持**：支持 Kimi、GLM、自定义 API 和第三方 API
- **需求完善对话引擎**：Kimi 作为需求完善 Agent，主动与用户多轮对话
- **架构设计引擎**：GLM 作为架构师，根据最终需求输出详细架构设计
- **失败自动回退**：当主 Provider 失败时，自动尝试备用 Provider
- **统一接口**：所有 AI Provider 通过统一的 `callAI()` 接口调用

## 系统架构

```
backend/
├── routes/
│   └── provider.js          # 路由处理
├── services/
│   ├── kimi.js              # Kimi 服务
│   ├── glm.js               # GLM 服务
│   ├── customAPI.js         # 自定义 API 服务
│   ├── thirdParty.js        # 第三方 API 服务
│   └── aiProvider.js        # AI Provider 统一接口
├── logic/
│   └── requirementEngine.js # 需求完善逻辑层
├── middleware/
│   └── errorHandler.js      # 错误处理中间件
├── config.js                # 配置文件
├── server.js                # 主服务器文件
└── package.json             # 项目依赖
```

## 安装与运行

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

创建 `.env` 文件并配置以下变量：

```env
# 服务器配置
PORT=3001
HOST=localhost
CORS_ORIGIN=*

# Kimi 配置
KIMI_BASE_URL=https://api.moonshot.cn/v1
KIMI_MODEL=moonshot-v1-8k
KIMI_MAX_TOKENS=4000
KIMI_TIMEOUT=30000

# GLM 配置
GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4
GLM_MODEL=glm-4
GLM_MAX_TOKENS=4000
GLM_TIMEOUT=30000

# 自定义 API 配置
CUSTOM_API_BASE_URL=
CUSTOM_API_MODEL=gpt-3.5-turbo
CUSTOM_API_MAX_TOKENS=4000
CUSTOM_API_TIMEOUT=30000

# 第三方 API 配置
THIRD_PARTY_BASE_URL=
THIRD_PARTY_MODEL=gpt-3.5-turbo
THIRD_PARTY_MAX_TOKENS=4000
THIRD_PARTY_TIMEOUT=30000

# 需求引擎配置
MAX_CONVERSATION_TURNS=10
FINAL_REQUIREMENT_THRESHOLD=0.8

# 请求配置
REQUEST_RETRIES=3
RETRY_DELAY=1000
REQUEST_TIMEOUT=30000

# 日志配置
LOG_LEVEL=info
LOG_FORMAT=json
```

### 3. 启动服务器

```bash
# 生产环境
npm start

# 开发环境（需要安装 nodemon）
npm run dev
```

## API 接口

### 1. 获取 Provider 列表

```
GET /api/provider/list
```

响应：
```json
{
  "success": true,
  "data": [
    {
      "id": "kimi",
      "name": "Kimi"
    },
    {
      "id": "glm",
      "name": "GLM"
    },
    {
      "id": "customAPI",
      "name": "Custom API"
    },
    {
      "id": "thirdParty",
      "name": "Third Party API"
    }
  ]
}
```

### 2. 调用 AI Provider

```
POST /api/provider/call
```

请求体：
```json
{
  "provider": "kimi",
  "apiKey": "your-api-key",
  "customUrl": "https://your-custom-api.com/chat",
  "prompt": "你的提示词",
  "conversation": [
    {"role": "user", "content": "用户消息"},
    {"role": "assistant", "content": "AI 回复"}
  ],
  "mode": "requirement"
}
```

响应：
```json
{
  "success": true,
  "data": "AI 的回复内容"
}
```

### 3. GLM 架构设计

```
POST /api/provider/glm/architecture
```

请求体：
```json
{
  "apiKey": "your-glm-api-key",
  "finalRequirement": "最终需求文档"
}
```

响应：
```json
{
  "success": true,
  "data": "GLM 生成的架构设计"
}
```

## 需求完善对话引擎

### 工作流程

1. 用户发送初始需求到后端，指定 `provider: "kimi"` 和 `mode: "requirement"`
2. 系统将用户输入和对话历史发送给 Kimi
3. Kimi 根据需求完善提示词判断：
   - 如果信息不足，继续提出具体问题
   - 如果信息开始完整，提出更关键的需求问题
   - 如果信息已完整，输出 "FINAL" 并输出结构化需求
4. 系统解析 Kimi 的响应，返回给前端：
   - 如果是问题，继续对话
   - 如果是 "FINAL"，提取最终需求文档

### 最终需求文档结构

```json
{
  "projectPosition": "项目定位",
  "functionalScope": "功能范围",
  "userFlow": "用户流程",
  "keyConstraints": "关键约束",
  "nonFunctionalRequirements": "非功能性需求",
  "apiRequirements": "API 需求",
  "outputGoals": "输出目标",
  "summaryForGLM": "可直接交给 GLM 的总结"
}
```

## GLM 架构设计引擎

当 Kimi 返回最终需求后，前端可以将该需求发送给 GLM 进行架构设计。GLM 将输出：

1. 文件结构
2. 全局架构说明
3. 模块拆解
4. API 列表
5. 前后端任务清单
6. 可交给 Trae 的开发步骤（必须一次性可执行）

## 错误处理

系统实现了完善的错误处理机制：

- 请求验证
- API 调用错误处理
- 失败自动回退
- 统一错误响应格式
- 详细的错误日志

## 安全特性

- 请求速率限制
- CORS 配置
- 安全头设置（Helmet）
- 输入验证

## 许可证

ISC