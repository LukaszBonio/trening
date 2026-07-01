import { ref, computed } from 'vue'

export function useSetNavigation(exercises) {
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

  function advance() {
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

  function goBackPosition() {
    if (setIdx.value > 0) {
      setIdx.value--
    } else if (exIdx.value > 0) {
      exIdx.value--
      setIdx.value = exercises.value[exIdx.value].sets.length - 1
    }
  }

  function jumpToFirstUnchecked() {
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

  function reset() {
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
    advance,
    goBackPosition,
    jumpToFirstUnchecked,
    reset
  }
}
