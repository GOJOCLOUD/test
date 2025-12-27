// cli.js
// 命令行入口：读取结构文本 → 生成 PowerShell 文件

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parseStructure } from "./parser.js";
import { generatePowerShell } from "./generator.js";

// 获取 __dirname 的 ES 模块等效方式
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 获取输入路径参数
const inputPath = process.argv[2];
if (!inputPath) {
  console.error("❌ 请提供输入文件路径，例如：node src/cli.js examples/react-app.txt");
  process.exit(1);
}

if (!fs.existsSync(inputPath)) {
  console.error("❌ 找不到输入文件：" + inputPath);
  process.exit(1);
}

// 读取内容
const text = fs.readFileSync(inputPath, "utf8");
const parsed = parseStructure(text);

// 生成 PowerShell 脚本
const script = generatePowerShell(text);

// 写入 output/generated.ps1
const outputDir = path.join(__dirname, "..", "output");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, "generated.ps1");
fs.writeFileSync(outputPath, script, "utf8");

console.log("✅ 已生成 PowerShell 脚本：", outputPath);
console.log("💡 执行示例：");
console.log(`powershell -ExecutionPolicy Bypass -File "${outputPath}"`);
