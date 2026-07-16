export interface WorkoutSet {
  weight?: number
  reps?: number
}

export interface WorkoutExercise {
  sets: WorkoutSet[]
}

export interface Workout {
  exercises?: WorkoutExercise[]
}

export function workoutVolume(workout: Workout | null | undefined): number {
  if (!workout?.exercises) return 0
  let v = 0
  for (const ex of workout.exercises) {
    for (const s of ex.sets) v += (s.weight || 0) * (s.reps || 0)
  }
  return Math.round(v)
}

export function totalSets(workout: Workout | null | undefined): number {
  if (!workout?.exercises) return 0
  return workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
}

// Ćwiczenie izometryczne/czasowe (plank, wall sit itp.) — mierzone w sekundach,
// nie w powtórzeniach/ciężarze. Sygnał: cel (reps) zawiera jednostkę czasu, albo
// nazwa to znany bezruch. Wtedy pole serii = sekundy, ciężar nie ma sensu.
export function isTimedExercise(name?: string | null, reps?: string | null): boolean {
  if (reps && /\d\s*(s|sek|sec|min)\b/i.test(reps)) return true
  if (name && /\b(deska|plank|wall\s?-?sit|izometr|martwy zwis|hollow|superman hold|zwis)\b/i.test(name)) return true
  return false
}
