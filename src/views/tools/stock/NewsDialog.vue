<template>
  <DraggableDialog
    v-model="visible"
    title="热点新闻"
    :initial-width="800"
    :initial-height="600"
    :min-width="600"
    :min-height="400"
  >
    <div class="news-content">
      <div v-if="loading" class="loading">
        <p>正在获取新闻数据...</p>
      </div>
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
      </div>
      <div v-else-if="newsData.length > 0" class="news-list">
        <div v-for="(item, index) in newsData" :key="index" class="news-item">
          <h4>{{ item.title }}</h4>
          <p class="news-summary">{{ item.summary }}</p>
          <div class="news-meta">
            <span class="news-source">来源: {{ item.source }}</span>
            <a :href="item.url" target="_blank" class="news-link">查看原文</a>
          </div>
        </div>
      </div>
      <div v-else class="no-data">
        <p>暂无新闻数据</p>
      </div>
    </div>
  </DraggableDialog>
</template>

<script setup>
import { ref } from 'vue'
import DraggableDialog from '@/components/DraggableDialog.vue'

const props = defineProps({
  newsData: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})

const visible = ref(false)

// 暴露方法给父组件
defineExpose({
  show: () => {
    visible.value = true
  }
})
</script>

<style scoped>
.news-content {
  height: 100%;
  padding: 20px;
}

.loading, .error-message, .no-data {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error-message {
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
}

.news-list {
  height: 100%;
  overflow-y: auto;
}

.news-item {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.news-item:last-child {
  border-bottom: none;
}

.news-item h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
}

.news-summary {
  color: #666;
  margin: 8px 0;
  line-height: 1.5;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
}

.news-source {
  color: #999;
}

.news-link {
  color: #1890ff;
  text-decoration: none;
}

.news-link:hover {
  color: #096dd9;
}
</style> 