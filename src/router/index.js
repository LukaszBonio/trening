import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: { name: 'workout' } },
  { path: '/workout', name: 'workout', component: () => import('../views/WorkoutView.vue') },
  { path: '/stats',   name: 'stats',   component: () => import('../views/StatsView.vue') },
  { path: '/history', name: 'history', component: () => import('../views/HistoryView.vue') },
  { path: '/you',     name: 'you',     component: () => import('../views/YouView.vue') }
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})
