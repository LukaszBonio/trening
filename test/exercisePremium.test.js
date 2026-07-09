import { describe, it, expect } from 'vitest'
import { findExerciseById } from '../src/lib/exerciseDb'
import { EXERCISE_PREMIUM, withPremium } from '../src/lib/exercisePremium'
import { deriveExerciseProfile } from '../src/lib/exerciseModel'
import { scoreExercise } from '../src/lib/exerciseScoring'

describe('EXERCISE_PREMIUM — integralność', () => {
  it('każdy klucz premium wskazuje realne ćwiczenie w bazie (brak literówek id)', () => {
    for (const id of Object.keys(EXERCISE_PREMIUM)) {
      expect(findExerciseById(id), `nieznane id: ${id}`).toBeTruthy()
    }
  })
  it('pokrywa pełny Push (41 wpisów)', () => {
    expect(Object.keys(EXERCISE_PREMIUM).length).toBe(41)
  })
})

describe('withPremium + derive', () => {
  it('dipy: injuryRisk high + ac_joint, wysoki jointStress barku', () => {
    const dips = withPremium(findExerciseById('pompki-na-poreczach'))
    expect(dips.safety?.injuryRisk).toBe('high')
    expect(dips.safety?.contraindications).toContain('ac_joint')
    const prof = deriveExerciseProfile(dips)
    expect(prof.peakTension).toBe('stretch')
    expect(prof.maxJointStress).toBeGreaterThanOrEqual(7) // bark 7
  })

  it('rozpiętki skośne: STORED stretchStimulus 9 wchodzi do profilu', () => {
    const fly = withPremium(findExerciseById('rozpietki-hantlami-na-lawce-skosnej'))
    expect(deriveExerciseProfile(fly).stretchStimulus).toBe(9)
  })

  it('ćwiczenie bez wpisu premium → withPremium nie dokłada pól', () => {
    const legExt = findExerciseById('wyprosty-nog') // Legs, brak premium
    const merged = withPremium(legExt)
    expect(merged.mechanics).toBeUndefined()
    expect(merged.safety).toBeUndefined()
  })
})

describe('withPremium + score', () => {
  it('OHP przeciwwskazany przy dyskopatii (lumbar_disc) → eligible=false', () => {
    const ohp = withPremium(findExerciseById('wyciskanie-sztangi-nad-glowe'))
    const s = scoreExercise(ohp, { goal: 'strength', level: 'intermediate', injuries: ['lumbar_disc'] })
    expect(s.eligible).toBe(false)
    expect(s.total).toBe(0)
  })
  it('ten sam OHP bez kontuzji → eligible=true', () => {
    const ohp = withPremium(findExerciseById('wyciskanie-sztangi-nad-glowe'))
    const s = scoreExercise(ohp, { goal: 'strength', level: 'intermediate' })
    expect(s.eligible).toBe(true)
    expect(s.total).toBeGreaterThan(0)
  })
})
