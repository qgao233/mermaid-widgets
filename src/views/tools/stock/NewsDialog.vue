<template>
  <DraggableDialog
    v-model="isVisible"
    title="新闻列表"
    :close-on-overlay-click="true"
    :initial-width="800"
    :initial-height="600"
  >
    <div class="news-dialog">
      <!-- 添加新闻按钮 -->
      <div class="dialog-header">
        <button 
          class="add-news-button"
          @click="showAddNewsForm"
        >
          + 添加新闻
        </button>
      </div>

      <!-- 新闻列表 -->
      <div v-if="!isAddingNews" class="news-list">
        <div v-if="loading" class="loading-state">
          <p>加载中...</p>
        </div>
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="$emit('retry')" class="retry-button">重试</button>
        </div>
        <template v-else>
          <div 
            v-for="(news, index) in newsData" 
            :key="index"
            class="news-item"
          >
            <div class="news-header">
              <h3 class="news-title">{{ news.title }}</h3>
              <button 
                class="delete-button"
                @click="handleDelete(index)"
              >
                删除
              </button>
            </div>
            <p class="news-summary">{{ news.summary }}</p>
            <div class="news-meta">
              <span class="news-source">来源：{{ news.source }}</span>
              <span class="news-time">{{ formatTime(news.publishedAt) }}</span>
            </div>
            <a 
              :href="news.url" 
              target="_blank" 
              class="news-link"
            >
              查看原文
            </a>
          </div>
        </template>
      </div>

      <!-- 添加新闻表单 -->
      <div v-else class="add-news-form">
        <h3>添加新闻</h3>
        <div class="form-item">
          <label>
            新闻标题
            <span class="required">*</span>
          </label>
          <input 
            v-model="newsForm.title"
            type="text"
            placeholder="请输入新闻标题"
          >
        </div>
        <div class="form-item">
          <label>新闻摘要</label>
          <textarea
            v-model="newsForm.summary"
            placeholder="请输入新闻摘要（选填）"
            rows="4"
          ></textarea>
        </div>
        <div class="form-item">
          <label>
            新闻链接
            <span class="required">*</span>
          </label>
          <input
            v-model="newsForm.url"
            type="text"
            placeholder="请输入新闻链接"
          >
        </div>
        <div class="form-item">
          <label>新闻来源</label>
          <input
            v-model="newsForm.source"
            type="text"
            placeholder="请输入新闻来源（选填）"
          >
        </div>
        <div class="form-actions">
          <button 
            @click="cancelAddNews"
            class="cancel-button"
          >
            取消
          </button>
          <button 
            @click="submitAddNews"
            :disabled="!isFormValid"
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
  name: 'NewsDialog',
  
  components: {
    DraggableDialog
  },
  
  props: {
    newsData: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    }
  },
  
  emits: ['retry', 'add-news', 'delete-news'],
  
  data() {
    return {
      isVisible: false,
      isAddingNews: false,
      newsForm: {
        title: '',
        summary: '',
        url: '',
        source: ''
      }
    }
  },
  
  computed: {
    isFormValid() {
      const { title, url } = this.newsForm
      return title.trim() && url.trim()
    }
  },
  
  methods: {
    show() {
      this.isVisible = true
    },
    
    hide() {
      this.isVisible = false
      this.isAddingNews = false
      this.resetForm()
    },
    
    formatTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      return date.toLocaleString()
    },
    
    showAddNewsForm() {
      this.isAddingNews = true
    },
    
    cancelAddNews() {
      this.isAddingNews = false
      this.resetForm()
    },
    
    submitAddNews() {
      if (!this.isFormValid) return
      
      const newsItem = {
        ...this.newsForm,
        // 如果摘要为空，使用标题作为摘要
        summary: this.newsForm.summary.trim() || this.newsForm.title,
        // 如果来源为空，使用"用户添加"
        source: this.newsForm.source.trim() || '用户添加',
        publishedAt: new Date().toISOString()
      }
      
      this.$emit('add-news', newsItem)
      this.isAddingNews = false
      this.resetForm()
    },
    
    handleDelete(index) {
      this.$emit('delete-news', index)
    },
    
    resetForm() {
      this.newsForm = {
        title: '',
        summary: '',
        url: '',
        source: ''
      }
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

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.news-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.news-summary {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.news-meta {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

.news-source {
  margin-right: 16px;
}

.news-link {
  display: inline-block;
  margin-top: 8px;
  color: #1890ff;
  text-decoration: none;
  font-size: 14px;
}

.news-link:hover {
  color: #40a9ff;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.retry-button {
  background: #1890ff;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 16px;
}

/* 添加新闻表单样式 */
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

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
}

.required {
  color: #ff4d4f;
  margin-left: 4px;
}

.form-item input,
.form-item textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-item input:hover,
.form-item textarea:hover {
  border-color: #40a9ff;
}

.form-item input:focus,
.form-item textarea:focus {
  border-color: #1890ff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-item textarea {
  resize: vertical;
  min-height: 100px;
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
</style> 