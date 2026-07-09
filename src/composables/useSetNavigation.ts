import { ref, computed, type Ref } from 'vue'

interface NavigationSet {
  done?: boolean
  [key: string]: unknown
}

interface NavigationExercise {
  sets: NavigationSet[]
  [key: string]: unknown
}

export function useSetNavigation(exercises: Ref<NavigationExercise[]>) {
  const exIdx = ref(0)
  const setIdx = ref(0)

  const currentEx = computed(() => exercises.value[exIdx.value])
  const currentSet = computed(() => currentEx.value?.sets[setIdx.value])

  const nextExIdx = computed(() => {
    if (!currentEx.value) return -1
    if (setIdx.value < currentEx.value.sets.length - 1) return exIdx.value
    return exIdx.value + 1
  })
  const nextSetIdx = computed(() => {
    if (!currentEx.value) return -1
    if (setIdx.value < currentEx.value.sets.length - 1) return setIdx.value + 1
    return 0
  })
  const nextEx = computed(() =>
    nextExIdx.value >= 0 && nextExIdx.value < exercises.value.length
      ? exercises.value[nextExIdx.value]
      : null
  )

  const globalProgress = computed(() => {
    let done = 0, total = 0, currentGlobalIdx = 0
    exercises.value.forEach((ex, ei) => {
      ex.sets.forEach((s, si) => {
        total++
        if (s.done) done++
        if (ei < exIdx.value || (ei === exIdx.value && si < setIdx.value)) {
          currentGlobalIdx++
        }
      })
    })
    return { done, total, currentGlobalIdx }
  })

  function advance(): boolean {
    if (!currentEx.value) return false
    if (setIdx.value < currentEx.value.sets.length - 1) {
      setIdx.value++
      return true
    }
    if (exIdx.value < exercises.value.length - 1) {
      exIdx.value++
      setIdx.value = 0
      return true
    }
    return false
  }

  function goBackPosition(): void {
    if (setIdx.value > 0) {
      setIdx.value--
    } else if (exIdx.value > 0) {
      exIdx.value--
      setIdx.value = exercises.value[exIdx.value].sets.length - 1
    }
  }

  // Przesuwa do następnej NIEUKOŃCZONEJ serii (z zawijaniem od początku).
  // Zwraca false, gdy wszystkie serie są już ukończone. Dzięki temu koniec treningu
  // zależy od faktycznego ukończenia, nie od dojścia do ostatniej pozycji.
  function advanceToNextUnchecked(): boolean {
    const flat: { ei: number; si: number; done: boolean }[] = []
    exercises.value.forEach((ex, ei) => ex.sets.forEach((s, si) => flat.push({ ei, si, done: !!s.done })))
    if (!flat.length) return false
    const cur = flat.findIndex(p => p.ei === exIdx.value && p.si === setIdx.value)
    const start = cur < 0 ? 0 : cur
    for (let off = 1; off <= flat.length; off++) {
      const p = flat[(start + off) % flat.length]
      if (!p.done) { exIdx.value = p.ei; setIdx.value = p.si; return true }
    }
    return false
  }

  // Czy pozostała jakakolwiek nieukończona seria (w całym treningu).
  const hasUnchecked = computed(() =>
    exercises.value.some(ex => ex.sets.some(s => !s.done))
  )

  function goToPrevExercise(): boolean {
    if (exIdx.value > 0) { exIdx.value--; setIdx.value = 0; return true }
    return false
  }

  function skipToNextExercise(): boolean {
    if (exIdx.value < exercises.value.length - 1) { exIdx.value++; setIdx.value = 0; return true }
    return false
  }

  function jumpToFirstUnchecked(): void {
    for (let ei = 0; ei < exercises.value.length; ei++) {
      for (let si = 0; si < exercises.value[ei].sets.length; si++) {
        if (!exercises.value[ei].sets[si].done) {
          exIdx.value = ei
          setIdx.value = si
          return
        }
      }
    }
  }

  function reset(): void {
    exIdx.value = 0
    setIdx.value = 0
  }

  return {
    exIdx,
    setIdx,
    currentEx,
    currentSet,
    nextExIdx,
    nextSetIdx,
    nextEx,
    globalProgress,
    hasUnchecked,
    advance,
    advanceToNextUnchecked,
    goToPrevExercise,
    skipToNextExercise,
    goBackPosition,
    jumpToFirstUnchecked,
    reset
  }
}
