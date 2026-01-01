<template>
  <div class="search">
    <h2>AI 智能搜索</h2>
    <div class="search-box">
      <input
        v-model="query"
        @keyup.enter="search"
        placeholder="输入你想找的工具..."
        class="search-input"
      >
      <button @click="search" class="search-btn">搜索</button>
    </div>
    
    <div v-if="results.length > 0" class="results">
      <h3>搜索结果</h3>
      <div v-for="result in results" :key="result.id" class="result-item">
        <h4>{{ result.name }}</h4>
        <p>{{ result.description }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Search',
  data() {
    return {
      query: '',
      results: []
    }
  },
  methods: {
    async search() {
      if (!this.query.trim()) return
      
      try {
        const response = await axios.post('/api/ai/search', { query: this.query })
        this.results = response.data.results
      } catch (error) {
        console.error('搜索失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.search-box {
  display: flex;
  gap: 0.5rem;
  margin: 2rem 0;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.search-btn {
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.results {
  margin-top: 2rem;
}

.result-item {
  background: #f8f9fa;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 8px;
}
</style>