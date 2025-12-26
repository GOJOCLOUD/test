// 加载环境变量
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const providerRoutes = require('./routes/provider');
const translationRoutes = require('./routes/translation');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// 创建 Express 应用
const app = express();

// 安全中间件
app.use(helmet());

// CORS 配置
app.use(cors(config.server.cors));

// 请求日志
app.use(morgan(config.logging.format));

// 请求体解析
app.use(express.json({ 
  limit: '10mb',
  type: 'application/json',
  defaultCharset: 'utf-8',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString("utf8");
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 确保所有响应都设置正确的 Content-Type 头部
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

// 通用速率限制
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: config.rateLimit.message
  },
  standardHeaders: true, // 返回速率限制信息在 `RateLimit-*` headers
  legacyHeaders: false, // 禁用 `X-RateLimit-*` headers
});

// AI API 特定的更严格的速率限制
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5分钟窗口
  max: 50, // 每个IP 5分钟内最多50个AI请求
  message: {
    error: 'AI请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 应用通用速率限制
app.use('/api/', generalLimiter);

// 对AI相关路由应用更严格的限制
app.use('/api/provider/', aiLimiter);
app.use('/api/translation/', aiLimiter);

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
    }
  });
});

// 系统状态监控端点
app.get('/api/system/status', (req, res) => {
  try {
    const { getSystemStatus } = require('./services/aiProvider');
    const systemStatus = getSystemStatus();
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
        external: Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100
      },
      cpu: {
        usage: process.cpuUsage()
      },
      system: systemStatus
    });
  } catch (error) {
    console.error('获取系统状态失败:', error);
    res.status(500).json({
      status: 'error',
      message: '无法获取系统状态',
      error: error.message
    });
  }
});

// API 路由
app.use('/api/provider', providerRoutes);
app.use('/api/translation', translationRoutes);
app.use('/api/pages', require('./routes/pages'));

// 404 处理
app.use(notFound);

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
const PORT = config.server.port;
const HOST = config.server.host;

app.listen(PORT, HOST, () => {
  console.log(`服务器运行在 http://${HOST}:${PORT}`);
  console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`速率限制: 每IP每${config.rateLimit.windowMs/1000/60}分钟最多${config.rateLimit.max}个请求`);
  console.log(`AI速率限制: 每IP每5分钟最多20个请求`);
});

module.exports = app;