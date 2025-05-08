import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import ExcelFormatter from '../views/tools/ExcelFormatter.vue'
import JsonFormatter from '../views/tools/JsonFormatter.vue'
import TextDiff from '../views/tools/TextDiff.vue'
import ColorPicker from '../views/tools/ColorPicker.vue'
import VideoParser from '../views/tools/VideoParser.vue'
import Chat from '../views/tools/chat/Chat.vue'
import PrivateChat from '../views/tools/chat/PrivateChat.vue'
import StockRecommender from '../views/tools/stock/StockRecommender.vue'
import AuthCallback from '../views/AuthCallback.vue'
import FitnessPlan from '../views/FitnessPlan.vue'

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
  },
  {
    path: '/tools/video-parser',
    name: 'VideoParser',
    component: VideoParser
  },
  {
    path: '/tools/chat/chat',
    name: 'Chat',
    component: Chat
  },
  {
    path: '/tools/chat/private-chat',
    name: 'PrivateChat',
    component: PrivateChat
  },
  {
    path: '/tools/stock/stock-recommender',
    name: 'StockRecommender',
    component: StockRecommender
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: AuthCallback
  },
  {
    path: '/fitness-plan',
    name: 'FitnessPlan',
    component: FitnessPlan
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),//hash模式，可以在非根目录部署时使用
  routes
})

export default router 