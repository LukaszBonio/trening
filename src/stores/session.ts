import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useWorkoutsStore } from './workouts'
import { suggestNextWeight } from '../lib/progression'

const DRAFT_KEY = 'tp_session_draft_v1'

interface SessionSet {
  weight: number | string
  reps: number | string
  rpe: number | string
  note: string
  done: boolean
}

interface SessionExercise {
  name: string
  tip: string
  reps: string
  primaryMuscle: string | null
  muscleHead: string | null
  exerciseType: string | null
  movementPattern: string | null
  progressionReason: string | null
  sets: SessionSet[]
  _swappedFrom?: string
  [key: string]: unknown
}

interface ActiveSession {
  id: string
  type: string
  planName: string
  source: string
  startedAt: number
  exercises: SessionExercise[]
  // Uwaga do treningu wpisywana na koniec (obecnie tylko plany Ani). Zasila AI.
  note?: string
}

interface PlanExercise {
  name: string
  tip?: string
  reps: string
  sets: number
  primaryMuscle?: string | null
  muscleHead?: string | null
  exerciseType?: string | null
  movementPattern?: string | null
  suggestedWeight?: number | null
  [key: string]: unknown
}

interface Plan {
  name: string
  exercises: PlanExercise[]
}

function loadDraft(): ActiveSession | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function emptySet(): SessionSet {
  return { weight: '', reps: '', rpe: '', note: '', done: false }
}

export const useSessionStore = defineStore('session', () => {
  const active = ref<ActiveSession | null>(loadDraft())

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

  function startSession(plan: Plan, type: string, source = 'library'): void {
    const history = useWorkoutsStore().history

    active.value = {
      id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      planName: plan.name,
      source,
      startedAt: Date.now(),
      exercises: plan.exercises.map(ex => {
        const sets = Array.from({ length: ex.sets }, () => emptySet())

        const progression = suggestNextWeight(history, ex.name, ex.reps)
        let initialWeight: number | null = null
        let progressionReason: string | null = null
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
          primaryMuscle: ex.primaryMuscle || null,
          muscleHead: ex.muscleHead || null,
          exerciseType: ex.exerciseType || null,
          movementPattern: ex.movementPattern || null,
          progressionReason,
          sets
        }
      })
    }
  }

  function addSet(exIdx: number): void {
    if (!active.value) return
    active.value.exercises[exIdx].sets.push(emptySet())
  }

  function removeSet(exIdx: number, setIdx: number): void {
    if (!active.value) return
    active.value.exercises[exIdx].sets.splice(setIdx, 1)
  }

  function toggleSet(exIdx: number, setIdx: number): void {
    if (!active.value) return
    const s = active.value.exercises[exIdx].sets[setIdx]
    s.done = !s.done
  }

  function updateSet(exIdx: number, setIdx: number, patch: Partial<SessionSet>): void {
    if (!active.value) return
    Object.assign(active.value.exercises[exIdx].sets[setIdx], patch)
  }

  function setNote(note: string): void {
    if (!active.value) return
    active.value.note = note
  }

  function swapExercise(exIdx: number, newName: string): void {
    if (!active.value) return
    const ex = active.value.exercises[exIdx]
    if (!ex) return
    if (!ex._swappedFrom) ex._swappedFrom = ex.name
    ex.name = newName
    ex.sets = ex.sets.map(s => s.done ? s : { ...s, weight: '', reps: '' })
  }

  function discard(): void {
    active.value = null
  }

  function finishToPayload() {
    if (!active.value) return null
    const now = Date.now()
    const note = typeof active.value.note === 'string' ? active.value.note.trim() : ''
    return {
      id: active.value.id,
      type: active.value.type,
      planName: active.value.planName,
      date: new Date(active.value.startedAt).toISOString(),
      finishedAt: now,
      duration: Math.floor((now - active.value.startedAt) / 1000),
      ...(note ? { note } : {}),
      exercises: active.value.exercises.map(ex => {
        const out: Record<string, unknown> = {
          name: ex.name,
          sets: ex.sets
            .filter(s => s.done && (s.weight !== '' || s.reps !== ''))
            .map(s => {
              const o: Record<string, unknown> = { weight: Number(s.weight) || 0, reps: Number(s.reps) || 0 }
              if (s.rpe) o.rpe = Number(s.rpe)
              if (s.note) o.note = s.note
              return o
            })
        }
        if (ex.primaryMuscle) out.primaryMuscle = ex.primaryMuscle
        if (ex.muscleHead) out.muscleHead = ex.muscleHead
        if (ex.exerciseType) out.exerciseType = ex.exerciseType
        if (ex.movementPattern) out.movementPattern = ex.movementPattern
        return out
      }).filter(ex => (ex.sets as unknown[]).length > 0)
    }
  }

  let _persistTimer: ReturnType<typeof setTimeout> | null = null
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
    startSession, addSet, removeSet, toggleSet, updateSet, setNote, swapExercise,
    discard, finishToPayload
  }
})
