<template>
  <div class="home">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="hero-title-main">智能工具箱</span>
          <span class="hero-title-sub">让学习和工作更高效</span>
        </h1>
        <p class="hero-description">
          探索我们精心设计的工具集合，涵盖学习、办公、创意等多个领域
        </p>
        <div class="hero-actions">
          <router-link to="/tools/internal" class="btn btn-primary">
            <i class="fas fa-rocket"></i>
            探索工具
          </router-link>
          <router-link to="/search" class="btn btn-secondary">
            <i class="fas fa-search"></i>
            搜索功能
          </router-link>
        </div>
      </div>
      <div class="hero-visual">
        <div class="floating-card card-1">
          <i class="fas fa-graduation-cap"></i>
        </div>
        <div class="floating-card card-2">
          <i class="fas fa-file-alt"></i>
        </div>
        <div class="floating-card card-3">
          <i class="fas fa-chart-line"></i>
        </div>
      </div>
    </div>

    <div class="features-section">
      <h2 class="section-title">核心功能</h2>
      <div class="features-grid">
        <router-link to="/tools/internal" class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-tools"></i>
          </div>
          <h3 class="feature-title">内嵌工具</h3>
          <p class="feature-description">Base64、JSON格式化、时间戳转换等常用工具</p>
        </router-link>
        <router-link to="/tools/external" class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-link"></i>
          </div>
          <h3 class="feature-title">外部工具</h3>
          <p class="feature-description">集成多种在线服务和第三方工具</p>
        </router-link>
        <router-link to="/search" class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-robot"></i>
          </div>
          <h3 class="feature-title">AI搜索</h3>
          <p class="feature-description">智能搜索你需要的工具</p>
        </router-link>
      </div>
    </div>

    <div class="student-section">
      <h2 class="section-title">学生专区</h2>
      <div class="student-card">
        <router-link to="/student" class="student-link">
          <div class="student-icon">
            <i class="fas fa-graduation-cap"></i>
          </div>
          <div class="student-content">
            <h3>我是大学生</h3>
            <p>专为大学生设计的工具集合，助力学习生活</p>
          </div>
          <div class="student-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      features: [
        {
          id: 1,
          icon: 'fas fa-tools',
          title: '内嵌工具',
          description: 'Base64、JSON格式化、时间戳转换等常用工具'
        },
        {
          id: 2,
          icon: 'fas fa-link',
          title: '外部工具',
          description: '集成多种在线服务和第三方工具'
        },
        {
          id: 3,
          icon: 'fas fa-robot',
          title: 'AI搜索',
          description: '智能搜索你需要的工具'
        }
      ],
      popularTools: [
        {
          id: 1,
          title: '论文排版',
          description: '一键格式化学术论文，符合各种期刊要求',
          icon: 'fas fa-file-alt',
          path: '/paper-format',
          users: '1.2k',
          rating: '4.8'
        },
        {
          id: 2,
          title: '文档翻译',
          description: '支持多语言文档翻译，保留原始格式',
          icon: 'fas fa-language',
          path: '/document-translation',
          users: '980',
          rating: '4.6'
        },
        {
          id: 3,
          title: 'PPT生成',
          description: '根据内容自动生成专业演示文稿',
          icon: 'fas fa-presentation',
          path: '/ppt-generation',
          users: '756',
          rating: '4.7'
        },
        {
          id: 4,
          title: '数据分析',
          description: '可视化数据分析，生成专业图表',
          icon: 'fas fa-chart-bar',
          path: '/data-analysis',
          users: '623',
          rating: '4.5'
        }
      ]
    }
  },
  methods: {
    navigateToTool(path) {
      this.$router.push(path);
    }
  },
  mounted() {
    // 添加滚动动画
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
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
      const elements = document.querySelectorAll('.feature-card, .tool-card, .section-title');
      elements.forEach(el => observer.observe(el));
    }, 100);
  }
}
</script>

<style scoped> 
.home {
  overflow-x: hidden;
}

/* 英雄区域 */
.hero-section {
  display: flex;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
  gap: 3rem;
  position: relative;
}

.hero-content {
  flex: 1;
  max-width: 600px;
}

.hero-title {
  margin-bottom: 1.5rem;
}

.hero-title-main {
  display: block;
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  animation: fadeInUp 0.8s ease-out;
}

.hero-title-sub {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-secondary);
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.hero-description {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

.hero-visual {
  flex: 1;
  position: relative;
  height: 400px;
}

.floating-card {
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: var(--radius-lg);
  background: white;
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: var(--primary-color);
  animation: float 4s ease-in-out infinite;
}

.floating-card.card-1 {
  top: 20px;
  left: 50px;
  animation-delay: 0s;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.floating-card.card-2 {
  top: 150px;
  right: 80px;
  animation-delay: 1s;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.floating-card.card-3 {
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

/* 功能区域 */
.features-section, .tools-section, .student-section {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  color: var(--text-primary);
  position: relative;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease-out;
}

.section-title.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: 2px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.feature-card {
  background: var(--surface-secondary);
  border-radius: var(--radius-lg);
  padding: 2rem;
  text-align: center;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  opacity: 0;
  transform: translateY(30px);
  position: relative;
  overflow: hidden;
}

.feature-card.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-normal);
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: var(--shadow-lg);
}

.feature-card:hover::before {
  transform: scaleX(1);
}

.feature-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.1), rgba(88, 86, 214, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 1.8rem;
  color: var(--primary-color);
  transition: all var(--transition-normal);
}

.feature-card:hover .feature-icon {
  transform: scale(1.1);
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
}

.feature-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.feature-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 工具区域 */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.tool-card {
  background: var(--surface-secondary);
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(30px);
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
}

.tool-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}

.tool-card:hover::after {
  opacity: 1;
}

.tool-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: white;
  transition: all var(--transition-normal);
}

.tool-card:hover .tool-icon {
  transform: rotate(10deg) scale(1.05);
}

.tool-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
  color: var(--text-primary);
}

.tool-description {
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.tool-stats {
  display: flex;
  gap: 1rem;
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

/* 学生专区 */
.student-card {
  max-width: 800px;
  margin: 0 auto;
}

.student-link {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.05), rgba(88, 86, 214, 0.05));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.student-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s;
}

.student-link:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.student-link:hover::before {
  left: 100%;
}

.student-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  flex-shrink: 0;
}

.student-content {
  flex: 1;
}

.student-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.student-content p {
  color: var(--text-secondary);
  line-height: 1.5;
}

.student-arrow {
  font-size: 1.2rem;
  color: var(--primary-color);
  transition: transform var(--transition-normal);
}

.student-link:hover .student-arrow {
  transform: translateX(5px);
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: none;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  box-shadow: 0 4px 15px rgba(0, 122, 255, 0.3);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.4);
}

.btn-secondary {
  background: transparent;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
}

.btn-secondary:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-3px);
}

.btn-outline {
  background: transparent;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  margin: 0 auto;
  display: inline-flex;
}

.btn-outline:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-3px);
}

.section-actions {
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    min-height: auto;
    padding: 2rem 1rem;
    gap: 2rem;
  }
  
  .hero-content {
    max-width: 100%;
    text-align: center;
  }
  
  .hero-title-main {
    font-size: 2.5rem;
  }
  
  .hero-title-sub {
    font-size: 1.2rem;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .hero-visual {
    height: 250px;
    width: 100%;
  }
  
  .floating-card {
    width: 80px;
    height: 80px;
    font-size: 1.8rem;
  }
  
  .floating-card.card-1 {
    top: 10px;
    left: 20px;
  }
  
  .floating-card.card-2 {
    top: 100px;
    right: 30px;
  }
  
  .floating-card.card-3 {
    bottom: 30px;
    left: 70px;
  }
  
  .features-section, .tools-section, .student-section {
    padding: 3rem 1rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .features-grid, .tools-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .student-link {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .student-arrow {
    transform: rotate(90deg);
  }
  
  .student-link:hover .student-arrow {
    transform: rotate(90deg) translateX(5px);
  }
}
</style>