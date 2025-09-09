// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// CSS ลำดับสำคัญ: Bootstrap ก่อน, ของเราทีหลัง (เพื่อ override ได้)
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js' // มี Popper ในตัว (ใช้กับ dropdown/offcanvas)
import '@/assets/main.css' // ถ้ามี alias @ → src; ถ้าไม่ได้ตั้ง ใช้ './assets/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
