import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/global.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// Trigger settings store init (applies accent color CSS var)
import { useSettingsStore } from './stores/settings.js'
useSettingsStore()

app.mount('#app')

// Ukryj splash screen po zamontowaniu Vue
requestAnimationFrame(() => {
  const splash = document.getElementById('splash')
  if (splash) {
    splash.classList.add('fade')
    setTimeout(() => splash.remove(), 320)
  }
})
