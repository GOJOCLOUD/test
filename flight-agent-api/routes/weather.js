import express from "express";
import { http, ok, fail } from "../utils/http.js";
import { CONFIG } from "../utils/config.js";

const router = express.Router();

/**
 * GET /api/weather?city=420100
 * 或 /api/weather?city=武汉
 * 返回实时/预报（此处示例实时）
 */
router.get("/", async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json(fail("请提供 ?city=", 400));

    const url = `https://restapi.amap.com/v3/weather/weatherInfo?city=${encodeURIComponent(
      city
    )}&key=${CONFIG.AMAP_KEY}`;
    const { data } = await http.get(url);

    if (data.status !== "1") {
      return res.status(404).json(fail("查询失败", 404));
    }
    return res.json(ok(data));
  } catch (e) {
    return res.status(500).json(fail(e.message));
  }
});

export default router;
