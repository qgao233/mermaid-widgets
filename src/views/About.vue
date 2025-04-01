<template>
  <div class="about">
    <!-- 页头区域 -->
    <section class="page-header">
      <div class="header-background"></div>
      <div class="header-content">
        <h1>关于我</h1>
        <p class="breadcrumbs">首页 > 关于我</p>
      </div>
    </section>
    
    <div class="about-content">
      <!-- 介绍区域 -->
      <section class="intro-section">
        <div class="section-content">
          <div class="section-header">
            <h2>项目介绍</h2>
            <div class="section-divider"></div>
          </div>
          <div class="intro-grid">
            <div class="intro-text">
              <p>在线工具集是一个提供多种实用在线工具的门户网站，旨在为开发者和日常办公提供便捷的工具支持。我致力于打造简洁易用的工具平台，为用户提供高效的在线解决方案。</p>
              <p>我的宗旨是简化复杂工作流程，通过专业的在线工具帮助用户提高工作效率，让技术服务于创造。</p>
            </div>
            <div class="intro-image">
              <img src="https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="项目介绍图片">
            </div>
          </div>
        </div>
      </section>
      
      <!-- 工具列表区域 -->
      <section class="tools-section">
        <div class="section-content">
          <div class="section-header">
            <h2>我的工具</h2>
            <div class="section-divider"></div>
          </div>
          <div class="tools-list">
            <div class="tool-item">
              <div class="tool-icon">📊</div>
              <div class="tool-details">
                <h3>Excel格式化</h3>
                <p>将复杂的Excel公式转换为易读格式，帮助理解和调试公式。支持多种格式化选项，提升公式可读性。</p>
              </div>
            </div>
            
            <div class="tool-item">
              <div class="tool-icon">{}</div>
              <div class="tool-details">
                <h3>JSON格式化</h3>
                <p>美化、压缩和校验JSON数据，使其更易于阅读和编辑。支持语法高亮、结构折叠和错误检测功能。</p>
              </div>
            </div>
            
            <div class="tool-item">
              <div class="tool-icon">⟷</div>
              <div class="tool-details">
                <h3>文本对比</h3>
                <p>比较两段文本的差异，支持逐行对比和高亮显示。可快速识别插入、删除和修改的内容。</p>
              </div>
            </div>
            
            <div class="tool-item">
              <div class="tool-icon">🎨</div>
              <div class="tool-details">
                <h3>颜色选择器</h3>
                <p>便捷的颜色选择工具，支持RGB、HEX、HSL等多种格式转换。提供颜色方案生成，帮助设计和前端开发。</p>
              </div>
            </div>
            
            <div class="tool-item">
              <div class="tool-icon">🎬</div>
              <div class="tool-details">
                <h3>视频解析工具</h3>
                <p>多线路解析各大平台视频，提供流畅的视频播放体验。支持自动切换播放源，解决视频加载问题。</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 信任区域 -->
      <section class="trust-section">
        <div class="trust-background"></div>
        <div class="trust-content">
          <h2>为什么选择我</h2>
          <div class="trust-grid">
            <div class="trust-item">
              <div class="trust-icon">🔒</div>
              <h3>安全可靠</h3>
              <p>所有工具在浏览器本地运行，确保数据不会外泄</p>
            </div>
            <div class="trust-item">
              <div class="trust-icon">⚡</div>
              <h3>高效便捷</h3>
              <p>专注于简化流程，提供快速高效的解决方案</p>
            </div>
            <div class="trust-item">
              <div class="trust-icon">🛠️</div>
              <h3>专业工具</h3>
              <p>针对开发者和办公需求，提供专业级工具</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 联系我区域 -->
      <section class="contact-section">
        <div class="section-content">
          <div class="section-header">
            <h2>联系我</h2>
            <div class="section-divider"></div>
          </div>
          <p>如果您有任何问题、建议或合作意向，欢迎通过以下方式联系我：</p>
          
          <div class="contact-card">
            <div class="contact-item">
              <div class="contact-icon">📧</div>
              <div class="contact-details">
                <h3>电子邮件</h3>
                <a href="mailto:qgao233@163.com">qgao233@163.com</a>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 隐私说明区域 -->
      <section class="privacy-section">
        <div class="section-content">
          <div class="section-header">
            <h2>隐私说明</h2>
            <div class="section-divider"></div>
          </div>
          <div class="privacy-box">
            <p>所有工具均在您的浏览器中本地运行，不会将您的数据传输到服务器。我高度重视用户隐私和数据安全，确保您的信息不会被收集或共享。</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'About'
}
</script>

<style scoped>
.about {
  padding-bottom: 60px;
}

/* 页头区域 */
.page-header {
  position: relative;
  padding: 80px 0;
  text-align: center;
  margin-bottom: 60px;
  color: white;
  overflow: hidden;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('https://images.unsplash.com/photo-1505682750263-f3f9e519c565?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80');
  background-size: cover;
  background-position: center;
  filter: brightness(0.7);
  z-index: 1;
}

.header-content {
  position: relative;
  z-index: 1;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.breadcrumbs {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* 内容区域通用样式 */
.about-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-content {
  margin-bottom: 80px;
}

.section-header {
  margin-bottom: 30px;
  text-align: center;
}

h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  display: inline-block;
}

.section-divider {
  width: 80px;
  height: 3px;
  background-color: #3a6df0;
  margin: 0 auto;
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

p {
  color: #555;
  line-height: 1.6;
  margin-bottom: 16px;
  font-size: 1rem;
}

/* 介绍区域 */
.intro-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}

.intro-image img {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* 工具列表区域 */
.tools-list {
  display: grid;
  gap: 24px;
}

.tool-item {
  display: flex;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  padding: 30px;
  border: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.tool-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.1);
}

.tool-icon {
  width: 56px;
  height: 56px;
  background-color: #f5f5f5;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-right: 20px;
  flex-shrink: 0;
}

.tool-details {
  flex: 1;
}

.tool-details p {
  font-size: 0.9375rem;
  margin-bottom: 0;
}

/* 信任区域 */
.trust-section {
  position: relative;
  padding: 80px 0;
  margin: 60px 0;
  color: white;
  overflow: hidden;
}

.trust-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80');
  background-size: cover;
  background-position: center;
  filter: brightness(0.3);
  z-index: 1;
}

.trust-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.trust-content h2 {
  color: white;
  margin-bottom: 40px;
}

.trust-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.trust-item {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 30px 20px;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.trust-item:hover {
  transform: translateY(-5px);
  background-color: rgba(255, 255, 255, 0.15);
}

.trust-icon {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.trust-item h3 {
  color: white;
  margin-bottom: 12px;
}

.trust-item p {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0;
}

/* 联系区域 */
.contact-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  padding: 30px;
  border: none;
}

.contact-item {
  display: flex;
  align-items: center;
}

.contact-icon {
  width: 56px;
  height: 56px;
  background-color: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-right: 20px;
  flex-shrink: 0;
}

.contact-details {
  flex: 1;
}

.contact-details a {
  color: #3a6df0;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
}

.contact-details a:hover {
  text-decoration: underline;
}

/* 隐私说明区域 */
.privacy-box {
  background-color: #f5f5f5;
  border-radius: 12px;
  padding: 30px;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .page-header {
    padding: 60px 0;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .section-content {
    margin-bottom: 60px;
  }
  
  h2 {
    font-size: 1.75rem;
  }
  
  .intro-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .trust-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .trust-section {
    padding: 60px 0;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 40px 0;
  }
  
  .page-header h1 {
    font-size: 1.75rem;
  }
  
  .tool-item {
    flex-direction: column;
    padding: 20px;
  }
  
  .tool-icon {
    margin-bottom: 16px;
    margin-right: 0;
  }
  
  .contact-item {
    flex-direction: column;
    text-align: center;
  }
  
  .contact-icon {
    margin-bottom: 16px;
    margin-right: 0;
  }
}
</style> 