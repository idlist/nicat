import 'normalize.css'
import '@/styles/global.sass'
import '@/styles/variables.sass'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')
