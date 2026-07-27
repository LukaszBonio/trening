// Funkcje analityczne — agregaty na podstawie history workouts.
// Czyste funkcje, łatwe do testowania, nie zależą od Vue ani store.

import { findExerciseByName } from './exerciseDb'

// Klucz tożsamości ćwiczenia: id z bazy (rozwiązuje aliasy PL/EN i przemianowane
// nazwy — „Hip thrust" / „Wypychanie bioder" / „hip thrusty" → jeden klucz), fallback
// na znormalizowany string dla ćwiczeń spoza bazy (custom). Dzięki temu historia
// (np. „ostatni ciężar") trafia mimo różnic w zapisie nazwy.
function exerciseIdentityKey(name: string): string {
  const ex = findExerciseByName(name)
  return ex ? `id:${ex.id}` : name.toLowerCase().trim()
}

// Nazwa kanoniczna do wyświetlenia (z bazy, jeśli znana; inaczej zapisana).
// Dzięki temu listy/rekordy/wykresy pokazują spójną nazwę mimo aliasów PL-EN w historii.
function exerciseDisplayName(name: string): string {
  return findExerciseByName(name)?.name ?? name
}

export interface WorkoutSet {
  weight: number
  reps: number
  rpe?: number | null
}

export interface Exercise {
  name: string
  sets: WorkoutSet[]
  exerciseType?: string | null
  movementPattern?: string | null
}

export interface Workout {
  date: string
  type?: string
  exercises: Exercise[]
}

export interface UniqueExerciseEntry {
  name: string
  count: number
  lastDate: string
}

export interface ProgressPoint {
  date: string
  bestWeight: number
  bestReps: number
  best1RM: number
  totalVolume: number
}

export interface PersonalRecord {
  name: string
  best1RM: number
  weight: number
  reps: number
  date: string
}

export interface LastSetResult {
  weight: number
  reps: number
  rpe: number | null
  date: string
}

/**
 * Estimated 1RM (Epley formula): 1RM ≈ weight × (1 + reps / 30)
 */
export function estimated1RM(weight: number, reps: number): number {
  if (!weight || !reps) return 0
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30) * 10) / 10
}

/**
 * Zwraca posortowaną listę unikalnych ćwiczeń z historii, z liczbą wystąpień.
 */
export function uniqueExercises(history: Workout[]): UniqueExerciseEntry[] {
  const map = new Map<string, UniqueExerciseEntry>()
  for (const w of history) {
    for (const ex of w.exercises) {
      const key = exerciseIdentityKey(ex.name)
      const existing = map.get(key)
      if (existing) {
        existing.count++
        existing.lastDate = w.date > existing.lastDate ? w.date : existing.lastDate
      } else {
        map.set(key, { name: exerciseDisplayName(ex.name), count: 1, lastDate: w.date })
      }
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count)
}

/**
 * Dla danego ćwiczenia zwraca chronologiczną listę najlepszych serii per dzień.
 * Format: [{ date, bestWeight, bestReps, best1RM, totalVolume }]
 */
export function exerciseProgress(history: Workout[], exerciseName: string): ProgressPoint[] {
  const key = exerciseIdentityKey(exerciseName)
  const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const points: ProgressPoint[] = []
  for (const w of sorted) {
    for (const ex of w.exercises) {
      if (exerciseIdentityKey(ex.name) !== key) continue
      let bestWeight = 0, bestReps = 0, best1RM = 0, totalVol = 0
      for (const s of ex.sets) {
        const e = estimated1RM(s.weight, s.reps)
        if (e > best1RM) { best1RM = e; bestWeight = s.weight; bestReps = s.reps }
        totalVol += (s.weight || 0) * (s.reps || 0)
      }
      points.push({
        date: w.date,
        bestWeight,
        bestReps,
        best1RM,
        totalVolume: Math.round(totalVol)
      })
    }
  }
  return points
}

/**
 * Personal record per exercise — najwyższy 1RM kiedykolwiek.
 */
export function personalRecords(history: Workout[]): PersonalRecord[] {
  const map = new Map<string, PersonalRecord>()
  for (const w of history) {
    for (const ex of w.exercises) {
      const key = exerciseIdentityKey(ex.name)
      for (const s of ex.sets) {
        const e = estimated1RM(s.weight, s.reps)
        const current = map.get(key)
        if (!current || e > current.best1RM) {
          map.set(key, {
            name: exerciseDisplayName(ex.name),
            best1RM: e,
            weight: s.weight,
            reps: s.reps,
            date: w.date
          })
        }
      }
    }
  }
  return [...map.values()].sort((a, b) => b.best1RM - a.best1RM)
}

/**
 * Ostatnia istotna seria danego ćwiczenia z historii (najnowszy trening, pierwsza nie-pusta seria).
 * Zwraca { weight, reps, rpe, date } lub null jeśli brak. rpe może być undefined.
 */
export function lastSetFor(history: Workout[], exerciseName: string): LastSetResult | null {
  // Dopasowanie po TOŻSAMOŚCI (id z bazy), nie po surowym stringu — inaczej po zmianie
  // nazwy / aliasie PL-EN „ostatni ciężar" gubił się (np. historia „Wypychanie bioder",
  // plan „Hip thrust"). Fallback na znormalizowaną nazwę dla ćwiczeń spoza bazy.
  const key = exerciseIdentityKey(exerciseName)
  const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  for (const w of sorted) {
    for (const ex of w.exercises) {
      if (exerciseIdentityKey(ex.name) !== key) continue
      const s = ex.sets.find(x => (x.weight || 0) > 0 || (x.reps || 0) > 0) || ex.sets[0]
      if (!s) continue
      return { weight: s.weight || 0, reps: s.reps || 0, rpe: s.rpe || null, date: w.date }
    }
  }
  return null
}

/**
 * N ostatnich sesji danego typu (push/pull/legs/...).
 */
export function recentSessionsOfType(history: Workout[], type: string, count: number = 2): Workout[] {
  return [...history]
    .filter(w => w.type === type)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count)
}

/**
 * Streak — liczba kolejnych tygodni z co najmniej 1 treningiem.
 */
export function currentStreak(history: Workout[]): number {
  if (!history.length) return 0
  const weeks = new Set<string>()
  for (const w of history) {
    const d = new Date(w.date)
    const monday = new Date(d)
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    weeks.add(monday.toISOString().slice(0, 10))
  }
  let streak = 0
  const today = new Date()
  const thisMonday = new Date(today)
  thisMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  const cursor = new Date(thisMonday)
  // Bieżący (jeszcze niedokończony) tydzień bez treningu NIE zeruje passy —
  // zaczynamy liczyć od poprzedniego tygodnia. Passa spada dopiero gdy cały
  // miniony tydzień był pusty.
  if (!weeks.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 7)
  }
  while (weeks.has(cursor.toISOString().slice(0, 10))) {
    streak++
    cursor.setDate(cursor.getDate() - 7)
  }
  return streak
}

// --- Analiza wzorców ruchowych (exerciseType + movementPattern) ---

export interface CompoundIsolationStats {
  compound: number
  isolation: number
  unknown: number
  compoundRatio: number
}

export function compoundIsolationRatio(history: Workout[]): CompoundIsolationStats {
  let compound = 0, isolation = 0, unknown = 0
  for (const w of history) {
    for (const ex of w.exercises) {
      const t = (ex as Exercise).exerciseType
      if (t === 'compound') compound++
      else if (t === 'isolation') isolation++
      else unknown++
    }
  }
  const total = compound + isolation
  return {
    compound,
    isolation,
    unknown,
    compoundRatio: total > 0 ? Math.round(compound / total * 100) : 0
  }
}

const MOVEMENT_PATTERN_LABELS: Record<string, string> = {
  horizontal_push: 'Wyciskanie poziome',
  vertical_push: 'Wyciskanie pionowe',
  horizontal_pull: 'Przyciąganie poziome',
  vertical_pull: 'Przyciąganie pionowe',
  squat: 'Przysiad',
  hinge: 'Hip hinge',
  lunge: 'Wypady',
  calf: 'Łydki',
  core: 'Core',
  elbow_flexion: 'Zginanie łokcia',
  elbow_extension: 'Prostowanie łokcia',
  shoulder_isolation: 'Izolacja barków'
}

export interface PatternEntry {
  key: string
  label: string
  sets: number
}

export function movementPatternBalance(history: Workout[]): PatternEntry[] {
  const map: Record<string, number> = {}
  for (const w of history) {
    for (const ex of w.exercises) {
      const p = (ex as Exercise).movementPattern
      if (p) map[p] = (map[p] || 0) + ex.sets.length
    }
  }
  return Object.entries(map)
    .map(([key, sets]) => ({
      key,
      label: MOVEMENT_PATTERN_LABELS[key] || key,
      sets
    }))
    .sort((a, b) => b.sets - a.sets)
}

export interface PushPullStats {
  pushSets: number
  pullSets: number
  ratio: number | null
}

const PUSH_PATTERNS = new Set(['horizontal_push', 'vertical_push'])
const PULL_PATTERNS = new Set(['horizontal_pull', 'vertical_pull'])

export function pushPullRatio(history: Workout[]): PushPullStats {
  let pushSets = 0, pullSets = 0
  for (const w of history) {
    for (const ex of w.exercises) {
      const p = (ex as Exercise).movementPattern
      if (p && PUSH_PATTERNS.has(p)) pushSets += ex.sets.length
      else if (p && PULL_PATTERNS.has(p)) pullSets += ex.sets.length
    }
  }
  return {
    pushSets,
    pullSets,
    ratio: pullSets > 0 ? Math.round(pushSets / pullSets * 100) / 100 : null
  }
}

// Fundamentalne wzorce, których brak w danym oknie warto zasygnalizować (bez akcesoriów
// typu core/łydki/izolacje — tam luki są normalne).
const FUNDAMENTAL_PATTERNS = [
  'horizontal_push', 'vertical_push',
  'horizontal_pull', 'vertical_pull',
  'squat', 'hinge'
]

// Wzorce fundamentalne nietrenowane w ostatnich `days` dniach. Zwraca [] gdy w oknie
// nie ma ŻADNYCH ćwiczeń z metadanymi (plany lokalne/custom) — żeby nie zgłaszać
// „wszystko brakuje", gdy po prostu nie ma danych do analizy.
export function missingMovementPatterns(history: Workout[], days: number = 7): PatternEntry[] {
  const cutoff = Date.now() - days * 86400000
  const trained = new Set<string>()
  let anyMeta = false
  for (const w of history) {
    if (new Date(w.date).getTime() < cutoff) continue
    for (const ex of w.exercises) {
      const p = (ex as Exercise).movementPattern
      if (p) { trained.add(p); anyMeta = true }
    }
  }
  if (!anyMeta) return []
  return FUNDAMENTAL_PATTERNS
    .filter(p => !trained.has(p))
    .map(key => ({ key, label: MOVEMENT_PATTERN_LABELS[key] || key, sets: 0 }))
}
