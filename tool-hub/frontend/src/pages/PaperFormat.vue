<template>
  <div class="paper-format-page">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">论文排版工具</h1>
        <p class="page-description">上传您的Word文档，我们将为您自动排版成格式美观的论文样式</p>
      </div>
      <div class="header-visual">
        <div class="floating-icon icon-1">
          <i class="fas fa-file-alt"></i>
        </div>
        <div class="floating-icon icon-2">
          <i class="fas fa-align-left"></i>
        </div>
        <div class="floating-icon icon-3">
          <i class="fas fa-graduation-cap"></i>
        </div>
      </div>
    </div>
    
    <div class="format-container">
      <div class="upload-section">
        <div class="upload-area" :class="{ 'drag-over': isDragOver }" 
             @dragover.prevent="handleDragOver" 
             @dragleave.prevent="handleDragLeave" 
             @drop.prevent="handleDrop">
          <input type="file" ref="fileInput" accept=".docx" style="display: none" @change="handleFileChange">
          <div class="upload-icon">
            <i class="fas fa-cloud-upload-alt"></i>
          </div>
          <p>点击上传或拖拽Word文档至此处</p>
          <p class="hint">支持 .docx 格式文件，最大20MB</p>
          <button class="upload-btn" @click="triggerFileInput">选择文件</button>
        </div>
        
        <div v-if="selectedFile" class="file-info">
          <div class="file-icon">
            <i class="fas fa-file-word"></i>
          </div>
          <div class="file-details">
            <p class="file-name">{{ selectedFile.name }}</p>
            <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
          </div>
          <button class="remove-btn" @click="removeFile">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="format-options" v-if="selectedFile">
          <h3>排版选项</h3>
          <div class="option-group">
            <label class="option-label">论文格式</label>
            <div class="radio-group">
              <label class="radio-option">
                <input type="radio" name="format" value="ieee" v-model="selectedFormat">
                <span>IEEE格式</span>
              </label>
              <label class="radio-option">
                <input type="radio" name="format" value="apa" v-model="selectedFormat">
                <span>APA格式</span>
              </label>
              <label class="radio-option">
                <input type="radio" name="format" value="mla" v-model="selectedFormat">
                <span>MLA格式</span>
              </label>
            </div>
          </div>
        </div>
        
        <button class="format-btn" :disabled="!selectedFile || isProcessing" @click="formatPaper">
          <span v-if="!isProcessing" class="btn-content">
            <i class="fas fa-magic"></i>
            开始排版
          </span>
          <span v-else class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            处理中...
          </span>
        </button>
        
        <div v-if="message" class="message" :class="messageType">
          <i class="fas" :class="getMessageIcon()"></i>
          {{ message }}
        </div>
      </div>
      
      <div class="info-section">
        <div class="info-card">
          <h3>支持的排版格式</h3>
          <ul>
            <li><i class="fas fa-check-circle"></i> IEEE学术期刊格式</li>
            <li><i class="fas fa-check-circle"></i> APA论文格式</li>
            <li><i class="fas fa-check-circle"></i> MLA论文格式</li>
            <li><i class="fas fa-check-circle"></i> 自动生成目录</li>
            <li><i class="fas fa-check-circle"></i> 参考文献格式化</li>
          </ul>
        </div>
        
        <div class="info-card">
          <h3>使用说明</h3>
          <ol>
            <li>上传您的Word文档</li>
            <li>选择所需的排版格式</li>
            <li>点击"开始排版"按钮</li>
            <li>等待处理完成并下载</li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'PaperFormat',
  setup() {
    const router = useRouter()
    const selectedFile = ref(null)
    const isDragOver = ref(false)
    const isProcessing = ref(false)
    const message = ref('')
    const messageType = ref('')
    const selectedFormat = ref('ieee')
    
    const fileInput = ref(null)
    
    const triggerFileInput = () => {
      fileInput.value.click()
    }
    
    const handleFileChange = (event) => {
      const file = event.target.files[0]
      if (file) {
        validateFile(file)
      }
    }
    
    const handleDragOver = () => {
      isDragOver.value = true
    }
    
    const handleDragLeave = () => {
      isDragOver.value = false
    }
    
    const handleDrop = (event) => {
      isDragOver.value = false
      const file = event.dataTransfer.files[0]
      if (file) {
        validateFile(file)
      }
    }
    
    const validateFile = (file) => {
      // 检查文件类型
      if (!file.name.endsWith('.docx')) {
        showMessage('请上传.docx格式的Word文档', 'error')
        return
      }
      
      // 检查文件大小（限制为20MB）
      const maxSize = 20 * 1024 * 1024
      if (file.size > maxSize) {
        showMessage('文件大小不能超过20MB', 'error')
        return
      }
      
      selectedFile.value = file
      showMessage('文件已选择', 'success')
    }
    
    const removeFile = () => {
      selectedFile.value = null
      fileInput.value.value = ''
      showMessage('', '')
    }
    
    const formatPaper = async () => {
      if (!selectedFile.value) return
      
      isProcessing.value = true
      showMessage('正在处理文件...', 'info')
      
      try {
        // 创建FormData对象
        const formData = new FormData()
        formData.append('file', selectedFile.value)
        
        // 调用后端API
        const response = await axios.post('/api/tools/paper-format', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          responseType: 'blob' // 接收二进制数据
        })
        
        // 创建下载链接
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        
        // 设置下载文件名
        const originalName = selectedFile.value.name.replace(/\.docx$/, '')
        link.setAttribute('download', `${originalName}_formatted.docx`)
        
        // 触发下载
        document.body.appendChild(link)
        link.click()
        
        // 清理
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        showMessage('论文排版成功！文件已下载', 'success')
        
      } catch (error) {
        console.error('排版失败:', error)
        showMessage('排版失败，请稍后重试', 'error')
      } finally {
        isProcessing.value = false
      }
    }
    
    const formatFileSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B'
      else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB'
      else return (bytes / 1048576).toFixed(2) + ' MB'
    }
    
    const showMessage = (msg, type) => {
      message.value = msg
      messageType.value = type
    }
    
    const getMessageIcon = () => {
      return messageType.value === 'success' ? 'fa-check-circle' : 
             messageType.value === 'error' ? 'fa-exclamation-circle' : 
             messageType.value === 'info' ? 'fa-info-circle' : 'fa-question-circle'
    }
    
    return {
      selectedFile,
      isDragOver,
      isProcessing,
      message,
      messageType,
      selectedFormat,
      fileInput,
      triggerFileInput,
      handleFileChange,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      removeFile,
      formatPaper,
      formatFileSize,
      getMessageIcon
    }
  }
}
</script>

<style scoped>
.paper-format-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding: 30px 0;
  position: relative;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  border-radius: 16px;
  color: white;
  overflow: hidden;
}

.header-content {
  flex: 1;
  z-index: 2;
  padding-left: 40px;
}

.page-title {
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.page-description {
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 600px;
  line-height: 1.6;
}

.header-visual {
  position: relative;
  width: 300px;
  height: 200px;
  z-index: 1;
}

.floating-icon {
  position: absolute;
  font-size: 2.5rem;
  opacity: 0.8;
  animation: float 6s ease-in-out infinite;
}

.icon-1 {
  top: 20px;
  right: 60px;
  animation-delay: 0s;
}

.icon-2 {
  top: 80px;
  right: 120px;
  animation-delay: 2s;
}

.icon-3 {
  bottom: 30px;
  right: 40px;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.format-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-top: 20px;
}

.upload-section {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.upload-section:hover {
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

.upload-area {
  border: 2px dashed #d0d7de;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  background-color: #f6f8fa;
  margin-bottom: 20px;
}

.upload-area:hover {
  border-color: #2575fc;
  background-color: rgba(37, 117, 252, 0.05);
}

.upload-area.drag-over {
  border-color: #2575fc;
  background-color: rgba(37, 117, 252, 0.1);
  transform: scale(1.02);
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  color: #2575fc;
}

.upload-area p {
  margin: 10px 0;
  color: #333;
  font-size: 1.1rem;
}

.hint {
  font-size: 0.9rem !important;
  color: #666 !important;
}

.upload-btn {
  background-color: #2575fc;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 15px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.upload-btn:hover {
  background-color: #1a5fd4;
  transform: translateY(-2px);
}

.file-info {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: #f6f8fa;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid #e1e4e8;
  transition: all 0.3s ease;
}

.file-info:hover {
  background-color: #f1f3f4;
}

.file-icon {
  font-size: 2.5rem;
  margin-right: 15px;
  color: #2575fc;
}

.file-details {
  flex: 1;
}

.file-name {
  font-weight: 600;
  margin-bottom: 5px;
  font-size: 1.1rem;
}

.file-size {
  color: #666;
  font-size: 0.9rem;
}

.remove-btn {
  background-color: #f44336;
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background-color: #d32f2f;
  transform: scale(1.1);
}

.format-options {
  margin: 25px 0;
  padding: 20px;
  background-color: #f6f8fa;
  border-radius: 12px;
  border: 1px solid #e1e4e8;
}

.format-options h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 1.2rem;
}

.option-group {
  margin-bottom: 15px;
}

.option-label {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  color: #333;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.radio-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 10px 15px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.radio-option:hover {
  background-color: rgba(37, 117, 252, 0.1);
}

.radio-option input {
  margin-right: 10px;
}

.format-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(37, 117, 252, 0.3);
}

.format-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(37, 117, 252, 0.4);
}

.format-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
  box-shadow: none;
}

.loading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.message {
  margin-top: 20px;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.success {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.message.error {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

.message.info {
  background-color: #e3f2fd;
  color: #1565c0;
  border: 1px solid #90caf9;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.info-card:hover {
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
  transform: translateY(-5px);
}

.info-card h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
}

.info-card ul, .info-card ol {
  padding-left: 20px;
  margin: 0;
}

.info-card li {
  margin-bottom: 10px;
  line-height: 1.5;
  color: #555;
}

.info-card li i {
  color: #2575fc;
  margin-right: 8px;
}

@media (max-width: 992px) {
  .format-container {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    text-align: center;
    padding: 30px 20px;
  }
  
  .header-content {
    padding-left: 0;
    margin-bottom: 20px;
  }
  
  .header-visual {
    width: 100%;
    height: 150px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .page-description {
    font-size: 1rem;
  }
}

@media (max-width: 576px) {
  .paper-format-page {
    padding: 15px;
  }
  
  .upload-area {
    padding: 30px 20px;
  }
  
  .upload-icon {
    font-size: 2.5rem;
  }
  
  .upload-area p {
    font-size: 1rem;
  }
  
  .file-info {
    padding: 15px;
  }
  
  .file-icon {
    font-size: 2rem;
  }
  
  .format-options {
    padding: 15px;
  }
  
  .info-card {
    padding: 20px;
  }
}
</style>