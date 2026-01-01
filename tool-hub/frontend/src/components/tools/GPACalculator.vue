<template>
  <div class="gpa-calculator-container">
    <div class="tool-header">
      <h2>GPA计算器</h2>
      <p>计算您的课程绩点和平均学分绩点</p>
    </div>
    
    <div class="tool-content">
      <div class="section">
        <h3>添加课程</h3>
        <div class="course-form">
          <div class="form-row">
            <div class="form-group">
              <label for="course-name">课程名称</label>
              <input type="text" id="course-name" v-model="newCourse.name" placeholder="例如：高等数学">
            </div>
            
            <div class="form-group">
              <label for="course-credits">学分</label>
              <input type="number" id="course-credits" v-model.number="newCourse.credits" min="0.5" max="10" step="0.5">
            </div>
            
            <div class="form-group">
              <label for="course-grade">成绩</label>
              <select id="course-grade" v-model="newCourse.grade">
                <option value="">选择成绩</option>
                <option value="A+">A+ (4.0)</option>
                <option value="A">A (4.0)</option>
                <option value="A-">A- (3.7)</option>
                <option value="B+">B+ (3.3)</option>
                <option value="B">B (3.0)</option>
                <option value="B-">B- (2.7)</option>
                <option value="C+">C+ (2.3)</option>
                <option value="C">C (2.0)</option>
                <option value="C-">C- (1.7)</option>
                <option value="D+">D+ (1.3)</option>
                <option value="D">D (1.0)</option>
                <option value="F">F (0.0)</option>
              </select>
            </div>
          </div>
          
          <button class="btn btn-primary" @click="addCourse">添加课程</button>
        </div>
      </div>
      
      <div class="section" v-if="courses.length > 0">
        <h3>课程列表</h3>
        <div class="course-list">
          <div class="course-item" v-for="(course, index) in courses" :key="index">
            <div class="course-info">
              <h4>{{ course.name }}</h4>
              <div class="course-details">
                <span class="credits">{{ course.credits }} 学分</span>
                <span class="grade">{{ course.grade }}</span>
                <span class="points">绩点: {{ getGradePoints(course.grade) }}</span>
              </div>
            </div>
            <button class="btn btn-danger btn-small" @click="removeCourse(index)">删除</button>
          </div>
        </div>
      </div>
      
      <div class="section" v-if="courses.length > 0">
        <h3>GPA计算结果</h3>
        <div class="gpa-result">
          <div class="result-item">
            <div class="result-label">总学分</div>
            <div class="result-value">{{ totalCredits }}</div>
          </div>
          <div class="result-item">
            <div class="result-label">总绩点</div>
            <div class="result-value">{{ totalPoints.toFixed(2) }}</div>
          </div>
          <div class="result-item highlight">
            <div class="result-label">GPA</div>
            <div class="result-value">{{ gpa.toFixed(2) }}</div>
          </div>
        </div>
        
        <div class="gpa-scale">
          <h4>GPA等级说明</h4>
          <div class="scale-item">
            <span class="grade-range">3.7 - 4.0</span>
            <span class="scale-label">优秀</span>
          </div>
          <div class="scale-item">
            <span class="grade-range">3.3 - 3.6</span>
            <span class="scale-label">良好</span>
          </div>
          <div class="scale-item">
            <span class="grade-range">2.7 - 3.2</span>
            <span class="scale-label">中等</span>
          </div>
          <div class="scale-item">
            <span class="grade-range">2.0 - 2.6</span>
            <span class="scale-label">及格</span>
          </div>
          <div class="scale-item">
            <span class="grade-range">0.0 - 1.9</span>
            <span class="scale-label">不及格</span>
          </div>
        </div>
      </div>
      
      <div class="action-buttons" v-if="courses.length > 0">
        <button class="btn btn-secondary" @click="clearAllCourses">清空所有课程</button>
        <button class="btn btn-success" @click="saveResults">保存结果</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'GPACalculator',
  setup() {
    const courses = ref([])
    const newCourse = ref({
      name: '',
      credits: 1,
      grade: ''
    })
    
    const gradePointsMap = {
      'A+': 4.0,
      'A': 4.0,
      'A-': 3.7,
      'B+': 3.3,
      'B': 3.0,
      'B-': 2.7,
      'C+': 2.3,
      'C': 2.0,
      'C-': 1.7,
      'D+': 1.3,
      'D': 1.0,
      'F': 0.0
    }
    
    const getGradePoints = (grade) => {
      return gradePointsMap[grade] || 0
    }
    
    const totalCredits = computed(() => {
      return courses.value.reduce((sum, course) => sum + course.credits, 0)
    })
    
    const totalPoints = computed(() => {
      return courses.value.reduce((sum, course) => {
        return sum + (course.credits * getGradePoints(course.grade))
      }, 0)
    })
    
    const gpa = computed(() => {
      return totalCredits.value > 0 ? totalPoints.value / totalCredits.value : 0
    })
    
    const addCourse = () => {
      if (!newCourse.value.name || !newCourse.value.grade) {
        alert('请填写完整的课程信息')
        return
      }
      
      courses.value.push({
        name: newCourse.value.name,
        credits: newCourse.value.credits,
        grade: newCourse.value.grade
      })
      
      // 重置表单
      newCourse.value = {
        name: '',
        credits: 1,
        grade: ''
      }
    }
    
    const removeCourse = (index) => {
      courses.value.splice(index, 1)
    }
    
    const clearAllCourses = () => {
      if (confirm('确定要清空所有课程吗？')) {
        courses.value = []
      }
    }
    
    const saveResults = () => {
      const results = {
        courses: courses.value,
        totalCredits: totalCredits.value,
        totalPoints: totalPoints.value,
        gpa: gpa.value,
        date: new Date().toISOString()
      }
      
      // 这里可以保存到本地存储或发送到服务器
      localStorage.setItem('gpa-results', JSON.stringify(results))
      
      alert('GPA计算结果已保存')
    }
    
    return {
      courses,
      newCourse,
      totalCredits,
      totalPoints,
      gpa,
      getGradePoints,
      addCourse,
      removeCourse,
      clearAllCourses,
      saveResults
    }
  }
}
</script>

<style scoped>
.gpa-calculator-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.tool-header {
  text-align: center;
  margin-bottom: 30px;
}

.tool-header h2 {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 10px;
}

.tool-header p {
  font-size: 16px;
  color: #7f8c8d;
}

.tool-content {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.section {
  margin-bottom: 30px;
}

.section h3 {
  font-size: 20px;
  color: #2c3e50;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f1f2f6;
}

.course-form {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #3498db;
  outline: none;
}

.course-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.course-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.course-info h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #2c3e50;
}

.course-details {
  display: flex;
  gap: 15px;
}

.course-details span {
  font-size: 14px;
  color: #7f8c8d;
}

.gpa-result {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.result-item {
  text-align: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  flex: 1;
  margin: 0 5px;
}

.result-item.highlight {
  background-color: rgba(52, 152, 219, 0.1);
  border: 2px solid #3498db;
}

.result-label {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.result-value {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
}

.gpa-scale h4 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.scale-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f1f2f6;
}

.scale-item:last-child {
  border-bottom: none;
}

.grade-range {
  font-weight: 500;
  color: #2c3e50;
}

.scale-label {
  color: #7f8c8d;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: #ecf0f1;
  color: #2c3e50;
}

.btn-secondary:hover {
  background-color: #dde4e6;
}

.btn-success {
  background-color: #2ecc71;
  color: white;
}

.btn-success:hover {
  background-color: #27ae60;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background-color: #c0392b;
}

.btn-small {
  padding: 8px 16px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .gpa-calculator-container {
    padding: 15px;
  }
  
  .form-row {
    flex-direction: column;
  }
  
  .gpa-result {
    flex-direction: column;
    gap: 10px;
  }
  
  .result-item {
    margin: 0;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>