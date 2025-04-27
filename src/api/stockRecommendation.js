import { supabase } from '@/utils/supabase.js'

/**
 * 保存股票推荐记录
 * @param {Array} newsData 新闻数据
 * @param {Array} recommendations AI推荐的股票数据
 * @returns {Promise<Object>} 保存结果
 */
export async function saveStockRecommendation(newsData, recommendations) {
    try {
      // 准备要保存的数据
      const record = [];
      for (let i = 0; i < newsData.length; i++) {
        record.push({
          news_context: newsData[i],
          recommendations: recommendations[i],
          created_at: new Date().toISOString()
        })
      }
  
      const { data, error } = await supabase
        .from('stock_recommendations')
        .insert(record)
        .select()
        .single()
  
      if (error) {
        console.error('保存股票推荐记录失败:', error)
        throw error
      }
  
      return data
    } catch (error) {
      console.error('保存股票推荐记录异常:', error)
      throw error
    }
  }
  
  /**
   * 获取历史推荐记录
   * @returns {Promise<Array>} 历史推荐记录
   */
  export async function getStockRecommendationHistory() {
    try {
      const { data, error } = await supabase
        .from('stock_recommendations')
        .select('*')
        .order('created_at', { ascending: false })
  
      if (error) {
        console.error('获取历史推荐记录失败:', error)
        return []
      }
  
      return data || []
    } catch (error) {
      console.error('获取历史推荐记录异常:', error)
      return []
    }
  }