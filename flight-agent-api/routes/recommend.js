import express from "express";
import { http, ok, fail } from "../utils/http.js";
import { CONFIG } from "../utils/config.js";

const router = express.Router();

/**
 * GET /api/recommend?from=武汉大学
 * 基于名称关键词检索：湖、公园、大桥、山
 */
router.get("/", async (req, res) => {
  try {
    const { from = "", radius = 30000 } = req.query; // 默认30km
    if (!from) return res.json(fail("缺少起点参数"));

    const { GAODE_KEY } = CONFIG;
    if (!GAODE_KEY) return res.json(fail("请在 config.js 中设置 GAODE_KEY"));

    // 1️⃣ 地理编码
    const geoURL = "https://restapi.amap.com/v3/geocode/geo";
    const geoRes = await http.get(geoURL, { params: { key: GAODE_KEY, address: from } });
    const location = geoRes.data.geocodes?.[0]?.location;
    if (!location) return res.json(fail("地理编码失败，检查地点名称是否正确"));

    // 2️⃣ 按关键词检索
    const keywords = ["湖", "公园", "大桥", "山"];
    const placeURL = "https://restapi.amap.com/v3/place/around";
    const allResults = [];

    for (const kw of keywords) {
      for (let page = 1; page <= 3; page++) { // 最多3页 * 20 = 60条
        const resp = await http.get(placeURL, {
          params: {
            key: GAODE_KEY,
            location,
            radius,
            keywords: kw,
            offset: 20,
            page,
            extensions: "base"
          }
        });
        const pois = resp.data.pois || [];
        if (pois.length === 0) break;

        for (const p of pois) {
          allResults.push({
            name: p.name,
            type: p.type,
            distance: Number(p.distance || 0),
            address: p.address,
            keyword: kw
          });
        }
      }
    }

    // 3️⃣ 去重 + 按距离排序
    const uniqueMap = new Map();
    for (const p of allResults) {
      if (!uniqueMap.has(p.name)) uniqueMap.set(p.name, p);
    }

    const sorted = Array.from(uniqueMap.values()).sort((a, b) => a.distance - b.distance);

    // 4️⃣ 生成推荐输出
    if (sorted.length === 0) {
      return res.json(ok({
        input: from,
        suggestions: [`未在 ${radius / 1000}km 内找到相关景点，请尝试更大范围。`]
      }));
    }

    const suggestions = [
      `白天模式推荐：${from} 周边 ${radius / 1000}km 内发现 ${sorted.length} 个景点`,
      ...sorted.slice(0, 10).map(
        (p, i) => `${i + 1}. ${p.name}（${p.keyword}，距 ${p.distance} 米）`
      ),
      "提示：推荐基于关键词“湖、公园、大桥、山”检索。"
    ];

    return res.json(ok({ input: from, suggestions }));
  } catch (e) {
    console.error("recommend error:", e.message);
    return res.status(500).json(fail(e.message));
  }
});

export default router;
