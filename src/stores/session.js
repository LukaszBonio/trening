import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useWorkoutsStore } from './workouts.js'
import { suggestNextWeight } from '../lib/progression.js'

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
    // Pobierz historię raz dla całego planu — używamy do deterministycznej
    // sugestii ciężaru z progresji (RPE + reps z ostatniej sesji ćwiczenia).
    const history = useWorkoutsStore().history

    active.value = {
      id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      planName: plan.name,
      source,           // 'library' | 'ai' | 'custom' — decyduje o algorytmie grupowania
      startedAt: Date.now(),
      exercises: plan.exercises.map(ex => {
        const sets = Array.from({ length: ex.sets }, () => emptySet())

        // Wybór sugerowanego ciężaru na pierwszą serię:
        // 1. Progresja z historii (RPE + reps) — deterministyczna, preferowana
        // 2. Fallback: ex.suggestedWeight z AI (gdy brak historii dla tego ćwiczenia)
        const progression = suggestNextWeight(history, ex.name, ex.reps)
        let initialWeight = null
        let progressionReason = null
        if (progression) {
          initialWeight = progression.weight
          progressionReason = progression.reason
        } else if (ex.suggestedWeight != null && ex.suggestedWeight > 0) {
          initialWeight = ex.suggestedWeight
          progressionReason = 'sugestia AI (brak historii)'
        }
        if (initialWeight != null && sets.length) {
          sets[0].weight = initialWeight
        }

        return {
          name: ex.name,
          tip: ex.tip || '',
          reps: ex.reps,
          // Pola z planów AI (mogą być null dla planów library/custom)
          primaryMuscle: ex.primaryMuscle || null,
          muscleHead: ex.muscleHead || null,
          exerciseType: ex.exerciseType || null,
          movementPattern: ex.movementPattern || null,
          // Powód sugestii — używamy w UI hint pod inputem.
          progressionReason,
          sets
        }
      })
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

  /**
   * Podmienia ćwiczenie na inne (zachowuje liczbę serii i target reps).
   * Loguje original w polu _swappedFrom dla śladu w historii.
   */
  function swapExercise(exIdx, newName) {
    if (!active.value) return
    const ex = active.value.exercises[exIdx]
    if (!ex) return
    if (!ex._swappedFrom) ex._swappedFrom = ex.name
    ex.name = newName
    // Reset serii nieukończonych
    ex.sets = ex.sets.map(s => s.done ? s : { ...s, weight: '', reps: '' })
  }

  function discard() {
    active.value = null
  }

  function finishToPayload() {
    if (!active.value) return null
    const now = Date.now()
    return {
      id: active.value.id,
      type: active.value.type,
      planName: active.value.planName,
      date: new Date(active.value.startedAt).toISOString(),
      finishedAt: now,
      duration: Math.floor((now - active.value.startedAt) / 1000),
      exercises: active.value.exercises.map(ex => {
        const out = {
          name: ex.name,
          sets: ex.sets
            .filter(s => s.done && (s.weight !== '' || s.reps !== ''))
            .map(s => {
              const o = { weight: Number(s.weight) || 0, reps: Number(s.reps) || 0 }
              if (s.rpe) o.rpe = Number(s.rpe)
              if (s.note) o.note = s.note
              return o
            })
        }
        // Zachowujemy metadane z planów AI tylko gdy są ustawione — nie zaśmiecamy historii nullami.
        if (ex.primaryMuscle) out.primaryMuscle = ex.primaryMuscle
        if (ex.muscleHead) out.muscleHead = ex.muscleHead
        if (ex.exerciseType) out.exerciseType = ex.exerciseType
        if (ex.movementPattern) out.movementPattern = ex.movementPattern
        return out
      }).filter(ex => ex.sets.length > 0)
    }
  }

  // Debounce 300 ms — bez tego każde wpisanie cyfry w weight/reps wywoływało pełen
  // JSON.stringify aktywnej sesji + localStorage.setItem (mierzalny lag).
  let _persistTimer = null
  watch(active, (v) => {
    if (_persistTimer) clearTimeout(_persistTimer)
    _persistTimer = setTimeout(() => {
      try {
        if (v) localStorage.setItem(DRAFT_KEY, JSON.stringify(v))
        else localStorage.removeItem(DRAFT_KEY)
      } catch {}
    }, 300)
  }, { deep: true })

  return {
    active, isActive, totalSetsDone, totalSets,
    startSession, addSet, removeSet, toggleSet, updateSet, swapExercise,
    discard, finishToPayload
  }
})
