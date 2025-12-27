import express from "express";
import { http, ok, fail } from "../utils/http.js";
import { CONFIG } from "../utils/config.js";

const router = express.Router();

/**
 * 航线规划接口（修正版）
 * - 默认起点：武汉大学
 * - 默认终点：光谷
 * - 支持 mode=fly（直线飞行）和 mode=drive（驾车路线）
 *
 * 示例：
 *   http://localhost:3000/api/route           → 默认 drive 模式
 *   http://localhost:3000/api/route?mode=fly → 飞行模式
 *   http://localhost:3000/api/route?fromText=黄鹤楼&toText=武汉大学&mode=fly
 */
router.get("/", async (req, res) => {
  try {
    // 默认参数：武汉大学 → 光谷
    const fromText = req.query.fromText || "武汉大学";
    const toText = req.query.toText || "光谷";
    const mode = req.query.mode || "drive";

    const { AMAP_KEY } = CONFIG;
    if (!AMAP_KEY) return res.status(400).json(fail("未设置 AMAP_KEY", 400));

    // 1️⃣ 起点地理编码
    const fromRich = await geocodeRich(fromText);
    if (!fromRich?.location)
      return res.status(400).json(fail("起点解析失败", 400));

    // 2️⃣ 终点地理编码（含距离异常重试逻辑）
    let toRich = await geocodeRich(toText);
    if (!toRich?.location)
      return res.status(400).json(fail("终点解析失败", 400));

    const [flon, flat] = fromRich.location.split(",").map(Number);
    const [tlon0, tlat0] = toRich.location.split(",").map(Number);
    let dist0 = greatCircleDistance(flat, flon, tlat0, tlon0);

    if (dist0 > 100_000 && fromRich.city) {
      const retry = await geocodeRich(toText, fromRich.city);
      if (retry?.location) toRich = retry;
    }

    const [tlon, tlat] = toRich.location.split(",").map(Number);
    const distance = greatCircleDistance(flat, flon, tlat, tlon);

    // 3️⃣ 飞行模式
    if (mode === "fly") {
      const bearing = calculateBearing(flat, flon, tlat, tlon);
      return res.json(
        ok({
          mode: "fly",
          from: fromText,
          to: toText,
          fromLoc: fromRich.location,
          toLoc: toRich.location,
          distance_m: distance,
          bearing_deg: bearing,
          summary: `航线距离约 ${(distance / 1000).toFixed(
            2
          )} 公里，方向角 ${bearing.toFixed(1)}°`
        })
      );
    }

    // 4️⃣ 驾车模式
    const driveData = await getDrivingRoute(fromRich.location, toRich.location);
    return res.json(ok({ mode: "drive", ...driveData }));
  } catch (e) {
    res.status(500).json(fail(e.message));
  }
});

/* =============== 工具函数 =============== */

async function geocodeRich(text, cityLimit) {
  const base = `https://restapi.amap.com/v3/geocode/geo?key=${CONFIG.AMAP_KEY}`;
  const url = cityLimit
    ? `${base}&address=${encodeURIComponent(text)}&city=${encodeURIComponent(
        cityLimit
      )}`
    : `${base}&address=${encodeURIComponent(text)}`;
  const { data } = await http.get(url);
  if (data.status !== "1" || !data.geocodes?.length) return null;
  const g = data.geocodes[0];
  return {
    location: g.location,
    formatted_address: g.formatted_address,
    city: g.city || g.province || "",
    adcode: g.adcode || ""
  };
}

async function getDrivingRoute(from, to) {
  const url = `https://restapi.amap.com/v3/direction/driving?origin=${from}&destination=${to}&key=${CONFIG.AMAP_KEY}`;
  const { data } = await http.get(url);
  const path = data?.route?.paths?.[0];
  return {
    from,
    to,
    distance_m: Number(path?.distance ?? 0),
    duration_s: Number(path?.duration ?? 0),
    summary: `公路距离 ${(Number(path?.distance) / 1000).toFixed(
      1
    )} 公里，预计 ${(Number(path?.duration) / 60).toFixed(0)} 分钟`
  };
}

function greatCircleDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = d => (d * Math.PI) / 180;
  const φ1 = toRad(lat1),
    φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1),
    Δλ = toRad(lon2 - lon1);
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateBearing(lat1, lon1, lat2, lon2) {
  const toRad = d => (d * Math.PI) / 180;
  const toDeg = r => (r * 180) / Math.PI;
  const φ1 = toRad(lat1),
    φ2 = toRad(lat2);
  const λ1 = toRad(lon1),
    λ2 = toRad(lon2);
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export default router;
