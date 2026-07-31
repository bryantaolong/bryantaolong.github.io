import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/simple.css'

const app = createApp(App)
app.use(router)
app.mount('#root')
