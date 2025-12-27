const sanitize = require("sanitize-filename");

function safeFileName(name) {
  if (!name || typeof name !== "string") name = "output";

  return sanitize(
    name
      .normalize("NFC")
      .replace(/[\u200B-\u200F]/g, "")
      .replace(/\uFEFF/g, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

module.exports = {
  safeFileName
};