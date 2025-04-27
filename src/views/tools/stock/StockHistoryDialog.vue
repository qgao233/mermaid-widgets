<template>
  <DraggableDialog
    v-model="visible"
    title="股票推荐历史记录"
    :initial-width="1200"
    :initial-height="600"
    :min-width="1000"
    :min-height="400"
  >
    <div class="history-content">
      <button @click="loadRecommendationHistory" :disabled="loading" class="refresh-button">
        {{ loading ? '加载中...' : '刷新历史记录' }}
      </button>
      
      <div v-if="loading" class="loading">
        <p>加载历史记录中...</p>
      </div>
      <div v-else-if="history.length > 0" class="history-table">
        <table>
          <thead>
            <tr>
              <th>时间</th>
              <th>股票代码</th>
              <th>股票名称</th>
              <th>市场</th>
              <th>置信度</th>
              <th>推荐理由</th>
              <th>相关新闻</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in flattenedHistory" :key="index">
              <td>{{ formatDate(item.created_at) }}</td>
              <td>{{ item.recommendation.stockCode }}</td>
              <td>{{ item.recommendation.stockName }}</td>
              <td>{{ item.recommendation.market }}</td>
              <td>
                <span 
                  class="confidence-badge"
                  :class="getConfidenceClass(item.recommendation.confidence)"
                >
                  {{ item.recommendation.confidence }}%
                </span>
              </td>
              <td>{{ item.recommendation.reason }}</td>
              <td class="news-cell">
                <div class="news-item">
                  <div class="news-title">{{ item.news_context.title }}</div>
                  <div class="news-meta">
                    <span class="news-source">{{ item.news_context.source }}</span>
                    <span class="news-time">{{ formatDate(item.news_context.publishedAt) }}</span>
                  </div>
                  <div class="news-summary">{{ item.news_context.summary }}</div>
                  <a 
                    :href="item.news_context.url" 
                    target="_blank" 
                    class="news-link"
                  >
                    查看原文
                  </a>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="no-history">
        <p>暂无推荐历史记录</p>
      </div>
    </div>
  </DraggableDialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import DraggableDialog from '@/components/DraggableDialog.vue'
import { getStockRecommendationHistory } from '@/api/stockRecommendation.js'

const visible = ref(false)
const loading = ref(false)
const history = ref([])

// 将历史记录展开成扁平结构
const flattenedHistory = computed(() => {
  const flattened = []
  history.value.forEach(item => {
    flattened.push({
      created_at: item.created_at,
      recommendation: item.recommendations,
      news_context: item.news_context
    })
  })
  return flattened
})

const getConfidenceClass = (confidence) => {
  if (confidence >= 80) return 'high'
  if (confidence >= 60) return 'medium'
  return 'low'
}

const loadRecommendationHistory = async () => {
  loading.value = true
  try {
    const data = await getStockRecommendationHistory()
    history.value = data || []
  } catch (error) {
    console.error('获取推荐历史异常:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 暴露方法给父组件
defineExpose({
  show: () => {
    visible.value = true
    loadRecommendationHistory()
  }
})
</script>

<style scoped>
.history-content {
  height: 100%;
  padding: 20px;
}

.refresh-button {
  margin-bottom: 20px;
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.refresh-button:hover {
  background-color: #096dd9;
}

.refresh-button:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.history-table {
  margin-top: 20px;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

table th,
table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
  vertical-align: top;
}

table th {
  background-color: #f5f5f5;
  font-weight: 500;
  white-space: nowrap;
}

.no-history {
  text-align: center;
  padding: 20px;
  color: #999;
}

.confidence-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
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

.news-cell {
  max-width: 400px;
}

.news-item {
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 8px;
}

.news-item:last-child {
  margin-bottom: 0;
}

.news-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.news-meta {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.news-source {
  margin-right: 12px;
}

.news-summary {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

.news-link {
  display: inline-block;
  margin-top: 8px;
  color: #1890ff;
  text-decoration: none;
  font-size: 12px;
}

.news-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}
</style> 