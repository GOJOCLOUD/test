import express from "express";
import fs from "fs";
import path from "path";
import { generatePowerShell } from "./generator.js";

const app = express();
const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "1mb" }));

// 接收前端 POST 的结构文本
app.post("/generate", (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: "内容为空" });
  }

  const ps1 = generatePowerShell(text);
  const outputDir = path.join(__dirname, "output");
  const outputPath = path.join(outputDir, "generated.ps1");

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, ps1, "utf8");

  res.json({
    success: true,
    message: "PowerShell 脚本已生成",
    path: "output/generated.ps1"
  });
});

app.listen(3000, () => {
  console.log("🚀 界面已启动：http://localhost:3000");
});
