<template>
  <div class="week-plan-carousel">
    <!-- 轮播图遮罩层 -->
    <div class="carousel-overlay" v-if="visible" @click="closeCarousel">
      <div class="carousel-content" @click.stop>
        <!-- 周数指示器 -->
        <div class="week-indicator">
          <span class="week-title">第 {{ currentDisplayWeek }} 周</span>
          <span class="week-date">{{ formatDate(weekData.startDate) }}</span>
        </div>

        <!-- 轮播图控制按钮 -->
        <div class="carousel-controls">
          <button class="control-btn prev" @click="prevWeek" :disabled="currentDisplayWeek <= 1">
            <span class="icon">←</span>
            <span class="text">上一周</span>
          </button>
          <button class="control-btn next" @click="nextWeek" :disabled="currentDisplayWeek >= totalWeeks">
            <span class="text">下一周</span>
            <span class="icon">→</span>
          </button>
        </div>

        <!-- 日历式布局 -->
        <div class="week-calendar">
          <div class="calendar-body">
            <div v-for="(day, index) in weekData.activities" 
                 :key="index"
                 class="calendar-cell day"
                 :class="{ 
                   'completed': day.is_completed,
                   'current-day': isCurrentDay(day.activity_date),
                   'past-day': isPastDay(day.activity_date)
                 }">
              <div class="day-header">
                <span class="date">{{ formatDayDate(day.activity_date) }}</span>
                <span class="weekday">{{ getWeekDay(day.activity_date) }}</span>
                <span class="status">{{ day.is_completed ? '已完成' : '进行中' }}</span>
              </div>
              
              <!-- 饮食计划 -->
              <div class="day-content meals" v-if="getDayMeals(day.activities).length">
                <h4>饮食计划</h4>
                <div v-for="meal in getDayMeals(day.activities)" 
                     :key="meal.id"
                     class="activity-item"
                     :class="{ 'completed': meal.is_completed }">
                  <div class="activity-header">
                    <span class="meal-type">{{ meal.meal_type }}</span>
                    <span class="calories">{{ meal.meal_calories }}卡</span>
                  </div>
                  <p class="description">{{ meal.meal_description }}</p>
                  <el-checkbox 
                    v-model="meal.is_completed"
                    @change="updateActivity(meal.id, $event)">
                    完成
                  </el-checkbox>
                </div>
              </div>
              
              <!-- 锻炼计划 -->
              <div class="day-content exercises" v-if="getDayExercises(day.activities).length">
                <h4>锻炼计划</h4>
                <div v-for="exercise in getDayExercises(day.activities)" 
                     :key="exercise.id"
                     class="activity-item"
                     :class="{ 'completed': exercise.is_completed }">
                  <div class="activity-header">
                    <span class="exercise-name">{{ exercise.exercise_name }}</span>
                    <span class="category">{{ exercise.exercise_category }}</span>
                  </div>
                  <div class="exercise-details">
                    <span v-if="exercise.exercise_duration_minutes">
                      ⏱️ {{ exercise.exercise_duration_minutes }}分钟
                    </span>
                    <span v-if="exercise.exercise_sets">
                      🔄 {{ exercise.exercise_sets }}组 x {{ exercise.exercise_reps }}
                    </span>
                    <span v-if="exercise.exercise_weight_kg">
                      ⚖️ {{ exercise.exercise_weight_kg }}kg
                    </span>
                    <span v-if="exercise.exercise_distance_km">
                      📏 {{ exercise.exercise_distance_km }}km
                    </span>
                  </div>
                  <el-checkbox 
                    v-model="exercise.is_completed"
                    @change="updateActivity(exercise.id, $event)">
                    完成
                  </el-checkbox>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { updateActivityStatus } from '@/api/fitness'

const props = defineProps({
  visible: Boolean,
  weekData: Object,
  currentDisplayWeek: Number,
  totalWeeks: Number
})

const emit = defineEmits(['update:visible', 'prev-week', 'next-week', 'activity-updated'])

const closeCarousel = () => {
  emit('update:visible', false)
}

const prevWeek = () => {
  emit('prev-week')
}

const nextWeek = () => {
  emit('next-week')
}

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const formatDate = (dateString) => {
  if (!dateString) return ''
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('zh-CN')
}

const getWeekDay = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return weekDays[date.getDay()]
}

const formatDayDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.getDate()
}

const getDayMeals = (activities) => {
  return activities.filter(activity => activity.entry_type === '饮食')
}

const getDayExercises = (activities) => {
  return activities.filter(activity => activity.entry_type === '锻炼')
}

const updateActivity = async (activityId, isCompleted) => {
  try {
    await updateActivityStatus(activityId, isCompleted)
    emit('activity-updated')
  } catch (error) {
    console.error('更新活动状态失败:', error)
  }
}

const isCurrentDay = (dateString) => {
  const today = new Date()
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toDateString() === today.toDateString()
}

const isPastDay = (dateString) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date < today
}
</script>

<style scoped>
.week-plan-carousel {
  font-family: 'Roboto', sans-serif;
}

.carousel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.carousel-content {
  background: #fff;
  border-radius: 16px;
  width: 95%;
  max-width: 1400px;
  height: 90vh;
  padding: 2rem;
  position: relative;
  overflow-y: auto;
}

.week-indicator {
  text-align: center;
  margin-bottom: 2rem;
}

.week-title {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  margin-right: 1rem;
}

.week-date {
  font-size: 1.2rem;
  color: #666;
}

.carousel-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.control-btn {
  display: flex;
  align-items: center;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: #3a6df0;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.control-btn:not(:disabled):hover {
  background: #2952b3;
}

.control-btn .icon {
  font-size: 1.2rem;
  margin: 0 0.5rem;
}

.week-calendar {
  background: #f8f9fa;
  border-radius: 12px;
  overflow-x: auto;
}

.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e9ecef;
}

.calendar-cell.day {
  background: white;
  padding: 1rem;
  min-height: 300px;
  border-top: 3px solid #3a6df0;
}

.calendar-cell.day.completed {
  background: #f0f9eb;
}

.calendar-cell.day.current-day {
  background: #e6f7ff;
  border-top: 3px solid #1890ff;
  box-shadow: 0 0 10px rgba(24, 144, 255, 0.2);
}

.calendar-cell.day.past-day {
  background: #f5f5f5;
  opacity: 0.8;
  border-top: 3px solid #d9d9d9;
}

.calendar-cell.day.past-day .activity-item {
  background: #fafafa;
}

.calendar-cell.day.current-day .day-header .date {
  color: #1890ff;
}

.day-header {
  margin-bottom: 1rem;
  text-align: center;
}

.day-header .date {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.day-header .weekday {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin: 0.3rem 0;
}

.day-header .status {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.5rem;
}

.day-content {
  margin-bottom: 1.5rem;
}

.day-content h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #3a6df0;
}

.activity-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.activity-item.completed {
  background: #f0f9eb;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.meal-type, .exercise-name {
  font-weight: 500;
  color: #2c3e50;
}

.calories, .category {
  color: #666;
  font-size: 0.9rem;
}

.description {
  font-size: 0.9rem;
  color: #666;
  margin: 0.5rem 0;
}

.exercise-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: #666;
}

@media (max-width: 1200px) {
  .carousel-content {
    padding: 1rem;
  }
  
  .calendar-cell.day {
    padding: 0.5rem;
  }
  
  .exercise-details {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style> 