// Funkcje analityczne — agregaty na podstawie history workouts.
// Czyste funkcje, łatwe do testowania, nie zależą od Vue ani store.

/**
 * Estimated 1RM (Epley formula): 1RM ≈ weight × (1 + reps / 30)
 */
export function estimated1RM(weight, reps) {
  if (!weight || !reps) return 0
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30) * 10) / 10
}

/**
 * Zwraca posortowaną listę unikalnych ćwiczeń z historii, z liczbą wystąpień.
 */
export function uniqueExercises(history) {
  const map = new Map()
  for (const w of history) {
    for (const ex of w.exercises) {
      const key = ex.name.toLowerCase().trim()
      const existing = map.get(key)
      if (existing) {
        existing.count++
        existing.lastDate = w.date > existing.lastDate ? w.date : existing.lastDate
      } else {
        map.set(key, { name: ex.name, count: 1, lastDate: w.date })
      }
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count)
}

/**
 * Dla danego ćwiczenia zwraca chronologiczną listę najlepszych serii per dzień.
 * Format: [{ date, bestWeight, bestReps, best1RM, totalVolume }]
 */
export function exerciseProgress(history, exerciseName) {
  const key = exerciseName.toLowerCase().trim()
  const sorted = [...history].sort((a, b) => new Date(a.date) - new Date(b.date))
  const points = []
  for (const w of sorted) {
    for (const ex of w.exercises) {
      if (ex.name.toLowerCase().trim() !== key) continue
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
export function personalRecords(history) {
  const map = new Map()
  for (const w of history) {
    for (const ex of w.exercises) {
      const key = ex.name.toLowerCase().trim()
      for (const s of ex.sets) {
        const e = estimated1RM(s.weight, s.reps)
        const current = map.get(key)
        if (!current || e > current.best1RM) {
          map.set(key, {
            name: ex.name,
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
export function lastSetFor(history, exerciseName) {
  const key = exerciseName.toLowerCase().trim()
  const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date))
  for (const w of sorted) {
    for (const ex of w.exercises) {
      if (ex.name.toLowerCase().trim() !== key) continue
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
export function recentSessionsOfType(history, type, count = 2) {
  return [...history]
    .filter(w => w.type === type)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, count)
}

/**
 * Streak — liczba kolejnych tygodni z co najmniej 1 treningiem.
 */
export function currentStreak(history) {
  if (!history.length) return 0
  const weeks = new Set()
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
  let cursor = new Date(thisMonday)
  while (weeks.has(cursor.toISOString().slice(0, 10))) {
    streak++
    cursor.setDate(cursor.getDate() - 7)
  }
  return streak
}
