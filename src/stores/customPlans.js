import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'tp_custom_plans_v1'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const useCustomPlansStore = defineStore('customPlans', () => {
  const plans = ref(load())

  const byType = computed(() => {
    const map = {}
    for (const p of plans.value) {
      if (!map[p.type]) map[p.type] = []
      map[p.type].push(p)
    }
    return map
  })

  function add(plan) {
    if (!plan.id) plan.id = `cp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    if (!plan.createdAt) plan.createdAt = new Date().toISOString()
    plans.value.push(plan)
    return plan.id
  }

  function update(id, patch) {
    const idx = plans.value.findIndex(p => p.id === id)
    if (idx >= 0) plans.value[idx] = { ...plans.value[idx], ...patch }
  }

  function remove(id) {
    plans.value = plans.value.filter(p => p.id !== id)
  }

  function duplicate(plan) {
    const copy = JSON.parse(JSON.stringify(plan))
    copy.id = undefined
    copy.createdAt = undefined
    copy.name = `${plan.name} (kopia)`
    return add(copy)
  }

  watch(plans, (v) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)) } catch {}
  }, { deep: true })

  return { plans, byType, add, update, remove, duplicate }
})
