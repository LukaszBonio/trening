import { ref, computed } from 'vue'
import { formatClock } from '../lib/format.js'
import { notifyTimerEnd } from '../lib/notifications.js'

export function useRestTimer(defaultSeconds = 90) {
  const restRemaining = ref(0)
  const restTotal = ref(defaultSeconds)
  const timerEndFlash = ref(false)
  let restInterval = null

  const restDisplay = computed(() => formatClock(restRemaining.value))
  const restProgress = computed(() => {
    if (restTotal.value === 0) return 0
    return (1 - restRemaining.value / restTotal.value) * 100
  })

  let _onEnd = null

  function startRest(seconds) {
    restTotal.value = seconds || defaultSeconds
    restRemaining.value = restTotal.value
    if (restInterval) clearInterval(restInterval)
    restInterval = setInterval(() => {
      restRemaining.value--
      if (restRemaining.value <= 0) {
        stopRest()
        notifyTimerEnd('Koniec przerwy', 'Wracaj do ćwiczeń')
        timerEndFlash.value = true
        setTimeout(() => { timerEndFlash.value = false }, 2000)
        if (_onEnd) _onEnd()
      }
    }, 1000)
  }

  function stopRest() {
    if (restInterval) { clearInterval(restInterval); restInterval = null }
  }

  function adjustRest(delta) {
    restRemaining.value = Math.max(0, restRemaining.value + delta)
    if (restRemaining.value > restTotal.value) restTotal.value = restRemaining.value
  }

  function onTimerEnd(cb) {
    _onEnd = cb
  }

  return {
    restRemaining,
    restTotal,
    restDisplay,
    restProgress,
    timerEndFlash,
    startRest,
    stopRest,
    adjustRest,
    onTimerEnd
  }
}
