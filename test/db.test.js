import { describe, it, expect } from 'vitest'
import { detectMuscle, detectEquipment } from '../src/lib/muscles.js'
import { findSubstitutes, translateExerciseName } from '../src/lib/substitutions.js'

describe('detectMuscle', () => {
  it('rozpoznaje klatkę po keyword', () => {
    expect(detectMuscle('Wyciskanie sztangi na ławce poziomej')).toBe('chest_middle')
    expect(detectMuscle('Wyciskanie sztangi na ławce skośnej dodatniej')).toBe('chest_upper')
  })
  it('rozpoznaje plecy', () => {
    expect(detectMuscle('Wiosłowanie sztangą w opadzie')).toBe('back_middle')
    expect(detectMuscle('Martwy ciąg klasyczny')).toBe('back_lower')
  })
  it('rozpoznaje hamstring (RDL bug fix z 4511e55)', () => {
    expect(detectMuscle('Rumuński martwy ciąg ze sztangą (RDL)')).toBe('hamstrings')
  })
  it('rozpoznaje barki boczne mimo deklinacji "hantlami" vs "hantli"', () => {
    expect(detectMuscle('Wznosy hantlami bokiem w staniu')).toBe('shoulder_side')
  })
  it('rozpoznaje przedramię', () => {
    expect(detectMuscle('Uginanie nadgarstków z hantlami w siadzie')).toBe('forearms')
  })
  it('zwraca null dla pustego/nieznanego', () => {
    expect(detectMuscle('')).toBeNull()
    expect(detectMuscle('Pies-jaszczurka turbo XYZ')).toBeNull()
  })
  it('jest case-insensitive', () => {
    expect(detectMuscle('PRZYSIAD ZE SZTANGĄ')).toBe('quads')
  })
})

describe('detectEquipment', () => {
  it('rozpoznaje sztangę', () => {
    const r = detectEquipment('Wyciskanie sztangi na ławce poziomej')
    expect(r).not.toBeNull()
    expect(r.label).toBe('Sztanga')
  })
  it('rozpoznaje hantle', () => {
    expect(detectEquipment('Uginanie hantli na ławce skośnej').label).toBe('Hantle')
  })
  it('zwraca null gdy brak match', () => {
    expect(detectEquipment('XYZ')).toBeNull()
  })
})

describe('findSubstitutes', () => {
  it('zwraca alternatywy z tej samej partii mięśniowej', () => {
    const r = findSubstitutes('Wyciskanie sztangi na ławce poziomej', 3)
    expect(r).toHaveLength(3)
    expect(r).not.toContain('Wyciskanie sztangi na ławce poziomej')
  })
  it('respektuje limit', () => {
    expect(findSubstitutes('Wyciskanie sztangi na ławce poziomej', 1)).toHaveLength(1)
  })
  it('zwraca [] gdy nie wykryto partii', () => {
    expect(findSubstitutes('Pies-jaszczurka turbo XYZ', 3)).toEqual([])
  })
})

describe('translateExerciseName', () => {
  it('tłumaczy angielskie nazwy na polskie', () => {
    expect(translateExerciseName('Bench Press')).toBe('Wyciskanie sztangi na ławce poziomej')
    expect(translateExerciseName('Lateral Raise')).toBe('Wznosy hantli bokiem')
    expect(translateExerciseName('Romanian Deadlift')).toBe('Martwy ciąg rumuński')
    expect(translateExerciseName('Skull Crusher')).toBe('Francuskie wyciskanie sztangi')
  })
  it('jest case-insensitive', () => {
    expect(translateExerciseName('bench press')).toBe('Wyciskanie sztangi na ławce poziomej')
    expect(translateExerciseName('BENCH PRESS')).toBe('Wyciskanie sztangi na ławce poziomej')
  })
  it('nie zmienia polskich nazw', () => {
    expect(translateExerciseName('Wyciskanie sztangi na ławce poziomej')).toBe('Wyciskanie sztangi na ławce poziomej')
  })
  it('nie zmienia nieznanych nazw', () => {
    expect(translateExerciseName('Jakieś nieznane')).toBe('Jakieś nieznane')
  })
  it('zwraca input dla null/undefined', () => {
    expect(translateExerciseName(null)).toBeNull()
    expect(translateExerciseName(undefined)).toBeUndefined()
  })
})
