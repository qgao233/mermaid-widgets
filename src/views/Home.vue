<template>
  <div class="home">
    <div class="hero">
      <h2>欢迎使用<span class="gradient-text">实用工具箱</span></h2>
      <p class="subtitle">为开发者和日常办公提供便捷实用的在线工具</p>
    </div>
    
    <div class="tools-grid">
      <div class="tool-card" @click="goToTool('/tools/excel-formatter')">
        <div class="card-icon-wrapper excel-icon">
          <div class="card-icon">📊</div>
        </div>
        <h3>Excel公式格式化</h3>
        <p>格式化Excel公式，使其更易读易懂</p>
        <div class="card-shine"></div>
      </div>
      
      <div class="tool-card" @click="goToTool('/tools/json-formatter')">
        <div class="card-icon-wrapper json-icon">
          <div class="card-icon">{ }</div>
        </div>
        <h3>JSON格式化</h3>
        <p>美化、压缩和校验JSON数据</p>
        <div class="card-shine"></div>
      </div>
      
      <div class="tool-card" @click="goToTool('/tools/text-diff')">
        <div class="card-icon-wrapper diff-icon">
          <div class="card-icon">⟷</div>
        </div>
        <h3>文本对比</h3>
        <p>比较两段文本的差异</p>
        <div class="card-shine"></div>
      </div>
      
      <div class="tool-card" @click="goToTool('/tools/color-picker')">
        <div class="card-icon-wrapper color-icon">
          <div class="card-icon">🎨</div>
        </div>
        <h3>颜色选择器</h3>
        <p>颜色选择、转换与生成配色方案</p>
        <div class="card-shine"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: 'Home',
  setup() {
    const router = useRouter();
    
    const goToTool = (path) => {
      router.push(path);
    };
    
    return {
      goToTool
    };
  }
}
</script>

<style scoped>
.home {
  padding: 20px 0;
}

.hero {
  text-align: center;
  margin-bottom: 50px;
  position: relative;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 700;
}

.gradient-text {
  background: linear-gradient(90deg, #4b6cb7 0%, #1cb5e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 40px;
  font-size: 1.2rem;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.tool-card {
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.tool-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.card-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(75, 108, 183, 0.1) 0%, rgba(24, 40, 72, 0.1) 100%);
  position: relative;
}

.excel-icon {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(27, 94, 32, 0.1) 100%);
}

.json-icon {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(13, 71, 161, 0.1) 100%);
}

.diff-icon {
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(74, 20, 140, 0.1) 100%);
}

.color-icon {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(230, 81, 0, 0.1) 100%);
}

.card-icon {
  font-size: 2.5rem;
  position: relative;
  z-index: 2;
}

.excel-icon .card-icon {
  color: #43a047;
}

.json-icon .card-icon {
  color: #1976d2;
}

.diff-icon .card-icon {
  color: #9c27b0;
}

.color-icon .card-icon {
  color: #ff9800;
}

.card-icon-wrapper:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(135deg, #4b6cb7 0%, #1cb5e0 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: destination-out;
  mask-composite: exclude;
}

h3 {
  margin-bottom: 15px;
  color: #2c3e50;
  font-size: 1.4rem;
  font-weight: 600;
}

.tool-card p {
  color: #666;
  font-size: 1rem;
  line-height: 1.6;
}

.card-shine {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    125deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0) 40%,
    rgba(255, 255, 255, 0.3) 45%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0) 55%,
    rgba(255, 255, 255, 0) 100%
  );
  transition: all 1s cubic-bezier(0.645, 0.045, 0.355, 1);
  transform: translateX(-100%);
  pointer-events: none;
}

.tool-card:hover .card-shine {
  transform: translateX(100%);
}

@media (max-width: 768px) {
  .tools-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
  }
  
  .card-icon-wrapper {
    width: 70px;
    height: 70px;
  }
  
  .tool-card {
    padding: 25px;
  }
  
  h2 {
    font-size: 2.2rem;
  }
}
</style> 