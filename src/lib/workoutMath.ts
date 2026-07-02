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
