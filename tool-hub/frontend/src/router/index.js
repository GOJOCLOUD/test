import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Tools from '../pages/Tools.vue'
import InternalTools from '../pages/InternalTools.vue'
import ExternalTools from '../pages/ExternalTools.vue'
import Search from '../pages/Search.vue'
import Student from '../pages/Student.vue'
import ToolDetail from '../pages/ToolDetail.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/tools',
    name: 'Tools',
    component: Tools
  },
  {
    path: '/tools/internal',
    name: 'InternalTools',
    component: InternalTools
  },
  {
    path: '/tools/external',
    name: 'ExternalTools',
    component: ExternalTools
  },
  {
    path: '/search',
    name: 'Search',
    component: Search
  },
  {
    path: '/student',
    name: 'Student',
    component: Student
  },
  {
    path: '/tool/:toolId',
    name: 'ToolDetail',
    component: ToolDetail
  },
  {
    path: '/paper-format',
    name: 'PaperFormat',
    component: () => import('../pages/PaperFormat.vue')
  },
  {
    path: '/tool/paper-format',
    redirect: '/paper-format'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router