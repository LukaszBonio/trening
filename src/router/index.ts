import { createRouter, createWebHashHistory } from 'vue-router'
import { REQUIRE_AUTH } from '../lib/authConfig'
import { isChunkLoadError, reloadForFreshChunks } from '../lib/chunkReload'

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
// Wspólna logika wykrywania/reloadu w lib/chunkReload (używana też przez ExerciseInfoModal).
router.onError((error, to) => {
  if (!isChunkLoadError(error)) return
  if (to?.fullPath) window.location.hash = to.fullPath
  reloadForFreshChunks() // throttled: najwyżej raz na 10 s (ochrona przed pętlą)
})

export default router
