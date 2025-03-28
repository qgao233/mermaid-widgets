<template>
  <div class="app">
    <div class="sidebar">
      <div class="logo">
        <h1>实用工具箱</h1>
        <div class="logo-underline"></div>
      </div>
      <nav class="main-nav">
        <router-link to="/" class="nav-link">
          <span class="nav-icon">🏠</span>
          <span>首页</span>
        </router-link>
        <router-link to="/tools/excel-formatter" class="nav-link">
          <span class="nav-icon">📊</span>
          <span>Excel公式格式化</span>
        </router-link>
        <router-link to="/tools/json-formatter" class="nav-link">
          <span class="nav-icon">{}</span>
          <span>JSON格式化</span>
        </router-link>
        <router-link to="/tools/text-diff" class="nav-link">
          <span class="nav-icon">⟷</span>
          <span>文本对比</span>
        </router-link>
        <router-link to="/tools/color-picker" class="nav-link">
          <span class="nav-icon">🎨</span>
          <span>颜色选择器</span>
        </router-link>
        <router-link to="/about" class="nav-link">
          <span class="nav-icon">ℹ️</span>
          <span>关于</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <p>© 2025 实用工具箱</p>
      </div>
    </div>
    <div class="content">
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
export default {
  name: 'App'
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Poppins', Arial, sans-serif;
  line-height: 1.6;
  background-color: #f0f2f5;
  height: 100vh;
  color: #333;
}

.app {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 280px;
  background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.logo {
  padding: 25px 20px;
  text-align: center;
  position: relative;
}

.logo h1 {
  font-size: 1.6rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.5px;
}

.logo-underline {
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #ff9a9e 0%, #fad0c4 100%);
  border-radius: 2px;
  margin: 8px auto 0;
}

.main-nav {
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  flex-grow: 1;
}

.nav-link {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-weight: 500;
  padding: 12px 20px;
  margin: 4px 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.nav-icon {
  margin-right: 10px;
  font-size: 1.2rem;
  width: 24px;
  display: inline-block;
  text-align: center;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  transform: translateX(5px);
}

.router-link-active {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
  color: #fff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.content {
  flex: 1;
  margin-left: 280px;
  padding: 30px;
  background-color: #f0f2f5;
}

main {
  max-width: 1200px;
  margin: 0 auto;
}

.sidebar-footer {
  padding: 15px;
  font-size: 0.8rem;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
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

@media (max-width: 768px) {
  .app {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
  }
  
  .content {
    margin-left: 0;
  }
  
  .main-nav {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    padding: 10px;
  }
  
  .nav-link {
    padding: 8px 15px;
    margin: 5px;
    display: inline-block;
  }
  
  .nav-link:hover {
    transform: translateX(0) translateY(-2px);
  }
  
  .logo-underline {
    display: none;
  }
}
</style> 