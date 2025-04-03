import Toast from '../components/common/Toast.vue';
import toastService from '../components/common/ToastService';

// Toast插件
export default {
  install: (app) => {
    // 全局注册Toast组件
    app.component('Toast', Toast);
    
    // 添加全局访问属性
    app.config.globalProperties.$toast = {
      show: (message, duration = 3000) => {
        toastService.showToast(message, duration);
      }
    };
    
    // 为Composition API提供inject函数
    app.provide('toast', {
      show: (message, duration = 3000) => {
        toastService.showToast(message, duration);
      }
    });
  }
}; 