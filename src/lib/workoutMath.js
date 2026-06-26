// Wspólne kalkulacje na obiekcie treningu — wcześniej zduplikowane 4× w stats/history/summary/charts.

/**
 * Suma wolumenu (waga × powtórzenia) we wszystkich seriach treningu.
 * Zwraca zaokrąglone kg.
 */
export function workoutVolume(workout) {
  if (!workout?.exercises) return 0
  let v = 0
  for (const ex of workout.exercises) {
    for (const s of ex.sets) v += (s.weight || 0) * (s.reps || 0)
  }
  return Math.round(v)
}

/**
 * Liczba wszystkich serii w treningu.
 */
export function totalSets(workout) {
  if (!workout?.exercises) return 0
  return workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
}
