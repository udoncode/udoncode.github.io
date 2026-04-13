import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import AboutPage from '@/pages/AboutPage.vue'
import ArchivePage from '@/pages/ArchivePage.vue'
import NotFoundPage from '@/pages/NotFoundPage.vue'
import PostViewPage from '@/pages/PostViewPage.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/archive', name: 'archive', component: ArchivePage },
    { path: '/archive/:category/:slug', name: 'post', component: PostViewPage },
    { path: '/about', name: 'about', component: AboutPage },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundPage },
  ],
})

export default router
