import { createRouter, createWebHashHistory } from 'vue-router'
import { REQUIRE_AUTH } from '../lib/authConfig'

const routes = [
  { path: '/', redirect: { name: 'workout' } },
  { path: '/login',   name: 'login',   component: () => import('../views/LoginView.vue'), meta: { public: true } },
  { path: '/workout', name: 'workout', component: () => import('../views/WorkoutView.vue') },
  { path: '/stats',   name: 'stats',   component: () => import('../views/StatsView.vue') },
  { path: '/coach',   name: 'coach',   component: () => import('../views/CoachView.vue') },
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

// Po deployu stare chunki widoków (hash w nazwie) znikają z serwera, a PWA
// (skipWaiting + cleanupOutdatedCaches) czyści je z cache w trakcie sesji.
// Wtedy leniwy import widoku pada i klik w zakładkę „nic nie robi". Łapiemy ten
// błąd i przeładowujemy stronę na docelową trasę — świeży index.html poda nowe chunki.
function isChunkLoadError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return /dynamically imported module|Importing a module script failed|error loading dynamically imported|Failed to fetch dynamically/i.test(msg)
}

router.onError((error, to) => {
  if (!isChunkLoadError(error)) return
  // Zabezpieczenie przed pętlą: przeładuj najwyżej raz na 10 s.
  const KEY = 'tp_chunk_reload_at'
  let last = 0
  try { last = Number(sessionStorage.getItem(KEY) || 0) } catch { /* prywatny tryb */ }
  const now = Date.now()
  if (now - last < 10000) return
  try { sessionStorage.setItem(KEY, String(now)) } catch { /* ignore */ }
  if (to?.fullPath) window.location.hash = to.fullPath
  window.location.reload()
})

export default router
