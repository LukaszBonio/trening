import { describe, it, expect } from 'vitest'
import { deriveExerciseProfile } from '../src/lib/exerciseModel'
import { scoreExercise } from '../src/lib/exerciseScoring'

// Minimalny ExerciseEntry + opcjonalne pola premium.
function ex(overrides = {}) {
  return {
    id: 'test', name: 'Test', aliases: [], primaryMuscle: 'quads', muscleHead: 'quads',
    equipment: 'sztanga', exerciseType: 'compound', movementPattern: 'squat',
    difficulty: 'intermediate', isUnilateral: false, defaultSets: 3, defaultReps: '8-12', tip: '',
    ...overrides
  }
}

describe('deriveExerciseProfile — reguły', () => {
  it('przysiad ze sztangą: wysokie zmęczenie ogólnoustrojowe i obciążenie kręgosłupa', () => {
    const p = deriveExerciseProfile(ex())
    expect(p.fatigueSystemic).toBeGreaterThanOrEqual(7)
    expect(p.spinalLoading).toBe(8)
    expect(p.recoveryCost).toBeGreaterThan(6)
  })

  it('izolacja na maszynie: niski systemic, wysokie SFR, niski recoveryCost', () => {
    const p = deriveExerciseProfile(ex({ exerciseType: 'isolation', equipment: 'maszyna', movementPattern: 'squat', name: 'Wyprosty nóg' }))
    expect(p.fatigueSystemic).toBeLessThanOrEqual(3)
    expect(p.sfr).toBeGreaterThan(5)
    expect(p.recoveryCost).toBeLessThan(4)
  })

  it('wszystkie wartości profilu w zakresie 0–10', () => {
    const p = deriveExerciseProfile(ex({ equipment: 'hantle', movementPattern: 'hinge' }))
    for (const v of Object.values(p)) {
      if (typeof v === 'number') { expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThanOrEqual(10) }
    }
  })

  it('STORED ma pierwszeństwo nad regułą (peakTension + jointStress.knee)', () => {
    const p = deriveExerciseProfile(ex({
      exerciseType: 'isolation', equipment: 'maszyna',
      mechanics: { peakTension: 'contraction' },
      jointStress: { knee: 7 }
    }))
    expect(p.peakTension).toBe('contraction')   // override, nie 'stretch' z reguły squat
    expect(p.maxJointStress).toBe(7)            // uwzględnia jawnie podane kolano
  })

  it('wyciąg → resistanceCurve constant; maszyna → variable', () => {
    expect(deriveExerciseProfile(ex({ equipment: 'wyciąg' })).resistanceCurve).toBe('constant')
    expect(deriveExerciseProfile(ex({ equipment: 'maszyna' })).resistanceCurve).toBe('variable')
  })
})

describe('scoreExercise — kontekstowa ocena', () => {
  const ctx = { goal: 'hypertrophy', level: 'intermediate' }

  it('zwraca total 0–100, eligible=true i rozbicie', () => {
    const s = scoreExercise(ex(), ctx)
    expect(s.eligible).toBe(true)
    expect(s.total).toBeGreaterThanOrEqual(0)
    expect(s.total).toBeLessThanOrEqual(100)
    expect(s.breakdown).toHaveProperty('sfr')
  })

  it('przeciwwskazanie przy kontuzji → eligible=false, total=0', () => {
    const e = ex({ safety: { contraindications: ['lumbar_disc'] } })
    const s = scoreExercise(e, { goal: 'hypertrophy', level: 'intermediate', injuries: ['lumbar_disc'] })
    expect(s.eligible).toBe(false)
    expect(s.total).toBe(0)
  })

  it('brak kontuzji pasującej do przeciwwskazań → eligible=true', () => {
    const e = ex({ safety: { contraindications: ['shoulder_impingement'] } })
    const s = scoreExercise(e, { goal: 'hypertrophy', level: 'intermediate', injuries: ['mcl'] })
    expect(s.eligible).toBe(true)
  })

  it('cel siła premiuje wielostawowy ze sztangą nad izolację', () => {
    const compound = scoreExercise(ex(), { goal: 'strength', level: 'advanced' })
    const isolation = scoreExercise(ex({ exerciseType: 'isolation', equipment: 'maszyna' }), { goal: 'strength', level: 'advanced' })
    expect(compound.total).toBeGreaterThan(isolation.total)
  })

  it('trudna technika karana u początkującego bardziej niż u zaawansowanego', () => {
    const hard = ex({ difficulty: 'advanced' })   // techniqueDifficulty ~7.5 z fallbacku
    const beginner = scoreExercise(hard, { goal: 'hypertrophy', level: 'absolute_beginner' })
    const elite = scoreExercise(hard, { goal: 'hypertrophy', level: 'elite' })
    expect(beginner.breakdown.technique).toBeLessThan(elite.breakdown.technique)
    expect(beginner.total).toBeLessThan(elite.total)
  })
})
