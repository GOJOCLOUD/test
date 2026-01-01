<template> 
  <div class="tools-page">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">工具集合</h1>
        <p class="page-description">探索我们精心设计的工具集合，涵盖学习、办公、创意等多个领域</p>
      </div>
      <div class="header-visual">
        <div class="floating-icon icon-1">
          <i class="fas fa-tools"></i>
        </div>
        <div class="floating-icon icon-2">
          <i class="fas fa-magic"></i>
        </div>
        <div class="floating-icon icon-3">
          <i class="fas fa-rocket"></i>
        </div>
      </div>
    </div>

    <div class="tools-container">
      <div class="tools-nav">
        <button 
          v-for="category in categories" 
          :key="category.id"
          :class="['category-btn', { active: activeCategory === category.id }]"
          @click="setActiveCategory(category.id)"
        >
          <i :class="category.icon"></i>
          {{ category.name }}
        </button>
      </div>

      <div class="tools-grid">
        <div 
          v-for="tool in filteredTools" 
          :key="tool.id" 
          class="tool-card"
          @click="navigateToTool(tool)"
        >
          <div class="tool-header">
            <div class="tool-icon">
              <i :class="tool.icon"></i>
            </div>
            <div class="tool-badge" v-if="tool.isNew">
              <span>新</span>
            </div>
            <div class="tool-badge popular" v-if="tool.isPopular">
              <span>热门</span>
            </div>
          </div>
          <div class="tool-content">
            <h3 class="tool-title">{{ tool.title }}</h3>
            <p class="tool-description">{{ tool.description }}</p>
            <div class="tool-tags">
              <span 
                v-for="tag in tool.tags" 
                :key="tag" 
                class="tool-tag"
              >
                {{ tag }}
              </span>
            </div>
            <div class="tool-stats">
              <span class="tool-stat">
                <i class="fas fa-users"></i>
                {{ tool.users }}
              </span>
              <span class="tool-stat">
                <i class="fas fa-star"></i>
                {{ tool.rating }}
              </span>
            </div>
          </div>
          <div class="tool-action">
            <span class="action-text">{{ tool.type === 'internal' ? '使用工具' : '访问工具' }}</span>
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>
      </div>

      <div class="tools-empty" v-if="filteredTools.length === 0">
        <div class="empty-icon">
          <i class="fas fa-search"></i>
        </div>
        <h3>暂无相关工具</h3>
        <p>请尝试选择其他分类或稍后再试</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Tools',
  data() {
    return {
      loading: true,
      internalTools: [],
      externalTools: [],
      activeCategory: 'all',
      categories: [
        { id: 'all', name: '全部', icon: 'fas fa-th' },
        { id: 'productivity', name: '效率工具', icon: 'fas fa-rocket' },
        { id: 'academic', name: '学术研究', icon: 'fas fa-graduation-cap' },
        { id: 'development', name: '开发工具', icon: 'fas fa-code' },
        { id: 'design', name: '设计创意', icon: 'fas fa-palette' },
        { id: 'utility', name: '实用工具', icon: 'fas fa-wrench' }
      ],
      allTools: [] // 存储所有工具的合并列表
    }
  },
  computed: {
    filteredTools() {
      if (this.activeCategory === 'all') {
        return this.allTools;
      }
      return this.allTools.filter(tool => tool.category === this.activeCategory);
    }
  },
  methods: {
    async fetchTools() {
      try {
        const response = await axios.get('/api/tools');
        this.internalTools = response.data.internal;
        this.externalTools = response.data.external;
        
        // 合并并处理工具数据
        this.allTools = [
          ...this.internalTools.map(tool => ({
            ...tool,
            title: tool.name,
            type: 'internal',
            isNew: Math.random() > 0.7, // 随机标记为新工具
            isPopular: Math.random() > 0.8, // 随机标记为热门
            users: this.generateRandomUsers(),
            rating: this.generateRandomRating(),
            tags: this.generateRandomTags(tool.category)
          })),
          ...this.externalTools.map(tool => ({
            ...tool,
            title: tool.name,
            type: 'external',
            isNew: Math.random() > 0.7,
            isPopular: Math.random() > 0.8,
            users: this.generateRandomUsers(),
            rating: this.generateRandomRating(),
            tags: this.generateRandomTags(tool.category)
          }))
        ];
        
        this.loading = false;
      } catch (error) {
        console.error('获取工具列表失败:', error);
        this.loading = false;
        
        // 如果API失败，使用模拟数据
        this.loadMockData();
      }
    },
    loadMockData() {
      // 模拟工具数据
      this.allTools = [
        {
          id: 'paper-format',
          title: '论文排版',
          description: '一键格式化学术论文，符合各种期刊要求',
          icon: 'fas fa-file-alt',
          type: 'internal',
          category: 'academic',
          isNew: true,
          isPopular: true,
          users: '1.2k',
          rating: '4.8',
          tags: ['学术', '论文', '格式化']
        },
        {
          id: 'document-translation',
          title: '文档翻译',
          description: '支持多语言文档翻译，保留原始格式',
          icon: 'fas fa-language',
          type: 'internal',
          category: 'academic',
          isNew: false,
          isPopular: true,
          users: '980',
          rating: '4.6',
          tags: ['翻译', '多语言', '文档']
        },
        {
          id: 'ppt-generation',
          title: 'PPT生成',
          description: '根据内容自动生成专业演示文稿',
          icon: 'fas fa-presentation',
          type: 'internal',
          category: 'productivity',
          isNew: true,
          isPopular: false,
          users: '756',
          rating: '4.7',
          tags: ['演示', 'PPT', '自动生成']
        },
        {
          id: 'data-analysis',
          title: '数据分析',
          description: '可视化数据分析，生成专业图表',
          icon: 'fas fa-chart-bar',
          type: 'internal',
          category: 'development',
          isNew: false,
          isPopular: true,
          users: '623',
          rating: '4.5',
          tags: ['数据', '分析', '图表']
        },
        {
          id: 'code-formatter',
          title: '代码格式化',
          description: '多种编程语言的代码格式化和美化',
          icon: 'fas fa-code',
          type: 'internal',
          category: 'development',
          isNew: false,
          isPopular: false,
          users: '542',
          rating: '4.4',
          tags: ['代码', '格式化', '编程']
        },
        {
          id: 'image-compressor',
          title: '图片压缩',
          description: '无损或有损压缩图片，减小文件大小',
          icon: 'fas fa-image',
          type: 'internal',
          category: 'utility',
          isNew: true,
          isPopular: false,
          users: '489',
          rating: '4.6',
          tags: ['图片', '压缩', '优化']
        },
        {
          id: 'color-picker',
          title: '颜色选择器',
          description: '专业颜色选择和调色板生成工具',
          icon: 'fas fa-palette',
          type: 'internal',
          category: 'design',
          isNew: false,
          isPopular: false,
          users: '421',
          rating: '4.7',
          tags: ['颜色', '设计', '调色板']
        },
        {
          id: 'password-generator',
          title: '密码生成器',
          description: '生成安全可靠的随机密码',
          icon: 'fas fa-key',
          type: 'internal',
          category: 'utility',
          isNew: false,
          isPopular: true,
          users: '387',
          rating: '4.5',
          tags: ['密码', '安全', '随机']
        }
      ];
    },
    generateRandomUsers() {
      const values = ['300+', '500+', '800+', '1k+', '1.5k+', '2k+'];
      return values[Math.floor(Math.random() * values.length)];
    },
    generateRandomRating() {
      return (Math.random() * 1.5 + 3.5).toFixed(1);
    },
    generateRandomTags(category) {
      const tagMap = {
        'academic': ['学术', '研究', '论文', '教育'],
        'productivity': ['效率', '办公', '自动化', '生产力'],
        'development': ['开发', '编程', '代码', '技术'],
        'design': ['设计', '创意', '视觉', '艺术'],
        'utility': ['实用', '工具', '日常', '便利']
      };
      
      const categoryTags = tagMap[category] || ['工具'];
      const count = Math.floor(Math.random() * 2) + 2; // 2-3个标签
      const shuffled = [...categoryTags].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    },
    setActiveCategory(categoryId) {
      this.activeCategory = categoryId;
    },
    navigateToTool(tool) {
      if (tool.type === 'internal') {
        // 特殊处理论文排版工具
        if (tool.id === 'paper-format') {
          this.$router.push('/paper-format');
        } else {
          this.$router.push(`/tools/${tool.category}/${tool.id}`);
        }
      } else {
        // 外部工具在新窗口打开
        window.open(tool.url, '_blank');
      }
    }
  },
  mounted() {
    this.fetchTools();
    
    // 添加滚动动画
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);
    
    // 延迟观察以确保DOM已完全渲染
    setTimeout(() => {
      const elements = document.querySelectorAll('.tool-card');
      elements.forEach(el => observer.observe(el));
    }, 100);
  }
}
</script>

<style scoped>
.tools-page {
  padding: 0;
  overflow-x: hidden;
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  min-height: 50vh;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.05), rgba(88, 86, 214, 0.05));
  position: relative;
  overflow: hidden;
}

.header-content {
  flex: 1;
  max-width: 600px;
  z-index: 2;
}

.page-title {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.1;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  animation: fadeInUp 0.8s ease-out;
}

.page-description {
  font-size: 1.2rem;
  color: var(--text-secondary);
  max-width: 500px;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.header-visual {
  flex: 1;
  position: relative;
  height: 300px;
  z-index: 1;
}

.floating-icon {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-lg);
  background: white;
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: var(--primary-color);
  animation: float 4s ease-in-out infinite;
}

.floating-icon.icon-1 {
  top: 20px;
  left: 50px;
  animation-delay: 0s;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.floating-icon.icon-2 {
  top: 120px;
  right: 80px;
  animation-delay: 1s;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.floating-icon.icon-3 {
  bottom: 50px;
  left: 150px;
  animation-delay: 2s;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 工具容器 */
.tools-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* 工具导航 */
.tools-nav {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  border-radius: var(--radius-md);
  background: transparent;
  border: 2px solid var(--border-color);
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.category-btn i {
  font-size: 1rem;
}

.category-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-2px);
}

.category-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

/* 工具网格 */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.tool-card {
  background: var(--surface-secondary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(30px);
  display: flex;
  flex-direction: column;
}

.tool-card.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.tool-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.05), rgba(88, 86, 214, 0.05));
  opacity: 0;
  transition: opacity var(--transition-normal);
  z-index: 0;
}

.tool-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}

.tool-card:hover::after {
  opacity: 1;
}

.tool-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
}

.tool-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  transition: all var(--transition-normal);
}

.tool-card:hover .tool-icon {
  transform: rotate(10deg) scale(1.05);
}

.tool-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
}

.tool-badge span {
  color: white;
}

.tool-badge:not(.popular) {
  background: var(--success-color);
}

.tool-badge.popular {
  background: var(--accent-color);
}

.tool-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.tool-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
  color: var(--text-primary);
}

.tool-description {
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1rem;
  flex: 1;
}

.tool-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tool-tag {
  padding: 0.2rem 0.6rem;
  background: rgba(0, 122, 255, 0.1);
  color: var(--primary-color);
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 500;
}

.tool-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.tool-stat {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.tool-stat i {
  color: var(--primary-color);
}

.tool-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  position: relative;
  z-index: 1;
}

.action-text {
  font-weight: 600;
  color: var(--primary-color);
}

.tool-action i {
  color: var(--primary-color);
  transition: transform var(--transition-normal);
}

.tool-card:hover .tool-action i {
  transform: translateX(5px);
}

/* 空状态 */
.tools-empty {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(0, 122, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
  color: var(--primary-color);
}

.tools-empty h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.tools-empty p {
  color: var(--text-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    min-height: auto;
    padding: 2rem 1rem;
    gap: 2rem;
  }
  
  .header-content {
    max-width: 100%;
    text-align: center;
  }
  
  .page-title {
    font-size: 2.5rem;
  }
  
  .page-description {
    font-size: 1rem;
    max-width: 100%;
  }
  
  .header-visual {
    height: 200px;
    width: 100%;
  }
  
  .floating-icon {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
  
  .floating-icon.icon-1 {
    top: 10px;
    left: 20px;
  }
  
  .floating-icon.icon-2 {
    top: 80px;
    right: 30px;
  }
  
  .floating-icon.icon-3 {
    bottom: 30px;
    left: 70px;
  }
  
  .tools-container {
    padding: 1rem;
  }
  
  .tools-nav {
    gap: 0.5rem;
    margin-bottom: 2rem;
  }
  
  .category-btn {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>