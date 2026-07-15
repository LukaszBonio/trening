import { describe, it, expect } from 'vitest'
import {
  MUSCLE_TO_GROUP,
  PRIMARY_TO_GROUP,
  GROUP_LABELS,
  GROUP_ORDER,
  groupExercisesByMuscle
} from '../src/lib/workoutSchema'

describe('MUSCLE_TO_GROUP', () => {
  it('mapuje głowy mięśniowe na grupy używane w GROUP_LABELS', () => {
    expect(MUSCLE_TO_GROUP.chest_upper).toBe('klatka')
    expect(MUSCLE_TO_GROUP.back_lats).toBe('plecy')
    expect(MUSCLE_TO_GROUP.quads).toBe('czworogłowy')
  })
  it('każdy klucz mapuje na klucz obecny w GROUP_LABELS', () => {
    for (const group of Object.values(MUSCLE_TO_GROUP)) {
      expect(GROUP_LABELS[group]).toBeDefined()
    }
  })
})

describe('PRIMARY_TO_GROUP', () => {
  it('zawiera 13 angielskich kluczy AI', () => {
    const keys = Object.keys(PRIMARY_TO_GROUP)
    expect(keys).toContain('chest')
    expect(keys).toContain('rear_shoulders')
    expect(keys).toContain('core')
    expect(keys).toContain('adductors')
    expect(keys.length).toBe(13)
  })
  it('każdy klucz mapuje na klucz obecny w GROUP_LABELS', () => {
    for (const group of Object.values(PRIMARY_TO_GROUP)) {
      expect(GROUP_LABELS[group]).toBeDefined()
    }
  })
})

describe('GROUP_ORDER', () => {
  it('ma kolejność dla każdego typu w schemacie', () => {
    expect(GROUP_ORDER.push).toContain('klatka')
    expect(GROUP_ORDER.pull).toContain('plecy')
    expect(GROUP_ORDER.legs).toContain('czworogłowy')
  })
})

describe('groupExercisesByMuscle', () => {
  it('grupuje rozpoznane ćwiczenia push do klatka/barki/triceps', () => {
    const exercises = [
      { name: 'Wyciskanie sztangi na ławce poziomej' },
      { name: 'Wyciskanie żołnierskie' },
      { name: 'Pushdown' }
    ]
    const groups = groupExercisesByMuscle(exercises, 'push', 'library')
    const groupIds = groups.map(g => g.groupId)
    expect(groupIds).toContain('klatka')
    expect(groupIds).toContain('barki')
    expect(groupIds).toContain('triceps')
  })
  it('nieznane ćwiczenia trafiają do sąsiedniej grupy zamiast "inne"', () => {
    const exercises = [
      { name: 'Wyciskanie sztangi na ławce poziomej' },
      { name: 'Pies-jaszczurka XYZ' } // unknown
    ]
    const groups = groupExercisesByMuscle(exercises, 'push', 'library')
    // Unknown powinno wpaść do klatki (sąsiad)
    const klatka = groups.find(g => g.groupId === 'klatka')
    expect(klatka.exerciseIndices.length).toBe(2)
  })
})
