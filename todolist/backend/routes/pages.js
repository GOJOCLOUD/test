const express = require('express');
const router = express.Router();

// 模拟页面数据存储
let pages = [
  {
    id: 'page-1',
    name: '首页',
    components: [],
    scale: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// 生成唯一ID
const generateId = () => `page-${Date.now()}`;

// 获取所有页面
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: pages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 获取单个页面
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const page = pages.find(p => p.id === id);
    
    if (!page) {
      return res.status(404).json({
        success: false,
        error: '页面未找到'
      });
    }
    
    res.json({
      success: true,
      data: page
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 创建新页面
router.post('/', (req, res) => {
  try {
    const { name, components = [] } = req.body;
    
    const newPage = {
      id: generateId(),
      name: name || `页面 ${pages.length + 1}`,
      components,
      scale: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    pages.push(newPage);
    
    res.status(201).json({
      success: true,
      data: newPage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 更新页面
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, components, scale } = req.body;
    
    const pageIndex = pages.findIndex(p => p.id === id);
    
    if (pageIndex === -1) {
      return res.status(404).json({
        success: false,
        error: '页面未找到'
      });
    }
    
    // 更新页面
    pages[pageIndex] = {
      ...pages[pageIndex],
      name: name || pages[pageIndex].name,
      components: components !== undefined ? components : pages[pageIndex].components,
      scale: scale !== undefined ? scale : pages[pageIndex].scale,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: pages[pageIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 删除页面
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // 确保至少保留一个页面
    if (pages.length <= 1) {
      return res.status(400).json({
        success: false,
        error: '至少需要保留一个页面'
      });
    }
    
    const pageIndex = pages.findIndex(p => p.id === id);
    
    if (pageIndex === -1) {
      return res.status(404).json({
        success: false,
        error: '页面未找到'
      });
    }
    
    // 删除页面
    const deletedPage = pages.splice(pageIndex, 1)[0];
    
    res.json({
      success: true,
      data: deletedPage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 更新页面缩放比例
router.put('/:id/scale', (req, res) => {
  try {
    const { id } = req.params;
    const { scale } = req.body;
    
    if (scale === undefined || scale < 0.1 || scale > 3) {
      return res.status(400).json({
        success: false,
        error: '缩放比例必须在 0.1 到 3 之间'
      });
    }
    
    const pageIndex = pages.findIndex(p => p.id === id);
    
    if (pageIndex === -1) {
      return res.status(404).json({
        success: false,
        error: '页面未找到'
      });
    }
    
    // 更新缩放比例
    pages[pageIndex] = {
      ...pages[pageIndex],
      scale,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: pages[pageIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;