<template>
    <div class="stock-recommender">
      <h2>股票推荐工具</h2>
      
      <!-- 进度条区域 -->
      <div class="progress-section">
        <div class="progress-bar">
          <div 
            class="progress" 
            :style="{ width: `${currentProgress}%` }"
            :class="{ 'progress-error': hasError }"
          ></div>
        </div>
        <div class="progress-steps">
          <div 
            v-for="(step, index) in progressSteps" 
            :key="index"
            class="step"
            :class="{
              'completed': step.completed,
              'current': step.current,
              'error': step.error
            }"
            @click="step.completed && step.onClick && step.onClick()"
          >
            <div class="step-icon">{{ step.icon }}</div>
            <div class="step-label">{{ step.label }}</div>
          </div>
        </div>
      </div>
  
      <!-- 详细信息区域 -->
      <div class="detail-section">
        <div class="detail-header">
          <h3>执行详情</h3>
          <button 
            v-if="!isProcessing" 
            @click="startProcess"
            :disabled="isCompleted"
          >
            {{ isCompleted ? '流程已完成' : '开始执行' }}
          </button>
        </div>
  
        <!-- 详细信息日志 -->
        <div class="detail-log" ref="logContainer">
          <div 
            v-for="(log, index) in executionLogs" 
            :key="index"
            class="log-item"
            :class="log.type"
          >
            <span class="log-time">{{ log.time }}</span>
            <span class="log-content">{{ log.content }}</span>
          </div>
        </div>
  
        <!-- 用户交互区域 -->
        <div 
          v-if="currentUserAction"
          class="user-action-panel"
        >
          <div class="action-description">
            {{ currentUserAction.description }}
          </div>
          <div class="action-input">
            <textarea
              v-if="currentUserAction.type === 'input'"
              v-model="currentUserAction.value"
              :placeholder="currentUserAction.placeholder"
              rows="4"
            ></textarea>
            <button
              @click="submitUserAction"
              :disabled="!canSubmitUserAction"
            >
              {{ currentUserAction.buttonText }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- 固定在右侧的历史按钮 -->
      <div class="fixed-history-button">
        <button @click="showHistory" class="history-button">
          <span class="history-icon">📋</span>
          <span class="history-text">查看历史</span>
        </button>
      </div>
      
      <!-- 使用新的历史记录组件 -->
      <StockHistory ref="historyDialog" />
      
      <!-- 使用新闻对话框组件 -->
      <NewsDialog 
        ref="newsDialog"
        :news-data="newsData || []"
        :loading="isLoadingNews"
        :error="newsError"
      />
    </div>
  </template>
  
  <script>
  import StockHistory from './StockHistory.vue'
  import NewsDialog from './NewsDialog.vue'
  import { fetchHotNews } from '@/utils/newsService.js'
  
  export default {
    name: 'StockRecommender',
    components: {
      StockHistory,
      NewsDialog
    },
    data() {
      return {
        // 进度相关
        currentProgress: 0,
        progressSteps: [
          { label: '爬取新闻', icon: '🔍', completed: false, current: false, error: false },
          { label: 'AI推荐', icon: '🤖', completed: false, current: false, error: false },
          { label: '获取数据', icon: '📊', completed: false, current: false, error: false },
          { label: 'AI分析', icon: '🧠', completed: false, current: false, error: false },
          { label: '综合推荐', icon: '📈', completed: false, current: false, error: false },
          { label: '保存结果', icon: '💾', completed: false, current: false, error: false }
        ],
        
        // 执行状态
        isProcessing: false,
        isCompleted: false,
        hasError: false,
        
        // 执行日志
        executionLogs: [],
        
        // 用户交互
        currentUserAction: null,
        newsData: null,
        isLoadingNews: false,
        newsError: null,
      }
    },
    
    computed: {
      canSubmitUserAction() {
        return this.currentUserAction && 
               this.currentUserAction.value && 
               this.currentUserAction.value.trim().length > 0
      }
    },
    
    methods: {
      // 开始执行流程
      async startProcess() {
        this.isProcessing = true
        this.resetProgress()
        await this.executeStep(0) // 从第一步开始执行
      },
      
      // 重置进度
      resetProgress() {
        this.currentProgress = 0
        this.isCompleted = false
        this.hasError = false
        this.executionLogs = []
        this.progressSteps = this.progressSteps.map(step => ({
          ...step,
          completed: false,
          current: false,
          error: false
        }))
      },
      
      // 添加日志
      addLog(content, type = 'info') {
        const time = new Date().toLocaleTimeString()
        this.executionLogs.push({ time, content, type })
        this.$nextTick(() => {
          if (this.$refs.logContainer) {
            this.$refs.logContainer.scrollTop = this.$refs.logContainer.scrollHeight
          }
        })
      },
      
      // 更新进度
      updateProgress(stepIndex, status = 'current') {
        const totalSteps = this.progressSteps.length
        this.progressSteps = this.progressSteps.map((step, index) => ({
          ...step,
          current: index === stepIndex && status === 'current',
          completed: index < stepIndex || (index === stepIndex && status === 'completed'),
          error: index === stepIndex && status === 'error'
        }))
        this.currentProgress = ((stepIndex + (status === 'completed' ? 1 : 0.5)) / totalSteps) * 100
      },
      
      // 执行步骤
      async executeStep(stepIndex) {
        this.updateProgress(stepIndex, 'current')
        this.addLog(`开始执行第${stepIndex + 1}步: ${this.progressSteps[stepIndex].label}`)
        
        try {
          switch (stepIndex) {
            case 0: // 爬取新闻
              await this.executeNewsStep()
              break
            // 其他步骤将在后续实现
          }
          
          this.updateProgress(stepIndex, 'completed')
          return true
        } catch (error) {
          console.error(`步骤${stepIndex + 1}执行失败:`, error)
          this.addLog(`步骤执行失败: ${error.message}`, 'error')
          this.updateProgress(stepIndex, 'error')
          this.hasError = true
          return false
        }
      },
      
      // 执行爬取新闻步骤
      async executeNewsStep() {
        this.addLog('开始爬取热点新闻...')
        this.isLoadingNews = true
        this.newsError = null
        
        try {
          
          // 使用日志回调获取新闻
          const results = await fetchHotNews((log) => {
            this.addLog(log.message, log.type)
          })
          
          if (!results || results.length === 0) {
            throw new Error('未获取到任何新闻数据')
          }
          
          this.newsData = results
          
          // 将进度步骤设置为可点击
          this.progressSteps[0].onClick = () => {
            this.$refs.newsDialog.show()
          }
          
          return true
        } catch (error) {
          this.newsError = error.message
          throw new Error(`爬取新闻失败: ${error.message}`)
        } finally {
          this.isLoadingNews = false
        }
      },
      
      // 提交用户操作
      async submitUserAction() {
        // 用户操作的处理逻辑将在后续实现
      },
      
      showHistory() {
        this.$refs.historyDialog.show()
      }
    }
  }
  </script>
  
  <style scoped>
  .stock-recommender {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  /* 进度条区域样式 */
  .progress-section {
    margin: 30px 0;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .progress-bar {
    height: 8px;
    background: #f0f0f0;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 20px;
  }
  
  .progress {
    height: 100%;
    background: #1890ff;
    transition: width 0.3s ease;
  }
  
  .progress-error {
    background: #ff4d4f;
  }
  
  .progress-steps {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
  }
  
  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    position: relative;
  }
  
  .step-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
  }
  
  .step.completed .step-icon {
    background: #52c41a;
    color: white;
  }
  
  .step.current .step-icon {
    background: #1890ff;
    color: white;
  }
  
  .step.error .step-icon {
    background: #ff4d4f;
    color: white;
  }
  
  /* 详细信息区域样式 */
  .detail-section {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;
  }
  
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .detail-log {
    height: 500px;
    overflow-y: auto;
    background: #f5f5f5;
    padding: 10px;
    border-radius: 4px;
    font-family: monospace;
  }
  
  .log-item {
    padding: 4px 8px;
    margin-bottom: 4px;
    border-radius: 2px;
  }
  
  .log-time {
    color: #888;
    margin-right: 10px;
  }
  
  .log-item.info {
    background: #e6f7ff;
  }
  
  .log-item.success {
    background: #f6ffed;
  }
  
  .log-item.error {
    background: #fff2f0;
  }
  
  /* 用户交互面板样式 */
  .user-action-panel {
    margin-top: 20px;
    padding: 20px;
    background: #fafafa;
    border-radius: 4px;
  }
  
  .action-description {
    margin-bottom: 10px;
    color: #666;
  }
  
  .action-input textarea {
    width: 100%;
    margin-bottom: 10px;
    padding: 8px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
  }
  
  .action-input button {
    background: #1890ff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .action-input button:disabled {
    background: #d9d9d9;
    cursor: not-allowed;
  }
  
  /* 固定在右侧的历史按钮样式 */
  .fixed-history-button {
    position: fixed;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 100;
  }
  
  .history-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px;
    background-color: #1890ff;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  
  .history-button:hover {
    background-color: #096dd9;
    transform: scale(1.05);
  }
  
  .history-icon {
    font-size: 24px;
    margin-bottom: 5px;
  }
  
  .history-text {
    font-size: 12px;
    white-space: nowrap;
  }
  
  /* 添加进度步骤点击样式 */
  .step.completed {
    cursor: pointer;
  }
  
  .step.completed:hover .step-icon {
    transform: scale(1.1);
    transition: transform 0.3s;
  }
  </style>