<template>
  <div
    v-if="modelValue"
    class="dialog-overlay"
    @mousedown.self="closeOnOverlayClick && $emit('update:modelValue', false)"
  >
    <div
      ref="dialogRef"
      class="dialog"
      :style="dialogStyle"
    >
      <!-- 拖拽头部 -->
      <div
        class="dialog-header"
        @mousedown="startDrag"
      >
        <slot name="header">
          <h3>{{ title }}</h3>
        </slot>
        <button
          class="close-button"
          @click.stop="$emit('update:modelValue', false)"
        >
          ×
        </button>
      </div>

      <!-- 内容区域 -->
      <div class="dialog-content">
        <slot></slot>
      </div>

      <!-- 调整大小的手柄 -->
      <div
        class="resize-handle"
        @mousedown.stop="startResize"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: '对话框'
  },
  initialWidth: {
    type: Number,
    default: 400
  },
  initialHeight: {
    type: Number,
    default: 300
  },
  minWidth: {
    type: Number,
    default: 200
  },
  minHeight: {
    type: Number,
    default: 150
  },
  closeOnOverlayClick: {
    type: Boolean,
    default: true
  }
})

defineEmits(['update:modelValue'])

const dialogRef = ref(null)
const position = ref({ x: 0, y: 0 })
const size = ref({
  width: props.initialWidth,
  height: props.initialHeight
})

// 计算对话框样式
const dialogStyle = computed(() => ({
  transform: `translate(${position.value.x}px, ${position.value.y}px)`,
  width: `${size.value.width}px`,
  height: `${size.value.height}px`
}))

// 拖拽相关
let isDragging = false
let startX = 0
let startY = 0
let initialX = 0
let initialY = 0

const startDrag = (event) => {
  isDragging = true
  startX = event.clientX
  startY = event.clientY
  initialX = position.value.x
  initialY = position.value.y

  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
}

const handleDrag = (event) => {
  if (!isDragging) return

  const deltaX = event.clientX - startX
  const deltaY = event.clientY - startY

  position.value = {
    x: initialX + deltaX,
    y: initialY + deltaY
  }
}

const stopDrag = () => {
  isDragging = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 调整大小相关
let isResizing = false
let startWidth = 0
let startHeight = 0

const startResize = (event) => {
  isResizing = true
  startX = event.clientX
  startY = event.clientY
  startWidth = size.value.width
  startHeight = size.value.height

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

const handleResize = (event) => {
  if (!isResizing) return

  const deltaX = event.clientX - startX
  const deltaY = event.clientY - startY

  size.value = {
    width: Math.max(props.minWidth, startWidth + deltaX),
    height: Math.max(props.minHeight, startHeight + deltaY)
  }
}

const stopResize = () => {
  isResizing = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  position: absolute;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  padding: 16px;
  background: #f5f5f5;
  cursor: move;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
}

.dialog-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 0 4px;
}

.close-button:hover {
  color: #333;
}

.dialog-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
}

.resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 20px;
  height: 20px;
  cursor: se-resize;
  background: linear-gradient(
    135deg,
    transparent 50%,
    rgba(0, 0, 0, 0.1) 50%
  );
}
</style> 