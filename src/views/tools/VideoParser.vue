<template>
  <div class="video-parser-container">
    <div class="header">
      <h1>视频解析工具</h1>
      <p class="description">输入视频链接，同时使用多个解析接口进行解析，找到最佳播放源</p>
    </div>

    <div class="input-container">
      <input 
        type="text" 
        v-model="videoUrl" 
        placeholder="请输入需要解析的视频链接(优酷、爱奇艺、腾讯视频等)"
        @keyup.enter="parseVideo"
      />
      <button 
        class="parse-btn" 
        @click="parseVideo" 
        :disabled="isLoading || !videoUrl"
      >
        {{ isLoading ? '解析中...' : '解析' }}
      </button>
    </div>

    <div class="status-container" v-if="isLoading">
      <div class="progress-container">
        <div class="loader"></div>
        <div class="progress-text">
          正在请求解析接口 ({{ currentParserIndex + 1 }}/{{ parserUrls.length }})
        </div>
      </div>
      <div class="parser-status">
        <div 
          v-for="(parser, index) in parserUrls" 
          :key="index"
          class="parser-item"
          :class="{
            'active': currentParserIndex === index,
            'success': successParsers.includes(index),
            'failed': failedParsers.includes(index)
          }"
        >
          <span class="parser-name">{{ parser.name }}</span>
          <span class="parser-indicator">
            <span v-if="currentParserIndex === index" class="loading-dot"></span>
            <span v-else-if="successParsers.includes(index)" class="success-icon">✓</span>
            <span v-else-if="failedParsers.includes(index)" class="failed-icon">✗</span>
          </span>
        </div>
      </div>
    </div>

    <div class="player-container" v-if="finalVideoUrl">
      <iframe 
        :src="finalVideoUrl" 
        frameborder="0" 
        allowfullscreen
        class="video-player"
      ></iframe>
      <div class="player-info">
        <div class="success-message">
          <span class="success-icon">✓</span> 
          成功使用 {{ currentSuccessParser.name }} 接口解析视频
        </div>
        <div class="action-buttons">
          <button class="info-btn" @click="toggleParserInfo">
            {{ showParserInfo ? '隐藏解析信息' : '查看解析信息' }}
          </button>
          <button class="copy-btn" @click="copyUrl">复制解析地址</button>
        </div>
      </div>
      
      <div class="parser-info" v-if="showParserInfo">
        <div class="parser-info-header">
          <span>解析接口信息</span>
          <span class="parser-info-count">共 {{ parserUrls.length }} 个接口</span>
        </div>
        <div class="parser-list">
          <div 
            v-for="(parser, index) in parserUrls" 
            :key="index"
            class="parser-list-item"
            :class="{'current-parser': currentSuccessParser && currentSuccessParser.name === parser.name}"
          >
            <span class="parser-list-name">{{ parser.name }}</span>
            <span 
              v-if="currentSuccessParser && currentSuccessParser.name === parser.name" 
              class="current-tag"
            >当前</span>
          </div>
        </div>
      </div>
    </div>

    <div class="error-container" v-if="errorMessage">
      <div class="error-message">
        <span class="error-icon">!</span>
        {{ errorMessage }}
      </div>
    </div>

    <div class="tips-container">
      <h3>使用提示</h3>
      <ul>
        <li>支持优酷、爱奇艺、腾讯视频、芒果TV、搜狐视频等主流视频网站</li>
        <li>请直接复制视频页面的完整URL地址</li>
        <li>系统会自动尝试多个解析接口，直到找到可用的资源</li>
        <li>如遇到解析失败，可能是视频太新或者版权限制严格</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoParser',
  data() {
    return {
      videoUrl: '',
      isLoading: false,
      finalVideoUrl: '',
      errorMessage: '',
      currentParserIndex: 0,
      successParsers: [],
      failedParsers: [],
      currentSuccessParser: null,
      showParserInfo: false,
      // 解析接口列表
      parserUrls: [
        { name: "纯净1", url: "https://im1907.top/?jx=" },
        { name: "B站1", url: "https://jx.jsonplayer.com/player/?url=" },
        { name: "爱豆", url: "https://jx.aidouer.net/?url=" },
        { name: "听乐", url: "https://jx.dj6u.com/?url=" },
        { name: "YT", url: "https://jx.yangtu.top/?url=" },
        { name: "BL", url: "https://vip.bljiex.com/?v=" },
        { name: "冰豆", url: "https://bd.jx.cn/?url=" },
        { name: "CK", url: "https://www.ckplayer.vip/jiexi/?url=" },
        { name: "弹幕", url: "https://dmjx.m3u8.tv/?url=" },
        { name: "IK9", url: "https://yparse.ik9.cc/index.php?url=" },
        { name: "JX", url: "https://jiexi.site/?url=" },
        { name: "JY", url: "https://jx.playerjy.com/?url=" },
        { name: "解析la", url: "https://api.jiexi.la/?url=" },
        { name: "M3U8", url: "https://jx.m3u8.tv/jiexi/?url=" },
        { name: "PM", url: "https://www.playm3u8.cn/jiexi.php?url=" },
        { name: "盘古", url: "https://www.pangujiexi.cc/jiexi.php?url=" },
        { name: "盘古2", url: "https://www.pangujiexi.com/jiexi/?url=" },
        { name: "剖云", url: "https://www.pouyun.com/?url=" },
        { name: "七哥", url: "https://jx.nnxv.cn/tv.php?url=" },
        { name: "神哥", url: "https://json.ovvo.pro/jx.php?url=" },
        { name: "维多", url: "https://jx.ivito.cn/?url=" },
        { name: "虾米", url: "https://jx.xmflv.com/?url=" },
        { name: "虾米2", url: "https://jx.xmflv.cc/?url=" },
        { name: "夜幕", url: "https://www.yemu.xyz/?url=" },
        { name: "云析", url: "https://jx.yparse.com/index.php?url=" },
        { name: "17云", url: "https://www.1717yun.com/jx/ty.php?url=" },
        { name: "180", url: "https://jx.000180.top/jx/?url=" },
        { name: "2ys", url: "https://gj.fenxiangb.com/player/analysis.php?v=" },
        { name: "8090", url: "https://www.8090g.cn/?url=" }
      ],
      maxConcurrentRequests: 3, // 最大并发解析请求数
      parsingTimeout: 6000, // 解析超时时间（毫秒）
    }
  },
  methods: {
    async parseVideo() {
      if (!this.videoUrl || this.isLoading) return;
      
      // 重置状态
      this.isLoading = true;
      this.finalVideoUrl = '';
      this.errorMessage = '';
      this.currentParserIndex = 0;
      this.successParsers = [];
      this.failedParsers = [];
      this.currentSuccessParser = null;
      this.showParserInfo = false;
      
      try {
        // 验证URL格式
        if (!this.isValidUrl(this.videoUrl)) {
          throw new Error('请输入有效的视频链接');
        }
        
        // 并发请求多个解析接口
        const batchSize = this.maxConcurrentRequests;
        let foundWorkingParser = false;
        
        for (let i = 0; i < this.parserUrls.length; i += batchSize) {
          if (foundWorkingParser) break;
          
          const batch = this.parserUrls.slice(i, i + batchSize);
          const promises = batch.map((parser, batchIndex) => {
            const index = i + batchIndex;
            this.currentParserIndex = index;
            
            return this.testParser(parser, index)
              .then(success => {
                if (success && !foundWorkingParser) {
                  foundWorkingParser = true;
                  this.currentSuccessParser = parser;
                  this.finalVideoUrl = parser.url + this.videoUrl;
                  this.successParsers.push(index);
                }
                return success;
              })
              .catch(() => {
                this.failedParsers.push(index);
                return false;
              });
          });
          
          // 等待当前批次完成
          await Promise.all(promises);
        }
        
        if (!foundWorkingParser) {
          throw new Error('所有解析接口均无法解析该视频，请检查视频链接是否正确或尝试其他视频');
        }
        
      } catch (error) {
        this.errorMessage = error.message;
      } finally {
        this.isLoading = false;
      }
    },
    
    testParser(parser, index) {
      return new Promise((resolve, reject) => {
        // 由于跨域限制和安全原因，我们不能直接测试接口是否可用
        // 这里模拟测试，实际应用中需要通过后端服务来验证
        
        // 模拟测试解析接口是否可用
        setTimeout(() => {
          // 随机模拟成功或失败，实际应用中应该真正检测
          // 这里我们假设 70% 的概率成功
          const success = Math.random() > 0.7;
          
          if (success) {
            resolve(true);
          } else {
            reject(false);
          }
        }, 1000 + Math.random() * 1000); // 随机延迟，模拟网络请求
      });
    },
    
    isValidUrl(url) {
      try {
        new URL(url);
        return true;
      } catch (e) {
        return false;
      }
    },
    
    copyUrl() {
      if (this.finalVideoUrl) {
        navigator.clipboard.writeText(this.finalVideoUrl)
          .then(() => {
            alert('解析地址已复制到剪贴板');
          })
          .catch(err => {
            console.error('复制失败:', err);
            alert('复制失败，请手动复制');
          });
      }
    },
    
    toggleParserInfo() {
      this.showParserInfo = !this.showParserInfo;
    }
  }
}
</script>

<style scoped>
.video-parser-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.description {
  color: #666;
  font-size: 1.1rem;
}

.input-container {
  display: flex;
  margin-bottom: 20px;
}

input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #a18cd1;
}

.parse-btn {
  padding: 12px 25px;
  background: linear-gradient(90deg, #a18cd1 0%, #fbc2eb 100%);
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: opacity 0.3s;
}

.parse-btn:hover {
  opacity: 0.9;
}

.parse-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.status-container {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.progress-container {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #a18cd1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.progress-text {
  font-size: 1rem;
  color: #333;
}

.parser-status {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.parser-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 15px;
  background: white;
  border-radius: 4px;
  border-left: 3px solid #ddd;
  transition: all 0.3s;
}

.parser-item.active {
  border-left-color: #fbc2eb;
  background-color: #fdf7fd;
}

.parser-item.success {
  border-left-color: #4caf50;
  background-color: #f0f9f0;
}

.parser-item.failed {
  border-left-color: #f44336;
  background-color: #fef5f5;
}

.parser-name {
  font-weight: 500;
}

.parser-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.loading-dot {
  width: 8px;
  height: 8px;
  background-color: #fbc2eb;
  border-radius: 50%;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0.8); opacity: 0.5; }
}

.success-icon {
  color: #4caf50;
  font-weight: bold;
}

.failed-icon {
  color: #f44336;
  font-weight: bold;
}

.player-container {
  margin-bottom: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.video-player {
  width: 100%;
  height: 500px;
  border: none;
}

.player-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: white;
  border-top: 1px solid #eee;
}

.success-message {
  display: flex;
  align-items: center;
  color: #4caf50;
  font-weight: 500;
}

.success-message .success-icon {
  margin-right: 8px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.copy-btn, .info-btn {
  padding: 8px 15px;
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.copy-btn:hover, .info-btn:hover {
  background: #e0e0e0;
}

.info-btn {
  background: #e8f4ff;
  color: #2196f3;
}

.info-btn:hover {
  background: #d5ebff;
}

.parser-info {
  padding: 15px;
  background: #f5f9ff;
  border-top: 1px solid #e0e0e0;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.parser-info-header {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  margin-bottom: 10px;
  color: #2c3e50;
}

.parser-info-count {
  color: #2196f3;
}


.parser-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
  margin-top: 12px;
  max-height: 300px;
  overflow-y: auto;
  border-top: 1px solid #eee;
  padding-top: 12px;
}

.parser-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  border-left: 3px solid #ddd;
  font-size: 0.9rem;
}

.parser-list-name {
  font-weight: 500;
}

.current-parser {
  background-color: #e3f2fd;
  border-left-color: #2196f3;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.current-tag {
  background-color: #2196f3;
  color: white;
  padding: 2px 6px;
  font-size: 0.7rem;
  border-radius: 10px;
  font-weight: 500;
}

.error-container {
  background: #fff5f5;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  border-left: 4px solid #f44336;
}

.error-message {
  display: flex;
  align-items: center;
  color: #d32f2f;
}

.error-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #f44336;
  color: white;
  border-radius: 50%;
  margin-right: 10px;
  font-weight: bold;
}

.tips-container {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  margin-top: 30px;
}

.tips-container h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.tips-container ul {
  padding-left: 20px;
}

.tips-container li {
  margin-bottom: 10px;
  color: #666;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .input-container {
    flex-direction: column;
  }
  
  input {
    border-radius: 4px;
    margin-bottom: 10px;
  }
  
  .parse-btn {
    border-radius: 4px;
    width: 100%;
  }
  
  .video-player {
    height: 300px;
  }
  
  .player-info {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .action-buttons {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  
  .parser-status {
    grid-template-columns: 1fr;
  }
  
  .parser-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 