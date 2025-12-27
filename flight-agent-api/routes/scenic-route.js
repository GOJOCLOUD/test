import express from "express";
import { http, ok, fail } from "../utils/http.js";
import { CONFIG } from "../utils/config.js";

const router = express.Router();

/**
 * 观景模式（修复版）
 * - 采用 v3/place/around + extensions=all 才会返回 biz_ext.rating
 * - 半径强制夹取到 [1000, 50000]（高德 around 最大 50km）
 * - 按航程自适应采样点数量：每 ~30km 一个点，范围 [3, 12]
 * - 多页抓取（最多 3 页），聚合去重（优先使用 POI id）
 * - 距离异常>100km → 使用起点 city 限定重试 geocode
 * - 若仍无评分，回退到“无评分也可入选”，按名称+去重返回
 *
 * GET /api/scenic-route?fromText=武汉纺织大学&toText=黄鹤楼&range=50000
 */
router.get("/", async (req, res) => {
  try {
    const { fromText, toText } = req.query;
    let range = Number(req.query.range ?? 30000);
    range = clamp(range, 1000, 50000); // 高德 around 半径上限 50km

    if (!fromText || !toText) return res.status(400).json(fail("缺少起止地点", 400));

    // 1) 起点富编码
    const fromRich = await geocodeRich(fromText);
    if (!fromRich?.location) return res.status(400).json(fail("起点解析失败", 400));

    // 2) 终点富编码，距离异常则用起点 city 限定重试
    let toRich = await geocodeRich(toText);
    if (!toRich?.location) return res.status(400).json(fail("终点解析失败", 400));

    const [flon, flat] = toLonLat(fromRich.location);
    const [tlon0, tlat0] = toLonLat(toRich.location);

    let dist0 = greatCircleDistance(flat, flon, tlat0, tlon0);
    if (dist0 > 100_000 && fromRich.city) {
      const retry = await geocodeRich(toText, fromRich.city);
      if (retry?.location) toRich = retry;
    }

    const [tlon, tlat] = toLonLat(toRich.location);
    const totalDistKm = greatCircleDistance(flat, flon, tlat, tlon) / 1000;

    // 3) 沿线自适应采样（每 ~30km 一点，3~12点）
    const nSamples = clamp(Math.ceil(totalDistKm / 30), 3, 12);
    const samples = sampleAlongLine({ lat: flat, lon: flon }, { lat: tlat, lon: tlon }, nSamples);

    // 4) 每个采样点检索 POI（v3 + extensions=all + 多页），聚合去重
    const merged = new Map(); // key 优先用 id，其次用 location+name
    for (const s of samples) {
      const pois = await fetchPOIsAroundV3(s.lon, s.lat, range);
      for (const p of pois) {
        const key = p.id || `${p.location}|${p.name}`;
        const existed = merged.get(key);
        if (!existed) merged.set(key, p);
        else {
          // 如果重复命中，保留评分更高者
          if ((p.ratingNum ?? -1) > (existed.ratingNum ?? -1)) merged.set(key, p);
        }
      }
    }

    let all = Array.from(merged.values());

    // 5) 先筛有评分的；若没有，降级允许无评分
    let filtered = all.filter(p => isFinite(p.ratingNum));
    if (filtered.length === 0) {
      // 允许无评分：用名称去重后返回若干个代表性点
      all = dedupeByNameAndLoc(all);
      const fallback = all.slice(0, 5).map(x => ({
        name: x.name,
        rating: x.ratingNum,  // 可能为 NaN
        location: x.location,
        address: x.address
      }));
      return res.json(ok({
        mode: "scenic",
        from: fromText,
        to: toText,
        totalDistanceKm: totalDistKm.toFixed(2),
        waypoints: [...fallback, { name: toText, location: toRich.location }],
        summary: `共飞行约 ${totalDistKm.toFixed(2)} 公里，评分缺失，返回 ${fallback.length} 个候选景点（无评分）。`
      }));
    }

    // 有评分：降序取 Top5
    filtered.sort((a, b) => b.ratingNum - a.ratingNum);
    filtered = filtered.slice(0, 5);

    const waypoints = [
      ...filtered.map(p => ({ name: p.name, rating: p.ratingNum, location: p.location, address: p.address })),
      { name: toText, location: toRich.location }
    ];

    return res.json(ok({
      mode: "scenic",
      from: fromText,
      to: toText,
      totalDistanceKm: totalDistKm.toFixed(2),
      waypoints,
      summary: `共飞行约 ${totalDistKm.toFixed(2)} 公里，筛选出 ${filtered.length} 个高评分景点。`
    }));
  } catch (e) {
    res.status(500).json(fail(e.message));
  }
});

export default router;

/* ================= 工具函数 ================= */

async function geocodeRich(text, cityLimit) {
  const base = `https://restapi.amap.com/v3/geocode/geo?key=${CONFIG.AMAP_KEY}`;
  const url = cityLimit
    ? `${base}&address=${encodeURIComponent(text)}&city=${encodeURIComponent(cityLimit)}`
    : `${base}&address=${encodeURIComponent(text)}`;
  const { data } = await http.get(url);
  if (data.status !== "1" || !data.geocodes?.length) return null;
  const g = data.geocodes[0];
  return {
    location: g.location,                      // "lon,lat"
    formatted_address: g.formatted_address,
    city: g.city || g.province || "",
    adcode: g.adcode || ""
  };
}

async function fetchPOIsAroundV3(lon, lat, radius) {
  // 使用 v3 接口 + extensions=all 以获取 biz_ext.rating
  // 放宽 types：风景名胜|公园|自然风光|休闲娱乐（中文类目在 v3 可用）
  const types = encodeURIComponent("风景名胜|公园|自然风光|休闲娱乐");
  const base = `https://restapi.amap.com/v3/place/around?key=${CONFIG.AMAP_KEY}&location=${lon},${lat}&radius=${radius}&extensions=all&types=${types}&offset=25&sortrule=distance`;
  const results = [];

  for (let page = 1; page <= 3; page++) {
    const url = `${base}&page=${page}`;
    const { data } = await http.get(url);
    if (data.status !== "1" || !Array.isArray(data.pois) || data.pois.length === 0) break;
    for (const p of data.pois) {
      results.push({
        id: p.id,
        name: p.name,
        location: p.location,              // "lon,lat"
        address: p.address,
        rating: p.biz_ext?.rating ?? "",
        ratingNum: parseFloat(p.biz_ext?.rating ?? "NaN")
      });
    }
    if (data.pois.length < 25) break; // 已到末页
  }

  return results;
}

function toLonLat(locStr) {
  const [lon, lat] = locStr.split(",").map(Number);
  return [lon, lat];
}

function greatCircleDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = d => (d * Math.PI) / 180;
  const φ1 = toRad(lat1), φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1), Δλ = toRad(lon2 - lon1);
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function sampleAlongLine(a, b, n) {
  const arr = [];
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1);
    arr.push({ lat: a.lat + (b.lat - a.lat) * t, lon: a.lon + (b.lon - a.lon) * t });
  }
  return arr;
}

function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

function dedupeByNameAndLoc(items) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    const key = `${it.name}|${it.location}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(it);
    }
  }
  return out;
}
