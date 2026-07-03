import { createRouter, createWebHashHistory } from 'vue-router'
import { REQUIRE_AUTH } from '../lib/authConfig'

const routes = [
  { path: '/', redirect: { name: 'workout' } },
  { path: '/login',   name: 'login',   component: () => import('../views/LoginView.vue'), meta: { public: true } },
  { path: '/workout', name: 'workout', component: () => import('../views/WorkoutView.vue') },
  { path: '/stats',   name: 'stats',   component: () => import('../views/StatsView.vue') },
  { path: '/history', name: 'history', component: () => import('../views/HistoryView.vue') },
  { path: '/you',     name: 'you',     component: () => import('../views/YouView.vue') }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to) => {
  if (!REQUIRE_AUTH) return true

  const { useCloudStore } = await import('../stores/cloud')
  const cloud = useCloudStore()
  cloud.init()
  await cloud.waitForAuth()

  if (cloud.isLoggedIn && to.name === 'login') {
    return { name: 'workout' }
  }
  if (!cloud.isLoggedIn && !to.meta.public) {
    return { name: 'login', query: to.fullPath !== '/' ? { redirect: to.fullPath } : {} }
  }
  return true
})

export default router
