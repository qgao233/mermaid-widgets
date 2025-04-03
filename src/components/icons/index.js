// 导入所有图标组件
import GoogleIcon from './GoogleIcon.vue';

// 导出所有图标组件 
export {
  GoogleIcon
};

// 创建图标插件
export default {
  install: (app) => {
    // 全局注册所有图标组件
    app.component('GoogleIcon', GoogleIcon);
    
    // 如有更多图标，可以在此继续注册
  }
}; 