import express from "express";
import { http, ok, fail } from "../utils/http.js";
import { CONFIG } from "../utils/config.js";

const router = express.Router();

/**
 * 支持：
 * 1️⃣ GET  /api/flight-plan?fromText=武汉大学&toText=黄鹤楼
 * 2️⃣ POST /api/flight-plan  { "current_location": "上海浦东", "destination": "陆家嘴" }
 */
router.all("/", async (req, res) => {
  try {
    // ==== 动态参数 ====
    const fromText =
      req.body?.current_location || req.query.fromText || "武汉大学";
    const toText =
      req.body?.destination || req.query.toText || "黄鹤楼";
    const MAX_RANGE_M = 30000; // 半径 30km 限制

    if (!CONFIG.AMAP_KEY)
      return res.status(400).json(fail("未设置 AMAP_KEY", 400));

    // ==== 起点终点地理编码 ====
    const fromRich = await geocodeRich(fromText);
    const toRich = await geocodeRich(toText);
    if (!fromRich?.location || !toRich?.location)
      return res.status(400).json(fail("地理编码失败", 400));

    const [fromLon, fromLat] = strToLonLat(fromRich.location);
    const [toLon, toLat] = strToLonLat(toRich.location);

    // ==== 半径限制 ====
    const dist = greatCircleDistance(fromLat, fromLon, toLat, toLon);
    if (dist > MAX_RANGE_M)
      return res
        .status(400)
        .json(
          fail(
            `目的地超出起点30公里限制（当前约 ${(dist / 1000).toFixed(
              2
            )} km）`,
            400
          )
        );

    const mainBearing = calculateBearing(fromLat, fromLon, toLat, toLon);
    const directDist = dist;
    const city = fromRich.city || fromRich.province || "本地";

    // ==== 模式 A：direct ====
    const directKm = directDist / 1000;
    const planDirect = {
      mode: "direct",
      total_km: Number(directKm.toFixed(2)),
      points: [
        { name: fromText, lng: fromLon, lat: fromLat },
        { name: toText, lng: toLon, lat: toLat },
      ],
      segments: [
        {
          from: fromText,
          to: toText,
          dist_km: Number(directKm.toFixed(2)),
          bearing_deg: Number(mainBearing.toFixed(1)),
        },
      ],
      summary: `模式：direct；全程约 ${directKm.toFixed(
        2
      )} 公里，共 1 段航程（限定30公里范围内）。`,
    };

    // ==== 模式 B：balanced ====
    const allPOIs = await findPOIsInCity(city, CONFIG.AMAP_KEY);
    const enrichedPOIs = allPOIs
      .map((p) => {
        const [plon, plat] = strToLonLat(p.location);
        const bearing = calculateBearing(fromLat, fromLon, plat, plon);
        const dist = greatCircleDistance(fromLat, fromLon, plat, plon);
        const diff = angleDiff(mainBearing, bearing);
        const proj = dist * Math.cos((diff * Math.PI) / 180);
        return { ...p, bearing, dist, diff, proj, lon: plon, lat: plat };
      })
      .filter(
        (p) => p.dist <= MAX_RANGE_M && p.proj >= 0 && p.proj <= directDist
      )
      .sort((a, b) => a.proj - b.proj);

    const balancedCandidates = enrichedPOIs.filter((p) => p.diff <= 25);
    const balancedPOIs = pickEvenlySpacedPOIs(balancedCandidates, 4);
    const planBalancedNodes = [
      { name: fromText, location: fromRich.location },
      ...balancedPOIs.map((p) => ({
        name: p.name,
        location: `${p.lon},${p.lat}`,
      })),
      { name: toText, location: toRich.location },
    ];
    const planBalanced = finalizePlan(
      "balanced",
      planBalancedNodes,
      MAX_RANGE_M,
      city
    );

    // ==== 模式 C：explore ====
    const exploreCandidates = enrichedPOIs.filter((p) => p.diff <= 40);
    const explorePOIs = greedilyFillPOIs(
      exploreCandidates,
      { lon: fromLon, lat: fromLat },
      MAX_RANGE_M * 0.9,
      10
    );
    const planExploreNodes = [
      { name: fromText, location: fromRich.location },
      ...explorePOIs.map((p) => ({
        name: p.name,
        location: `${p.lon},${p.lat}`,
      })),
      { name: toText, location: toRich.location },
    ];
    const planExplore = finalizePlan(
      "explore",
      planExploreNodes,
      MAX_RANGE_M,
      city
    );

    return res.json(ok({ city, plans: [planDirect, planBalanced, planExplore] }));
  } catch (err) {
    return res.status(500).json(fail(err.message));
  }
});

export default router;

/* ------------------ 工具函数 ------------------ */

// ✅ 生成完整规划信息
function finalizePlan(mode, rawNodes, maxRangeM, city) {
  const routeNodes = [rawNodes[0]];
  let totalDistM = 0;
  for (let i = 0; i < rawNodes.length - 1; i++) {
    const a = routeNodes[routeNodes.length - 1];
    const b = rawNodes[i + 1];
    const [alon, alat] = strToLonLat(a.location);
    const [blon, blat] = strToLonLat(b.location);
    const segDistM = greatCircleDistance(alat, alon, blat, blon);
    if (totalDistM + segDistM > maxRangeM) break;
    totalDistM += segDistM;
    routeNodes.push(b);
  }

  const segments = [];
  for (let i = 0; i < routeNodes.length - 1; i++) {
    const a = routeNodes[i];
    const b = routeNodes[i + 1];
    const [alon, alat] = strToLonLat(a.location);
    const [blon, blat] = strToLonLat(b.location);
    const distM = greatCircleDistance(alat, alon, blat, blon);
    const bearing = calculateBearing(alat, alon, blat, blon);
    segments.push({
      from: a.name,
      to: b.name,
      dist_km: Number((distM / 1000).toFixed(2)),
      bearing_deg: Number(bearing.toFixed(1)),
    });
  }

  const points = routeNodes.map((n) => {
    const [lon, lat] = strToLonLat(n.location);
    return { name: n.name, lng: lon, lat: lat };
  });

  const summary = `模式：${mode}；全程约 ${(totalDistM / 1000).toFixed(
    2
  )} 公里，共 ${segments.length} 段航程（限制：起点半径30公里范围）。`;

  return {
    mode,
    total_km: Number((totalDistM / 1000).toFixed(2)),
    points,
    segments,
    summary,
  };
}

// ✅ 均匀抽样 POI
function pickEvenlySpacedPOIs(candidates, maxCount) {
  if (!candidates.length) return [];
  if (candidates.length <= maxCount) return candidates;
  const step = Math.max(1, Math.floor(candidates.length / maxCount));
  const picked = [];
  for (let i = 0; i < candidates.length; i += step) {
    picked.push(candidates[i]);
    if (picked.length >= maxCount) break;
  }
  return picked;
}

// ✅ 贪心填充 POI
function greedilyFillPOIs(candidates, startCoord, budgetM, maxCount) {
  const used = new Set();
  const route = [];
  let curr = { ...startCoord };
  let usedDist = 0;

  for (let step = 0; step < maxCount; step++) {
    let best = null;
    let bestDist = Infinity;
    for (const p of candidates) {
      const key = `${p.name}|${p.lon},${p.lat}`;
      if (used.has(key)) continue;
      const distM = greatCircleDistance(curr.lat, curr.lon, p.lat, p.lon);
      if (distM < bestDist) {
        bestDist = distM;
        best = p;
      }
    }
    if (!best) break;
    if (usedDist + bestDist > budgetM) break;
    usedDist += bestDist;
    route.push(best);
    used.add(`${best.name}|${best.lon},${best.lat}`);
    curr = { lon: best.lon, lat: best.lat };
  }
  return route;
}

// ✅ 动态地级市地理编码
async function geocodeRich(text, cityHint = "") {
  const cityParam = cityHint ? `&city=${encodeURIComponent(cityHint)}` : "";
  const url = `https://restapi.amap.com/v3/geocode/geo?key=${CONFIG.AMAP_KEY}&address=${encodeURIComponent(
    text
  )}${cityParam}`;
  const { data } = await http.get(url);
  if (data.status !== "1" || !data.geocodes?.length) return null;
  const g = data.geocodes[0];
  return {
    location: g.location,
    city: g.city,
    province: g.province,
    district: g.district,
    formatted_address: g.formatted_address,
  };
}

// ✅ 根据地级市检索POI
async function findPOIsInCity(city, key) {
  const types = "风景名胜|公园|自然风光|休闲娱乐|旅游景点";
  const all = [];
  const cityQuery = city || "";

  for (let page = 1; page <= 5; page++) {
    const url = `https://restapi.amap.com/v3/place/text?key=${key}&keywords=${encodeURIComponent(
      cityQuery
    )}&types=${encodeURIComponent(types)}&page=${page}&offset=25`;
    const { data } = await http.get(url);
    if (data.status !== "1" || !data.pois?.length) break;
    for (const p of data.pois) {
      if (!p.location) continue;
      all.push({ name: p.name, location: p.location });
    }
    if (data.pois.length < 25) break;
  }
  return dedupeSequenceByNameAndLoc(all);
}

// ✅ 数学函数
function strToLonLat(loc) {
  return loc.split(",").map(Number);
}
function angleDiff(a, b) {
  let diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}
function greatCircleDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
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
  const toRad = (d) => (d * Math.PI) / 180,
    toDeg = (r) => (r * 180) / Math.PI;
  const φ1 = toRad(lat1),
    φ2 = toRad(lat2),
    λ1 = toRad(lon1),
    λ2 = toRad(lon2);
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}
function dedupeSequenceByNameAndLoc(list) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const key = `${item.name}|${item.location}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}
