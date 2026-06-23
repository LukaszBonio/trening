import { createRouter, createWebHashHistory } from 'vue-router'
import { REQUIRE_AUTH } from '../lib/authConfig.js'

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

// === BRAMKA LOGOWANIA (auth gate) ===
// Sterowana flagą REQUIRE_AUTH w src/lib/authConfig.js.
// Aby wyłączyć: ustaw flagę na false (guard staje się no-opem) lub usuń ten blok.
router.beforeEach(async (to) => {
  if (!REQUIRE_AUTH) return true

  // Import wewnątrz guarda: Pinia musi być już aktywna (jest — main.js
  // instaluje Pinię przed routerem).
  const { useCloudStore } = await import('../stores/cloud.js')
  const cloud = useCloudStore()
  cloud.init()
  await cloud.waitForAuth()

  // Zalogowany na ekranie logowania → przekieruj do aplikacji.
  if (cloud.isLoggedIn && to.name === 'login') {
    return { name: 'workout' }
  }
  // Niezalogowany poza trasą publiczną → ekran logowania (z zapamiętaniem celu).
  if (!cloud.isLoggedIn && !to.meta.public) {
    return { name: 'login', query: to.fullPath !== '/' ? { redirect: to.fullPath } : {} }
  }
  return true
})

export default router
