import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'tp_settings_v1'

const DEFAULTS = {
  restTimerDefault: 90,     // sec
  units: 'kg',              // 'kg' | 'lb'
  showRpe: true,            // wyświetlać input RPE podczas sesji
  autoStartTimer: true,     // auto-start rest po zaznaczeniu serii
  accentColor: '#d4ff3a',   // kolor akcentu
  weekStartsMonday: true
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return { ...DEFAULTS, ...(raw ? JSON.parse(raw) : {}) }
  } catch {
    return { ...DEFAULTS }
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref(load())

  function set(key, value) {
    settings.value[key] = value
  }

  function reset() {
    settings.value = { ...DEFAULTS }
  }

  function applyAccentColor() {
    document.documentElement.style.setProperty('--accent', settings.value.accentColor)
  }

  watch(settings, (v) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)) } catch {}
    applyAccentColor()
  }, { deep: true })

  // initial apply
  applyAccentColor()

  return { settings, set, reset }
})
