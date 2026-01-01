<template>
  <div class="micro-interactions">
    <!-- 点击涟漪效果 -->
    <div 
      v-for="ripple in ripples" 
      :key="ripple.id"
      class="ripple"
      :style="{
        left: ripple.x + 'px',
        top: ripple.y + 'px',
        width: ripple.size + 'px',
        height: ripple.size + 'px'
      }"
    ></div>
    
    <!-- 加载指示器 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>{{ loadingText }}</p>
      </div>
    </div>
    
    <!-- 提示消息 -->
    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <i class="toast-icon" :class="getToastIcon(toast.type)"></i>
        <span>{{ toast.message }}</span>
      </div>
    </transition>
    
    <!-- 确认对话框 -->
    <transition name="modal">
      <div v-if="confirm.show" class="modal-overlay" @click="closeConfirm">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h3>{{ confirm.title }}</h3>
            <button class="modal-close" @click="closeConfirm">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>{{ confirm.message }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeConfirm">取消</button>
            <button class="btn btn-primary" @click="confirmAction">确认</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue'

export default {
  name: 'MicroInteractions',
  setup() {
    const ripples = ref([])
    const loading = ref(false)
    const loadingText = ref('加载中...')
    const toast = reactive({
      show: false,
      message: '',
      type: 'info',
      duration: 3000
    })
    const confirm = reactive({
      show: false,
      title: '确认操作',
      message: '您确定要执行此操作吗？',
      action: null
    })
    
    let rippleId = 0
    let toastTimer = null
    
    // 创建涟漪效果
    const createRipple = (event) => {
      // 确保我们有有效的事件和目标元素
      if (!event || !event.currentTarget) {
        return
      }
      
      const target = event.currentTarget
      
      // 确保目标元素有 getBoundingClientRect 方法
      if (typeof target.getBoundingClientRect !== 'function') {
        return
      }
      
      const rect = target.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = event.clientX - rect.left - size / 2
      const y = event.clientY - rect.top - size / 2
      
      const newRipple = {
        id: rippleId++,
        x,
        y,
        size
      }
      
      ripples.value.push(newRipple)
      
      // 在动画结束后移除涟漪
      setTimeout(() => {
        ripples.value = ripples.value.filter(r => r.id !== newRipple.id)
      }, 600)
    }
    
    // 显示加载状态
    const showLoading = (text = '加载中...') => {
      loadingText.value = text
      loading.value = true
    }
    
    // 隐藏加载状态
    const hideLoading = () => {
      loading.value = false
    }
    
    // 显示提示消息
    const showToast = (message, type = 'info', duration = 3000) => {
      toast.message = message
      toast.type = type
      toast.duration = duration
      toast.show = true
      
      // 清除之前的定时器
      if (toastTimer) {
        clearTimeout(toastTimer)
      }
      
      // 设置新的定时器
      toastTimer = setTimeout(() => {
        toast.show = false
      }, duration)
    }
    
    // 获取提示图标
    const getToastIcon = (type) => {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
      }
      return icons[type] || icons.info
    }
    
    // 显示确认对话框
    const showConfirm = (title, message, action) => {
      confirm.title = title
      confirm.message = message
      confirm.action = action
      confirm.show = true
    }
    
    // 关闭确认对话框
    const closeConfirm = () => {
      confirm.show = false
      confirm.action = null
    }
    
    // 执行确认操作
    const confirmAction = () => {
      if (typeof confirm.action === 'function') {
        confirm.action()
      }
      closeConfirm()
    }
    
    // 添加全局点击事件监听
    const handleClick = (event) => {
      // 检查点击的元素或其父元素是否有ripple-effect类
      let target = event.target
      while (target && target !== document.body) {
        if (target.classList && target.classList.contains('ripple-effect')) {
          // 创建一个新的事件对象，确保currentTarget指向正确的元素
          const rippleEvent = { ...event, currentTarget: target }
          createRipple(rippleEvent)
          break
        }
        target = target.parentElement
      }
    }
    
    onMounted(() => {
      document.addEventListener('click', handleClick)
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClick)
      if (toastTimer) {
        clearTimeout(toastTimer)
      }
    })
    
    return {
      ripples,
      loading,
      loadingText,
      toast,
      confirm,
      getToastIcon,
      showLoading,
      hideLoading,
      showToast,
      showConfirm,
      closeConfirm,
      confirmAction
    }
  }
}
</script>

<style scoped>
.micro-interactions {
  position: relative;
}

/* 涟漪效果 */
.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  transform: scale(0);
  animation: ripple-animation 0.6s ease-out;
  pointer-events: none;
  z-index: 1000;
}

@keyframes ripple-animation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* 加载覆盖层 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  background: white;
  border-radius: 12px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 122, 255, 0.2);
  border-top: 4px solid #007AFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 提示消息 */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  color: white;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  max-width: 400px;
}

.toast.success {
  background: var(--success-color);
}

.toast.error {
  background: var(--accent-color);
}

.toast.warning {
  background: #FF9500;
}

.toast.info {
  background: var(--primary-color);
}

.toast-icon {
  font-size: 1.2rem;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 5px;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.modal-close:hover {
  background: var(--surface);
  color: var(--text-primary);
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid var(--border-color);
}

.btn {
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: #0051d5;
}

.btn-secondary {
  background: var(--surface);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: #e1e4e8;
}

/* 过渡动画 */
.toast-enter-active, .toast-leave-active {
  transition: all var(--transition-normal);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.modal-enter-active, .modal-leave-active {
  transition: all var(--transition-normal);
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>