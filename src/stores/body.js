import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'tp_body_v1'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const useBodyStore = defineStore('body', () => {
  const entries = ref(load())

  const sortedAsc = computed(() =>
    [...entries.value].sort((a, b) => a.date.localeCompare(b.date))
  )
  const sortedDesc = computed(() =>
    [...entries.value].sort((a, b) => b.date.localeCompare(a.date))
  )
  const latest = computed(() => sortedDesc.value[0] || null)

  const trend = computed(() => {
    if (sortedAsc.value.length < 2) return null
    const first = sortedAsc.value[0]
    const last = sortedAsc.value[sortedAsc.value.length - 1]
    return Math.round((last.weight - first.weight) * 10) / 10
  })

  function addEntry(weight, dateISO = null) {
    const date = dateISO || new Date().toISOString().slice(0, 10)
    const existing = entries.value.findIndex(e => e.date === date)
    if (existing >= 0) {
      entries.value[existing].weight = weight
    } else {
      entries.value.push({
        id: `b_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        date,
        weight: Number(weight)
      })
    }
  }

  function removeEntry(id) {
    entries.value = entries.value.filter(e => e.id !== id)
  }

  watch(entries, (v) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)) } catch {}
  }, { deep: true })

  function replaceEntries(newEntries) {
    entries.value = newEntries
  }

  return { entries, sortedAsc, sortedDesc, latest, trend, addEntry, removeEntry, replaceEntries }
})
