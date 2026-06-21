import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/global.css'
import { migrateFromLegacy } from './lib/migration.js'

// Migracja danych z legacy formatu (uruchamia się raz, przed bootstrapem store'ów)
const migration = migrateFromLegacy()
if (migration.migrated) {
  console.log(`✓ Migracja: ${migration.count} treningów + ${migration.bodyCount} pomiarów wagi z legacy`)
}

const app = createApp(App)
app.use(createPinia())
app.use(router)

// Trigger settings store init (applies accent color CSS var)
import { useSettingsStore } from './stores/settings.js'
useSettingsStore()

app.mount('#app')
