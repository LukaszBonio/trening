import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  estimated1RM,
  uniqueExercises,
  exerciseProgress,
  personalRecords,
  currentStreak,
  lastSetFor,
  recentSessionsOfType,
  compoundIsolationRatio,
  movementPatternBalance,
  missingMovementPatterns,
  pushPullRatio
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
  it('zwraca listę unikalnych nazw posortowaną wg liczby wystąpień (nazwa kanoniczna)', () => {
    const history = [
      { date: '2026-06-01', exercises: [{ name: 'Bench Press' }, { name: 'Squat' }] },
      { date: '2026-06-02', exercises: [{ name: 'bench press' }] }
    ]
    const out = uniqueExercises(history)
    expect(out).toHaveLength(2)
    // aliasy 'Bench Press'/'bench press' → jedno ćwiczenie, nazwa kanoniczna z bazy
    expect(out[0].name).toBe('Wyciskanie sztangi na ławce poziomej')
    expect(out[0].count).toBe(2)
    expect(out[1].name).toBe('Przysiad ze sztangą')
    expect(out[1].count).toBe(1)
  })
  it('scala różne nazwy tego samego ćwiczenia (alias/rename → 1 wpis)', () => {
    const history = [
      { date: '2026-06-01', exercises: [{ name: 'Wypychanie bioder' }] },
      { date: '2026-06-08', exercises: [{ name: 'Hip thrust' }] }
    ]
    const out = uniqueExercises(history)
    expect(out).toHaveLength(1)
    expect(out[0].name).toBe('Hip thrust')
    expect(out[0].count).toBe(2)
  })
  it('nie scala ćwiczeń spoza bazy o różnych nazwach', () => {
    const history = [
      { date: '2026-06-01', exercises: [{ name: 'Custom A' }, { name: 'Custom B' }] }
    ]
    expect(uniqueExercises(history)).toHaveLength(2)
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
  it('scala rekord tego samego ćwiczenia mimo aliasu/rename (1 wpis, nazwa kanoniczna)', () => {
    const history = [
      { date: '2026-06-01', exercises: [{ name: 'Wyciskanie nogami', sets: [{ weight: 100, reps: 10 }] }] },
      { date: '2026-06-08', exercises: [{ name: 'Leg press', sets: [{ weight: 120, reps: 8 }] }] }
    ]
    const out = personalRecords(history)
    expect(out).toHaveLength(1)
    expect(out[0].name).toBe('Leg press')
    expect(out[0].weight).toBe(120)
  })
})

describe('exerciseProgress', () => {
  it('łączy historię tego samego ćwiczenia mimo różnych nazw (alias/rename)', () => {
    const history = [
      { date: '2026-06-01', exercises: [{ name: 'Wyciskanie nogami', sets: [{ weight: 100, reps: 10 }] }] },
      { date: '2026-06-08', exercises: [{ name: 'Leg press', sets: [{ weight: 110, reps: 10 }] }] }
    ]
    // zapytanie kanoniczną nazwą łapie oba punkty (dawniej tylko jeden)
    const pts = exerciseProgress(history, 'Leg press')
    expect(pts).toHaveLength(2)
    expect(pts[0].bestWeight).toBe(100)
    expect(pts[1].bestWeight).toBe(110)
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
  // Regresja: dopasowanie po tożsamości (id z bazy), nie po surowym stringu —
  // po zmianie nazwy / aliasie PL-EN „ostatni ciężar" musi się odnaleźć.
  it('znajduje historię mimo innej nazwy tego samego ćwiczenia (alias/rename)', () => {
    const history = [
      { date: '2026-06-01', exercises: [{ name: 'Wypychanie bioder', sets: [{ weight: 80, reps: 10 }] }] }
    ]
    // plan używa kanonicznej nazwy „Hip thrust" — dawniej zwracało null
    expect(lastSetFor(history, 'Hip thrust').weight).toBe(80)
  })
  it('dopasowuje przemianowane ćwiczenie po id (Uginanie hantli młotkowo → Hammer curl)', () => {
    const history = [
      { date: '2026-06-01', exercises: [{ name: 'Uginanie hantli młotkowo', sets: [{ weight: 14, reps: 12 }] }] }
    ]
    expect(lastSetFor(history, 'Hammer curl').weight).toBe(14)
  })
  it('nie myli różnych ćwiczeń (fallback string dla spoza bazy)', () => {
    const history = [
      { date: '2026-06-01', exercises: [{ name: 'Jakieś custom XYZ', sets: [{ weight: 30, reps: 10 }] }] }
    ]
    expect(lastSetFor(history, 'Inne custom ABC')).toBeNull()
    expect(lastSetFor(history, 'Jakieś custom XYZ').weight).toBe(30)
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
  afterEach(() => { vi.useRealTimers() })

  const w = (date) => ({ date, exercises: [{ name: 'X', sets: [{ weight: 10, reps: 10 }] }] })

  it('zwraca 0 dla pustej historii', () => {
    expect(currentStreak([])).toBe(0)
  })

  it('liczy kolejne tygodnie gdy bieżący ma trening', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-07-08T12:00:00Z'))
    // dziś, −7 dni (poprzedni tydzień) → 2 kolejne tygodnie
    expect(currentStreak([w('2026-07-08'), w('2026-07-01')])).toBe(2)
  })

  it('bieżący niedokończony tydzień (bez treningu) NIE zeruje passy', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-07-08T12:00:00Z'))
    // brak treningu w tym tygodniu, ale −7 i −14 dni → passa 2, nie 0
    expect(currentStreak([w('2026-07-01'), w('2026-06-24')])).toBe(2)
  })

  it('passa spada do 0 gdy cały miniony tydzień był pusty', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-07-08T12:00:00Z'))
    // ostatni trening 2 tygodnie temu, bieżący i poprzedni tydzień puste
    expect(currentStreak([w('2026-06-24')])).toBe(0)
  })
})

// --- Analiza wzorców ruchowych ---

const historyWithMeta = [
  {
    date: '2026-06-01',
    exercises: [
      { name: 'Bench Press', sets: [{ weight: 80, reps: 8 }, { weight: 80, reps: 8 }], exerciseType: 'compound', movementPattern: 'horizontal_push' },
      { name: 'OHP', sets: [{ weight: 40, reps: 10 }], exerciseType: 'compound', movementPattern: 'vertical_push' },
      { name: 'Rozpiętki', sets: [{ weight: 12, reps: 12 }], exerciseType: 'isolation', movementPattern: 'horizontal_push' }
    ]
  },
  {
    date: '2026-06-02',
    exercises: [
      { name: 'Wiosłowanie', sets: [{ weight: 70, reps: 8 }, { weight: 70, reps: 8 }], exerciseType: 'compound', movementPattern: 'horizontal_pull' },
      { name: 'Podciąganie', sets: [{ weight: 0, reps: 10 }], exerciseType: 'compound', movementPattern: 'vertical_pull' },
      { name: 'Uginanie ramion', sets: [{ weight: 14, reps: 12 }], exerciseType: 'isolation', movementPattern: 'elbow_flexion' }
    ]
  }
]

describe('compoundIsolationRatio', () => {
  it('zwraca 0/0/0 dla pustej historii', () => {
    const r = compoundIsolationRatio([])
    expect(r.compound).toBe(0)
    expect(r.isolation).toBe(0)
    expect(r.compoundRatio).toBe(0)
  })

  it('liczy compound vs isolation', () => {
    const r = compoundIsolationRatio(historyWithMeta)
    expect(r.compound).toBe(4)
    expect(r.isolation).toBe(2)
    expect(r.compoundRatio).toBe(67)
    expect(r.unknown).toBe(0)
  })

  it('liczy unknown dla ćwiczeń bez exerciseType', () => {
    const history = [
      { date: '2026-06-01', exercises: [
        { name: 'Squat', sets: [{ weight: 100, reps: 5 }] },
        { name: 'Bench', sets: [{ weight: 80, reps: 8 }], exerciseType: 'compound' }
      ]}
    ]
    const r = compoundIsolationRatio(history)
    expect(r.compound).toBe(1)
    expect(r.unknown).toBe(1)
    expect(r.compoundRatio).toBe(100)
  })
})

describe('movementPatternBalance', () => {
  it('zwraca pustą tablicę dla pustej historii', () => {
    expect(movementPatternBalance([])).toEqual([])
  })

  it('liczy serie per wzorzec ruchowy', () => {
    const r = movementPatternBalance(historyWithMeta)
    const push = r.find(p => p.key === 'horizontal_push')
    expect(push.sets).toBe(3)
    const pull = r.find(p => p.key === 'horizontal_pull')
    expect(pull.sets).toBe(2)
    const vPull = r.find(p => p.key === 'vertical_pull')
    expect(vPull.sets).toBe(1)
  })

  it('sortuje malejąco po seriach', () => {
    const r = movementPatternBalance(historyWithMeta)
    for (let i = 1; i < r.length; i++) {
      expect(r[i].sets).toBeLessThanOrEqual(r[i - 1].sets)
    }
  })

  it('pomija ćwiczenia bez movementPattern', () => {
    const history = [
      { date: '2026-06-01', exercises: [
        { name: 'Squat', sets: [{ weight: 100, reps: 5 }] }
      ]}
    ]
    expect(movementPatternBalance(history)).toEqual([])
  })
})

describe('pushPullRatio', () => {
  it('zwraca null ratio dla pustej historii', () => {
    const r = pushPullRatio([])
    expect(r.ratio).toBe(null)
  })

  it('liczy stosunek push/pull', () => {
    const r = pushPullRatio(historyWithMeta)
    expect(r.pushSets).toBe(4)
    expect(r.pullSets).toBe(3)
    expect(r.ratio).toBe(1.33)
  })

  it('nie liczy elbow_flexion jako pull', () => {
    const history = [
      { date: '2026-06-01', exercises: [
        { name: 'Curl', sets: [{ weight: 10, reps: 12 }], movementPattern: 'elbow_flexion' }
      ]}
    ]
    const r = pushPullRatio(history)
    expect(r.pushSets).toBe(0)
    expect(r.pullSets).toBe(0)
    expect(r.ratio).toBe(null)
  })
})

describe('missingMovementPatterns', () => {
  afterEach(() => { vi.useRealTimers() })

  const wp = (date, patterns) => ({
    date,
    exercises: patterns.map(p => ({ name: p, sets: [{ weight: 10, reps: 10 }], movementPattern: p }))
  })

  it('zwraca [] gdy brak ćwiczeń z metadanymi w oknie (nie zgłasza "wszystko brakuje")', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-07-08T12:00:00Z'))
    const history = [{ date: '2026-07-07', exercises: [{ name: 'x', sets: [{ weight: 10, reps: 10 }] }] }]
    expect(missingMovementPatterns(history, 7)).toEqual([])
  })

  it('wskazuje brakujące fundamentalne wzorce', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-07-08T12:00:00Z'))
    const history = [wp('2026-07-07', ['horizontal_push'])]
    const missing = missingMovementPatterns(history, 7).map(m => m.key)
    expect(missing).toContain('squat')
    expect(missing).toContain('hinge')
    expect(missing).toContain('vertical_pull')
    expect(missing).not.toContain('horizontal_push')
    expect(missing.length).toBe(5)
  })

  it('zwraca [] gdy wszystkie 6 fundamentalnych wzorców trenowane', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-07-08T12:00:00Z'))
    const history = [wp('2026-07-07', [
      'horizontal_push', 'vertical_push', 'horizontal_pull', 'vertical_pull', 'squat', 'hinge'
    ])]
    expect(missingMovementPatterns(history, 7)).toEqual([])
  })

  it('ignoruje treningi spoza okna', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-07-08T12:00:00Z'))
    const history = [wp('2026-06-01', ['squat'])]  // > 7 dni temu
    expect(missingMovementPatterns(history, 7)).toEqual([])
  })
})
