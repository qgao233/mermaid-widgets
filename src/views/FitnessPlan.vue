<template>
  <div class="fitness-plan">
    <!-- 页面背景 -->
    <div class="page-background"></div>
    
    <!-- 计划概览 -->
    <div class="page-header">
      <div class="header-content">
        <h1>
          <span class="icon">💪</span>
          {{ currentGoal.goal_name }}
        </h1>
        <p class="subtitle">{{ currentGoal.goal_description }}</p>
        
        <div class="goal-info">
          <div class="info-item">
            <div class="info-icon">⚖️</div>
            <div class="info-content">
              <span class="label">起始体重</span>
              <span class="value">{{ currentGoal.start_weight }}斤</span>
            </div>
          </div>
          <div class="info-item">
            <div class="info-icon">🎯</div>
            <div class="info-content">
              <span class="label">目标体重</span>
              <span class="value">{{ currentGoal.target_weight }}斤</span>
            </div>
          </div>
          <div class="info-item">
            <div class="info-icon">📈</div>
            <div class="info-content">
              <span class="label">每周目标</span>
              <span class="value">-{{ currentGoal.weekly_goal }}斤</span>
            </div>
          </div>
        </div>
        
        <div class="plan-progress">
          <div class="progress-info">
            <span class="current-week">第 {{ currentWeek }} 周 / 共 {{ currentGoal.total_weeks }} 周</span>
            <span class="start-date">开始日期: {{ formatDate(currentGoal.start_date) }}</span>
          </div>
          <div class="progress-bar">
            <div 
              :style="{ width: `${(currentWeek / currentGoal.total_weeks) * 100}%` }" 
              class="progress-fill"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- 周计划列表 -->
      <div class="weeks-container">
        <div 
          v-for="week in weeksOverview" 
          :key="week.weekNumber"
          class="week-card"
          :class="{ 
            'current-week': week.weekNumber === currentWeek,
            'completed': calculateWeekProgress(week.activities) === 100
          }"
          @click="showWeekPlan(week.weekNumber)"
        >
          <div class="week-card-content">
            <div class="week-header">
              <h3>第 {{ week.weekNumber }} 周</h3>
              <span class="week-date">{{ formatDate(week.startDate) }}</span>
            </div>
            
            <div class="week-progress">
              <div class="progress-bar">
                <div 
                  :style="{ width: `${calculateWeekProgress(week.activities)}%` }" 
                  class="progress-fill"
                ></div>
              </div>
              <span class="progress-text">
                完成度: {{ calculateWeekProgress(week.activities) }}%
              </span>
            </div>
            
            <div class="week-summary">
              <div class="summary-item">
                <span class="icon">🏃‍♂️</span>
                <span class="count">{{ countExercises(week.activities) }}</span>
                <span class="label">个运动项目</span>
              </div>
              <div class="summary-item">
                <span class="icon">🥗</span>
                <span class="count">{{ countMeals(week.activities) }}</span>
                <span class="label">餐营养计划</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 周计划轮播图 -->
    <WeekPlanCarousel
      v-model:visible="showCarousel"
      :weekData="selectedWeekData"
      :currentDisplayWeek="selectedWeek"
      :totalWeeks="currentGoal.total_weeks"
      @prev-week="prevWeek"
      @next-week="nextWeek"
      @activity-updated="handleActivityUpdated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { 
  getCurrentGoal,
  getWeeksOverview,
  getWeekActivities,
  getCurrentWeek
} from '@/api/fitness'
import WeekPlanCarousel from '@/components/fitness/WeekPlanCarousel.vue'

// 获取Toast服务
const toast = inject('toast')

const currentGoal = ref({})
const currentWeek = ref(1)
const weeksOverview = ref([])
const selectedWeek = ref(null)
const selectedWeekData = ref(null)
const showCarousel = ref(false)

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 计算周进度
const calculateWeekProgress = (activities) => {
  if (!activities || activities.length === 0) return 0
  
  let totalActivities = 0
  let completedActivities = 0
  
  activities.forEach(day => {
    if (day.activities) {
      totalActivities += day.activities.length
      completedActivities += day.activities.filter(a => a.is_completed).length
    }
  })
  
  return totalActivities === 0 ? 0 : Math.round((completedActivities / totalActivities) * 100)
}

// 统计运动项目数量
const countExercises = (activities) => {
  if (!activities) return 0
  return activities.reduce((count, day) => {
    if (day.activities) {
      return count + day.activities.filter(a => a.entry_type === '锻炼').length
    }
    return count
  }, 0)
}

// 统计饮食计划数量
const countMeals = (activities) => {
  if (!activities) return 0
  return activities.reduce((count, day) => {
    if (day.activities) {
      return count + day.activities.filter(a => a.entry_type === '饮食').length
    }
    return count
  }, 0)
}

// 显示周计划详情
const showWeekPlan = async (weekNumber) => {
  selectedWeek.value = weekNumber
  try {
    const activities = await getWeekActivities(currentGoal.value.id, weekNumber)
    
    // 按日期分组活动
    const groupedActivities = activities.reduce((acc, activity) => {
      if (!acc[activity.activity_date]) {
        acc[activity.activity_date] = {
          activity_date: activity.activity_date,
          is_completed: false,
          activities: []
        }
      }
      acc[activity.activity_date].activities.push(activity)
      // 如果任何一个活动完成，则该天标记为完成
      if (activity.is_completed) {
        acc[activity.activity_date].is_completed = true
      }
      return acc
    }, {})
    
    // 转换为数组并按日期排序
    const sortedActivities = Object.values(groupedActivities).sort(
      (a, b) => new Date(a.activity_date) - new Date(b.activity_date)
    )

    selectedWeekData.value = {
      startDate: weeksOverview.value.find(w => w.weekNumber === weekNumber)?.startDate,
      activities: sortedActivities
    }
    showCarousel.value = true
  } catch (error) {
    toast.show('获取周计划失败')
    console.error(error)
  }
}

// 上一周
const prevWeek = async () => {
  if (selectedWeek.value > 1) {
    await showWeekPlan(selectedWeek.value - 1)
  }
}

// 下一周
const nextWeek = async () => {
  if (selectedWeek.value < currentGoal.value.total_weeks) {
    await showWeekPlan(selectedWeek.value + 1)
  }
}

// 处理活动更新
const handleActivityUpdated = async () => {
  // 重新加载周概览数据
  weeksOverview.value = await getWeeksOverview(currentGoal.value.id)
  // 重新加载当前选中的周数据
  if (selectedWeek.value) {
    await showWeekPlan(selectedWeek.value)
  }
}

// 初始化数据
const initializeData = async () => {
  try {
    const [goal, week] = await Promise.all([
      getCurrentGoal(),
      getCurrentWeek()
    ])
    
    currentGoal.value = goal
    currentWeek.value = week
    
    // 获取周概览
    weeksOverview.value = await getWeeksOverview(goal.id)
  } catch (error) {
    toast.show('获取计划数据失败')
    console.error(error)
  }
}

onMounted(() => {
  initializeData()
})
</script>

<style scoped>
.fitness-plan {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.page-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)),
    url('https://source.unsplash.com/1600x900/?fitness,gym,workout') center/cover;
  z-index: -1;
  background-attachment: fixed;
}

.page-header {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  padding: 3rem 0;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('/images/pattern.svg') center/cover;
  opacity: 0.1;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
}

.page-header h1 {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 2.5rem;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 800px;
  line-height: 1.6;
}

.goal-info {
  display: flex;
  gap: 2rem;
  margin: 2rem 0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 12px;
  min-width: 200px;
}

.info-icon {
  font-size: 2rem;
}

.info-content {
  display: flex;
  flex-direction: column;
}

.info-content .label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.info-content .value {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 0.3rem;
}

.plan-progress {
  margin-top: 2rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
}

.current-week {
  font-size: 1.2rem;
  font-weight: 500;
}

.start-date {
  opacity: 0.8;
}

.progress-bar {
  height: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #fff;
  transition: width 0.3s ease;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.weeks-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.week-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
}

.week-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #6a11cb, #2575fc);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.week-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.week-card:hover::before {
  opacity: 1;
}

.week-card.current-week {
  border: 2px solid #2575fc;
}

.week-card.completed::after {
  content: '✓';
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 24px;
  height: 24px;
  background: #67c23a;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.week-card-content {
  padding: 1.5rem;
}

.week-header {
  margin-bottom: 1.5rem;
}

.week-header h3 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.week-date {
  color: #666;
  font-size: 0.9rem;
}

.week-progress {
  margin-bottom: 1.5rem;
}

.week-summary {
  display: flex;
  justify-content: space-around;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.summary-item .icon {
  font-size: 1.5rem;
}

.summary-item .count {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
}

.summary-item .label {
  font-size: 0.8rem;
  color: #666;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }
  
  .goal-info {
    flex-direction: column;
    gap: 1rem;
  }
  
  .info-item {
    width: 100%;
  }
  
  .weeks-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style> 