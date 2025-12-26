// 模拟后端逻辑，实际项目中可替换为真实 API 调用
export const mockDelay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

export const mockQuestions = [
  { id: 1, text: "该项目主要面向的用户群体是谁？（B端/C端）", answered: false },
  { id: 2, text: "是否需要支持多语言国际化？", answered: false },
  { id: 3, text: "后端首选技术栈是 Node.js, Python 还是 Go？", answered: false }
];

export const mockTodoList = {
  frontend: [
    "初始化 Vite + React 项目结构",
    "配置 TailwindCSS 与 Shadcn/UI",
    "实现用户登录注册页面 (Login/Register)",
    "集成 Zustand 全局状态管理",
    "开发仪表盘首页组件"
  ],
  backend: [
    "设计 MySQL 数据库 User 表结构",
    "搭建 NestJS 基础服务框架",
    "实现 JWT 认证 Middleware",
    "开发 CRUD 核心 API 接口"
  ],
  deploy: [
    "编写 Dockerfile 容器化配置",
    "配置 Nginx 反向代理",
    "设置 GitHub Actions CI/CD 流程",
    "购买并配置 SSL 证书"
  ]
};

export const mockTemplates = [
  { id: 1, name: "SaaS Web App", description: "标准的 B 端管理系统架构", tags: ["React", "NestJS"] },
  { id: 2, name: "AI Chat Agent", description: "基于 LLM 的对话式应用模板", tags: ["LangChain", "Python"] },
  { id: 3, name: "E-commerce", description: "高性能电商前台模板", tags: ["Next.js", "Go"] },
];