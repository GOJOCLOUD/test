// 文档结构分析服务
// 用于从文档内容中提取标题、副标题、小标题和内容结构

/**
 * 分析文档结构，提取标题、副标题、小标题和内容
 * @param {string} content - 文档内容
 * @returns {Object} 文档结构对象
 */
export const analyzeDocumentStructure = (content) => {
  if (!content || typeof content !== 'string') {
    return {
      titles: [],
      subtitles: [],
      headings: [],
      content: content || '',
      structure: []
    };
  }

  // 按行分割内容
  const lines = content.split('\n').filter(line => line.trim() !== '');
  
  // 初始化结构数组
  const structure = [];
  const titles = [];
  const subtitles = [];
  const headings = [];
  
  // 遍历每一行，分析其结构
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // 跳过空行
    if (!trimmedLine) return;
    
    // 分析行类型
    const lineType = analyzeLineType(trimmedLine, index, lines);
    
    // 根据类型添加到相应的数组
    if (lineType.type === 'title') {
      titles.push(trimmedLine);
      structure.push({
        type: 'title',
        content: trimmedLine,
        level: 1,
        index: index
      });
    } else if (lineType.type === 'subtitle') {
      subtitles.push(trimmedLine);
      structure.push({
        type: 'subtitle',
        content: trimmedLine,
        level: 2,
        index: index
      });
    } else if (lineType.type === 'heading') {
      headings.push(trimmedLine);
      structure.push({
        type: 'heading',
        content: trimmedLine,
        level: 3,
        index: index
      });
    } else {
      structure.push({
        type: 'content',
        content: trimmedLine,
        level: 4,
        index: index
      });
    }
  });
  
  // 返回分析结果
  return {
    titles,
    subtitles,
    headings,
    content,
    structure
  };
};

/**
 * 分析单行文本的类型
 * @param {string} line - 文本行
 * @param {number} index - 行索引
 * @param {Array} allLines - 所有行
 * @returns {Object} 行类型对象
 */
const analyzeLineType = (line, index, allLines) => {
  // 规则1: 如果是第一行且长度适中，可能是标题
  if (index === 0 && line.length > 5 && line.length < 100) {
    return { type: 'title', confidence: 0.8 };
  }
  
  // 规则2: 如果行以数字开头（如"1. "、"一、"等），可能是标题
  if (/^(\d+\.|[\u4e00-\u9fa5]+[、，]|[一二三四五六七八九十]+[、，])/.test(line)) {
    // 根据位置判断是副标题还是小标题
    if (index < allLines.length * 0.3) {
      return { type: 'subtitle', confidence: 0.7 };
    } else {
      return { type: 'heading', confidence: 0.6 };
    }
  }
  
  // 规则3: 如果行较短且前后有空行，可能是标题
  const prevLine = index > 0 ? allLines[index - 1].trim() : '';
  const nextLine = index < allLines.length - 1 ? allLines[index + 1].trim() : '';
  
  if (
    line.length < 50 && 
    line.length > 5 &&
    (!prevLine || !nextLine) &&
    !line.endsWith('。') && 
    !line.endsWith('！') && 
    !line.endsWith('？')
  ) {
    // 根据位置判断是副标题还是小标题
    if (index < allLines.length * 0.3) {
      return { type: 'subtitle', confidence: 0.6 };
    } else {
      return { type: 'heading', confidence: 0.5 };
    }
  }
  
  // 规则4: 如果行全大写或包含关键词，可能是标题
  const titleKeywords = ['引言', '摘要', '绪论', '背景', '目的', '方法', '结果', '讨论', '结论', '参考文献', '附录'];
  const hasKeyword = titleKeywords.some(keyword => line.includes(keyword));
  
  if (line === line.toUpperCase() || hasKeyword) {
    // 根据位置判断是副标题还是小标题
    if (index < allLines.length * 0.3) {
      return { type: 'subtitle', confidence: 0.7 };
    } else {
      return { type: 'heading', confidence: 0.6 };
    }
  }
  
  // 默认为内容
  return { type: 'content', confidence: 0.8 };
};

/**
 * 生成文档结构预览HTML
 * @param {Object} structure - 文档结构对象
 * @returns {string} HTML字符串
 */
export const generateStructurePreview = (structure) => {
  if (!structure || !structure.structure || structure.structure.length === 0) {
    return '<p>文档内容为空</p>';
  }
  
  let html = '<div class="document-preview">';
  
  structure.structure.forEach(item => {
    switch (item.type) {
      case 'title':
        html += `<h1 class="preview-title">${escapeHtml(item.content)}</h1>`;
        break;
      case 'subtitle':
        html += `<h2 class="preview-subtitle">${escapeHtml(item.content)}</h2>`;
        break;
      case 'heading':
        html += `<h3 class="preview-heading">${escapeHtml(item.content)}</h3>`;
        break;
      case 'content':
        html += `<p class="preview-content">${escapeHtml(item.content)}</p>`;
        break;
    }
  });
  
  html += '</div>';
  
  return html;
};

/**
 * HTML转义函数
 * @param {string} text - 需要转义的文本
 * @returns {string} 转义后的文本
 */
const escapeHtml = (text) => {
  if (!text) return '';
  
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  
  return text.replace(/[&<>"']/g, (match) => htmlEscapes[match]);
};

/**
 * 应用样式到预览HTML
 * @param {string} html - HTML字符串
 * @param {Object} styles - 样式对象
 * @returns {string} 应用样式后的HTML
 */
export const applyStylesToPreview = (html, styles) => {
  if (!html || !styles) return html;
  
  let styledHtml = html;
  
  // 应用标题样式
  if (styles.title) {
    const titleStyle = generateStyleString(styles.title);
    styledHtml = styledHtml.replace(
      /<h1 class="preview-title">/g,
      `<h1 class="preview-title" style="${titleStyle}">`
    );
  }
  
  // 应用副标题样式
  if (styles.subtitle) {
    const subtitleStyle = generateStyleString(styles.subtitle);
    styledHtml = styledHtml.replace(
      /<h2 class="preview-subtitle">/g,
      `<h2 class="preview-subtitle" style="${subtitleStyle}">`
    );
  }
  
  // 应用小标题样式
  if (styles.heading) {
    const headingStyle = generateStyleString(styles.heading);
    styledHtml = styledHtml.replace(
      /<h3 class="preview-heading">/g,
      `<h3 class="preview-heading" style="${headingStyle}">`
    );
  }
  
  // 应用内容样式
  if (styles.content) {
    const contentStyle = generateStyleString(styles.content);
    styledHtml = styledHtml.replace(
      /<p class="preview-content">/g,
      `<p class="preview-content" style="${contentStyle}">`
    );
  }
  
  return styledHtml;
};

/**
 * 生成样式字符串
 * @param {Object} style - 样式对象
 * @returns {string} 样式字符串
 */
const generateStyleString = (style) => {
  let styleStr = '';
  
  if (style.font) {
    styleStr += `font-family: ${style.font};`;
  }
  
  if (style.size) {
    styleStr += `font-size: ${style.size}px;`;
  }
  
  if (style.bold) {
    styleStr += 'font-weight: bold;';
  }
  
  if (style.italic) {
    styleStr += 'font-style: italic;';
  }
  
  if (style.underline) {
    styleStr += 'text-decoration: underline;';
  }
  
  if (style.color) {
    styleStr += `color: ${style.color};`;
  }
  
  return styleStr;
};