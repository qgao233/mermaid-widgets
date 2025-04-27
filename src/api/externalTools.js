import supabase from '@/utils/supabase.js'


/**
 * 获取所有外链工具
 * @returns {Promise<Array>} 外链工具列表
 */
export async function getExternalTools() {
    try {
        const { data, error } = await supabase
          .from('external_tools')
          .select('*')
          .order('sort_order', { ascending: true })
        
        if (error) {
          console.error('获取外链工具失败:', error)
          return []
        }
        
        return data || []
      } catch (error) {
        console.error('获取外链工具异常:', error)
        return []
      }
}

