// Migracja danych z legacy (8270-LOC monolit) do nowej struktury Vue.
//
// Legacy format:
//   localStorage['tp_profiles_v1'] = {
//     activeId: 'default',
//     profiles: [{
//       id: 'default', name: 'Łukasz',
//       history: [{ id, type, timestamp, date, exercises: [{ name, reps, sets, kg, orm }], ... }]
//     }]
//   }
//
// Vue format:
//   localStorage['tp_history_v1'] = [{
//     id, type, planName, date (ISO), duration,
//     exercises: [{ name, sets: [{ weight, reps }] }]
//   }]

// --- Interfaces ---

/** Pojedyncza seria w nowym formacie. */
interface NewSet {
  weight: number
  reps: number
}

/** Ćwiczenie w nowym formacie. */
interface NewExercise {
  name: string
  sets: NewSet[]
}

/** Wpis treningu w nowym formacie (po migracji). */
export interface TransformedEntry {
  id: string
  type: string
  planName: string
  date: string
  duration: number
  finishedAt: number
  note: string | undefined
  exercises: NewExercise[]
}

/** Ćwiczenie w formacie legacy. */
interface LegacyExercise {
  name?: string
  sets?: number | string
  reps?: number | string
  kg?: number | string
  orm?: number | string
}

/** Wpis treningu w formacie legacy. */
interface LegacyEntry {
  id?: string
  type?: string
  timestamp?: number
  date?: string
  planName?: string
  note?: string
  duration?: number | string
  exercises?: LegacyExercise[]
}

/** Wpis pomiaru ciała w formacie legacy. */
interface LegacyBodyEntry {
  id?: string
  date?: string
  timestamp?: number
  weight?: number | string
  kg?: number | string
}

/** Profil legacy z historią treningów i pomiarami ciała. */
interface LegacyProfile {
  id?: string
  name?: string
  history?: LegacyEntry[]
  bodyLog?: LegacyBodyEntry[]
  weightLog?: LegacyBodyEntry[]
  body?: LegacyBodyEntry[]
}

/** Dane legacy po parsowaniu z localStorage (różne warianty). */
interface LegacyProfilesData {
  activeId?: string
  activeProfileId?: string
  profiles?: LegacyProfile[]
  history?: LegacyEntry[]
}

/** Wpis pomiaru ciała w nowym formacie. */
interface NewBodyEntry {
  id: string
  date: string
  weight: number
}

/** Rezultat ekstrakcji danych legacy. */
interface ExtractedLegacyData {
  workouts: LegacyEntry[]
  bodyEntries: NewBodyEntry[]
  profileCount: number
}

/** Opcje migracji. */
interface MigrateOptions {
  force?: boolean
}

/** Rezultat migracji. */
export interface MigrationResult {
  migrated: boolean
  count: number
  bodyCount?: number
  profileCount?: number
  reason?: string
  error?: string
}

// --- Constants ---

const MIGRATION_FLAG: string = 'tp_migrated_from_legacy_v1'
const LEGACY_PROFILES_KEY: string = 'tp_profiles_v1'
const NEW_HISTORY_KEY: string = 'tp_history_v1'
const NEW_BODY_KEY: string = 'tp_body_v1'

/**
 * Konwertuje pojedynczy wpis legacy → nowy format.
 */
export function transformLegacyEntry(legacy: LegacyEntry): TransformedEntry | null {
  if (!legacy || !legacy.id) return null

  // Date: legacy może mieć timestamp (ms) lub date (YYYY-MM-DD)
  let dateISO: string
  if (legacy.timestamp) {
    dateISO = new Date(legacy.timestamp).toISOString()
  } else if (legacy.date) {
    // Format YYYY-MM-DD → pełne ISO
    dateISO = new Date(legacy.date + 'T12:00:00').toISOString()
  } else {
    dateISO = new Date().toISOString()
  }

  // Exercises: legacy miał `sets` jako liczbę, `reps`+`kg` jako pojedyncze wartości
  // Replikujemy te same powtórzenia/ciężar dla każdej serii
  const exercises: NewExercise[] = (legacy.exercises || []).map((ex: LegacyExercise) => {
    const setCount: number = Math.max(1, Math.min(20, Number(ex.sets) || 1))
    const weight: number = Number(ex.kg) || 0
    const reps: number = Number(ex.reps) || 0
    return {
      name: ex.name || 'Nieznane ćwiczenie',
      sets: Array.from({ length: setCount }, (): NewSet => ({ weight, reps }))
    }
  }).filter((ex: NewExercise) => ex.sets.length > 0)

  return {
    id: legacy.id,
    type: legacy.type || 'push',
    planName: legacy.planName || legacy.note?.slice(0, 40) || 'Trening (z legacy)',
    date: dateISO,
    duration: Number(legacy.duration) || 0,
    finishedAt: legacy.timestamp || Date.now(),
    note: legacy.note || undefined,
    exercises
  }
}

/**
 * Wyciąga history z legacy profiles storage.
 * Returns: { workouts: [...], bodyEntries: [...], profileCount: N }
 */
function extractLegacyData(): ExtractedLegacyData | null {
  try {
    const raw: string | null = localStorage.getItem(LEGACY_PROFILES_KEY)
    if (!raw) return null

    const data: LegacyProfilesData | LegacyProfile[] | null = JSON.parse(raw)
    if (!data) return null

    // Format może być:
    // 1. { activeId, profiles: [{ history: [...] }] }
    // 2. [{ history: [...] }] (stary tablicowy)
    // 3. { profiles: [...], activeProfileId } (różne wersje)
    let profiles: LegacyProfile[] = []
    if (Array.isArray(data)) {
      profiles = data
    } else if (Array.isArray((data as LegacyProfilesData).profiles)) {
      profiles = (data as LegacyProfilesData).profiles!
    } else if ((data as LegacyProfilesData).history) {
      // Pojedynczy profil bez wrappera
      profiles = [data as LegacyProfile]
    }

    if (!profiles.length) return null

    // Zbierz wszystkie unikalne treningi ze wszystkich profili (po id)
    const seenIds: Set<string> = new Set()
    const workouts: LegacyEntry[] = []
    const bodyEntries: NewBodyEntry[] = []
    for (const p of profiles) {
      if (Array.isArray(p.history)) {
        for (const entry of p.history) {
          if (entry && entry.id && !seenIds.has(entry.id)) {
            seenIds.add(entry.id)
            workouts.push(entry)
          }
        }
      }
      // Body log (jeśli legacy go miał — pole bodyLog / weightLog / mass)
      const candidates: LegacyBodyEntry[] = p.bodyLog || p.weightLog || p.body || []
      if (Array.isArray(candidates)) {
        for (const e of candidates) {
          if (e && (e.weight || e.kg)) {
            bodyEntries.push({
              id: e.id || `b_legacy_${e.date || Date.now()}`,
              date: e.date || new Date(e.timestamp || Date.now()).toISOString().slice(0, 10),
              weight: Number(e.weight || e.kg)
            })
          }
        }
      }
    }

    return { workouts, bodyEntries, profileCount: profiles.length }
  } catch (e) {
    console.warn('[migration] failed to read legacy profiles:', e)
    return null
  }
}

/**
 * Główna funkcja migracji. Bezpieczna do wielokrotnego wywołania —
 * idempotentna (flag w localStorage).
 *
 * Returns: { migrated: bool, count: N, reason?: string }
 */
export function migrateFromLegacy({ force = false }: MigrateOptions = {}): MigrationResult {
  try {
    if (!force && localStorage.getItem(MIGRATION_FLAG)) {
      return { migrated: false, count: 0, reason: 'already-done' }
    }

    // Sprawdź czy Vue już ma dane — nie nadpisuj
    const existing: string | null = localStorage.getItem(NEW_HISTORY_KEY)
    if (!force && existing) {
      try {
        const arr: unknown = JSON.parse(existing)
        if (Array.isArray(arr) && arr.length > 0) {
          localStorage.setItem(MIGRATION_FLAG, '1')
          return { migrated: false, count: 0, reason: 'new-data-exists' }
        }
      } catch {}
    }

    const legacy: ExtractedLegacyData | null = extractLegacyData()
    if (!legacy) {
      localStorage.setItem(MIGRATION_FLAG, '1')
      return { migrated: false, count: 0, reason: 'no-legacy-data' }
    }

    // Transform
    const newWorkouts: TransformedEntry[] = legacy.workouts
      .map(transformLegacyEntry)
      .filter((w): w is TransformedEntry => w !== null)
      .sort((a: TransformedEntry, b: TransformedEntry) => new Date(a.date).getTime() - new Date(b.date).getTime())  // chronologicznie

    // Merge z istniejącymi (gdyby user już coś dodał)
    let merged: TransformedEntry[] = newWorkouts
    if (existing) {
      try {
        const existingArr: TransformedEntry[] = JSON.parse(existing) || []
        const seenIds: Set<string> = new Set(existingArr.map((w: TransformedEntry) => w.id))
        merged = [...existingArr, ...newWorkouts.filter((w: TransformedEntry) => !seenIds.has(w.id))]
      } catch {}
    }

    localStorage.setItem(NEW_HISTORY_KEY, JSON.stringify(merged))

    // Body log
    if (legacy.bodyEntries.length) {
      const existingBody: string | null = localStorage.getItem(NEW_BODY_KEY)
      let mergedBody: NewBodyEntry[] = legacy.bodyEntries
      if (existingBody) {
        try {
          const ex: NewBodyEntry[] = JSON.parse(existingBody) || []
          const seenDates: Set<string> = new Set(ex.map((e: NewBodyEntry) => e.date))
          mergedBody = [...ex, ...legacy.bodyEntries.filter((e: NewBodyEntry) => !seenDates.has(e.date))]
        } catch {}
      }
      localStorage.setItem(NEW_BODY_KEY, JSON.stringify(mergedBody))
    }

    localStorage.setItem(MIGRATION_FLAG, '1')
    console.log(`[migration] imported ${newWorkouts.length} workouts + ${legacy.bodyEntries.length} body entries from legacy`)
    return {
      migrated: true,
      count: newWorkouts.length,
      bodyCount: legacy.bodyEntries.length,
      profileCount: legacy.profileCount
    }
  } catch (e) {
    console.error('[migration] error:', e)
    return { migrated: false, count: 0, reason: 'error', error: (e as Error).message }
  }
}
