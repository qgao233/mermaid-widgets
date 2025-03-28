import { createRouter, createWebHistory,createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Examples from '../views/Examples.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/examples',
    name: 'Examples',
    component: Examples
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),//hash模式，可以在非根目录部署时使用
  routes
})

export default router 