import { supabase } from '@/utils/supabase.js'

/**
 * 保存股票推荐记录
 * @param {Array} newsData 新闻数据
 * @param {Array} recommendations AI推荐的股票数据
 * @returns {Promise<Object>} 保存结果
 */
export async function saveStockRecommendation(newsData, recommendations) {
  try {
    // 创建一个新闻ID到新闻数据的映射
    const newsMap = new Map(newsData.map(news => [news.id, news]))
    
    // 准备要保存的数据
    const records = recommendations.map(recommendation => {
      // 根据推荐中的newsId找到对应的新闻
      const relatedNews = newsMap.get(recommendation.newsId)
      
      return {
        news_context: JSON.stringify(relatedNews) || null, // 如果找不到对应的新闻，则为null
        recommendations: JSON.stringify(recommendation),
        created_at: new Date().toISOString()
      }
    })

    if (records.length === 0) {
      throw new Error('没有有效的推荐记录可保存')
    }

    const { data, error } = await supabase
      .from('stock_recommendations')
      .insert(records)
      .select()

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