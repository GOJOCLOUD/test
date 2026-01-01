<template>
  <div class="student-page">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">大学生工具箱</h1>
        <p class="page-description">专为大学生设计的实用工具集合，助力学习与成长</p>
      </div>
      <div class="header-visual">
        <div class="floating-icon icon-1">
          <i class="fas fa-graduation-cap"></i>
        </div>
        <div class="floating-icon icon-2">
          <i class="fas fa-book"></i>
        </div>
        <div class="floating-icon icon-3">
          <i class="fas fa-lightbulb"></i>
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
          class="tool-card" 
          v-for="(tool, index) in filteredTools" 
          :key="tool.id"
          :style="{ animationDelay: `${index * 0.05}s` }"
          @click="navigateToTool(tool.id)"
        >
          <div class="tool-icon">
            <i :class="tool.iconClass"></i>
          </div>
          <div class="tool-content">
            <h3>{{ tool.name }}</h3>
            <p>{{ tool.description }}</p>
            <div class="tool-tags">
              <span v-for="tag in tool.tags" :key="tag" class="tool-tag">{{ tag }}</span>
            </div>
          </div>
          <div class="tool-action">
            <span class="action-text">开始使用</span>
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Student',
  setup() {
    const router = useRouter()
    const activeCategory = ref('all')
    
    const navigateToTool = (toolId) => {
      router.push(`/tool/${toolId}`)
    }
    
    const setActiveCategory = (categoryId) => {
      activeCategory.value = categoryId
    }
    
    const categories = [
      { id: 'all', name: '全部工具', icon: 'fas fa-th' },
      { id: 'study', name: '学习工具', icon: 'fas fa-book-open' },
      { id: 'productivity', name: '效率工具', icon: 'fas fa-rocket' },
      { id: 'career', name: '职业发展', icon: 'fas fa-briefcase' },
      { id: 'life', name: '生活助手', icon: 'fas fa-heart' }
    ]
    
    const studentTools = [
      {
        id: "ppt-tool",
        iconClass: "fas fa-chart-line",
        name: "PPT工具",
        description: "快速制作专业演示文稿，提供多种模板和设计元素",
        category: "study",
        tags: ["演示", "设计", "模板"],
        users: 1250,
        rating: 4.8
      },
      {          
        id: "paper-format",          
        iconClass: "fas fa-file-alt",
        name: "论文排版（Word）",          
        description: "自动格式化学术论文，符合期刊要求",
        category: "study",
        tags: ["论文", "排版", "学术"],
        users: 890,
        rating: 4.9
      },
      {
        id: "gpa-calculator",
        iconClass: "fas fa-calculator",
        name: "GPA计算器",
        description: "计算学期和总体GPA，支持多种评分标准",
        category: "study",
        tags: ["计算", "成绩", "GPA"],
        users: 2100,
        rating: 4.7
      },
      {
        id: "schedule-manager",
        iconClass: "fas fa-calendar-alt",
        name: "课程表管理",
        description: "管理课程时间表，设置提醒和作业截止日期",
        category: "productivity",
        tags: ["时间管理", "课程表", "提醒"],
        users: 1800,
        rating: 4.6
      },
      {
        id: "scientific-calculator",
        iconClass: "fas fa-square-root-alt",
        name: "科学计算器",
        description: "高级数学计算，支持函数绘图和统计分析",
        category: "study",
        tags: ["数学", "计算", "绘图"],
        users: 1500,
        rating: 4.8
      },
      {
        id: "academic-translation",
        iconClass: "fas fa-language",
        name: "学术翻译",
        description: "专业学术文献翻译，支持多语言互译",
        category: "study",
        tags: ["翻译", "学术", "多语言"],
        users: 950,
        rating: 4.5
      },
      {
        id: "data-analysis",
        iconClass: "fas fa-chart-bar",
        name: "数据分析",
        description: "实验数据处理和可视化，支持多种图表类型",
        category: "study",
        tags: ["数据", "分析", "可视化"],
        users: 1100,
        rating: 4.7
      },
      {
        id: "creative-thinking",
        iconClass: "fas fa-brain",
        name: "创意思维",
        description: "头脑风暴工具，帮助生成创新想法和解决方案",
        category: "productivity",
        tags: ["创意", "思维", "头脑风暴"],
        users: 760,
        rating: 4.4
      },
      {
        id: "note-organizer",
        iconClass: "fas fa-sticky-note",
        name: "笔记整理",
        description: "课堂笔记智能整理，支持关键词提取和总结",
        category: "productivity",
        tags: ["笔记", "整理", "总结"],
        users: 1900,
        rating: 4.6
      },
      {
        id: "goal-planner",
        iconClass: "fas fa-bullseye",
        name: "目标规划",
        description: "学期目标设定和进度跟踪，提高学习效率",
        category: "productivity",
        tags: ["目标", "规划", "效率"],
        users: 1200,
        rating: 4.5
      },
      {
        id: "academic-search",
        iconClass: "fas fa-search",
        name: "学术搜索",
        description: "学术论文和资源搜索，支持多个数据库",
        category: "study",
        tags: ["搜索", "学术", "资源"],
        users: 2300,
        rating: 4.8
      },
      {
        id: "team-collaboration",
        iconClass: "fas fa-users",
        name: "小组协作",
        description: "团队项目管理，分配任务和跟踪进度",
        category: "productivity",
        tags: ["协作", "团队", "项目管理"],
        users: 1400,
        rating: 4.6
      },
      {
        id: "competition-info",
        iconClass: "fas fa-trophy",
        name: "竞赛信息",
        description: "学科竞赛和活动信息，提供报名和准备指导",
        category: "career",
        tags: ["竞赛", "活动", "指导"],
        users: 850,
        rating: 4.5
      },
      {
        id: "internship-job",
        iconClass: "fas fa-briefcase",
        name: "实习求职",
        description: "实习和就业信息，简历优化和面试准备",
        category: "career",
        tags: ["实习", "求职", "简历"],
        users: 2100,
        rating: 4.7
      },
      {
        id: "graduate-exam",
        iconClass: "fas fa-user-graduate",
        name: "考研规划",
        description: "研究生考试准备，院校选择和专业规划",
        category: "career",
        tags: ["考研", "规划", "院校"],
        users: 1600,
        rating: 4.8
      }
    ]
    
    const filteredTools = computed(() => {
      if (activeCategory.value === 'all') {
        return studentTools
      }
      return studentTools.filter(tool => tool.category === activeCategory.value)
    })
    
    onMounted(() => {
      // 添加滚动动画
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      }, { threshold: 0.1 })
      
      setTimeout(() => {
        const cards = document.querySelectorAll('.tool-card')
        cards.forEach(card => observer.observe(card))
      }, 100)
    })
    
    return {
      activeCategory,
      categories,
      filteredTools,
      navigateToTool,
      setActiveCategory
    }
  }
}
</script>

<style scoped>
.student-page {
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
  animation: slideInUp 0.6s ease-out forwards;
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
  margin-bottom: 1rem;
}

.tool-card:hover .tool-icon {
  transform: rotate(10deg) scale(1.05);
}

.tool-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.tool-content h3 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
  color: var(--text-primary);
}

.tool-content p {
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

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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