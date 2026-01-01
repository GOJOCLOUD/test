import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 引入动画库
import 'animate.css'
import '@fortawesome/fontawesome-free/css/all.css'

const app = createApp(App)
app.use(router)
app.mount('#app')