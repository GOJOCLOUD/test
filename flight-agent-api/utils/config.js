// backend/utils/config.js

// ✅ 云端部署安全版配置
export const CONFIG = {
  /**
   * 高德 Web 服务 Key
   * 优先从环境变量 AMAP_KEY 读取（部署到云服务时设置）
   * 本地开发可使用默认值
   */
  AMAP_KEY: process.env.AMAP_KEY || "463dacec477bc6ad699dbe357f9a64b6",

  // 全局超时时间（毫秒）
  TIMEOUT_MS: 10000,

  // 服务器监听端口（云端 Render / Railway 会自动注入 PORT）
  PORT: process.env.PORT || 3000,
};

// ✅ 启动日志
console.log("✅ CONFIG 已加载：");
console.log("  ├─ AMAP_KEY:", CONFIG.AMAP_KEY ? "存在" : "缺失");
console.log("  ├─ TIMEOUT_MS:", CONFIG.TIMEOUT_MS);
console.log("  └─ PORT:", CONFIG.PORT);
