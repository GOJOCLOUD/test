<template> 
   <div id="app"> 
     <MicroInteractions ref="microInteractions" />
     <header class="header" :class="{ 'scrolled': scrolled, 'menu-open': mobileMenuOpen }"> 
       <div class="header-content"> 
         <div class="logo" @click="$router.push('/')">
           <span class="logo-icon"><i class="fas fa-tools"></i></span> 
           <span class="logo-text">Tool Hub</span> 
         </div> 
         
         <!-- 桌面导航 -->
         <nav class="nav desktop-nav"> 
           <router-link to="/" class="nav-link" v-slot="{ navigate, isActive }"> 
             <button @click="navigate" :class="['nav-btn', { active: isActive }, 'ripple-effect']"> 
               <i class="fas fa-home"></i>
               <span>首页</span>
             </button> 
           </router-link> 
           <router-link to="/tools" class="nav-link" v-slot="{ navigate, isActive }">
             <button @click="navigate" :class="['nav-btn', { active: isActive }, 'ripple-effect']">
               <i class="fas fa-th-large"></i>
               <span>所有工具</span>
             </button> 
           </router-link> 
           <router-link to="/search" class="nav-link" v-slot="{ navigate, isActive }"> 
             <button @click="navigate" :class="['nav-btn', { active: isActive }, 'ripple-effect']"> 
               <i class="fas fa-search"></i>
               <span>AI搜索</span>
             </button> 
           </router-link> 
         </nav>
         
         <!-- 移动端菜单按钮 -->
         <button class="mobile-menu-btn ripple-effect" @click="toggleMobileMenu">
           <i class="fas" :class="mobileMenuOpen ? 'fa-times' : 'fa-bars'"></i>
         </button>
       </div>
       
       <!-- 移动端导航 -->
       <transition name="slide-down">
         <nav class="mobile-nav" v-if="mobileMenuOpen">
           <router-link to="/" class="nav-link ripple-effect" @click="closeMobileMenu">
             <i class="fas fa-home"></i>
             <span>首页</span>
           </router-link>
           <router-link to="/tools" class="nav-link ripple-effect" @click="closeMobileMenu">
             <i class="fas fa-th-large"></i>
             <span>所有工具</span>
           </router-link>
           <router-link to="/search" class="nav-link ripple-effect" @click="closeMobileMenu">
             <i class="fas fa-search"></i>
             <span>AI搜索</span>
           </router-link>
         </nav>
       </transition>
     </header> 
     
     <main class="main" :class="{ 'menu-open': mobileMenuOpen }"> 
       <transition name="page" mode="out-in"> 
         <router-view v-slot="{ Component }"> 
           <component :is="Component" /> 
         </router-view> 
       </transition> 
     </main>
     
     <!-- 返回顶部按钮 -->
     <transition name="fade">
       <button class="back-to-top ripple-effect" v-if="showBackToTop" @click="scrollToTop">
         <i class="fas fa-arrow-up"></i>
       </button>
     </transition>
   </div> 
 </template> 
 
 <script>
import { ref, onMounted, onUnmounted } from 'vue'
import MicroInteractions from './components/MicroInteractions.vue'

export default {
  name: 'App',
  components: {
    MicroInteractions
  },
  setup() {
    const isDarkMode = ref(false)
    const mobileMenuOpen = ref(false)
    const showBackToTop = ref(false)
    const microInteractions = ref(null)
    
    // 初始化主题
    const initTheme = () => {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        isDarkMode.value = savedTheme === 'dark'
      } else {
        // 检查系统主题偏好
        isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      applyTheme()
    }
    
    // 应用主题
    const applyTheme = () => {
      if (isDarkMode.value) {
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        document.documentElement.removeAttribute('data-theme')
      }
    }
    
    // 切换主题
    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value
      localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
      applyTheme()
      
      // 显示主题切换提示
      if (microInteractions.value) {
        microInteractions.value.showToast(
          `已切换至${isDarkMode.value ? '深色' : '浅色'}主题`,
          'success',
          2000
        )
      }
    }
    
    // 切换移动端菜单
    const toggleMobileMenu = () => {
      mobileMenuOpen.value = !mobileMenuOpen.value
    }
    
    // 关闭移动端菜单
    const closeMobileMenu = () => {
      mobileMenuOpen.value = false
    }
    
    // 滚动到顶部
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
    
    // 处理滚动事件
    const handleScroll = () => {
      showBackToTop.value = window.scrollY > 300
    }
    
    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleMediaChange = (e) => {
      if (!localStorage.getItem('theme')) {
        isDarkMode.value = e.matches
        applyTheme()
      }
    }
    
    // 添加键盘快捷键
    const handleKeyDown = (event) => {
      // Ctrl/Cmd + K 打开搜索
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        // 这里可以添加打开搜索的逻辑
        if (microInteractions.value) {
          microInteractions.value.showToast('搜索功能开发中...', 'info', 2000)
        }
      }
      
      // ESC 关闭移动端菜单
      if (event.key === 'Escape' && mobileMenuOpen.value) {
        closeMobileMenu()
      }
    }
    
    // 添加全局错误处理
    const handleError = (event) => {
      console.error('全局错误:', event.error)
      if (microInteractions.value) {
        microInteractions.value.showToast(
          '发生了一个错误，请刷新页面重试',
          'error',
          5000
        )
      }
    }
    
    onMounted(() => {
      initTheme()
      window.addEventListener('scroll', handleScroll)
      mediaQuery.addEventListener('change', handleMediaChange)
      document.addEventListener('keydown', handleKeyDown)
      window.addEventListener('error', handleError)
      
      // 显示欢迎消息
      setTimeout(() => {
        if (microInteractions.value) {
          microInteractions.value.showToast(
            '欢迎使用工具箱！探索各种实用工具。',
            'info',
            4000
          )
        }
      }, 1000)
    })
    
    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
      mediaQuery.removeEventListener('change', handleMediaChange)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('error', handleError)
    })
    
    return {
      isDarkMode,
      mobileMenuOpen,
      showBackToTop,
      microInteractions,
      toggleTheme,
      toggleMobileMenu,
      closeMobileMenu,
      scrollToTop
    }
  }
}
</script> 
 
 <style> 
 :root { 
   --primary-color: #007AFF; 
   --secondary-color: #5856D6; 
   --accent-color: #FF3B30;
   --success-color: #34C759;
   --warning-color: #FF9500;
   --info-color: #5AC8FA;
   --background: #FFFFFF; 
   --surface: #F5F5F7; 
   --surface-secondary: #FFFFFF; 
   --surface-tertiary: #F0F0F2; 
   --text-primary: #000000; 
   --text-secondary: #666; 
   --text-tertiary: #999; 
   --border-color: #E5E5E7; 
   --shadow-sm: 0 2px 10px rgba(0, 0, 0, 0.08); 
   --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.12); 
   --shadow-lg: 0 10px 40px rgba(0, 0, 0, 0.16); 
   --radius-sm: 8px; 
   --radius-md: 12px; 
   --radius-lg: 20px; 
   --radius-xl: 24px; 
   --transition-fast: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
   --transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
   --transition-slow: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
   
   /* 新增字体大小变量 */
   --font-size-xs: 0.75rem;
   --font-size-sm: 0.875rem;
   --font-size-md: 1rem;
   --font-size-lg: 1.125rem;
   --font-size-xl: 1.25rem;
   --font-size-2xl: 1.5rem;
   --font-size-3xl: 2rem;
   
   /* 新增间距变量 */
   --spacing-xs: 0.25rem;
   --spacing-sm: 0.5rem;
   --spacing-md: 1rem;
   --spacing-lg: 1.5rem;
   --spacing-xl: 2rem;
   --spacing-2xl: 3rem;
 } 
 
 /* 深色主题 */
 [data-theme="dark"] {
   --background: #1C1C1E;
   --surface: #2C2C2E;
   --surface-secondary: #3A3A3C;
   --surface-tertiary: #48484A;
   --text-primary: #F5F5F7;
   --text-secondary: #D1D1D6;
   --text-tertiary: #8E8E93;
   --border-color: #48484A;
   --shadow-sm: 0 2px 10px rgba(0, 0, 0, 0.2);
   --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.3);
   --shadow-lg: 0 10px 40px rgba(0, 0, 0, 0.4);
 } 
 
 * { 
   margin: 0; 
   padding: 0; 
   box-sizing: border-box; 
 } 
 
 body { 
   font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
   background: var(--background); 
   color: var(--text-primary); 
   line-height: 1.6; 
   -webkit-font-smoothing: antialiased; 
   -moz-osx-font-smoothing: grayscale; 
   overflow-x: hidden;
 } 
 
 /* 滚动条样式 */
 ::-webkit-scrollbar {
   width: 8px;
   height: 8px;
 }
 
 ::-webkit-scrollbar-track {
   background: var(--surface);
 }
 
 ::-webkit-scrollbar-thumb {
   background: rgba(0, 0, 0, 0.2);
   border-radius: 4px;
 }
 
 ::-webkit-scrollbar-thumb:hover {
   background: rgba(0, 0, 0, 0.3);
 }
 
 /* 全局加载动画 */
 .loading-spinner {
   display: inline-block;
   width: 20px;
   height: 20px;
   border: 2px solid rgba(255, 255, 255, 0.3);
   border-radius: 50%;
   border-top-color: #fff;
   animation: spin 1s ease-in-out infinite;
 }
 
 @keyframes spin {
   to { transform: rotate(360deg); }
 }
 
 /* 脉冲动画 */
 @keyframes pulse {
   0% {
     box-shadow: 0 0 0 0 rgba(0, 122, 255, 0.7);
   }
   70% {
     box-shadow: 0 0 0 10px rgba(0, 122, 255, 0);
   }
   100% {
     box-shadow: 0 0 0 0 rgba(0, 122, 255, 0);
   }
 }
 
 /* 震动动画 */
 @keyframes shake {
   0%, 100% { transform: translateX(0); }
   10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
   20%, 40%, 60%, 80% { transform: translateX(5px); }
 }
 
 /* 闪烁动画 */
 @keyframes blink {
   0%, 50%, 100% { opacity: 1; }
   25%, 75% { opacity: 0.5; }
 }
 
 /* 渐变动画 */
 @keyframes gradient {
   0% { background-position: 0% 50%; }
   50% { background-position: 100% 50%; }
   100% { background-position: 0% 50%; }
 }
 
 /* 旋转动画 */
 @keyframes rotate {
   from { transform: rotate(0deg); }
   to { transform: rotate(360deg); }
 }
 
 /* 波浪动画 */
 @keyframes wave {
   0% { transform: rotate(0deg); }
   10% { transform: rotate(14deg); }
   20% { transform: rotate(-8deg); }
   30% { transform: rotate(14deg); }
   40% { transform: rotate(-4deg); }
   50% { transform: rotate(10deg); }
   60% { transform: rotate(0deg); }
   100% { transform: rotate(0deg); }
 }
 
 /* 弹跳动画 */
 @keyframes bounce {
   0%, 20%, 53%, 80%, 100% {
     transform: translate3d(0,0,0);
   }
   
   40%, 43% {
     transform: translate3d(0, -30px, 0);
   }
   
   70% {
     transform: translate3d(0, -15px, 0);
   }
   
   90% {
     transform: translate3d(0, -4px, 0);
   }
 }
 
 /* 心跳动画 */
 @keyframes heartbeat {
   0% {
     transform: scale(1);
   }
   14% {
     transform: scale(1.3);
   }
   28% {
     transform: scale(1);
   }
   42% {
     transform: scale(1.3);
   }
   70% {
     transform: scale(1);
   }
 }
 
 .header { 
   position: fixed; 
   top: 0; 
   left: 0; 
   right: 0; 
   background: rgba(255, 255, 255, 0.8); 
   backdrop-filter: blur(20px); 
   -webkit-backdrop-filter: blur(20px); 
   border-bottom: 1px solid var(--border-color); 
   z-index: 1000; 
   transition: all var(--transition-normal); 
 } 
 
 .header.scrolled { 
   background: rgba(255, 255, 255, 0.95); 
   box-shadow: var(--shadow-sm); 
 } 
 
 .header-content { 
   max-width: 1200px; 
   margin: 0 auto; 
   padding: 1rem 2rem; 
   display: flex; 
   justify-content: space-between; 
   align-items: center; 
 } 
 
 .logo { 
   display: flex; 
   align-items: center; 
   gap: 0.5rem; 
   font-weight: 600; 
   font-size: 1.25rem; 
   cursor: pointer;
   transition: transform var(--transition-fast);
 }
 
 .logo:hover {
   transform: scale(1.05);
 }
 
 .logo-icon { 
   font-size: 1.5rem; 
   color: var(--primary-color);
   animation: float 3s ease-in-out infinite; 
 } 
 
 @keyframes float { 
   0%, 100% { transform: translateY(0); } 
   50% { transform: translateY(-3px); } 
 } 
 
 .desktop-nav {
   display: flex;
   gap: 0.5rem;
 }
 
 .mobile-menu-btn {
   display: none;
   background: none;
   border: none;
   font-size: 1.5rem;
   color: var(--text-primary);
   cursor: pointer;
   padding: 0.5rem;
   border-radius: var(--radius-sm);
   transition: all var(--transition-fast);
 }
 
 .mobile-menu-btn:hover {
   background: var(--surface);
 }
 
 .mobile-nav {
   display: none;
   flex-direction: column;
   gap: 0.5rem;
   padding: 1rem 2rem;
   border-top: 1px solid var(--border-color);
   background: rgba(255, 255, 255, 0.95);
   backdrop-filter: blur(20px);
 }
 
 .mobile-nav .nav-link {
   display: flex;
   align-items: center;
   gap: 0.75rem;
   padding: 0.75rem 1rem;
   border-radius: var(--radius-sm);
   text-decoration: none;
   color: var(--text-primary);
   font-weight: 500;
   transition: all var(--transition-fast);
 }
 
 .mobile-nav .nav-link:hover {
   background: rgba(0, 122, 255, 0.08);
   color: var(--primary-color);
 }
 
 .nav { 
   display: flex; 
   gap: 0.5rem; 
 } 
 
 .nav-link {
   text-decoration: none;
 }
 
 .nav-btn {
    background: none;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: var(--radius-sm);
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 1;
  }
  
  .nav-btn i {
    font-size: 0.9rem;
  }
  
  .nav-btn::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: var(--primary-color);
    transform: scaleX(0);
    transform-origin: right;
    transition: transform var(--transition-fast);
    z-index: -1;
  }
  
  .nav-btn:hover {
    background: rgba(0, 122, 255, 0.08);
    color: var(--primary-color);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
  
  .nav-btn:hover::after {
    transform: scaleX(1);
    transform-origin: left;
  }
  
  .nav-btn:active {
    transform: translateY(0);
    box-shadow: none;
  }
  
  .nav-btn.active {
    background: var(--primary-color);
    color: white;
    box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
  }
  
  .nav-btn.active::before {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 3px;
    background: white;
    border-radius: 2px;
  }
  
  .nav-btn.active::after {
    display: none;
  } 
 
 .main { 
   margin-top: 80px; 
   min-height: calc(100vh - 80px); 
   padding: 2rem; 
   max-width: 1200px; 
   margin-left: auto; 
   margin-right: auto; 
   transition: all var(--transition-normal);
 }
 
 .main.menu-open {
   padding-top: 1rem;
 }
 
 .back-to-top {
   position: fixed;
   bottom: 2rem;
   right: 2rem;
   width: 50px;
   height: 50px;
   border-radius: 50%;
   background: var(--primary-color);
   color: white;
   border: none;
   box-shadow: var(--shadow-md);
   cursor: pointer;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 1.2rem;
   transition: all var(--transition-normal);
   z-index: 999;
 }
 
 .back-to-top:hover {
   background: #0051d5;
   transform: translateY(-3px);
   box-shadow: var(--shadow-lg);
 }
 
 /* 页面切换动画 */ 
 .page-enter-active, 
 .page-leave-active { 
   transition: all var(--transition-normal); 
 } 
 
 .page-enter-from { 
   opacity: 0; 
   transform: translateY(20px); 
 } 
 
 .page-leave-to { 
   opacity: 0; 
   transform: translateY(-20px); 
 }
 
 /* 移动端导航动画 */
 .slide-down-enter-active,
 .slide-down-leave-active {
   transition: all var(--transition-normal);
   overflow: hidden;
 }
 
 .slide-down-enter-from,
 .slide-down-leave-to {
   max-height: 0;
   opacity: 0;
 }
 
 .slide-down-enter-to,
 .slide-down-leave-from {
   max-height: 200px;
   opacity: 1;
 }
 
 /* 淡入淡出动画 */
 .fade-enter-active,
 .fade-leave-active {
   transition: opacity var(--transition-normal);
 }
 
 .fade-enter-from,
 .fade-leave-to {
   opacity: 0;
 }
 
 /* 缩放动画 */
 .scale-enter-active,
 .scale-leave-active {
   transition: all var(--transition-normal);
 }
 
 .scale-enter-from,
 .scale-leave-to {
   opacity: 0;
   transform: scale(0.9);
 }
 
 /* 滑动动画 */
 .slide-left-enter-active,
 .slide-left-leave-active {
   transition: all var(--transition-normal);
 }
 
 .slide-left-enter-from {
   opacity: 0;
   transform: translateX(30px);
 }
 
 .slide-left-leave-to {
   opacity: 0;
   transform: translateX(-30px);
 }
 
 .slide-right-enter-active,
 .slide-right-leave-active {
   transition: all var(--transition-normal);
 }
 
 .slide-right-enter-from {
   opacity: 0;
   transform: translateX(-30px);
 }
 
 .slide-right-leave-to {
   opacity: 0;
   transform: translateX(30px);
 }
 
 /* 翻转动画 */
 .flip-enter-active {
   transition: all var(--transition-slow);
 }
 
 .flip-leave-active {
   transition: all var(--transition-fast);
 }
 
 .flip-enter-from {
   transform: rotateY(90deg);
   opacity: 0;
 }
 
 .flip-leave-to {
   transform: rotateY(90deg);
   opacity: 0;
 }
 
 /* 响应式设计 */ 
 @media (max-width: 768px) { 
   .header-content { 
     padding: 1rem; 
   }
   
   .desktop-nav {
     display: none;
   }
   
   .mobile-menu-btn {
     display: block;
   }
   
   .mobile-nav {
     display: flex;
   }
   
   .nav { 
     gap: 0.25rem; 
   }
   
   .nav-btn { 
     padding: 0.5rem 0.75rem; 
     font-size: 0.875rem; 
   }
   
   .main { 
     padding: 1rem; 
   }
   
   .back-to-top {
     bottom: 1rem;
     right: 1rem;
     width: 45px;
     height: 45px;
   }
 } 
 
 /* 新增工具类 */
 .text-center { text-align: center; }
 .text-left { text-align: left; }
 .text-right { text-align: right; }
 
 .flex { display: flex; }
 .flex-col { flex-direction: column; }
 .items-center { align-items: center; }
 .justify-center { justify-content: center; }
 .justify-between { justify-content: space-between; }
 
 .w-full { width: 100%; }
 .h-full { height: 100%; }
 
 .mt-1 { margin-top: var(--spacing-xs); }
 .mt-2 { margin-top: var(--spacing-sm); }
 .mt-3 { margin-top: var(--spacing-md); }
 .mt-4 { margin-top: var(--spacing-lg); }
 .mt-5 { margin-top: var(--spacing-xl); }
 
 .mb-1 { margin-bottom: var(--spacing-xs); }
 .mb-2 { margin-bottom: var(--spacing-sm); }
 .mb-3 { margin-bottom: var(--spacing-md); }
 .mb-4 { margin-bottom: var(--spacing-lg); }
 .mb-5 { margin-bottom: var(--spacing-xl); }
 
 .p-1 { padding: var(--spacing-xs); }
 .p-2 { padding: var(--spacing-sm); }
 .p-3 { padding: var(--spacing-md); }
 .p-4 { padding: var(--spacing-lg); }
 .p-5 { padding: var(--spacing-xl); }
 
 .rounded-sm { border-radius: var(--radius-sm); }
 .rounded-md { border-radius: var(--radius-md); }
 .rounded-lg { border-radius: var(--radius-lg); }
 .rounded-xl { border-radius: var(--radius-xl); }
 
 .shadow-sm { box-shadow: var(--shadow-sm); }
 .shadow-md { box-shadow: var(--shadow-md); }
 .shadow-lg { box-shadow: var(--shadow-lg); }
 
 .bg-primary { background-color: var(--background); }
 .bg-secondary { background-color: var(--surface); }
 .bg-tertiary { background-color: var(--surface-tertiary); }
 
 .text-primary { color: var(--text-primary); }
 .text-secondary { color: var(--text-secondary); }
 .text-tertiary { color: var(--text-tertiary); }
 
 .text-xs { font-size: var(--font-size-xs); }
 .text-sm { font-size: var(--font-size-sm); }
 .text-md { font-size: var(--font-size-md); }
 .text-lg { font-size: var(--font-size-lg); }
 .text-xl { font-size: var(--font-size-xl); }
 .text-2xl { font-size: var(--font-size-2xl); }
 .text-3xl { font-size: var(--font-size-3xl); }
 
 .font-light { font-weight: 300; }
 .font-normal { font-weight: 400; }
 .font-medium { font-weight: 500; }
 .font-semibold { font-weight: 600; }
 .font-bold { font-weight: 700; }
 
 .hidden { display: none; }
 .block { display: block; }
 .inline { display: inline; }
 .inline-block { display: inline-block; }
 
 .relative { position: relative; }
 .absolute { position: absolute; }
 .fixed { position: fixed; }
 
 .z-10 { z-index: 10; }
 .z-20 { z-index: 20; }
 .z-30 { z-index: 30; }
 .z-40 { z-index: 40; }
 .z-50 { z-index: 50; }
 
 .cursor-pointer { cursor: pointer; }
 .cursor-not-allowed { cursor: not-allowed; }
 
 .select-none { user-select: none; }
 .select-text { user-select: text; }
 .select-all { user-select: all; }
 
 .pointer-events-none { pointer-events: none; }
 .pointer-events-auto { pointer-events: auto; }
 
 .transition { transition: all var(--transition-normal); }
 .transition-fast { transition: all var(--transition-fast); }
 .transition-slow { transition: all var(--transition-slow); }
 
 .opacity-0 { opacity: 0; }
 .opacity-25 { opacity: 0.25; }
 .opacity-50 { opacity: 0.5; }
 .opacity-75 { opacity: 0.75; }
 .opacity-100 { opacity: 1; }
 
 .transform { transform: translateZ(0); }
 .scale-90 { transform: scale(0.9); }
 .scale-100 { transform: scale(1); }
 .scale-110 { transform: scale(1.1); }
 
 .rotate-0 { transform: rotate(0deg); }
 .rotate-45 { transform: rotate(45deg); }
 .rotate-90 { transform: rotate(90deg); }
 .rotate-180 { transform: rotate(180deg); }
 
 .translate-x-0 { transform: translateX(0); }
 .translate-x-1 { transform: translateX(var(--spacing-xs)); }
 .translate-x-2 { transform: translateX(var(--spacing-sm)); }
 .translate-x-3 { transform: translateX(var(--spacing-md)); }
 .translate-x-4 { transform: translateX(var(--spacing-lg)); }
 .translate-x-5 { transform: translateX(var(--spacing-xl)); }
 
 .translate-y-0 { transform: translateY(0); }
 .translate-y-1 { transform: translateY(var(--spacing-xs)); }
 .translate-y-2 { transform: translateY(var(--spacing-sm)); }
 .translate-y-3 { transform: translateY(var(--spacing-md)); }
 .translate-y-4 { transform: translateY(var(--spacing-lg)); }
 .translate-y-5 { transform: translateY(var(--spacing-xl)); }
 
 /* 新增动画类 */
 .animate-pulse { animation: pulse 2s infinite; }
 .animate-shake { animation: shake 0.5s; }
 .animate-bounce { animation: bounce 1s infinite; }
 .animate-heartbeat { animation: heartbeat 1.5s ease-in-out infinite; }
 .animate-blink { animation: blink 1.5s infinite; }
 .animate-rotate { animation: rotate 2s linear infinite; }
 .animate-wave { animation: wave 2s ease-in-out infinite; }
 
 /* 新增渐变背景 */
 .gradient-bg {
   background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
   background-size: 400% 400%;
   animation: gradient 15s ease infinite;
 }
 
 /* 新增悬停效果 */
 .hover-lift {
   transition: transform var(--transition-fast), box-shadow var(--transition-fast);
 }
 
 .hover-lift:hover {
   transform: translateY(-4px);
   box-shadow: var(--shadow-lg);
 }
 
 .hover-scale {
   transition: transform var(--transition-fast);
 }
 
 .hover-scale:hover {
   transform: scale(1.05);
 }
 
 /* 新增玻璃态效果 */
 .glass {
   background: rgba(255, 255, 255, 0.1);
   backdrop-filter: blur(10px);
   -webkit-backdrop-filter: blur(10px);
   border: 1px solid rgba(255, 255, 255, 0.2);
 }
 
 /* 新增霓虹效果 */
 .neon {
   text-shadow: 0 0 10px var(--primary-color),
                0 0 20px var(--primary-color),
                0 0 30px var(--primary-color),
                0 0 40px var(--primary-color);
 }
 
 /* 新增打字机效果 */
 .typewriter {
   overflow: hidden;
   border-right: 2px solid var(--primary-color);
   white-space: nowrap;
   animation: typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite;
 }
 
 @keyframes typing {
   from { width: 0 }
   to { width: 100% }
 }
 
 @keyframes blink-caret {
   from, to { border-color: transparent }
   50% { border-color: var(--primary-color) }
 }
 </style>