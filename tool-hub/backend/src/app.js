const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 导入路由
const paperFormatRoutes = require('./routes/paperFormatRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

// 中间件
app.use(cors());
app.use(express.json());

// 使用论文排版路由
app.use('/api/tools', paperFormatRoutes);

// 基础路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Tool Hub API is running' });
});

// 工具列表路由
app.get('/api/tools', (req, res) => {
  res.json({
    internal: [
      { id: 'base64', name: 'Base64编码/解码', category: 'text' },
      { id: 'json-formatter', name: 'JSON格式化', category: 'text' },
      { id: 'url-encoder', name: 'URL编码/解码', category: 'text' },
      { id: 'timestamp', name: '时间戳转换', category: 'converter' },
      { id: 'uuid-generator', name: 'UUID生成器', category: 'generator' },
      { id: 'paper-format', name: '论文排版', category: 'paper_formatting' }
    ],
    external: [
      { id: 'google-analytics', name: 'Google Analytics', url: 'https://analytics.google.com' },
      { id: 'github', name: 'GitHub', url: 'https://github.com' },
      { id: 'figma', name: 'Figma', url: 'https://figma.com' }
    ]
  });
});

// AI搜索路由
app.post('/api/ai/search', (req, res) => {
  const { query } = req.body;
  // 简单的关键词匹配，后续可集成真正的AI
  const tools = [
    { id: 'base64', name: 'Base64编码/解码', description: 'Base64编码解码工具' },
    { id: 'json-formatter', name: 'JSON格式化', description: 'JSON格式美化工具' },
    { id: 'paper-format', name: '论文排版', description: 'Word文档自动排版工具，支持格式优化和美化' }
  ];
  
  const results = tools.filter(tool => 
    tool.name.includes(query) || tool.description.includes(query)
  );
  
  res.json({ results });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});