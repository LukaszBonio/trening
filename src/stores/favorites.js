import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'tp_favorites_v1'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const useFavoritesStore = defineStore('favorites', () => {
  // Plan key format: `${type}::${planName}` (library) or `custom::${id}` (custom)
  const ids = ref(load())

  function planKey(type, plan) {
    if (plan._custom) return `custom::${plan.id}`
    return `${type}::${plan.name}`
  }

  function isFavorite(type, plan) {
    return ids.value.includes(planKey(type, plan))
  }

  function toggle(type, plan) {
    const key = planKey(type, plan)
    const i = ids.value.indexOf(key)
    if (i >= 0) ids.value.splice(i, 1)
    else ids.value.push(key)
  }

  watch(ids, (v) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)) } catch {}
  }, { deep: true })

  return { ids, isFavorite, toggle, planKey }
})
