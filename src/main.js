import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import toastPlugin from './plugins/toast'
import iconPlugin from './components/icons'
import store from './store'

const app = createApp(App)
app.use(router)
app.use(toastPlugin)
app.use(iconPlugin)
app.use(store)
app.mount('#app') 