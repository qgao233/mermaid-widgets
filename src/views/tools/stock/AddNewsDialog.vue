<template>
  <DraggableDialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="添加新闻"
    :close-on-overlay-click="true"
    :initial-width="600"
    :initial-height="500"
  >
    <div class="add-news-form">
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
          @click="handleCancel"
          class="cancel-button"
        >
          取消
        </button>
        <button 
          @click="handleSubmit"
          :disabled="!isFormValid"
          class="submit-button"
        >
          确认添加
        </button>
      </div>
    </div>
  </DraggableDialog>
</template>

<script>
import DraggableDialog from '@/components/DraggableDialog.vue'

export default {
  name: 'AddNewsDialog',
  
  components: {
    DraggableDialog
  },
  
  props: {
    modelValue: {
      type: Boolean,
      required: true
    }
  },
  
  emits: ['update:modelValue', 'submit'],
  
  data() {
    return {
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
    handleCancel() {
      this.resetForm()
      this.$emit('update:modelValue', false)
    },
    
    handleSubmit() {
      if (!this.isFormValid) return
      
      const newsItem = {
        ...this.newsForm,
        // 如果摘要为空，使用标题作为摘要
        summary: this.newsForm.summary.trim() || this.newsForm.title,
        // 如果来源为空，使用"用户添加"
        source: this.newsForm.source.trim() || '用户添加',
        publishedAt: new Date().toISOString()
      }
      
      this.$emit('submit', newsItem)
      this.resetForm()
      this.$emit('update:modelValue', false)
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
.add-news-form {
  padding: 20px;
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
</style> 