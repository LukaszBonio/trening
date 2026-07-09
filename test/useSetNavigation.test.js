import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useSetNavigation } from '../src/composables/useSetNavigation'

function makeExercises() {
  return ref([
    { name: 'A', sets: [{ done: false }, { done: false }] },
    { name: 'B', sets: [{ done: false }, { done: true }, { done: false }] }
  ])
}

describe('useSetNavigation', () => {
  it('starts at 0/0', () => {
    const nav = useSetNavigation(makeExercises())
    expect(nav.exIdx.value).toBe(0)
    expect(nav.setIdx.value).toBe(0)
  })

  it('advance moves through sets then exercises', () => {
    const nav = useSetNavigation(makeExercises())
    expect(nav.advance()).toBe(true)
    expect(nav.exIdx.value).toBe(0)
    expect(nav.setIdx.value).toBe(1)
    expect(nav.advance()).toBe(true)
    expect(nav.exIdx.value).toBe(1)
    expect(nav.setIdx.value).toBe(0)
  })

  it('advance returns false at end', () => {
    const nav = useSetNavigation(makeExercises())
    nav.exIdx.value = 1
    nav.setIdx.value = 2
    expect(nav.advance()).toBe(false)
  })

  it('goBackPosition moves backwards', () => {
    const nav = useSetNavigation(makeExercises())
    nav.exIdx.value = 1
    nav.setIdx.value = 1
    nav.goBackPosition()
    expect(nav.setIdx.value).toBe(0)
    nav.goBackPosition()
    expect(nav.exIdx.value).toBe(0)
    expect(nav.setIdx.value).toBe(1)
  })

  it('jumpToFirstUnchecked skips done sets', () => {
    const exercises = makeExercises()
    exercises.value[0].sets[0].done = true
    exercises.value[0].sets[1].done = true
    exercises.value[1].sets[0].done = true
    const nav = useSetNavigation(exercises)
    nav.jumpToFirstUnchecked()
    expect(nav.exIdx.value).toBe(1)
    expect(nav.setIdx.value).toBe(2)
  })

  it('globalProgress counts correctly', () => {
    const exercises = makeExercises()
    exercises.value[0].sets[0].done = true
    const nav = useSetNavigation(exercises)
    expect(nav.globalProgress.value.done).toBe(2)
    expect(nav.globalProgress.value.total).toBe(5)
  })

  it('currentEx and currentSet reflect position', () => {
    const nav = useSetNavigation(makeExercises())
    expect(nav.currentEx.value.name).toBe('A')
    nav.exIdx.value = 1
    expect(nav.currentEx.value.name).toBe('B')
  })

  it('nextEx returns next exercise when at last set', () => {
    const nav = useSetNavigation(makeExercises())
    nav.setIdx.value = 1
    expect(nav.nextEx.value.name).toBe('B')
  })

  it('reset sets both indices to 0', () => {
    const nav = useSetNavigation(makeExercises())
    nav.exIdx.value = 1
    nav.setIdx.value = 2
    nav.reset()
    expect(nav.exIdx.value).toBe(0)
    expect(nav.setIdx.value).toBe(0)
  })

  it('advanceToNextUnchecked pomija ukończone i zawija; false gdy wszystko zrobione', () => {
    const exercises = makeExercises()
    // done: A0, A1; niezrobione: B0, B2 (B1 done)
    exercises.value[0].sets[0].done = true
    exercises.value[0].sets[1].done = true
    exercises.value[1].sets[1].done = true
    const nav = useSetNavigation(exercises)
    // z pozycji A0 → następna niezrobiona to B0
    expect(nav.advanceToNextUnchecked()).toBe(true)
    expect(nav.exIdx.value).toBe(1); expect(nav.setIdx.value).toBe(0)
    // z B0 → B2 (B1 pominięte bo done)
    expect(nav.advanceToNextUnchecked()).toBe(true)
    expect(nav.setIdx.value).toBe(2)
    // dokończ ostatnie → brak niezrobionych → false
    exercises.value[1].sets[0].done = true
    exercises.value[1].sets[2].done = true
    expect(nav.advanceToNextUnchecked()).toBe(false)
  })

  it('hasUnchecked odzwierciedla pozostałe serie', () => {
    const exercises = makeExercises()
    const nav = useSetNavigation(exercises)
    expect(nav.hasUnchecked.value).toBe(true)
    exercises.value.forEach(ex => ex.sets.forEach(s => { s.done = true }))
    expect(nav.hasUnchecked.value).toBe(false)
  })

  it('goToPrevExercise / skipToNextExercise przełączają ćwiczenia i zerują setIdx', () => {
    const nav = useSetNavigation(makeExercises())
    expect(nav.goToPrevExercise()).toBe(false) // już na pierwszym
    expect(nav.skipToNextExercise()).toBe(true)
    expect(nav.exIdx.value).toBe(1); expect(nav.setIdx.value).toBe(0)
    expect(nav.skipToNextExercise()).toBe(false) // ostatnie
    expect(nav.goToPrevExercise()).toBe(true)
    expect(nav.exIdx.value).toBe(0)
  })
})
