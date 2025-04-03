<template>
  <Toast 
    :show="toastService.show.value" 
    :message="toastService.message.value" 
    :duration="toastService.duration.value"
    @update:show="toastService.show.value = $event"
  />
</template>

<script>
import { defineComponent } from 'vue';
import Toast from './Toast.vue';
import toastService from './ToastService';

export default defineComponent({
  name: 'ToastContainer',
  components: {
    Toast
  },
  setup() {
    return {
      toastService
    };
  }
});
</script> 