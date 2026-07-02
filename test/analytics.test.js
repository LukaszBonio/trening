import { describe, it, expect } from 'vitest'
import {
  estimated1RM,
  uniqueExercises,
  personalRecords,
  currentStreak,
  lastSetFor,
  recentSessionsOfType
} from '../src/lib/analytics'

describe('estimated1RM (Epley)', () => {
  it('zwraca 0 dla brakujących danych', () => {
    expect(estimated1RM(0, 10)).toBe(0)
    expect(estimated1RM(50, 0)).toBe(0)
  })
  it('zwraca wagę dla 1 powtórzenia', () => {
    expect(estimated1RM(100, 1)).toBe(100)
  })
  it('liczy Epley dla wielu powtórzeń', () => {
    // 100 × (1 + 5/30) = 100 × 1.1666... = 116.666... → 116.7
    expect(estimated1RM(100, 5)).toBe(116.7)
  })
})

describe('uniqueExercises', () => {
  it('zwraca listę unikalnych nazw posortowaną wg liczby wystąpień', () => {
    const history = [
      { date: '2026-06-01', exercises: [{ name: 'Bench Press' }, { name: 'Squat' }] },
      { date: '2026-06-02', exercises: [{ name: 'bench press' }] }
    ]
    const out = uniqueExercises(history)
    expect(out).toHaveLength(2)
    expect(out[0].name).toBe('Bench Press')
    expect(out[0].count).toBe(2)
    expect(out[1].name).toBe('Squat')
    expect(out[1].count).toBe(1)
  })
})

describe('personalRecords', () => {
  it('zwraca PR per ćwiczenie posortowane wg 1RM desc', () => {
    const history = [
      { date: '2026-06-01', exercises: [{ name: 'Bench', sets: [{ weight: 80, reps: 5 }] }] },
      { date: '2026-06-08', exercises: [{ name: 'Bench', sets: [{ weight: 85, reps: 5 }] }] }
    ]
    const out = personalRecords(history)
    expect(out).toHaveLength(1)
    expect(out[0].weight).toBe(85)
    expect(out[0].reps).toBe(5)
  })
})

describe('lastSetFor', () => {
  it('zwraca ostatnią serię dla ćwiczenia z najnowszego treningu', () => {
    const history = [
      { date: '2026-06-01', exercises: [{ name: 'Bench', sets: [{ weight: 60, reps: 10 }] }] },
      { date: '2026-06-08', exercises: [{ name: 'Bench', sets: [{ weight: 70, reps: 8 }] }] }
    ]
    const r = lastSetFor(history, 'Bench')
    expect(r.weight).toBe(70)
    expect(r.reps).toBe(8)
  })
  it('zwraca null gdy ćwiczenie nie istnieje w historii', () => {
    expect(lastSetFor([], 'Bench')).toBeNull()
  })
  it('jest case-insensitive', () => {
    const history = [
      { date: '2026-06-01', exercises: [{ name: 'BENCH PRESS', sets: [{ weight: 60, reps: 10 }] }] }
    ]
    expect(lastSetFor(history, 'bench press').weight).toBe(60)
  })
})

describe('recentSessionsOfType', () => {
  it('zwraca N ostatnich sesji danego typu posortowanych malejąco', () => {
    const history = [
      { date: '2026-06-01', type: 'push', exercises: [] },
      { date: '2026-06-05', type: 'pull', exercises: [] },
      { date: '2026-06-10', type: 'push', exercises: [] },
      { date: '2026-06-15', type: 'push', exercises: [] }
    ]
    const r = recentSessionsOfType(history, 'push', 2)
    expect(r).toHaveLength(2)
    expect(r[0].date).toBe('2026-06-15')
    expect(r[1].date).toBe('2026-06-10')
  })
})

describe('currentStreak', () => {
  it('zwraca 0 dla pustej historii', () => {
    expect(currentStreak([])).toBe(0)
  })
})
