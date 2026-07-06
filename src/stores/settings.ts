import { defineStore } from 'pinia'
import { watch } from 'vue'
import { usePersistentRef } from '../composables/usePersistentRef'

export interface Settings {
  restTimerDefault: number
  units: string
  showRpe: boolean
  autoStartTimer: boolean
  accentColor: string
  weekStartsMonday: boolean
  theme: string
  workoutMode: string
  goal: string
  [key: string]: unknown
}

const DEFAULTS: Settings = {
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

export interface GoalOption {
  key: string
  label: string
  icon: string
}

export const GOALS: GoalOption[] = [
  { key: 'mass',          label: 'Masa',          icon: 'ti-flame' },
  { key: 'strength',      label: 'Siła',          icon: 'ti-barbell' },
  { key: 'endurance',     label: 'Wytrzymałość',  icon: 'ti-run' },
  { key: 'cut',           label: 'Redukcja',      icon: 'ti-trending-down' },
  { key: 'recomposition', label: 'Rekompozycja',  icon: 'ti-refresh' }
]

export function goalLabel(key: string): string {
  return GOALS.find(g => g.key === key)?.label || 'Masa'
}

export const useSettingsStore = defineStore('settings', () => {
  const raw = usePersistentRef<Settings>('tp_settings_v1', () => ({ ...DEFAULTS }))
  if (typeof raw.value === 'object' && raw.value !== null) {
    for (const k of Object.keys(DEFAULTS) as (keyof Settings)[]) {
      if (!(k in raw.value)) (raw.value as Record<string, unknown>)[k] = DEFAULTS[k]
    }
  }
  const settings = raw

  function set(key: string, value: unknown): void {
    (settings.value as Record<string, unknown>)[key] = value
    ;(settings.value as Record<string, unknown>)._updatedAt = Date.now()
  }

  function reset(): void {
    settings.value = { ...DEFAULTS }
  }

  function applyAccentColor(): void {
    document.documentElement.style.setProperty('--accent', settings.value.accentColor)
  }

  function applyTheme(): void {
    document.documentElement.dataset.theme = settings.value.theme || 'dark'
  }

  watch(settings, () => {
    applyAccentColor()
    applyTheme()
  }, { deep: true })

  applyAccentColor()
  applyTheme()

  function applyRemote(remote: Partial<Settings>): void {
    Object.assign(settings.value, remote)
    applyTheme()
    applyAccentColor()
  }

  return { settings, set, reset, applyRemote }
})
