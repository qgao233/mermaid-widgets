import { createStore } from 'vuex';

export default createStore({
  state: {
    authRedirectPath: '/tools/chat', // 默认重定向路径
  },
  
  mutations: {
    // 设置认证重定向路径
    setAuthRedirectPath(state, path) {
      state.authRedirectPath = path;
    },
  },
  
  actions: {
    // 保存登录来源页面
    saveAuthSource({ commit }, path) {
      commit('setAuthRedirectPath', path);
    },
  },
  
  getters: {
    // 获取认证重定向路径
    getAuthRedirectPath: state => state.authRedirectPath,
  },
}); 