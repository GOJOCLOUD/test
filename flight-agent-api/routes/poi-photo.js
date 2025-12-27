// routes/poi-photo.js
import express from "express";
import { http, ok, fail } from "../utils/http.js";
import { CONFIG } from "../utils/config.js";

const router = express.Router();

/**
 * ✅ 获取景点元数据（包括图片链接）
 * GET /api/poi/photo?name=黄鹤楼
 */
router.get("/photo", async (req, res) => {
  try {
    const name = req.query.name;
    if (!name) return res.status(400).json(fail("缺少 name 参数", 400));
    if (!CONFIG.AMAP_KEY) return res.status(400).json(fail("未设置 AMAP_KEY", 400));

    // ⚙️ 增加 types 限制，尽量返回真实景点图
    const url = `https://restapi.amap.com/v3/place/text?key=${CONFIG.AMAP_KEY}&keywords=${encodeURIComponent(
      name
    )}&types=${encodeURIComponent("风景名胜|公园|自然风光|旅游景点")}&offset=1&page=1&extensions=all`;

    const { data } = await http.get(url);
    if (data.status !== "1" || !data.pois?.length)
      return res.status(404).json(fail(`未找到景点：${name}`, 404));

    const poi = data.pois[0];
    const photos = poi.photos || [];
    const photoUrl =
      photos.length && photos[0].url
        ? photos[0].url
        : "/src/assets/poi/placeholder.jpg";

    return res.json(
      ok({
        poi: poi.name,
        photoUrl: `/api/poi/image?name=${encodeURIComponent(name)}`,
        address: poi.address || "",
        type: poi.type || "",
        cityname: poi.cityname || "",
      })
    );
  } catch (err) {
    console.error("❌ 获取图片失败：", err.message);
    return res.status(500).json(fail(err.message));
  }
});

/**
 * ✅ 图片代理接口（防跨域）
 * GET /api/poi/image?name=黄鹤楼
 */
router.get("/image", async (req, res) => {
  try {
    const name = req.query.name;
    if (!name) return res.status(400).send("缺少 name 参数");

    const searchUrl = `https://restapi.amap.com/v3/place/text?key=${CONFIG.AMAP_KEY}&keywords=${encodeURIComponent(
      name
    )}&types=${encodeURIComponent("风景名胜|公园|自然风光|旅游景点")}&offset=1&page=1&extensions=all`;

    const { data } = await http.get(searchUrl);
    if (data.status !== "1" || !data.pois?.length)
      return res.redirect("/src/assets/poi/placeholder.jpg");

    const poi = data.pois[0];
    const photos = poi.photos || [];
    const realUrl =
      photos.length && photos[0].url
        ? photos[0].url
        : "https://dummyimage.com/200x200/cccccc/ffffff.png&text=No+Image";

    const imgResp = await http.get(realUrl, { responseType: "arraybuffer" });
    res.set("Content-Type", "image/jpeg");
    res.send(imgResp.data);
  } catch (err) {
    console.error("❌ 代理图片失败：", err.message);
    res.redirect("/src/assets/poi/placeholder.jpg");
  }
});

export default router;
