<template>
  <DraggableDialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="AI股票推荐"
    :close-on-overlay-click="true"
    :initial-width="800"
    :initial-height="600"
  >
    <div class="news-dialog">
      <!-- 添加推荐按钮 -->
      <div class="dialog-header">
        <button 
          class="add-news-button"
          @click="showAddRecommendForm"
        >
          + 添加推荐
        </button>
      </div>

      <!-- 推荐列表 -->
      <div v-if="!isAddingRecommend" class="news-list">
        <div v-if="error" class="error-state">
          <p>{{ error }}</p>
        </div>
        <template v-else>
          <div 
            v-for="(item, index) in recommendations" 
            :key="index"
            class="news-item"
          >
            <div class="stock-info">
              <div class="stock-info-left">
                <span class="stock-name">{{ item.stockName }}</span>
                <span class="stock-code">({{ item.stockCode }})</span>
                <span class="stock-market">{{ item.market }}</span>
              </div>
              <div class="stock-info-right">
                <button 
                  class="delete-button"
                  @click="handleDelete(index)"
                >
                  删除
                </button>
                <span 
                  class="confidence-badge"
                  :class="getConfidenceClass(item.confidence)"
                >
                  置信度: {{ item.confidence }}%
                </span>
              </div>
            </div>
            <div class="recommendation-reason">
              {{ item.reason }}
            </div>
            <div class="related-news">
              <strong>相关新闻：</strong>
              <ul>
                <li v-for="(news, newsIndex) in item.relatedNews" :key="newsIndex">
                  {{ news }}
                </li>
              </ul>
            </div>
          </div>
        </template>
      </div>

      <!-- 添加推荐表单 -->
      <div v-else class="add-news-form">
        <h3>添加AI推荐</h3>
        <div class="prompt-info">
          <p>您可以使用以下提示词在第三方AI助手中获取更多推荐：</p>
          <div class="prompt-template">{{ promptTemplate }}</div>
          <div class="copy-button-wrapper">
            <button 
              class="copy-button"
              @click="copyPrompt"
            >
              复制提示词
            </button>
            <span 
              v-if="showCopySuccess" 
              class="copy-success"
            >
              ✓ 复制成功
            </span>
          </div>
        </div>
        
        <div class="form-item">
          <label>将第三方AI助手的回答粘贴到下面：</label>
          <div class="input-example">
            <p>支持单个推荐对象或多个推荐对象的数组，例如：</p>
            <pre class="example-code">
// 单个推荐对象
{
  "stockCode": "000001",
  "stockName": "平安银行",
  "market": "A股",
  "reason": "金融科技转型成效显著",
  "relatedNews": ["相关新闻标题1", "相关新闻标题2"],
  "confidence": 85
}

// 或多个推荐对象的数组
[
  {
    "stockCode": "000001",
    "stockName": "平安银行",
    "market": "A股",
    "reason": "金融科技转型成效显著",
    "relatedNews": ["相关新闻标题1"],
    "confidence": 85
  },
  {
    "stockCode": "600036",
    "stockName": "招商银行",
    "market": "A股",
    "reason": "零售银行业务优势明显",
    "relatedNews": ["相关新闻标题2"],
    "confidence": 90
  }
]</pre>
          </div>
          <textarea
            v-model="userInput"
            placeholder="请粘贴AI助手的JSON格式回答..."
            rows="6"
          ></textarea>
          <div class="error-message" v-if="inputError">
            {{ inputError }}
          </div>
        </div>
        
        <div class="form-actions">
          <button 
            @click="cancelAddRecommend"
            class="cancel-button"
          >
            取消
          </button>
          <button 
            @click="handleSubmit"
            :disabled="!userInput.trim()"
            class="submit-button"
          >
            确认添加
          </button>
        </div>
      </div>
    </div>
  </DraggableDialog>
</template>

<script>
import DraggableDialog from '@/components/DraggableDialog.vue'

export default {
  name: 'AIRecommendDialog',
  
  components: {
    DraggableDialog
  },
  
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    recommendations: {
      type: Array,
      default: () => []
    },
    newsData: {
      type: Array,
      default: () => []
    },
    error: {
      type: String,
      default: null
    }
  },
  
  emits: ['update:modelValue', 'submit', 'delete'],
  
  data() {
    return {
      isAddingRecommend: false,
      userInput: '',
      inputError: '',
      showCopySuccess: false,
      copySuccessTimer: null
    }
  },
  
  computed: {
    promptTemplate() {
      return `请分析以下新闻，找出可能相关的股票：

当前新闻列表：
${this.formatNewsForPrompt()}

请根据以上新闻：
1. 分析每条新闻提到的公司和行业
2. 找出相关的股票代码（优先A股，同时可以包含港股和美股）
3. 给出推荐理由
4. 使用以下JSON格式返回结果，可以返回单个对象或对象数组：

[
  {
    "stockCode": "股票代码",
    "stockName": "股票名称",
    "market": "市场（A股/港股/美股）",
    "reason": "推荐理由（包含对公司优势和相关新闻分析的详细说明）",
    "relatedNews": ["相关新闻标题1", "相关新闻标题2"],
    "confidence": 推荐置信度(0-100)
  },
  // 可以返回多个推荐...
]

注意事项：
1. 每个推荐都需要包含完整的字段信息
2. confidence 值范围为0-100
3. 确保返回格式为标准JSON，可以被JSON.parse()直接解析
4. 可以返回单个对象或对象数组，但格式必须正确`
    },

    // 格式化新闻数据用于提示词
    formattedNews() {
      if (!this.newsData || this.newsData.length === 0) {
        return '暂无新闻数据'
      }

      return this.newsData.map((news, index) => {
        return `${index + 1}. ${news.title}
          来源：${news.source}
          摘要：${news.summary}`
      }).join('\n\n')
    },
  },
  
  methods: {
    // 格式化新闻数据用于提示词模板
    formatNewsForPrompt() {
      return this.formattedNews
    },
    
    getConfidenceClass(confidence) {
      if (confidence >= 80) return 'high'
      if (confidence >= 60) return 'medium'
      return 'low'
    },
    
    showAddRecommendForm() {
      this.isAddingRecommend = true
    },
    
    cancelAddRecommend() {
      this.isAddingRecommend = false
      this.userInput = ''
      this.inputError = ''
    },
    
    async copyPrompt() {
      try {
        await navigator.clipboard.writeText(this.promptTemplate)
        this.showCopySuccess = true
        
        if (this.copySuccessTimer) {
          clearTimeout(this.copySuccessTimer)
        }
        
        this.copySuccessTimer = setTimeout(() => {
          this.showCopySuccess = false
        }, 2000)
      } catch (err) {
        console.error('复制失败:', err)
      }
    },
    
    handleSubmit() {
      this.inputError = ''
      
      try {
        let recommendations = JSON.parse(this.userInput)
        
        // 如果不是数组，转换为数组
        if (!Array.isArray(recommendations)) {
          recommendations = [recommendations]
        }
        
        const requiredFields = ['stockCode', 'stockName', 'market', 'reason', 'relatedNews', 'confidence']
        
        // 验证每个推荐对象
        for (const recommendation of recommendations) {
          const missingFields = requiredFields.filter(field => !(field in recommendation))
          
          if (missingFields.length > 0) {
            this.inputError = `推荐对象缺少必要字段: ${missingFields.join(', ')}`
            return
          }
          
          if (recommendation.confidence < 0 || recommendation.confidence > 100) {
            this.inputError = '置信度必须在0-100之间'
            return
          }
        }
        
        this.$emit('submit', recommendations)
        this.userInput = ''
        this.inputError = ''
        this.isAddingRecommend = false
      } catch (error) {
        this.inputError = '输入格式不正确，请确保是有效的JSON格式'
      }
    },
    
    handleDelete(index) {
      this.$emit('delete', index)
    }
  },
  
  beforeUnmount() {
    if (this.copySuccessTimer) {
      clearTimeout(this.copySuccessTimer)
    }
  }
}
</script>

<style scoped>
.news-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  padding: 0 0 16px 0;
  display: flex;
  justify-content: flex-end;
}

.add-news-button {
  background: #1890ff;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.add-news-button:hover {
  background: #40a9ff;
}

.news-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.news-item {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.stock-info {
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stock-info-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stock-info-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stock-name {
  font-weight: bold;
  font-size: 16px;
  margin-right: 8px;
}

.stock-code {
  color: #666;
  margin-right: 8px;
}

.stock-market {
  background: #e6f7ff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.confidence-badge {
  float: right;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.confidence-badge.high {
  background: #f6ffed;
  color: #52c41a;
}

.confidence-badge.medium {
  background: #fff7e6;
  color: #fa8c16;
}

.confidence-badge.low {
  background: #fff1f0;
  color: #f5222d;
}

.recommendation-reason {
  margin: 8px 0;
  color: #333;
}

.related-news {
  font-size: 13px;
  color: #666;
}

.related-news ul {
  margin: 4px 0;
  padding-left: 20px;
}

.error-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

/* 添加推荐表单样式 */
.add-news-form {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.add-news-form h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.prompt-info {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.prompt-template {
  background: #fff;
  padding: 12px;
  border-radius: 4px;
  margin: 8px 0;
  white-space: pre-wrap;
  font-size: 12px;
  font-family: monospace;
  border: 1px solid #d9d9d9;
}

.copy-button-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.copy-button {
  background: #1890ff;
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.copy-button:hover {
  background: #40a9ff;
}

.copy-success {
  color: #52c41a;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
}

.form-item textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
  resize: vertical;
  min-height: 120px;
}

.form-item textarea:hover {
  border-color: #40a9ff;
}

.form-item textarea:focus {
  border-color: #1890ff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
}

.form-actions {
  text-align: right;
  margin-top: 24px;
}

.cancel-button {
  background: #fff;
  border: 1px solid #d9d9d9;
  color: rgba(0, 0, 0, 0.65);
  margin-right: 12px;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.cancel-button:hover {
  color: #40a9ff;
  border-color: #40a9ff;
}

.submit-button {
  background: #1890ff;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.submit-button:hover {
  background: #40a9ff;
}

.submit-button:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.delete-button {
  background: #ff4d4f;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.delete-button:hover {
  background: #ff7875;
}

.input-example {
  margin: 8px 0;
  font-size: 12px;
  color: #666;
}

.example-code {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  margin: 8px 0;
  font-family: monospace;
  white-space: pre;
  overflow-x: auto;
  border: 1px solid #e8e8e8;
}

.example-code::-webkit-scrollbar {
  height: 6px;
}

.example-code::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 3px;
}

.example-code::-webkit-scrollbar-track {
  background-color: #f5f5f5;
}
</style> 