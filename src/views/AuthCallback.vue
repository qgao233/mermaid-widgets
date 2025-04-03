<template>
  <div class="auth-callback">
    <h2>认证中...</h2>
    <p>请稍候，正在完成登录流程</p>
  </div>
</template>

<script>
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { supabase } from '../utils/supabase';

export default {
  name: 'AuthCallback',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();

    onMounted(async () => {
      console.log('认证回调页面加载，哈希参数:', route.hash);
      const hash = route.hash;

      if (hash.startsWith('#access_token=')) {
        // 处理哈希中的 access_token
        const hashParams = new URLSearchParams(hash.substring(1));
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');
        
        if (access_token && refresh_token) {
          // 使用获取到的token调用setSession
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token
          });
          
          if (error) {
            console.error('设置会话失败:', error);
          } else {
            console.log('成功设置会话');
          }
        }
        
        // 从Vuex中获取登录前保存的路径
        const redirectPath = store.getters.getAuthRedirectPath;
        console.log('登录成功，重定向到:', redirectPath);
        
        // 替换当前路由，跳转到登录前的页面
        router.replace({ path: redirectPath, replace: true });
      } else {
        console.log('未找到授权码，可能是直接访问回调页面');
        router.push('/');
      }
    });

    return {};
  }
}
</script>

<style scoped>
.auth-callback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  font-family: Arial, sans-serif;
}

h2 {
  margin-bottom: 10px;
  color: #333;
}

p {
  color: #666;
}
</style> 