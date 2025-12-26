# TodoGen - AI驱动的项目计划生成工具

TodoGen是一个基于AI的项目计划生成工具，可以帮助开发者快速生成前端、后端和部署相关的任务清单。

## 功能特点

- 🤖 AI驱动的项目计划生成
- 📝 智能问题生成，帮助明确项目需求
- 🎯 针对性的任务清单（前端、后端、部署）
- 📋 项目模板库，快速启动常见项目
- 🔄 响应式设计，支持多种设备

## 技术栈

- **前端框架**: React 18
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **路由**: React Router
- **动画**: Framer Motion
- **图标**: Lucide React

## 项目结构

```
src/
├── api/           # API调用
├── components/    # 组件
├── mock/          # 模拟数据
├── pages/         # 页面
├── store/         # 状态管理
├── App.jsx        # 应用入口
├── index.css      # 全局样式
└── main.jsx       # 主入口
```

## 开始使用

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:5173 上运行。

### 构建生产版本

```bash
npm run build
```

## 使用指南

### 1. 创建项目计划

1. 在主页输入框中描述你的项目
2. 点击"Generate Plan"按钮
3. 回答生成的问题
4. 点击"Generate Final Plan"获取完整的项目计划

### 2. 使用项目模板

1. 访问模板页面
2. 浏览可用的项目模板
3. 点击"应用此模板"按钮
4. 根据需要调整项目描述

### 3. 查看和导出计划

1. 在主页或预览页面查看生成的计划
2. 使用"Export JSON"导出计划
3. 使用"Copy All"复制计划内容

## API说明

当前版本使用模拟API，实际项目中需要替换为真实的后端API。

### 可用的API端点

- `POST /api/generate_questions` - 生成问题
- `POST /api/complete_missing` - 自动补全答案
- `POST /api/generate_todolist` - 生成任务清单
- `GET /api/templates` - 获取模板列表
- `POST /api/templates` - 保存模板

## 自定义配置

### 修改主题

在 `src/index.css` 中修改CSS变量来自定义主题：

```css
:root {
  --primary-color: #3b82f6;
  --background-color: #ffffff;
  --text-color: #1f2937;
}
```

### 添加新的模板

在 `src/mock/handlers.js` 中添加新的模板：

```javascript
export const mockTemplates = [
  // 现有模板...
  { 
    id: 4, 
    name: "新模板名称", 
    description: "模板描述", 
    tags: ["标签1", "标签2"] 
  },
];
```

## 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件至 [your-email@example.com]

## 更新日志

### v1.0.0
- 初始版本发布
- 基本的项目计划生成功能
- 模板系统
- 响应式设计