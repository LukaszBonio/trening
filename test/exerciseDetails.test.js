import { describe, it, expect } from 'vitest'
import { ALL_EXERCISES } from '../src/lib/exerciseDb'
import { EXERCISE_DETAILS, getExerciseDetailsById, getExerciseDetailsByName } from '../src/lib/exerciseDetails'

describe('exerciseDetails — pokrycie i spójność z bazą', () => {
  it('każde ćwiczenie z bazy ma wpis szczegółów', () => {
    const missing = ALL_EXERCISES.filter(ex => !EXERCISE_DETAILS[ex.id]).map(ex => ex.id)
    expect(missing, `brak szczegółów dla: ${missing.join(', ')}`).toEqual([])
  })

  it('brak osieroconych wpisów (id spoza bazy)', () => {
    const dbIds = new Set(ALL_EXERCISES.map(ex => ex.id))
    const orphans = Object.keys(EXERCISE_DETAILS).filter(id => !dbIds.has(id))
    expect(orphans, `osierocone id: ${orphans.join(', ')}`).toEqual([])
  })

  it('ćwiczenia na wyciągu mają określony uchwyt (attachment)', () => {
    const bad = ALL_EXERCISES
      .filter(ex => ex.equipment === 'wyciąg')
      .filter(ex => !EXERCISE_DETAILS[ex.id]?.attachment)
      .map(ex => ex.id)
    expect(bad, `wyciąg bez uchwytu: ${bad.join(', ')}`).toEqual([])
  })

  it('każdy wpis ma kompletne, niepuste pola', () => {
    const problems = []
    for (const [id, d] of Object.entries(EXERCISE_DETAILS)) {
      if (!d.equipmentDetail?.trim()) problems.push(`${id}: equipmentDetail`)
      if (!d.startPosition?.trim()) problems.push(`${id}: startPosition`)
      if (!d.rangeOfMotion?.trim()) problems.push(`${id}: rangeOfMotion`)
      if (!Array.isArray(d.execution) || d.execution.length < 3) problems.push(`${id}: execution < 3 kroków`)
      if (!Array.isArray(d.musclesPrimary) || d.musclesPrimary.length < 1) problems.push(`${id}: musclesPrimary puste`)
      if (!Array.isArray(d.musclesSecondary) || d.musclesSecondary.length < 1) problems.push(`${id}: musclesSecondary puste`)
      if (!Array.isArray(d.commonMistakes) || d.commonMistakes.length < 3) problems.push(`${id}: commonMistakes < 3`)
      if (!Array.isArray(d.tips) || d.tips.length < 2) problems.push(`${id}: tips < 2`)
    }
    expect(problems, problems.join('\n')).toEqual([])
  })

  it('getExerciseDetailsById zwraca wpis lub null', () => {
    expect(getExerciseDetailsById('wyciskanie-sztangi-na-lawce-poziomej')).toBeTruthy()
    expect(getExerciseDetailsById('nie-istnieje')).toBeNull()
  })

  it('getExerciseDetailsByName działa po nazwie kanonicznej i aliasie', () => {
    const byName = getExerciseDetailsByName('Wyciskanie sztangi na ławce poziomej')
    const byAlias = getExerciseDetailsByName('bench press')
    expect(byName).toBeTruthy()
    expect(byAlias).toBe(byName)
    expect(getExerciseDetailsByName('Ćwiczenie spoza bazy')).toBeNull()
  })
})
