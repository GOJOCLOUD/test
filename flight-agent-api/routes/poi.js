import express from "express";
import { http, ok, fail } from "../utils/http.js";
import { CONFIG } from "../utils/config.js";

const router = express.Router();

/**
 * GET /api/poi?lat=30.5&lon=114.3&radius=5000
 * 返回周边景点列表
 */
router.get("/", async (req, res) => {
  try {
    const { lat, lon, radius = 5000 } = req.query;
    if (!lat || !lon) return res.status(400).json(fail("缺少经纬度参数", 400));

    const url = `https://restapi.amap.com/v5/place/around?key=${CONFIG.AMAP_KEY}&location=${lon},${lat}&radius=${radius}&types=风景名胜`;
    const { data } = await http.get(url);
    if (data.status !== "1") return res.status(500).json(fail("POI检索失败"));
    const pois = data.pois?.map(p => ({
      name: p.name,
      type: p.type,
      location: p.location,
      address: p.address
    })) || [];

    res.json(ok({ count: pois.length, pois }));
  } catch (e) {
    res.status(500).json(fail(e.message));
  }
});

export default router;
