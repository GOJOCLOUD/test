import express from "express";
import { http, ok, fail } from "../utils/http.js";
import { CONFIG } from "../utils/config.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { text, auto } = req.query;

    if (auto === "true") {
      const url = `https://restapi.amap.com/v3/ip?key=${CONFIG.AMAP_KEY}`;
      const { data } = await http.get(url);
      if (data.status !== "1") return res.status(500).json(fail("IP定位失败"));
      let location = null;
      if (data.rectangle) {
        const [a, b] = data.rectangle.split(";");
        const [lng1, lat1] = a.split(",").map(Number);
        const [lng2, lat2] = b.split(",").map(Number);
        location = `${((lng1 + lng2) / 2).toFixed(6)},${((lat1 + lat2) / 2).toFixed(6)}`;
      }
      return res.json(ok({ type: "ip", province: data.province, city: data.city, adcode: data.adcode, location }));
    }

    if (text) {
      const url = `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(text)}&key=${CONFIG.AMAP_KEY}`;
      const { data } = await http.get(url);
      if (data.status !== "1" || !data.geocodes?.length) return res.status(404).json(fail("未找到对应地址", 404));
      const g = data.geocodes[0];
      return res.json(ok({ type: "text", input: text, formatted_address: g.formatted_address, location: g.location }));
    }

    return res.status(400).json(fail("请提供 ?text= 或 ?auto=true", 400));
  } catch (e) {
    return res.status(500).json(fail(e.message));
  }
});

export default router;
