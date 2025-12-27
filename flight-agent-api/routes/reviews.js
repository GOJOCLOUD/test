import express from "express";
import { http, ok, fail } from "../utils/http.js";
import { CONFIG } from "../utils/config.js";

const router = express.Router();

/**
 * GET /api/reviews?keyword=黄鹤楼
 * 从高德获取景点信息与评分
 */
router.get("/", async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) return res.status(400).json(fail("请提供 ?keyword=", 400));

    const url = `https://restapi.amap.com/v5/place/text?key=${CONFIG.AMAP_KEY}&keywords=${encodeURIComponent(
      keyword
    )}&types=风景名胜`;
    const { data } = await http.get(url);

    if (data.status !== "1" || !data.pois?.length)
      return res.status(404).json(fail("未找到相关景点", 404));

    const poi = data.pois[0];
    res.json(
      ok({
        name: poi.name,
        type: poi.type,
        address: poi.address,
        rating: poi.biz_ext?.rating || "暂无评分",
        cost: poi.biz_ext?.cost || "未知",
        location: poi.location
      })
    );
  } catch (e) {
    res.status(500).json(fail(e.message));
  }
});

export default router;
