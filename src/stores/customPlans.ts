import { defineStore } from 'pinia'
import { computed } from 'vue'
import { usePersistentRef } from '../composables/usePersistentRef'

export interface CustomPlan {
  id: string
  type: string
  name: string
  createdAt: string
  exercises: unknown[]
  [key: string]: unknown
}

export const useCustomPlansStore = defineStore('customPlans', () => {
  const plans = usePersistentRef<CustomPlan[]>('tp_custom_plans_v1', [])

  const byType = computed(() => {
    const map: Record<string, CustomPlan[]> = {}
    for (const p of plans.value) {
      if (!map[p.type]) map[p.type] = []
      map[p.type].push(p)
    }
    return map
  })

  function add(plan: Partial<CustomPlan>): string {
    if (!plan.id) plan.id = `cp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    if (!plan.createdAt) plan.createdAt = new Date().toISOString()
    plans.value.push(plan as CustomPlan)
    return plan.id
  }

  function update(id: string, patch: Partial<CustomPlan>): void {
    const idx = plans.value.findIndex(p => p.id === id)
    if (idx >= 0) plans.value[idx] = { ...plans.value[idx], ...patch }
  }

  function remove(id: string): void {
    plans.value = plans.value.filter(p => p.id !== id)
  }

  function duplicate(plan: CustomPlan): string {
    const copy = JSON.parse(JSON.stringify(plan)) as Partial<CustomPlan>
    copy.id = undefined
    copy.createdAt = undefined
    copy.name = `${plan.name} (kopia)`
    return add(copy)
  }

  return { plans, byType, add, update, remove, duplicate }
})
