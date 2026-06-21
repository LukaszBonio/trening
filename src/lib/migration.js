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

const MIGRATION_FLAG = 'tp_migrated_from_legacy_v1'
const LEGACY_PROFILES_KEY = 'tp_profiles_v1'
const NEW_HISTORY_KEY = 'tp_history_v1'
const NEW_BODY_KEY = 'tp_body_v1'

/**
 * Konwertuje pojedynczy wpis legacy → nowy format.
 */
export function transformLegacyEntry(legacy) {
  if (!legacy || !legacy.id) return null

  // Date: legacy może mieć timestamp (ms) lub date (YYYY-MM-DD)
  let dateISO
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
  const exercises = (legacy.exercises || []).map(ex => {
    const setCount = Math.max(1, Math.min(20, Number(ex.sets) || 1))
    const weight = Number(ex.kg) || 0
    const reps = Number(ex.reps) || 0
    return {
      name: ex.name || 'Nieznane ćwiczenie',
      sets: Array.from({ length: setCount }, () => ({ weight, reps }))
    }
  }).filter(ex => ex.sets.length > 0)

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
function extractLegacyData() {
  try {
    const raw = localStorage.getItem(LEGACY_PROFILES_KEY)
    if (!raw) return null

    const data = JSON.parse(raw)
    if (!data) return null

    // Format może być:
    // 1. { activeId, profiles: [{ history: [...] }] }
    // 2. [{ history: [...] }] (stary tablicowy)
    // 3. { profiles: [...], activeProfileId } (różne wersje)
    let profiles = []
    if (Array.isArray(data)) {
      profiles = data
    } else if (Array.isArray(data.profiles)) {
      profiles = data.profiles
    } else if (data.history) {
      // Pojedynczy profil bez wrappera
      profiles = [data]
    }

    if (!profiles.length) return null

    // Zbierz wszystkie unikalne treningi ze wszystkich profili (po id)
    const seenIds = new Set()
    const workouts = []
    const bodyEntries = []
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
      const candidates = p.bodyLog || p.weightLog || p.body || []
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
export function migrateFromLegacy({ force = false } = {}) {
  try {
    if (!force && localStorage.getItem(MIGRATION_FLAG)) {
      return { migrated: false, count: 0, reason: 'already-done' }
    }

    // Sprawdź czy Vue już ma dane — nie nadpisuj
    const existing = localStorage.getItem(NEW_HISTORY_KEY)
    if (!force && existing) {
      try {
        const arr = JSON.parse(existing)
        if (Array.isArray(arr) && arr.length > 0) {
          localStorage.setItem(MIGRATION_FLAG, '1')
          return { migrated: false, count: 0, reason: 'new-data-exists' }
        }
      } catch {}
    }

    const legacy = extractLegacyData()
    if (!legacy) {
      localStorage.setItem(MIGRATION_FLAG, '1')
      return { migrated: false, count: 0, reason: 'no-legacy-data' }
    }

    // Transform
    const newWorkouts = legacy.workouts
      .map(transformLegacyEntry)
      .filter(Boolean)
      .sort((a, b) => new Date(a.date) - new Date(b.date))  // chronologicznie

    // Merge z istniejącymi (gdyby user już coś dodał)
    let merged = newWorkouts
    if (existing) {
      try {
        const existingArr = JSON.parse(existing) || []
        const seenIds = new Set(existingArr.map(w => w.id))
        merged = [...existingArr, ...newWorkouts.filter(w => !seenIds.has(w.id))]
      } catch {}
    }

    localStorage.setItem(NEW_HISTORY_KEY, JSON.stringify(merged))

    // Body log
    if (legacy.bodyEntries.length) {
      const existingBody = localStorage.getItem(NEW_BODY_KEY)
      let mergedBody = legacy.bodyEntries
      if (existingBody) {
        try {
          const ex = JSON.parse(existingBody) || []
          const seenDates = new Set(ex.map(e => e.date))
          mergedBody = [...ex, ...legacy.bodyEntries.filter(e => !seenDates.has(e.date))]
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
    return { migrated: false, count: 0, reason: 'error', error: e.message }
  }
}
