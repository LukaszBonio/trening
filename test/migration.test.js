import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { transformLegacyEntry, migrateFromLegacy } from '../src/lib/migration.js'

// Środowisko testów to 'node' (vite.config.js) — brak localStorage. Lekki in-memory stub.
beforeAll(() => {
  if (typeof globalThis.localStorage === 'undefined') {
    const store = new Map()
    globalThis.localStorage = {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
      clear: () => store.clear()
    }
  }
})

describe('transformLegacyEntry', () => {
  it('zwraca null dla braku id', () => {
    expect(transformLegacyEntry(null)).toBeNull()
    expect(transformLegacyEntry({})).toBeNull()
    expect(transformLegacyEntry({ type: 'push' })).toBeNull()
  })

  it('rozwija sets (liczba) na tablicę serii z powtórzonymi weight/reps', () => {
    const out = transformLegacyEntry({
      id: 'w1', type: 'push',
      timestamp: 1700000000000,
      exercises: [{ name: 'Bench', sets: 3, reps: 10, kg: 60 }]
    })
    expect(out.id).toBe('w1')
    expect(out.exercises[0].name).toBe('Bench')
    expect(out.exercises[0].sets).toEqual([
      { weight: 60, reps: 10 },
      { weight: 60, reps: 10 },
      { weight: 60, reps: 10 }
    ])
  })

  it('konwertuje timestamp (ms) na ISO date', () => {
    const out = transformLegacyEntry({ id: 'w1', timestamp: 1700000000000, exercises: [] })
    expect(out.date).toBe(new Date(1700000000000).toISOString())
  })

  it('konwertuje date (YYYY-MM-DD) na pełne ISO (południe)', () => {
    const out = transformLegacyEntry({ id: 'w1', date: '2026-06-23', exercises: [] })
    expect(out.date).toBe(new Date('2026-06-23T12:00:00').toISOString())
  })

  it('ogranicza liczbę serii do 1..20', () => {
    const tooMany = transformLegacyEntry({ id: 'w', exercises: [{ name: 'X', sets: 999, reps: 5, kg: 10 }] })
    expect(tooMany.exercises[0].sets).toHaveLength(20)
    const zero = transformLegacyEntry({ id: 'w', exercises: [{ name: 'X', sets: 0, reps: 5, kg: 10 }] })
    expect(zero.exercises[0].sets).toHaveLength(1)
  })

  it('domyślne wartości dla brakujących pól', () => {
    const out = transformLegacyEntry({ id: 'w', exercises: [{ sets: 1 }] })
    expect(out.type).toBe('push')
    expect(out.exercises[0].name).toBe('Nieznane ćwiczenie')
    expect(out.exercises[0].sets).toEqual([{ weight: 0, reps: 0 }])
  })

  it('buduje planName z note gdy brak planName', () => {
    const out = transformLegacyEntry({ id: 'w', note: 'Świetny trening klaty', exercises: [] })
    expect(out.planName).toBe('Świetny trening klaty')
  })
})

describe('migrateFromLegacy', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('idempotentna — flag blokuje ponowną migrację', () => {
    localStorage.setItem('tp_migrated_from_legacy_v1', '1')
    expect(migrateFromLegacy()).toMatchObject({ migrated: false, reason: 'already-done' })
  })

  it('brak danych legacy → no-legacy-data', () => {
    expect(migrateFromLegacy()).toMatchObject({ migrated: false, reason: 'no-legacy-data' })
  })

  it('nie nadpisuje gdy nowe dane już istnieją', () => {
    localStorage.setItem('tp_history_v1', JSON.stringify([{ id: 'x', exercises: [] }]))
    expect(migrateFromLegacy()).toMatchObject({ migrated: false, reason: 'new-data-exists' })
  })

  it('migruje history z formatu { profiles: [{ history }] }', () => {
    localStorage.setItem('tp_profiles_v1', JSON.stringify({
      activeId: 'default',
      profiles: [{
        id: 'default', name: 'Łukasz',
        history: [
          { id: 'w1', type: 'push', timestamp: 1700000000000, exercises: [{ name: 'Bench', sets: 3, reps: 10, kg: 60 }] }
        ]
      }]
    }))
    const res = migrateFromLegacy()
    expect(res.migrated).toBe(true)
    expect(res.count).toBe(1)
    const saved = JSON.parse(localStorage.getItem('tp_history_v1'))
    expect(saved).toHaveLength(1)
    expect(saved[0].id).toBe('w1')
    expect(saved[0].exercises[0].sets).toHaveLength(3)
    // flag ustawiony
    expect(localStorage.getItem('tp_migrated_from_legacy_v1')).toBe('1')
  })

  it('deduplikuje treningi po id między profilami', () => {
    localStorage.setItem('tp_profiles_v1', JSON.stringify({
      profiles: [
        { history: [{ id: 'dup', type: 'push', timestamp: 1700000000000, exercises: [] }] },
        { history: [{ id: 'dup', type: 'pull', timestamp: 1700000000000, exercises: [] }] }
      ]
    }))
    const res = migrateFromLegacy()
    expect(res.count).toBe(1)
  })

  it('migruje body log gdy obecny', () => {
    localStorage.setItem('tp_profiles_v1', JSON.stringify({
      profiles: [{
        history: [{ id: 'w1', timestamp: 1700000000000, exercises: [] }],
        bodyLog: [{ date: '2026-06-01', weight: 80 }]
      }]
    }))
    const res = migrateFromLegacy()
    expect(res.bodyCount).toBe(1)
    const body = JSON.parse(localStorage.getItem('tp_body_v1'))
    expect(body[0].weight).toBe(80)
  })

  it('force=true ignoruje flag i istniejące dane', () => {
    localStorage.setItem('tp_migrated_from_legacy_v1', '1')
    localStorage.setItem('tp_profiles_v1', JSON.stringify({
      profiles: [{ history: [{ id: 'w1', timestamp: 1700000000000, exercises: [] }] }]
    }))
    const res = migrateFromLegacy({ force: true })
    expect(res.migrated).toBe(true)
    expect(res.count).toBe(1)
  })
})
