<template>
  <div class="home">
    <!-- Banner区域 -->
    <section class="banner">
      <div class="banner-background"></div>
      <div class="banner-content">
        <h1>在线工具集</h1>
        <p class="subtitle">为开发者和日常办公提供便捷实用的在线工具</p>
        <!-- <div class="search-box">
          <input type="text" placeholder="搜索工具..." v-model="searchQuery">
          <button type="button">搜索</button>
        </div> -->
      </div>
    </section>
    
    <!-- 热门工具区域 -->
    <section class="tools-section">
      <div class="section-header">
        <h2>热门工具</h2>
        <p>精选高效实用的开发工具</p>
      </div>
      
      <div class="tools-grid">
        <router-link to="/tools/json-formatter" class="tool-card">
          <div class="tool-icon">{}</div>
          <div class="tool-content">
            <h3>JSON格式化</h3>
            <p>美化、压缩和校验JSON数据</p>
          </div>
          <div class="tool-image code-image"></div>
        </router-link>
        
        <router-link to="/tools/excel-formatter" class="tool-card">
          <div class="tool-icon">📊</div>
          <div class="tool-content">
            <h3>Excel格式化</h3>
            <p>格式化Excel公式，使其更易读易懂</p>
          </div>
          <div class="tool-image data-image"></div>
        </router-link>
        
        <router-link to="/tools/text-diff" class="tool-card">
          <div class="tool-icon">⟷</div>
          <div class="tool-content">
            <h3>文本对比</h3>
            <p>比较两段文本的差异</p>
          </div>
          <div class="tool-image text-image"></div>
        </router-link>
      </div>
    </section>
    
    <!-- 金融工具区域 -->
    <section class="tools-section">
      <div class="section-header">
        <h2>金融工具</h2>
        <p>股票分析与投资辅助工具</p>
      </div>
      
      <div class="tools-grid">
        <router-link to="/tools/stock/stock-recommender" class="tool-card">
          <div class="tool-icon">📈</div>
          <div class="tool-content">
            <h3>股票推荐工具</h3>
            <p>基于新闻热点和技术分析的股票推荐</p>
          </div>
          <div class="tool-image finance-image"></div>
        </router-link>
      </div>
    </section>
    
    <!-- 色彩工具区域 -->
    <section class="tools-section">
      <div class="section-header">
        <h2>色彩工具</h2>
        <p>帮助设计和开发的色彩相关工具</p>
      </div>
      
      <div class="tools-grid">
        <router-link to="/tools/color-picker" class="tool-card">
          <div class="tool-icon">🎨</div>
          <div class="tool-content">
            <h3>颜色选择器</h3>
            <p>颜色选择、转换与生成配色方案</p>
          </div>
          <div class="tool-image color-image"></div>
        </router-link>
      </div>
    </section>
    
    <!-- 媒体工具区域 -->
    <section class="tools-section">
      <div class="section-header">
        <h2>媒体工具</h2>
        <p>视频与媒体处理相关工具</p>
      </div>
      
      <div class="tools-grid">
        <router-link to="/tools/video-parser" class="tool-card">
          <div class="tool-icon">🎬</div>
          <div class="tool-content">
            <h3>视频解析工具</h3>
            <p>多线路解析各大平台视频</p>
          </div>
          <div class="tool-image video-image"></div>
        </router-link>
      </div>
    </section>
    
    <!-- 通信工具区域 -->
    <section class="tools-section">
      <div class="section-header">
        <h2>通信工具</h2>
        <p>实时聊天与通信相关工具</p>
      </div>
      
      <div class="tools-grid">
        <router-link to="/tools/chat/chat" class="tool-card">
          <div class="tool-icon">💬</div>
          <div class="tool-content">
            <h3>实时聊天室</h3>
            <p>基于Supabase的实时聊天工具</p>
          </div>
          <div class="tool-image chat-image"></div>
        </router-link>
      </div>
    </section>
    
    <!-- 底部图片区域 -->
    <section class="bottom-image-section">
      <div class="overlay"></div>
      <div class="content">
        <h2>高效工具，简化工作</h2>
        <p>我致力于提供专业、便捷的在线工具，助您提高工作效率</p>
      </div>
    </section>
  </div>
</template>

<script>

export default {
  name: 'Home',
  data() {
    return {
      searchQuery: ''
    }
  },
}
</script>

<style scoped>
.home {
  padding-bottom: 0;
}

/* Banner区域 */
.banner {
  position: relative;
  padding: 100px 0;
  text-align: center;
  margin-bottom: 60px;
  overflow: hidden;
  color: white;
}

.banner-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('https://images.unsplash.com/photo-1483817101829-339b08e8d83f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80');
  background-size: cover;
  background-position: center;
  filter: brightness(0.7);
  z-index: 1;
}

.banner-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

h1 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.subtitle {
  font-size: 1.25rem;
  margin-bottom: 32px;
  line-height: 1.5;
  color: #fff;
  /* text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); */
}

.search-box {
  display: flex;
  max-width: 500px;
  margin: 0 auto;
}

.search-box input {
  flex: 1;
  height: 50px;
  padding: 0 20px;
  border: none;
  border-radius: 4px 0 0 4px;
  font-size: 1rem;
  outline: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-box button {
  height: 50px;
  padding: 0 30px;
  background-color: #3a6df0;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-box button:hover {
  background-color: #2952cc;
}

/* 工具区域 */
.tools-section {
  margin-bottom: 80px;
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-header h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.section-header p {
  font-size: 1.125rem;
  color: #666;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.tool-card {
  position: relative;
  display: flex;
  align-items: center;
  padding: 30px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-decoration: none;
  color: inherit;
  border: none;
  overflow: hidden;
  z-index: 1;
}

.tool-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.1);
}

.tool-image {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 40%;
  background-size: cover;
  background-position: center;
  opacity: 0.15;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.tool-card:hover .tool-image {
  opacity: 0.25;
}

.code-image {
  background-image: url('https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80');
}

.data-image {
  background-image: url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80');
}

.text-image {
  background-image: url('https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80');
}

.color-image {
  background-image: url('https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80');
}

.video-image {
  background-image: url('https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80');
}

.chat-image {
  background-image: url('https://images.unsplash.com/photo-1577563908411-5077b6dc7624?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80');
}

.tool-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  font-size: 1.75rem;
  background-color: #f5f5f5;
  border-radius: 12px;
  margin-right: 20px;
  flex-shrink: 0;
  z-index: 2;
}

.tool-content {
  flex: 1;
  z-index: 2;
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

p {
  font-size: 0.9375rem;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

/* 底部图片区域 */
.bottom-image-section {
  position: relative;
  height: 300px;
  background-image: url('https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
}

.bottom-image-section .overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1;
}

.bottom-image-section .content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  padding: 0 20px;
}

.bottom-image-section h2 {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: white;
}

.bottom-image-section p {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
}

@media (max-width: 768px) {
  .banner {
    padding: 80px 0;
  }
  
  h1 {
    font-size: 2.5rem;
  }
  
  .subtitle {
    font-size: 1.125rem;
  }
  
  .section-header h2 {
    font-size: 1.75rem;
  }
  
  .section-header p {
    font-size: 1rem;
  }
  
  .bottom-image-section {
    height: 250px;
  }
  
  .bottom-image-section h2 {
    font-size: 1.75rem;
  }
  
  .bottom-image-section p {
    font-size: 1.125rem;
  }
}

@media (max-width: 480px) {
  .banner {
    padding: 60px 0;
  }
  
  h1 {
    font-size: 2rem;
  }
  
  .search-box {
    flex-direction: column;
  }
  
  .search-box input {
    border-radius: 4px;
    margin-bottom: 12px;
  }
  
  .search-box button {
    border-radius: 4px;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .tool-image {
    width: 30%;
  }
  
  .bottom-image-section {
    height: 200px;
    background-attachment: scroll;
  }
  
  .bottom-image-section h2 {
    font-size: 1.5rem;
  }
  
  .bottom-image-section p {
    font-size: 1rem;
  }
}

/* 金融工具背景 */
.finance-image {
  background-image: url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80');
}
</style> 