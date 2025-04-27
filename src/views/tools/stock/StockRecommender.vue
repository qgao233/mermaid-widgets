<template>
    <div class="stock-recommender">
      <h2 class="main-title">股票推荐工具</h2>
      
      <!-- 进度条区域 -->
      <div class="progress-section">
        <div class="progress-header">
          <h3>执行进度</h3>
          <button 
            v-if="!isCompleted"
            @click="handleButtonClick"
            :disabled="isProcessing || isButtonDisabled"
            class="start-button"
          >
            {{ getButtonText }}
          </button>
        </div>
        
        <!-- 添加新闻提示 -->
        <div v-if="showAddNewsHint" class="add-news-hint">
          <div class="hint-content">
            <span>🔔 您可以在进行AI推荐之前添加自己关注的新闻</span>
            <button 
              @click="showAddNewsDialog"
              class="add-news-button"
            >
              添加新闻
            </button>
          </div>
        </div>

        <!-- AI推荐提示 -->
        <div v-if="showAIRecommendHint" class="add-news-hint">
          <div class="hint-content">
            <span>🤖 您可以通过第三方AI助手添加更多股票推荐</span>
            <button 
              @click="showAIRecommendDialog"
              class="add-news-button"
            >
              添加推荐
            </button>
          </div>
        </div>

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
        @add-news="handleAddNews"
      />

      <!-- 使用AI推荐对话框组件 -->
      <AIRecommendDialog
        v-model="isAIRecommendDialogVisible"
        :recommendations="aiRecommendations"
        :error="aiError"
        @submit="handleAddAIRecommendation"
      />
    </div>
  </template>
  
  <script>
  import StockHistory from './StockHistory.vue'
  import NewsDialog from './NewsDialog.vue'
  import { fetchHotNews } from '@/utils/newsService.js'
  import DraggableDialog from '@/components/DraggableDialog.vue'
  import AIRecommendDialog from './AIRecommendDialog.vue'
  
  export default {
    name: 'StockRecommender',
    components: {
      StockHistory,
      NewsDialog,
      DraggableDialog,
      AIRecommendDialog
    },
    data() {
      return {
        // 进度相关
        currentProgress: 0,
        progressSteps: [
          { label: '爬取新闻', icon: '🔍', completed: false, current: false, error: false },
          { label: 'AI推荐', icon: '🤖', completed: false, current: false, error: false },
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
        currentStepIndex: -1, // 添加当前步骤索引
        isAIRecommendDialogVisible: false,
        aiRecommendations: null,
        isProcessingAI: false,
        aiError: null,
        userAIInput: '',
        promptTemplate: `请根据以下新闻分析可能相关的股票：
1. 分析每条新闻提到的公司和行业
2. 找出相关的股票代码（优先A股，同时可以包含港股和美股）
3. 给出推荐理由
4. 使用以下格式返回结果：
{
  "stockCode": "股票代码",
  "stockName": "股票名称",
  "market": "市场（A股/港股/美股）",
  "reason": "推荐理由",
  "relatedNews": ["相关新闻标题1", "相关新闻标题2"],
  "confidence": 推荐置信度(0-100)
}`
      }
    },
    
    computed: {
      canSubmitUserAction() {
        return this.currentUserAction && 
               this.currentUserAction.value && 
               this.currentUserAction.value.trim().length > 0
      },
      
      isButtonDisabled() {
        if (this.currentStepIndex >= 0) {
          const currentStep = this.progressSteps[this.currentStepIndex]
          return !currentStep.completed
        }
        return false
      },
      
      getButtonText() {
        if (this.isCompleted) {
          return '流程已完成'
        }
        if (this.currentStepIndex >= 0) {
          const currentStep = this.progressSteps[this.currentStepIndex]
          if (currentStep && currentStep.completed) {
            return '下一步'
          }
          return '执行中...'
        }
        return '开始执行'
      },
      
      showAddNewsHint() {
        return this.currentStepIndex === 0 && 
               this.progressSteps[0].completed &&
               !this.isProcessing
      },
      
      showAIRecommendHint() {
        return this.currentStepIndex === 1 && 
               this.progressSteps[1].completed &&
               !this.isProcessing
      }
    },
    
    methods: {
      // 处理按钮点击
      async handleButtonClick() {
        if (this.isProcessing || this.isButtonDisabled) {
          return
        }
        
        if (this.currentStepIndex === -1) {
          // 首次开始执行
          this.isProcessing = true
          this.resetProgress()
          this.currentStepIndex = 0
          await this.executeStep(0)
          this.isProcessing = false
        } else {
          // 执行下一步
          const nextStepIndex = this.currentStepIndex + 1
          if (nextStepIndex < this.progressSteps.length) {
            this.isProcessing = true
            this.currentStepIndex = nextStepIndex
            await this.executeStep(nextStepIndex)
            this.isProcessing = false
          }
        }
      },
      
      // 重置进度
      resetProgress() {
        this.currentProgress = 0
        this.isCompleted = false
        this.hasError = false
        this.executionLogs = []
        this.currentStepIndex = -1
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
            case 1: // AI推荐
              await this.executeAIStep()
              break
            // ... 其他步骤
          }
          
          this.updateProgress(stepIndex, 'completed')
          
          // 检查是否所有步骤都完成
          if (stepIndex === this.progressSteps.length - 1) {
            this.isCompleted = true
            this.isProcessing = false
          }
          
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
      
      // 执行AI推荐步骤
      async executeAIStep() {
        this.addLog('开始AI分析新闻相关股票...')
        this.isProcessingAI = true
        this.aiError = null
        
        try {
          if (!this.newsData || this.newsData.length === 0) {
            throw new Error('没有可分析的新闻数据')
          }
          
          // 准备新闻数据
          const newsForAnalysis = this.newsData.map(news => ({
            title: news.title,
            summary: news.summary,
            source: news.source
          }))
          
          // 调用百度搜索API获取相关股票信息
          this.addLog('正在搜索相关股票信息...')
          const recommendations = await this.searchStocksByNews(newsForAnalysis)
          
          if (!recommendations || recommendations.length === 0) {
            throw new Error('未找到相关股票信息')
          }
          
          this.aiRecommendations = recommendations
          this.addLog(`AI分析完成，找到 ${recommendations.length} 只相关股票`)
          
          // 显示用户手动添加提示
          this.addLog('💡 提示：您可以通过第三方AI助手添加更多股票推荐', 'info')
          
          // 将进度步骤设置为可点击
          this.progressSteps[1].onClick = () => {
            this.showAIRecommendDialog()
          }
          
          return true
        } catch (error) {
          this.aiError = error.message
          throw new Error(`AI分析失败: ${error.message}`)
        } finally {
          this.isProcessingAI = false
        }
      },
      
      // 根据新闻搜索相关股票
      async searchStocksByNews(newsData) {
        // 这里是模拟的搜索结果，实际项目中需要调用真实的搜索API
        const mockRecommendations = []
        
        for (const news of newsData) {
          // 模拟API调用延迟
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          if (news.title.includes('科技') || news.summary.includes('科技')) {
            mockRecommendations.push({
              stockCode: '000001',
              stockName: '平安银行',
              market: 'A股',
              reason: `与新闻"${news.title}"相关，涉及金融科技领域`,
              relatedNews: [news.title],
              confidence: 85
            })
          }
          
          if (news.title.includes('新能源') || news.summary.includes('新能源')) {
            mockRecommendations.push({
              stockCode: '300750',
              stockName: '宁德时代',
              market: 'A股',
              reason: `与新闻"${news.title}"相关，新能源电池龙头企业`,
              relatedNews: [news.title],
              confidence: 90
            })
          }
        }
        
        return mockRecommendations
      },
      
      // 显示AI推荐对话框
      showAIRecommendDialog() {
        this.isAIRecommendDialogVisible = true
      },
      
      // 处理用户添加的AI推荐
      handleAddAIRecommendation(recommendations) {
        if (!Array.isArray(recommendations)) {
          recommendations = [recommendations]
        }
        
        // 合并用户添加的推荐和系统推荐
        this.aiRecommendations = [
          ...(this.aiRecommendations || []),
          ...recommendations
        ]
        
        // 添加日志
        this.addLog(`用户添加了 ${recommendations.length} 条AI推荐`, 'success')
      },
      
      // 提交用户操作
      async submitUserAction() {
        // 用户操作的处理逻辑将在后续实现
      },
      
      showHistory() {
        this.$refs.historyDialog.show()
      },
      
      showAddNewsDialog() {
        this.$refs.newsDialog.show()
      },
      
      handleAddNews(newsItem) {
        // 添加到现有新闻列表的开头
        this.newsData = [newsItem, ...(this.newsData || [])]
        
        // 添加日志
        this.addLog(`手动添加新闻: ${newsItem.title}`, 'success')
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
  
  .main-title {
    text-align: center;
    color: #1890ff;
    font-size: 24px;
    margin-bottom: 30px;
    position: relative;
  }
  
  .main-title::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: #1890ff;
    border-radius: 2px;
  }
  
  /* 进度条区域样式 */
  .progress-section {
    margin: 30px 0;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .progress-header h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
  }
  
  .start-button {
    background: #1890ff;
    color: white;
    border: none;
    padding: 8px 24px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;
  }
  
  .start-button:hover {
    background: #40a9ff;
  }
  
  .start-button:disabled {
    background: #d9d9d9;
    cursor: not-allowed;
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

  .add-news-hint {
    margin: 10px 0;
    padding: 10px;
    background: #e6f7ff;
    border: 1px solid #91d5ff;
    border-radius: 4px;
  }
  
  .hint-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .add-news-button {
    background: #1890ff;
    color: white;
    border: none;
    padding: 4px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;
  }
  
  .add-news-button:hover {
    background: #40a9ff;
  }
  </style>