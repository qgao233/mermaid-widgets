<template>
  <Teleport to="body">
    <div v-if="visible" class="toast-container" :class="{ 'toast-show': visible }">
      <div class="toast-message">
        {{ message }}
      </div>
    </div>
  </Teleport>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'Toast',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: ''
    },
    duration: {
      type: Number,
      default: 3000
    }
  },
  emits: ['update:show'],
  setup(props, { emit }) {
    const visible = ref(false);
    
    // 监听show属性变化
    watch(() => props.show, (newVal) => {
      if (newVal) {
        visible.value = true;
        // 自动关闭
        setTimeout(() => {
          visible.value = false;
          emit('update:show', false);
        }, props.duration);
      } else {
        visible.value = false;
      }
    }, { immediate: true });
    
    return {
      visible
    };
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 30px;
  left: 50%;
  transform: translateX(-50%) translateY(-100px);
  background-color: rgba(51, 51, 51, 0.9);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  transition: transform 0.3s ease, opacity 0.3s ease;
  opacity: 0;
}

.toast-show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

.toast-message {
  font-size: 16px;
  font-weight: 500;
}
</style> 