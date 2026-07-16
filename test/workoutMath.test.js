import { describe, it, expect } from 'vitest'
import { workoutVolume, totalSets, isTimedExercise } from '../src/lib/workoutMath'

describe('workoutVolume', () => {
  it('sumuje wagę × powtórzenia we wszystkich seriach', () => {
    const w = {
      exercises: [
        { sets: [{ weight: 50, reps: 10 }, { weight: 60, reps: 8 }] },
        { sets: [{ weight: 20, reps: 12 }] }
      ]
    }
    expect(workoutVolume(w)).toBe(50 * 10 + 60 * 8 + 20 * 12)
  })
  it('zwraca 0 dla pustego/null treningu', () => {
    expect(workoutVolume(null)).toBe(0)
    expect(workoutVolume({})).toBe(0)
    expect(workoutVolume({ exercises: [] })).toBe(0)
  })
  it('ignoruje brakujące wagi/powtórzenia (treat as 0)', () => {
    const w = { exercises: [{ sets: [{ reps: 10 }, { weight: 50 }] }] }
    expect(workoutVolume(w)).toBe(0)
  })
  it('zaokrągla wynik', () => {
    const w = { exercises: [{ sets: [{ weight: 12.5, reps: 7 }] }] }
    expect(workoutVolume(w)).toBe(88) // 87.5 → 88
  })
})

describe('totalSets', () => {
  it('liczy wszystkie serie we wszystkich ćwiczeniach', () => {
    const w = {
      exercises: [
        { sets: [{}, {}, {}] },
        { sets: [{}, {}] }
      ]
    }
    expect(totalSets(w)).toBe(5)
  })
  it('zwraca 0 dla pustego/null treningu', () => {
    expect(totalSets(null)).toBe(0)
    expect(totalSets({})).toBe(0)
  })
})

describe('isTimedExercise', () => {
  it('wykrywa czas z pola reps', () => {
    expect(isTimedExercise('Deska', '20-30s')).toBe(true)
    expect(isTimedExercise('Coś', '30s')).toBe(true)
    expect(isTimedExercise('Coś', '45 sek')).toBe(true)
  })
  it('wykrywa izometrię po nazwie mimo braku jednostki', () => {
    expect(isTimedExercise('Deska bokiem', '30')).toBe(true)
    expect(isTimedExercise('Wall sit', '')).toBe(true)
    expect(isTimedExercise('Martwy zwis', null)).toBe(true)
  })
  it('nie oznacza zwykłych ćwiczeń jako czasowe', () => {
    expect(isTimedExercise('Wyciskanie sztangi na ławce poziomej', '8-12')).toBe(false)
    expect(isTimedExercise('Przysiad ze sztangą', '5')).toBe(false)
    expect(isTimedExercise(null, null)).toBe(false)
  })
})
