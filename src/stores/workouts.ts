import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'tp_history_v1'

export interface WorkoutSet {
  weight: number
  reps: number
  rpe?: number
  note?: string
}

export interface WorkoutExercise {
  name: string
  sets: WorkoutSet[]
  primaryMuscle?: string
  muscleHead?: string
  exerciseType?: string
  movementPattern?: string
  [key: string]: unknown
}

export interface Workout {
  id: string
  type?: string
  planName?: string
  date: string
  finishedAt?: number
  duration?: number
  exercises: WorkoutExercise[]
  [key: string]: unknown
}

function loadHistory(): Workout[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const useWorkoutsStore = defineStore('workouts', () => {
  const history = ref<Workout[]>(loadHistory())

  const count = computed(() => history.value.length)
  const lastWorkout = computed(() => {
    if (!history.value.length) return null
    let latest = history.value[0]
    for (const w of history.value) {
      if (new Date(w.date) > new Date(latest.date)) latest = w
    }
    return latest
  })

  function addWorkout(workout: Partial<Workout>): void {
    if (!workout.id) workout.id = `w_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    if (!workout.date) workout.date = new Date().toISOString()
    history.value.push(workout as Workout)
  }

  function removeWorkout(id: string): void {
    history.value = history.value.filter(w => w.id !== id)
  }

  function updateWorkout(id: string, patch: Partial<Workout>): void {
    const idx = history.value.findIndex(w => w.id === id)
    if (idx >= 0) history.value[idx] = { ...history.value[idx], ...patch }
  }

  function setHistory(arr: Workout[]): void {
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
