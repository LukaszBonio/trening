import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/global.css'
import '@tabler/icons-webfont/dist/tabler-icons.min.css'
import { migrateFromLegacy } from './lib/migration'

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
