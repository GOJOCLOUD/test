<template>
  <div class="tool-detail-container">
    <!-- 根据工具ID动态加载不同的组件 -->
    <component :is="currentToolComponent" v-if="currentToolComponent" />
    
    <!-- 通用工具占位符，当特定工具组件不存在时显示 -->
    <div v-else class="tool-placeholder">
      <div class="placeholder-content">
        <h2>{{ currentTool.name }}</h2>
        <p>此工具正在开发中，敬请期待！</p>
        <div class="placeholder-features">
          <h3>即将推出的功能：</h3>
          <ul>
            <li v-for="(feature, index) in currentTool.features" :key="index">
              {{ feature }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 导入已实现的工具组件
import PPTTool from '../components/tools/PPTTool.vue'
import GPACalculator from '../components/tools/GPACalculator.vue'

export default {
  name: 'ToolDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const toolId = ref(route.params.toolId)
    
    // 工具数据映射
    const toolsData = {
      'ppt-tool': {
        id: 'ppt-tool',
        name: 'PPT工具',
        description: '快速制作专业演示文稿，提供多种模板和设计元素',
        icon: '📊',
        features: [
          '多种专业模板选择',
          '智能布局建议',
          '图表和数据可视化',
          '动画效果库',
          '导出多种格式'
        ]
      },
      'gpa-calculator': {
        id: 'gpa-calculator',
        name: 'GPA计算器',
        description: '计算课程绩点和平均学分绩点，支持多种评分标准',
        icon: '🧮',
        features: [
          '多学期成绩管理',
          '不同评分标准支持',
          '成绩趋势分析',
          '目标GPA规划',
          '成绩导出功能'
        ]
      },
      'citation-manager': {
        id: 'citation-manager',
        name: '文献引用管理',
        description: '整理和引用学术文献，自动生成参考文献格式',
        icon: '📝',
        features: [
          '多种引用格式支持',
          '文献自动导入',
          '引用生成和导出',
          '文献分类管理',
          'DOI自动解析'
        ]
      }
      // 可以继续添加更多工具...
    }
    
    // 当前工具信息
    const currentTool = computed(() => {
      return toolsData[toolId.value] || {
        id: 'unknown',
        name: '未知工具',
        description: '工具信息未找到',
        icon: '🔧',
        features: ['功能开发中...']
      }
    })
    
    // 动态组件映射
    const componentMap = {
      'ppt-tool': PPTTool,
      'gpa-calculator': GPACalculator,
      // 可以继续添加更多组件映射...
    }
    
    // 当前工具组件
    const currentToolComponent = computed(() => {
      return componentMap[toolId.value] || null
    })
    
    return {
      currentTool,
      currentToolComponent
    }
  }
}
</script>

<style scoped>
.tool-detail-container {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
}

.tool-placeholder {
  padding: 40px;
  text-align: center;
}

.placeholder-content h2 {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 15px;
}

.placeholder-content > p {
  font-size: 16px;
  color: #5a6c7d;
  margin-bottom: 30px;
}

.placeholder-features {
  text-align: left;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

.placeholder-features h3 {
  font-size: 18px;
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 15px;
}

.placeholder-features ul {
  padding-left: 20px;
  margin: 0;
}

.placeholder-features li {
  margin-bottom: 8px;
  color: #5a6c7d;
}


</style>