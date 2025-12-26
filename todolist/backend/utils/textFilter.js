/**
 * 不过滤任何内容，直接返回原始文本
 * @param {string} text - 原始文本
 * @returns {string} - 原始文本
 */
function filterCodeBlocks(text) {
  // 直接返回原始文本，不做任何过滤
  return text;
}

module.exports = {
  filterCodeBlocks
};