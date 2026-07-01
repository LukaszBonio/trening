import { defineStore } from 'pinia'
import { usePersistentRef } from '../composables/usePersistentRef.js'

export const useFavoritesStore = defineStore('favorites', () => {
  const ids = usePersistentRef('tp_favorites_v1', [])

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

  return { ids, isFavorite, toggle, planKey }
})
