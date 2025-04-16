<template>
  <DraggableDialog
    v-model="visible"
    title="股票推荐历史记录"
    :initial-width="1000"
    :initial-height="600"
    :min-width="800"
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
              <th>日期</th>
              <th>推荐股票</th>
              <th>推荐理由</th>
              <th>推荐得分</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, historyIndex) in history" :key="historyIndex">
              <td>{{ formatDate(item.created_at) }}</td>
              <td>
                <div v-for="(stock, stockIndex) in item.recommendations" :key="stockIndex">
                  {{ stock.symbol }} - {{ stock.name }}
                </div>
              </td>
              <td>
                <div v-for="(stock, stockIndex) in item.recommendations" :key="stockIndex">
                  {{ stock.reason }}
                </div>
              </td>
              <td>
                <div v-for="(stock, stockIndex) in item.recommendations" :key="stockIndex">
                  {{ stock.score.toFixed(2) }}
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
import { ref } from 'vue'
import DraggableDialog from '@/components/DraggableDialog.vue'
import { supabase } from '@/utils/supabase.js'

const visible = ref(false)
const loading = ref(false)
const history = ref([])

const loadRecommendationHistory = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('stock_recommendations')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('获取推荐历史失败:', error)
      return
    }
    
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
}

table th {
  background-color: #f5f5f5;
  font-weight: 500;
}

.no-history {
  text-align: center;
  padding: 20px;
  color: #999;
}
</style> 