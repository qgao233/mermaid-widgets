<template>
  <div class="app">
    <header class="header">
      <div class="container header-container">
        <div class="logo">
          <router-link to="/">
            <span class="logo-icon">⚙️</span>
            <span class="logo-text">工具集</span>
          </router-link>
        </div>
        
        <nav class="main-nav">
          <router-link to="/" class="nav-item">首页</router-link>
          
          <div class="nav-item" @click="toggleDropdown('tools')">
            <span>工具</span>
            <span class="dropdown-icon" :class="{ 'dropdown-open': dropdowns.tools }">▾</span>
            
            <div class="dropdown-menu" v-show="dropdowns.tools">
              <router-link to="/tools/excel-formatter" class="dropdown-item">
                <span class="item-icon">📊</span>
                <span>Excel格式化</span>
              </router-link>
              <router-link to="/tools/json-formatter" class="dropdown-item">
                <span class="item-icon">{}</span>
                <span>JSON格式化</span>
              </router-link>
              <router-link to="/tools/text-diff" class="dropdown-item">
                <span class="item-icon">⟷</span>
                <span>文本对比</span>
              </router-link>
              <router-link to="/tools/color-picker" class="dropdown-item">
                <span class="item-icon">🎨</span>
                <span>颜色选择器</span>
              </router-link>
              <router-link to="/tools/video-parser" class="dropdown-item">
                <span class="item-icon">🎬</span>
                <span>视频解析</span>
              </router-link>
              <router-link to="/tools/chat" class="dropdown-item">
                <span class="item-icon">💬</span>
                <span>实时聊天</span>
              </router-link>
            </div>
          </div>
          
          <div class="nav-item" @click="toggleDropdown('resources')">
            <span>资源</span>
            <span class="dropdown-icon" :class="{ 'dropdown-open': dropdowns.resources }">▾</span>
            
            <div class="dropdown-menu" v-show="dropdowns.resources">
              <template v-if="loadingExternalTools">
                <div class="dropdown-item disabled">
                  <span>加载中...</span>
                </div>
              </template>
              <template v-else-if="externalToolsError">
                <div class="dropdown-item disabled">
                  <span>{{ externalToolsError }}</span>
                </div>
              </template>
              <template v-else-if="externalTools.length === 0">
                <div class="dropdown-item disabled">
                  <span>暂无外部资源</span>
                </div>
              </template>
              <template v-else>
                <a v-for="tool in externalTools" 
                   :key="tool.id" 
                   :href="tool.url" 
                   target="_blank" 
                   class="dropdown-item external">
                  <span class="item-icon">{{ tool.icon }}</span>
                  <span>{{ tool.name }}</span>
                  <span class="external-indicator">↗</span>
                </a>
              </template>
            </div>
          </div>
          
          <router-link to="/about" class="nav-item">关于</router-link>
        </nav>
        
        <button class="mobile-menu-toggle" @click="mobileMenuOpen = !mobileMenuOpen">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
    
    <div class="mobile-menu" v-show="mobileMenuOpen">
      <div class="container">
        <router-link to="/" class="mobile-nav-item" @click="mobileMenuOpen = false">首页</router-link>
        
        <div class="mobile-dropdown">
          <div class="mobile-nav-item" @click="toggleMobileDropdown('tools')">
            <span>工具</span>
            <span class="dropdown-icon" :class="{ 'dropdown-open': mobileDropdowns.tools }">▾</span>
          </div>
          <div class="mobile-dropdown-items" v-show="mobileDropdowns.tools">
            <router-link to="/tools/excel-formatter" class="mobile-dropdown-item" @click="mobileMenuOpen = false">
              <span class="item-icon">📊</span>
              <span>Excel格式化</span>
            </router-link>
            <router-link to="/tools/json-formatter" class="mobile-dropdown-item" @click="mobileMenuOpen = false">
              <span class="item-icon">{}</span>
              <span>JSON格式化</span>
            </router-link>
            <router-link to="/tools/text-diff" class="mobile-dropdown-item" @click="mobileMenuOpen = false">
              <span class="item-icon">⟷</span>
              <span>文本对比</span>
            </router-link>
            <router-link to="/tools/color-picker" class="mobile-dropdown-item" @click="mobileMenuOpen = false">
              <span class="item-icon">🎨</span>
              <span>颜色选择器</span>
            </router-link>
            <router-link to="/tools/video-parser" class="mobile-dropdown-item" @click="mobileMenuOpen = false">
              <span class="item-icon">🎬</span>
              <span>视频解析</span>
            </router-link>
          </div>
        </div>
        
        <div class="mobile-dropdown">
          <div class="mobile-nav-item" @click="toggleMobileDropdown('resources')">
            <span>资源</span>
            <span class="dropdown-icon" :class="{ 'dropdown-open': mobileDropdowns.resources }">▾</span>
          </div>
          <div class="mobile-dropdown-items" v-show="mobileDropdowns.resources">
            <template v-if="loadingExternalTools">
              <div class="mobile-dropdown-item disabled">加载中...</div>
            </template>
            <template v-else-if="externalToolsError">
              <div class="mobile-dropdown-item disabled">{{ externalToolsError }}</div>
            </template>
            <template v-else-if="externalTools.length === 0">
              <div class="mobile-dropdown-item disabled">暂无外部资源</div>
            </template>
            <template v-else>
              <a v-for="tool in externalTools" 
                 :key="tool.id" 
                 :href="tool.url" 
                 target="_blank" 
                 class="mobile-dropdown-item external" 
                 @click="mobileMenuOpen = false">
                <span class="item-icon">{{ tool.icon }}</span>
                <span>{{ tool.name }}</span>
                <span class="external-indicator">↗</span>
              </a>
            </template>
          </div>
        </div>
        
        <router-link to="/about" class="mobile-nav-item" @click="mobileMenuOpen = false">关于</router-link>
      </div>
    </div>
    
    <main class="main-content">
      <div class="container">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
    
    <footer class="footer">
      <div class="footer-background"></div>
      <div class="footer-wrapper">
        <div class="footer-content">
          <div class="footer-section">
            <h3>工具集</h3>
            <p>为开发者和日常办公提供便捷实用的在线工具</p>
            <div class="social-icons">
              <a href="#" class="social-icon">📱</a>
              <a href="#" class="social-icon">📧</a>
              <a href="#" class="social-icon">🔗</a>
            </div>
          </div>
          
          <div class="footer-section">
            <h3>热门工具</h3>
            <ul class="footer-links">
              <li><router-link to="/tools/json-formatter">JSON格式化</router-link></li>
              <li><router-link to="/tools/excel-formatter">Excel格式化</router-link></li>
              <li><router-link to="/tools/text-diff">文本对比</router-link></li>
              <li><router-link to="/tools/color-picker">颜色选择器</router-link></li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h3>关于我</h3>
            <ul class="footer-links">
              <li><router-link to="/about">关于我</router-link></li>
              <li><a href="mailto:qgao233@163.com">联系我</a></li>
            </ul>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>© 2025 工具集 | 所有工具均在浏览器本地运行，保障数据安全</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { getExternalTools } from './utils/supabase';

export default {
  name: 'App',
  data() {
    return {
      dropdowns: {
        tools: false,
        resources: false
      },
      mobileDropdowns: {
        tools: false,
        resources: false
      },
      mobileMenuOpen: false,
      externalTools: [],
      loadingExternalTools: false,
      externalToolsError: null
    };
  },
  created() {
    this.fetchExternalTools();
    document.addEventListener('click', this.closeDropdowns);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeDropdowns);
  },
  methods: {
    toggleDropdown(name) {
      // 防止事件冒泡导致立即被closeDropdowns关闭
      event.stopPropagation();
      
      // 先关闭所有下拉菜单
      Object.keys(this.dropdowns).forEach(key => {
        if (key !== name) this.dropdowns[key] = false;
      });
      
      // 切换当前下拉菜单
      this.dropdowns[name] = !this.dropdowns[name];
    },
    toggleMobileDropdown(name) {
      this.mobileDropdowns[name] = !this.mobileDropdowns[name];
    },
    closeDropdowns(event) {
      // 当点击在下拉菜单外部时关闭所有下拉菜单
      if (!event.target.closest('.nav-item')) {
        Object.keys(this.dropdowns).forEach(key => {
          this.dropdowns[key] = false;
        });
      }
    },
    async fetchExternalTools() {
      try {
        this.loadingExternalTools = true;
        this.externalToolsError = null;
        this.externalTools = await getExternalTools();
      } catch (error) {
        console.error('获取外链工具失败:', error);
        this.externalToolsError = '加载失败';
      } finally {
        this.loadingExternalTools = false;
      }
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
  background-color: #f9f9f9;
  color: #333;
  min-height: 100vh;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  background: #faf7fd;
  background-image: 
    radial-gradient(#fbc2eb 1px, transparent 1px),
    radial-gradient(#a6c1ee 1px, transparent 1px);
  background-size: 40px 40px;
  background-position: 0 0, 20px 20px;
  background-attachment: fixed;
}

.container {
  width: 100%;
  margin: 0 auto;
}

/* 顶部导航 */
.header {
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  max-width: 1200px;
}

.logo a {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-icon {
  font-size: 1.5rem;
  margin-right: 8px;
}

.logo-text {
  font-size: 1.35rem;
  font-weight: 600;
  color: #333;
  background: linear-gradient(135deg, #3a6df0, #8a54ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.main-nav {
  display: flex;
  align-items: center;
}

.nav-item {
  position: relative;
  margin-left: 30px;
  padding: 8px 12px;
  color: #555;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 4px;
  text-decoration: none;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
}

.nav-item:hover {
  color: #3a6df0;
}

.dropdown-icon {
  font-size: 1rem;
  margin-left: 4px;
  transition: transform 0.2s;
}

.dropdown-open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 200px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  margin-top: 10px;
  z-index: 10;
  overflow: hidden;
  transform-origin: top;
  animation: dropdown 0.2s ease;
}

@keyframes dropdown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #555;
  font-size: 0.9rem;
  text-decoration: none;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f5f5f5;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
  color: #3a6df0;
}

.dropdown-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.item-icon {
  margin-right: 10px;
  font-size: 1.1rem;
  min-width: 20px;
  text-align: center;
}

.external-indicator {
  font-size: 0.7rem;
  margin-left: 5px;
  opacity: 0.6;
}

.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  background: transparent;
  border: none;
  cursor: pointer;
}

.mobile-menu-toggle span {
  display: block;
  width: 100%;
  height: 2px;
  background-color: #333;
  transition: transform 0.2s;
}

/* 移动菜单 */
.mobile-menu {
  display: none;
  background-color: #fff;
  padding: 20px 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.mobile-nav-item {
  display: block;
  padding: 12px 0;
  color: #333;
  text-decoration: none;
  font-size: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.mobile-dropdown {
  border-bottom: 1px solid #f0f0f0;
}

.mobile-dropdown-items {
  padding-left: 16px;
}

.mobile-dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  color: #555;
  text-decoration: none;
}

.mobile-dropdown-item.disabled {
  opacity: 0.6;
}

/* 主内容区 */
.main-content {
  flex: 1;
  padding-bottom: 0;
}

/* 页脚 */
.footer {
  position: relative;
  background-color: #222;
  padding: 60px 0 20px;
  margin-top: 60px;
  color: #fff;
  overflow: hidden;
}

.footer-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('https://images.unsplash.com/photo-1516116216624-53e697fedbea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80');
  background-size: cover;
  background-position: center;
  opacity: 0.1;
  z-index: 0;
}

.footer-wrapper {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.footer-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 20px;
  position: relative;
  padding-bottom: 10px;
}

.footer-section h3:after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px;
  width: 40px;
  background: linear-gradient(90deg, #3a6df0, #8a54ff);
}

.footer-section p {
  color: #aaa;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.social-icons {
  display: flex;
  gap: 12px;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  font-size: 1.1rem;
  color: #fff;
  text-decoration: none;
  transition: background-color 0.2s;
}

.social-icon:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.footer-links {
  list-style: none;
}

.footer-links li {
  margin-bottom: 10px;
}

.footer-links a {
  color: #aaa;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #3a6df0;
}

.footer-bottom {
  position: relative;
  z-index: 1;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.8rem;
  color: #777;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-nav {
    display: none;
  }
  
  .mobile-menu-toggle {
    display: flex;
  }
  
  .mobile-menu {
    display: block;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}
</style> 