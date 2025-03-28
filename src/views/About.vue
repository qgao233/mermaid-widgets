<template>
  <div class="about">
    <div class="about-content">
      <div class="header-section">
        <h2>关于<span class="gradient-text">实用工具箱</span></h2>
        <div class="header-underline"></div>
      </div>
      <p class="intro-text">实用工具箱是一个集合多种实用在线工具的网站，旨在为开发者和日常办公提供便捷的工具支持。</p>
      
      <div class="section">
        <h3><span class="section-icon">🛠️</span> 我们的工具</h3>
        <ul class="tool-list">
          <li>
            <div class="tool-item">
              <div class="tool-icon excel">📊</div>
              <div class="tool-details">
                <strong>Excel公式格式化</strong>
                <p>将复杂的Excel公式转换为易读格式，帮助理解和调试公式</p>
              </div>
            </div>
          </li>
          <li>
            <div class="tool-item">
              <div class="tool-icon json">{ }</div>
              <div class="tool-details">
                <strong>JSON格式化</strong>
                <p>美化、压缩和校验JSON数据，使其更易于阅读和编辑</p>
              </div>
            </div>
          </li>
          <li>
            <div class="tool-item">
              <div class="tool-icon diff">⟷</div>
              <div class="tool-details">
                <strong>文本对比</strong>
                <p>比较两段文本的差异，支持逐行对比和高亮显示</p>
              </div>
            </div>
          </li>
          <li>
            <div class="tool-item">
              <div class="tool-icon color">🎨</div>
              <div class="tool-details">
                <strong>颜色选择器</strong>
                <p>便捷的颜色选择工具，支持RGB、HEX、HSL等多种格式转换</p>
              </div>
            </div>
          </li>
        </ul>
      </div>
      
      <div class="section">
        <h3><span class="section-icon">✉️</span> 联系我们</h3>
        <p>如果您有任何问题、建议或合作意向，请通过以下方式联系我们：</p>
        <div class="contact-card">
          <div class="contact-icon">📧</div>
          <div class="contact-info">
            <strong>邮箱：</strong>
            <span>contact@utilbox.example.com</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h3><span class="section-icon">🔒</span> 隐私声明</h3>
        <div class="privacy-box">
          <p>我们所有的工具均在您的浏览器中本地运行，不会将您的数据传输到服务器。我们重视您的隐私和数据安全。</p>
        </div>
      </div>
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
  padding: 20px 0;
}

.about-content {
  background-color: #fff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.header-section {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
}

h2 {
  font-size: 2.2rem;
  margin-bottom: 15px;
  color: #2c3e50;
  font-weight: 700;
}

.gradient-text {
  background: linear-gradient(90deg, #4b6cb7 0%, #1cb5e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.header-underline {
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #4b6cb7 0%, #1cb5e0 100%);
  border-radius: 2px;
  margin: 0 auto;
}

.intro-text {
  margin-bottom: 40px;
  line-height: 1.8;
  color: #555;
  font-size: 1.1rem;
  text-align: center;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.section {
  margin-bottom: 40px;
}

h3 {
  margin: 25px 0 20px;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.section-icon {
  margin-right: 10px;
  font-size: 1.4rem;
}

p {
  margin-bottom: 15px;
  line-height: 1.6;
  color: #555;
}

.tool-list {
  list-style: none;
  padding: 0;
}

.tool-item {
  display: flex;
  margin-bottom: 20px;
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.tool-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.tool-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  margin-right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.excel {
  background-color: rgba(76, 175, 80, 0.1);
  color: #43a047;
}

.json {
  background-color: rgba(33, 150, 243, 0.1);
  color: #1976d2;
}

.diff {
  background-color: rgba(156, 39, 176, 0.1);
  color: #9c27b0;
}

.color {
  background-color: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.tool-details {
  flex: 1;
}

.tool-details strong {
  display: block;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 5px;
  color: #2c3e50;
}

.tool-details p {
  margin: 0;
  color: #666;
}

.contact-card {
  display: flex;
  align-items: center;
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  margin-top: 15px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.contact-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba(75, 108, 183, 0.1);
  color: #4b6cb7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-right: 20px;
  flex-shrink: 0;
}

.contact-info strong {
  font-weight: 600;
  color: #2c3e50;
}

.privacy-box {
  background: linear-gradient(135deg, rgba(75, 108, 183, 0.05) 0%, rgba(28, 181, 224, 0.05) 100%);
  border: 1px solid rgba(75, 108, 183, 0.1);
  border-radius: 12px;
  padding: 25px;
  margin-top: 15px;
  position: relative;
}

.privacy-box p {
  margin: 0;
}

@media (max-width: 768px) {
  .about-content {
    padding: 25px;
  }
  
  h2 {
    font-size: 1.8rem;
  }
  
  h3 {
    font-size: 1.3rem;
  }
  
  .tool-item {
    padding: 15px;
  }
  
  .tool-icon {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
    margin-right: 15px;
  }
}
</style> 