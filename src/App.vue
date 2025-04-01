<template>
  <div class="app">
    <div class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <div class="logo">
        <h1>实用工具箱</h1>
        <div class="logo-underline"></div>
      </div>
      
      <!-- 折叠按钮 -->
      <div class="collapse-btn" @click="toggleSidebar">
        <span class="collapse-icon">{{ sidebarCollapsed ? '→' : '←' }}</span>
      </div>
      
      <!-- 首页导航 -->
      <div class="menu-section">
        <nav class="home-nav">
          <router-link to="/" class="nav-link">
            <span class="nav-icon">🏠</span>
            <span v-show="!sidebarCollapsed">首页</span>
          </router-link>
        </nav>
      </div>
      
      <!-- 本站工具菜单 -->
      <div class="menu-section">
        <div class="menu-header" @click="toggleInternal">
          <span class="menu-title" v-show="!sidebarCollapsed">本站工具</span>
          <span class="menu-toggle" :class="{ 'menu-toggle-open': internalOpen }" v-show="!sidebarCollapsed">▼</span>
        </div>
        <nav class="main-nav" v-show="internalOpen || sidebarCollapsed">
          <router-link to="/tools/excel-formatter" class="nav-link">
            <span class="nav-icon">📊</span>
            <span v-show="!sidebarCollapsed">Excel公式格式化</span>
          </router-link>
          <router-link to="/tools/json-formatter" class="nav-link">
            <span class="nav-icon">{}</span>
            <span v-show="!sidebarCollapsed">JSON格式化</span>
          </router-link>
          <router-link to="/tools/text-diff" class="nav-link">
            <span class="nav-icon">⟷</span>
            <span v-show="!sidebarCollapsed">文本对比</span>
          </router-link>
          <router-link to="/tools/color-picker" class="nav-link">
            <span class="nav-icon">🎨</span>
            <span v-show="!sidebarCollapsed">颜色选择器</span>
          </router-link>
          <router-link to="/tools/video-parser" class="nav-link">
            <span class="nav-icon">🎬</span>
            <span v-show="!sidebarCollapsed">视频解析工具</span>
          </router-link>
        </nav>
      </div>
      
      <!-- 其他页面 -->
      <div class="menu-section">
        <div class="menu-header" @click="toggleOther">
          <span class="menu-title" v-show="!sidebarCollapsed">关于</span>
          <span class="menu-toggle" :class="{ 'menu-toggle-open': otherOpen }" v-show="!sidebarCollapsed">▼</span>
        </div>
        <nav class="other-nav" v-show="otherOpen || sidebarCollapsed">
          <router-link to="/about" class="nav-link">
            <span class="nav-icon">ℹ️</span>
            <span v-show="!sidebarCollapsed">关于本站</span>
          </router-link>
        </nav>
      </div>
      
      <!-- 外链工具菜单 -->
      <div class="menu-section">
        <div class="menu-header" @click="toggleExternal">
          <span class="menu-title" v-show="!sidebarCollapsed">外链工具</span>
          <span class="menu-toggle" :class="{ 'menu-toggle-open': externalOpen }" v-show="!sidebarCollapsed">▼</span>
        </div>
        <nav class="external-nav" v-show="externalOpen || sidebarCollapsed">
          <!-- 加载中状态 -->
          <div v-if="loadingExternalTools" class="loading-state">
            <div class="loading-spinner"></div>
            <span v-show="!sidebarCollapsed">加载中...</span>
          </div>
          
          <!-- 加载失败状态 -->
          <div v-else-if="externalToolsError" class="error-state">
            <span class="nav-icon">⚠️</span>
            <span v-show="!sidebarCollapsed">{{ externalToolsError }}</span>
          </div>
          
          <!-- 数据为空状态 -->
          <div v-else-if="externalTools.length === 0" class="empty-state">
            <span class="nav-icon">📂</span>
            <span v-show="!sidebarCollapsed">暂无外链工具</span>
          </div>
          
          <!-- 数据加载成功状态 -->
          <template v-else>
            <a v-for="tool in externalTools" 
               :key="tool.id" 
               :href="tool.url" 
               target="_blank" 
               class="nav-link external-link">
              <span class="nav-icon">{{ tool.icon }}</span>
              <span v-show="!sidebarCollapsed">{{ tool.name }}</span>
            </a>
          </template>
        </nav>
      </div>
      
      <div class="sidebar-footer" v-show="!sidebarCollapsed">
        <p>© 2025 实用工具箱</p>
      </div>
    </div>
    <div class="content" :class="{ 'content-expanded': sidebarCollapsed }">
      <main>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script>
import { getExternalTools } from './utils/supabase';

export default {
  name: 'App',
  data() {
    return {
      internalOpen: true, // 默认展开
      externalOpen: true, // 默认展开
      otherOpen: true,    // 默认展开
      sidebarCollapsed: false, // 侧边栏折叠状态
      externalTools: [], // 外链工具列表
      loadingExternalTools: false, // 加载状态
      externalToolsError: null // 错误信息
    };
  },
  async created() {
    // 组件创建时加载外链工具数据
    await this.fetchExternalTools();
  },
  methods: {
    toggleInternal() {
      if (!this.sidebarCollapsed) {
        this.internalOpen = !this.internalOpen;
      }
    },
    toggleExternal() {
      if (!this.sidebarCollapsed) {
        this.externalOpen = !this.externalOpen;
      }
    },
    toggleOther() {
      if (!this.sidebarCollapsed) {
        this.otherOpen = !this.otherOpen;
      }
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
      // 当展开时，恢复原有的菜单状态
      if (!this.sidebarCollapsed) {
        // 延迟执行，确保过渡效果流畅
        setTimeout(() => {
          this.internalOpen = true;
          this.externalOpen = true;
          this.otherOpen = true;
        }, 200);
      }
    },
    async fetchExternalTools() {
      try {
        this.loadingExternalTools = true;
        this.externalToolsError = null;
        this.externalTools = await getExternalTools();
      } catch (error) {
        console.error('获取外链工具失败:', error);
        this.externalToolsError = '加载失败，请刷新重试';
      } finally {
        this.loadingExternalTools = false;
      }
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Quicksand', Arial, sans-serif;
  line-height: 1.6;
  background-color: #faf7fd;
  height: 100vh;
  color: #444;
}

.app {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 280px;
  background: linear-gradient(145deg, #ffecd2 0%, #fcb69f 100%);
  color: #623b5a;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  box-shadow: 0 0 20px rgba(252, 182, 159, 0.3);
  z-index: 10;
  overflow-y: auto;
  border-right: 4px solid rgba(255, 255, 255, 0.25);
  scrollbar-width: thin;
  scrollbar-color: rgba(251, 194, 235, 0.5) rgba(255, 255, 255, 0.1);
  transition: width 0.3s ease;
}

/* 滚动条样式 - Webkit浏览器 */
.sidebar::-webkit-scrollbar {
  width: 8px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  margin: 8px 0;
}

.sidebar::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #fbc2eb 0%, #a6c1ee 100%);
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: content-box;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #a18cd1 0%, #fbc2eb 100%);
  background-clip: content-box;
}

.sidebar-collapsed {
  width: 60px;
  overflow-x: hidden;
}

.sidebar-collapsed .logo h1 {
  display: none;
}

.sidebar-collapsed .logo-underline {
  width: 30px;
}

.collapse-btn {
  position: absolute;
  top: 20px;
  right: 10px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 20;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: scale(1.1);
}

.collapse-icon {
  font-size: 14px;
  color: #623b5a;
}

.sidebar-collapsed .menu-header {
  padding: 10px 0;
  justify-content: center;
  margin: 0;
}

.sidebar-collapsed .nav-link {
  padding: 10px 0;
  justify-content: center;
  margin: 3px 0;
}

.sidebar-collapsed .menu-section {
  align-items: center;
}

.sidebar-collapsed .external-link::after {
  display: none;
}

.logo {
  padding: 25px 15px 20px;
  text-align: center;
  position: relative;
}

.logo h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #623b5a;
  letter-spacing: 0.5px;
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.5);
}

.logo-underline {
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #a18cd1 0%, #fbc2eb 100%);
  border-radius: 10px;
  margin: 10px auto 0;
  box-shadow: 0 2px 4px rgba(161, 140, 209, 0.2);
}

.menu-section {
  margin-bottom: 15px;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: linear-gradient(90deg, rgba(255, 236, 210, 0.6) 0%, rgba(255, 227, 206, 0.6) 100%);
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  margin: 0 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.menu-header:hover {
  background: linear-gradient(90deg, rgba(251, 194, 235, 0.4) 0%, rgba(166, 193, 238, 0.4) 100%);
}

.menu-title {
  font-weight: 700;
  font-size: 1rem;
  color: #623b5a;
}

.menu-toggle {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
  color: #623b5a;
}

.menu-toggle-open {
  transform: rotate(180deg);
}

.home-nav {
  display: flex;
  flex-direction: column;
  padding: 5px 0;
}

.main-nav, .external-nav, .other-nav {
  display: flex;
  flex-direction: column;
  padding: 5px 0;
}

.nav-link {
  color: #623b5a;
  text-decoration: none;
  font-weight: 600;
  padding: 10px 15px;
  margin: 3px 8px;
  border-radius: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  background-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.external-link {
  position: relative;
}

.external-link::after {
  content: "↗";
  position: absolute;
  right: 10px;
  font-size: 0.9rem;
  opacity: 0.7;
}

.nav-icon {
  margin-right: 8px;
  font-size: 1.1rem;
  width: 20px;
  display: inline-block;
  text-align: center;
}

.nav-link:hover {
  background: linear-gradient(45deg, rgba(251, 194, 235, 0.4) 0%, rgba(166, 193, 238, 0.4) 100%);
  color: #5c3553;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
}

.router-link-active {
  background: linear-gradient(45deg, #fbc2eb 0%, #a6c1ee 100%);
  color: #fff;
  box-shadow: 0 4px 15px rgba(166, 193, 238, 0.3);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  border: none;
}

/* 加载状态样式 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  color: #623b5a;
  font-weight: 500;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(251, 194, 235, 0.3);
  border-radius: 50%;
  border-top-color: #fbc2eb;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误状态样式 */
.error-state, .empty-state {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  margin: 3px 8px;
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  color: #623b5a;
  font-weight: 500;
}

.content {
  flex: 1;
  margin-left: 280px;
  padding: 30px;
  background: #faf7fd;
  background-image: 
    radial-gradient(#fbc2eb 1px, transparent 1px),
    radial-gradient(#a6c1ee 1px, transparent 1px);
  background-size: 40px 40px;
  background-position: 0 0, 20px 20px;
  background-attachment: fixed;
  transition: margin-left 0.3s ease;
}

.content-expanded {
  margin-left: 60px;
}

main {
  max-width: 1200px;
  margin: 0 auto;
}

.sidebar-footer {
  padding: 15px;
  font-size: 0.8rem;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  color: #623b5a;
  margin-top: auto;
  font-weight: 500;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 全局按钮样式 */
button {
  background: linear-gradient(45deg, #fbc2eb 0%, #a6c1ee 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-family: 'Quicksand', Arial, sans-serif;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(166, 193, 238, 0.3);
  transition: all 0.3s ease;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(166, 193, 238, 0.4);
}

input, textarea, select {
  font-family: 'Quicksand', Arial, sans-serif;
  border-radius: 10px;
  border: 1px solid rgba(161, 140, 209, 0.2);
  transition: all 0.3s ease;
}

input:focus, textarea:focus, select:focus {
  border-color: #fbc2eb;
  box-shadow: 0 0 0 3px rgba(251, 194, 235, 0.25);
  outline: none;
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: rgba(250, 247, 253, 0.5);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, rgba(251, 194, 235, 0.7) 0%, rgba(166, 193, 238, 0.7) 100%);
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: content-box;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, rgba(251, 194, 235, 0.9) 0%, rgba(166, 193, 238, 0.9) 100%);
  background-clip: content-box;
}

::-webkit-scrollbar-corner {
  background: transparent;
}

@media (max-width: 768px) {
  .app {
    flex-direction: column;
  }
  
  .sidebar, .sidebar-collapsed {
    width: 100%;
    height: auto;
    position: relative;
    overflow-y: visible;
    border-right: none;
    border-bottom: 4px solid rgba(255, 255, 255, 0.25);
  }
  
  .collapse-btn {
    top: 25px;
    right: 20px;
  }
  
  .content, .content-expanded {
    margin-left: 0;
    padding: 20px;
  }
  
  main {
    padding: 20px;
  }
  
  .home-nav, .main-nav, .external-nav, .other-nav {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    padding: 5px;
  }
  
  .nav-link {
    padding: 8px 12px;
    margin: 3px;
    display: inline-block;
    font-size: 0.85rem;
  }
  
  .nav-link:hover {
    transform: translateY(-2px);
  }
  
  .logo-underline {
    width: 60px;
  }
  
  .external-link::after {
    display: none;
  }
  
  .menu-header {
    border-radius: 8px;
    margin: 0 5px;
  }
}
</style> 