export function fixEncoding(str) {
  try {
    return Buffer.from(str, "binary").toString("utf8");
  } catch {
    return str;
  }
}