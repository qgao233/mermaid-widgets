<template>
  <DraggableDialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="AI股票推荐"
    :close-on-overlay-click="true"
    :initial-width="800"
    :initial-height="600"
  >
    <div class="ai-recommend">
      <!-- 系统推荐列表 -->
      <div class="recommendation-section">
        <h3>系统推荐股票</h3>
        <div class="recommendation-list">
          <div 
            v-for="(item, index) in recommendations" 
            :key="index"
            class="recommendation-item"
          >
            <div class="stock-info">
              <span class="stock-name">{{ item.stockName }}</span>
              <span class="stock-code">({{ item.stockCode }})</span>
              <span class="stock-market">{{ item.market }}</span>
              <span 
                class="confidence-badge"
                :class="getConfidenceClass(item.confidence)"
              >
                置信度: {{ item.confidence }}%
              </span>
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
        </div>
      </div>

      <!-- 用户手动添加区域 -->
      <div class="user-input-section">
        <h3>添加AI推荐</h3>
        <div class="prompt-info">
          <p>您可以使用以下提示词在第三方AI助手中获取更多推荐：</p>
          <pre class="prompt-template">{{ promptTemplate }}</pre>
          <button 
            class="copy-button"
            @click="copyPrompt"
          >
            复制提示词
          </button>
        </div>
        
        <div class="input-area">
          <p class="input-label">将AI助手的回答粘贴到下面：</p>
          <textarea
            v-model="userInput"
            placeholder="请粘贴AI助手的JSON格式回答..."
            rows="6"
          ></textarea>
          <div class="error-message" v-if="inputError">
            {{ inputError }}
          </div>
          <button 
            class="submit-button"
            @click="handleSubmit"
            :disabled="!userInput.trim()"
          >
            添加推荐
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
    promptTemplate: {
      type: String,
      required: true
    },
    error: {
      type: String,
      default: null
    }
  },
  
  emits: ['update:modelValue', 'submit'],
  
  data() {
    return {
      userInput: '',
      inputError: ''
    }
  },
  
  methods: {
    getConfidenceClass(confidence) {
      if (confidence >= 80) return 'high'
      if (confidence >= 60) return 'medium'
      return 'low'
    },
    
    async copyPrompt() {
      try {
        await navigator.clipboard.writeText(this.promptTemplate)
        // 可以添加一个复制成功的提示
      } catch (err) {
        console.error('复制失败:', err)
      }
    },
    
    handleSubmit() {
      this.inputError = ''
      
      try {
        // 尝试解析用户输入的JSON
        const recommendation = JSON.parse(this.userInput)
        
        // 验证必要字段
        const requiredFields = ['stockCode', 'stockName', 'market', 'reason', 'relatedNews', 'confidence']
        const missingFields = requiredFields.filter(field => !(field in recommendation))
        
        if (missingFields.length > 0) {
          this.inputError = `缺少必要字段: ${missingFields.join(', ')}`
          return
        }
        
        // 验证置信度范围
        if (recommendation.confidence < 0 || recommendation.confidence > 100) {
          this.inputError = '置信度必须在0-100之间'
          return
        }
        
        this.$emit('submit', recommendation)
        this.userInput = '' // 清空输入
        this.inputError = ''
      } catch (error) {
        this.inputError = '输入格式不正确，请确保是有效的JSON格式'
      }
    }
  }
}
</script>

<style scoped>
.ai-recommend {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
}

.recommendation-section,
.user-input-section {
  flex: 1;
  overflow: hidden;
}

.recommendation-section h3,
.user-input-section h3 {
  margin: 0 0 16px 0;
  color: #1890ff;
  font-size: 16px;
}

.recommendation-list {
  max-height: 250px;
  overflow-y: auto;
  padding-right: 10px;
}

.recommendation-item {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.stock-info {
  margin-bottom: 8px;
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

.input-area {
  margin-top: 16px;
}

.input-label {
  margin-bottom: 8px;
  color: #666;
}

textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  resize: vertical;
  font-family: monospace;
}

textarea:focus {
  border-color: #40a9ff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
}

.submit-button {
  background: #1890ff;
  color: white;
  border: none;
  padding: 8px 24px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 12px;
}

.submit-button:hover {
  background: #40a9ff;
}

.submit-button:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}
</style> 