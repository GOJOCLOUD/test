<template>
  <div class="external-tools">
    <h2>外部工具</h2>
    <p>快速跳转到GitHub、Figma等常用网站</p>
    
    <div v-if="loading">加载中...</div>
    
    <div v-else>
      <div class="tool-grid">
        <div v-for="tool in externalTools" :key="tool.id" class="tool-card">
          <a :href="tool.url" target="_blank">
            <div class="tool-icon">{{ tool.icon || '🔗' }}</div>
            <div class="tool-name">{{ tool.name }}</div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ExternalTools',
  data() {
    return {
      externalTools: [],
      loading: true
    }
  },
  async created() {
    try {
      const response = await axios.get('/api/tools')
      this.externalTools = response.data.external
    } catch (error) {
      console.error('获取外部工具列表失败:', error)
    } finally {
      this.loading = false
    }
  }
}
</script>

<style scoped>
.external-tools {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.external-tools h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
  text-align: center;
}

.external-tools p {
  font-size: 1.1rem;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 2rem;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.tool-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tool-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tool-card a {
  text-decoration: none;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.tool-icon {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.tool-name {
  font-size: 0.9rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .tool-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .tool-card {
    padding: 1.5rem;
  }
}
</style>