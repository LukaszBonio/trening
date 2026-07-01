import { defineStore } from 'pinia'
import { watch } from 'vue'
import { usePersistentRef } from '../composables/usePersistentRef.js'

const DEFAULTS = {
  restTimerDefault: 90,
  units: 'kg',
  showRpe: true,
  autoStartTimer: true,
  accentColor: '#d4ff3a',
  weekStartsMonday: true,
  theme: 'dark',
  workoutMode: 'cards',
  goal: 'mass'
}

export const GOALS = [
  { key: 'mass',          label: 'Masa',          icon: 'ti-flame' },
  { key: 'strength',      label: 'Siła',          icon: 'ti-barbell' },
  { key: 'endurance',     label: 'Wytrzymałość',  icon: 'ti-run' },
  { key: 'cut',           label: 'Redukcja',      icon: 'ti-trending-down' },
  { key: 'recomposition', label: 'Rekompozycja',  icon: 'ti-refresh' }
]

export function goalLabel(key) {
  return GOALS.find(g => g.key === key)?.label || 'Masa'
}

export const useSettingsStore = defineStore('settings', () => {
  const raw = usePersistentRef('tp_settings_v1', () => ({ ...DEFAULTS }))
  // Merge: nowe pola z DEFAULTS trafiają do zapisanych ustawień (forward-compat)
  if (typeof raw.value === 'object' && raw.value !== null) {
    for (const k of Object.keys(DEFAULTS)) {
      if (!(k in raw.value)) raw.value[k] = DEFAULTS[k]
    }
  }
  const settings = raw

  function set(key, value) {
    settings.value[key] = value
  }

  function reset() {
    settings.value = { ...DEFAULTS }
  }

  function applyAccentColor() {
    document.documentElement.style.setProperty('--accent', settings.value.accentColor)
  }

  function applyTheme() {
    document.documentElement.dataset.theme = settings.value.theme || 'dark'
  }

  watch(settings, () => {
    applyAccentColor()
    applyTheme()
  }, { deep: true })

  applyAccentColor()
  applyTheme()

  function applyRemote(remote) {
    Object.assign(settings.value, remote)
    applyTheme()
    applyAccentColor()
  }

  return { settings, set, reset, applyRemote }
})
