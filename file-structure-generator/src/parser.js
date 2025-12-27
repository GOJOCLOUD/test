// parser.js
// 把缩进文本解析成结构数组
// 输入：多行字符串
// 输出：数组 [{ level, name, isDir }]

function parseStructure(text) {
  if (!text || typeof text !== "string") return [];

  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  const result = [];

  for (const raw of lines) {
    const leadingSpaces = raw.length - raw.trimStart().length;
    const level = Math.floor(leadingSpaces / 2);
    const clean = raw.replace(/[├─└│]+/g, "").trim();
    const isDir = clean.endsWith("/");
    const name = isDir ? clean.slice(0, -1) : clean;
    result.push({ level, name, isDir });
  }
  return result;
}

export { parseStructure };
