import { defineStore } from 'pinia'
import { usePersistentRef } from '../composables/usePersistentRef'

interface Plan {
  name: string
  id?: string
  _custom?: boolean
  [key: string]: unknown
}

export const useFavoritesStore = defineStore('favorites', () => {
  const ids = usePersistentRef<string[]>('tp_favorites_v1', [])

  function planKey(type: string, plan: Plan): string {
    if (plan._custom) return `custom::${plan.id}`
    return `${type}::${plan.name}`
  }

  function isFavorite(type: string, plan: Plan): boolean {
    return ids.value.includes(planKey(type, plan))
  }

  function toggle(type: string, plan: Plan): void {
    const key = planKey(type, plan)
    const i = ids.value.indexOf(key)
    if (i >= 0) ids.value.splice(i, 1)
    else ids.value.push(key)
  }

  return { ids, isFavorite, toggle, planKey }
})
