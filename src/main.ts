import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/global.css'
import '@tabler/icons-webfont/dist/tabler-icons.min.css'
import { migrateFromLegacy } from './lib/migration'

// Link resetu hasła z e-maila ma tokeny w hashu (#access_token=...&type=recovery).
// Router hash-owy zjadłby ten hash, więc przechwytujemy tokeny PRZED startem routera,
// chowamy do sessionStorage i czyścimy URL. LoginView je odczyta i pokaże formularz.
if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
  const params = new URLSearchParams(window.location.hash.replace(/^#\/?/, ''))
  const at = params.get('access_token')
  const rt = params.get('refresh_token')
  if (at && rt) {
    sessionStorage.setItem('tp_recovery', JSON.stringify({ at, rt }))
  }
  window.location.hash = '#/login'
}

const migration = migrateFromLegacy()
if (migration.migrated) {
  console.log(`✓ Migracja: ${migration.count} treningów + ${migration.bodyCount} pomiarów wagi z legacy`)
}

const app = createApp(App)
app.use(createPinia())
app.use(router)

import { useSettingsStore } from './stores/settings'
useSettingsStore()

app.mount('#app')
