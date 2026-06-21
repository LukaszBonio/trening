import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const DRAFT_KEY = 'tp_session_draft_v1'

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function emptySet() {
  return { weight: '', reps: '', rpe: '', note: '', done: false }
}

export const useSessionStore = defineStore('session', () => {
  const active = ref(loadDraft())

  const isActive = computed(() => !!active.value)
  const totalSetsDone = computed(() => {
    if (!active.value) return 0
    return active.value.exercises.reduce((sum, ex) =>
      sum + ex.sets.filter(s => s.done).length, 0
    )
  })
  const totalSets = computed(() => {
    if (!active.value) return 0
    return active.value.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
  })

  function startSession(plan, type, source = 'library') {
    active.value = {
      id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      planName: plan.name,
      source,           // 'library' | 'ai' | 'custom' — decyduje o algorytmie grupowania
      startedAt: Date.now(),
      exercises: plan.exercises.map(ex => ({
        name: ex.name,
        tip: ex.tip || '',
        reps: ex.reps,
        sets: Array.from({ length: ex.sets }, () => emptySet())
      }))
    }
  }

  function addSet(exIdx) {
    if (!active.value) return
    active.value.exercises[exIdx].sets.push(emptySet())
  }

  function removeSet(exIdx, setIdx) {
    if (!active.value) return
    active.value.exercises[exIdx].sets.splice(setIdx, 1)
  }

  function toggleSet(exIdx, setIdx) {
    if (!active.value) return
    const s = active.value.exercises[exIdx].sets[setIdx]
    s.done = !s.done
  }

  function updateSet(exIdx, setIdx, patch) {
    if (!active.value) return
    Object.assign(active.value.exercises[exIdx].sets[setIdx], patch)
  }

  function discard() {
    active.value = null
  }

  function finishToPayload() {
    if (!active.value) return null
    return {
      id: active.value.id,
      type: active.value.type,
      planName: active.value.planName,
      date: new Date(active.value.startedAt).toISOString(),
      finishedAt: Date.now(),
      duration: Math.floor((Date.now() - active.value.startedAt) / 1000),
      exercises: active.value.exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets
          .filter(s => s.done && (s.weight !== '' || s.reps !== ''))
          .map(s => {
            const out = { weight: Number(s.weight) || 0, reps: Number(s.reps) || 0 }
            if (s.rpe) out.rpe = Number(s.rpe)
            if (s.note) out.note = s.note
            return out
          })
      })).filter(ex => ex.sets.length > 0)
    }
  }

  watch(active, (v) => {
    try {
      if (v) localStorage.setItem(DRAFT_KEY, JSON.stringify(v))
      else localStorage.removeItem(DRAFT_KEY)
    } catch {}
  }, { deep: true })

  return {
    active, isActive, totalSetsDone, totalSets,
    startSession, addSet, removeSet, toggleSet, updateSet,
    discard, finishToPayload
  }
})
