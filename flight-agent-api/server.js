// backend/server.js
import express from "express";
import cors from "cors";
import morgan from "morgan";

import geocodeRouter from "./routes/geocode.js";
import routeRouter from "./routes/route.js";
import weatherRouter from "./routes/weather.js";
import recommendRouter from "./routes/recommend.js";
import poiRouter from "./routes/poi.js";
import scenicRouter from "./routes/scenic-route.js";
import flightPlanRouter from "./routes/flight-plan.js"; // ✅ 飞行规划接口
import poiPhotoRouter from "./routes/poi-photo.js"; // ✅ 景点图片接口
import { CONFIG } from "./utils/config.js";

// ✅ 创建应用实例（必须在所有 app.use() 之前）
const app = express();

// ✅ 通用中间件
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ✅ 根路径测试
app.get("/", (_req, res) =>
  res.json({ ok: true, name: "flight-agent-api", version: "1.1.0" })
);

// ✅ 路由注册
app.use("/api/geocode", geocodeRouter);
app.use("/api/route", routeRouter);
app.use("/api/weather", weatherRouter);
app.use("/api/recommend", recommendRouter);
app.use("/api/poi", poiRouter);
app.use("/api/scenic-route", scenicRouter);
app.use("/api/flight-plan", flightPlanRouter); // ✅ 飞行规划接口
app.use("/api/poi", poiPhotoRouter); // ✅ 景点图片接口（必须在 app 定义之后）

// ✅ 自动识别云服务器端口（Render、Railway、Vercel等）
const PORT = process.env.PORT || CONFIG.PORT || 3000;

// ✅ 启动服务
app.listen(PORT, () => {
  console.log(`✅ Flight-Agent API running on port ${PORT}`);
  console.log(`🌍 Access test: http://localhost:${PORT}/api/flight-plan`);
});
