import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import ExcelFormatter from '../views/tools/ExcelFormatter.vue'
import JsonFormatter from '../views/tools/JsonFormatter.vue'
import TextDiff from '../views/tools/TextDiff.vue'
import ColorPicker from '../views/tools/ColorPicker.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/tools/excel-formatter',
    name: 'ExcelFormatter',
    component: ExcelFormatter
  },
  {
    path: '/tools/json-formatter',
    name: 'JsonFormatter',
    component: JsonFormatter
  },
  {
    path: '/tools/text-diff',
    name: 'TextDiff',
    component: TextDiff
  },
  {
    path: '/tools/color-picker',
    name: 'ColorPicker',
    component: ColorPicker
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),//hash模式，可以在非根目录部署时使用
  routes
})

export default router 