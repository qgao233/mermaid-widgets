import { supabase } from '@/utils/supabase'

// 获取计划概览信息
export const getPlanOverview = async () => {
  const { data, error } = await supabase
    .from('fitness_log')
    .select('plan_name, plan_start_date, plan_total_weeks, plan_goal_description')
    .limit(1)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data[0]
}

// 获取当前活动的健身目标
export const getCurrentGoal = async () => {
  const { data, error } = await supabase
    .from('fitness_goals')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error) throw error
  return data
}

// 获取指定目标的所有周概览
export const getWeeksOverview = async (goalId) => {
  const { data, error } = await supabase
    .from('fitness_activities')
    .select(`
      week_number,
      activity_date,
      is_completed
    `)
    .eq('goal_id', goalId)
    .order('week_number', { ascending: true })
    .order('activity_date', { ascending: true })
  
  if (error) throw error
  
  // 按周分组并计算完成度
  const weekGroups = data.reduce((acc, curr) => {
    if (!acc[curr.week_number]) {
      acc[curr.week_number] = {
        weekNumber: curr.week_number,
        startDate: curr.activity_date,
        activities: []
      }
    }
    acc[curr.week_number].activities.push(curr)
    return acc
  }, {})
  
  return Object.values(weekGroups)
}

// 获取当前周数
export const getCurrentWeek = async (goalId) => {
  const { data: goal } = await supabase
    .from('fitness_goals')
    .select('start_date')
    .eq('id', goalId)
    .single()
  
  if (!goal) return 1
  
  const startDate = new Date(goal.start_date)
  const today = new Date()
  const diffTime = Math.abs(today - startDate)
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
  
  return Math.min(diffWeeks, 16) // 限制最大16周
}

// 获取指定周的所有活动
export const getWeekActivities = async (goalId, weekNumber) => {
  const { data, error } = await supabase
    .from('fitness_activities')
    .select('*')
    .eq('goal_id', goalId)
    .eq('week_number', weekNumber)
    .order('activity_date', { ascending: true })
    .order('entry_type', { ascending: true })
    .order('display_order', { ascending: true })
  
  if (error) throw error
  
  // 对数据进行去重处理
  const uniqueActivities = data.reduce((acc, curr) => {
    const key = `${curr.activity_date}_${curr.entry_type}_${curr.meal_type || curr.exercise_name}`
    if (!acc[key]) {
      acc[key] = curr
    }
    return acc
  }, {})
  
  return Object.values(uniqueActivities)
}

// 创建一天的活动记录
export const createDayActivity = async (activityData) => {
  const { data, error } = await supabase
    .from('fitness_log')
    .insert([activityData])
    .select()
  
  if (error) throw error
  return data[0]
}

// 更新活动完成状态
export const updateActivityStatus = async (activityId, isCompleted) => {
  const { data, error } = await supabase
    .from('fitness_activities')
    .update({ 
      is_completed: isCompleted,
      updated_at: new Date().toISOString()
    })
    .eq('id', activityId)
    .select()
  
  if (error) throw error
  return data[0]
}

// 记录体重
export const recordWeight = async (goalId, weight) => {
  const { data, error } = await supabase
    .from('fitness_activities')
    .insert({
      goal_id: goalId,
      entry_type: '体重记录',
      weight_record: weight,
      activity_date: new Date().toISOString(),
      week_number: await getCurrentWeek(goalId),
      day_of_week: new Date().getDay() + 1
    })
    .select()
  
  if (error) throw error
  return data[0]
}

// 获取体重记录历史
export const getWeightHistory = async (goalId) => {
  const { data, error } = await supabase
    .from('fitness_activities')
    .select('activity_date, weight_record')
    .eq('goal_id', goalId)
    .eq('entry_type', '体重记录')
    .order('activity_date', { ascending: true })
  
  if (error) throw error
  return data
} 