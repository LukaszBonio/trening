import { ref, computed } from 'vue'
import { formatClock } from '../lib/format'
import { notifyTimerEnd } from '../lib/notifications'

export function useRestTimer(defaultSeconds = 90) {
  const restRemaining = ref(0)
  const restTotal = ref(defaultSeconds)
  const timerEndFlash = ref(false)
  let restInterval: ReturnType<typeof setInterval> | null = null
  let endTime = 0
  let wakeLock: WakeLockSentinel | null = null

  async function acquireWakeLock(): Promise<void> {
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await navigator.wakeLock.request('screen')
        wakeLock.addEventListener('release', () => { wakeLock = null })
      }
    } catch { /* user denied or tab hidden — non-critical */ }
  }

  function releaseWakeLock(): void {
    if (wakeLock) { wakeLock.release(); wakeLock = null }
  }

  function syncFromClock(): void {
    const remaining = Math.ceil((endTime - Date.now()) / 1000)
    if (remaining <= 0) {
      restRemaining.value = 0
      fireEnd()
    } else {
      restRemaining.value = remaining
    }
  }

  function handleVisibilityChange(): void {
    if (document.visibilityState !== 'visible') return
    if (restInterval) {
      syncFromClock()
      if (!wakeLock) acquireWakeLock()
    }
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  const restDisplay = computed(() => formatClock(restRemaining.value))
  const restProgress = computed(() => {
    if (restTotal.value === 0) return 0
    return (1 - restRemaining.value / restTotal.value) * 100
  })

  let _onEnd: (() => void) | null = null

  function fireEnd(): void {
    stopRest()
    notifyTimerEnd('Koniec przerwy', 'Wracaj do ćwiczeń')
    timerEndFlash.value = true
    setTimeout(() => { timerEndFlash.value = false }, 2000)
    if (_onEnd) _onEnd()
  }

  function startRest(seconds?: number): void {
    restTotal.value = seconds || defaultSeconds
    restRemaining.value = restTotal.value
    endTime = Date.now() + restTotal.value * 1000
    acquireWakeLock()
    if (restInterval) clearInterval(restInterval)
    restInterval = setInterval(syncFromClock, 1000)
  }

  function stopRest(): void {
    if (restInterval) { clearInterval(restInterval); restInterval = null }
    endTime = 0
    releaseWakeLock()
  }

  function adjustRest(delta: number): void {
    endTime += delta * 1000
    const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000))
    restRemaining.value = remaining
    if (remaining > restTotal.value) restTotal.value = remaining
  }

  function onTimerEnd(cb: () => void): void {
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
