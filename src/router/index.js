import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import AboutPage from '@/pages/AboutPage.vue'
import ArchivePage from '@/pages/ArchivePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/archive', name: 'archive', component: ArchivePage },
    { path: '/about', name: 'about', component: AboutPage },
  ],
})

export default router
