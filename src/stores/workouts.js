import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'tp_history_v1'

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const useWorkoutsStore = defineStore('workouts', () => {
  const history = ref(loadHistory())

  const count = computed(() => history.value.length)
  const lastWorkout = computed(() => history.value[history.value.length - 1] || null)

  function addWorkout(workout) {
    if (!workout.id) workout.id = `w_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    if (!workout.date) workout.date = new Date().toISOString()
    history.value.push(workout)
  }

  function removeWorkout(id) {
    history.value = history.value.filter(w => w.id !== id)
  }

  function updateWorkout(id, patch) {
    const idx = history.value.findIndex(w => w.id === id)
    if (idx >= 0) history.value[idx] = { ...history.value[idx], ...patch }
  }

  function setHistory(arr) {
    history.value = arr
  }

  watch(history, (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    } catch (e) {
      console.error('Failed to save workouts to localStorage:', e)
      window.dispatchEvent(new CustomEvent('storage-error', { detail: { store: 'workouts', error: e } }))
    }
  }, { deep: true })

  return { history, count, lastWorkout, addWorkout, removeWorkout, updateWorkout, setHistory }
})
