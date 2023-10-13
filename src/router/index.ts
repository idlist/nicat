import { createRouter, createWebHashHistory } from 'vue-router'
import MainView from '@/views/MainView/MainView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MainView,
    },
  ],
})

export default router
