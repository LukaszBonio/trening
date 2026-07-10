import { ref, computed, onScopeDispose, getCurrentScope } from 'vue'
import { formatClock } from '../lib/format'
import { notifyTimerEnd } from '../lib/notifications'

export function useRestTimer(defaultSeconds = 90) {
  const restRemaining = ref(0)
  const restTotal = ref(defaultSeconds)
  const timerEndFlash = ref(false)
  let restInterval: ReturnType<typeof setInterval> | null = null
  let endTime = 0
  let wakeLock: WakeLockSentinel | null = null

  // Fallback trzymający ekran włączony gdy natywne Wake Lock API zawodzi lub zostanie
  // wyciszone przez oszczędzanie baterii (częste na Androidzie). Odtwarzanie mediów
  // (wyciszone wideo ze strumienia z canvas) blokuje wygaszanie ekranu bez pliku zewn.
  let noSleepVideo: HTMLVideoElement | null = null
  let noSleepDraw: ReturnType<typeof setInterval> | null = null

  function startNoSleepFallback(): void {
    if (typeof document === 'undefined') return
    if (noSleepVideo) { noSleepVideo.play().catch(() => {}); return }
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 2
      canvas.height = 2
      const ctx = canvas.getContext('2d')
      const cap = (canvas as HTMLCanvasElement & { captureStream?: (fps?: number) => MediaStream }).captureStream
      if (!ctx || typeof cap !== 'function') return
      const stream = cap.call(canvas, 1)
      // Rysuj naprzemiennie co 0.5s — strumień musi produkować klatki, inaczej wideo się zatrzyma.
      let on = false
      noSleepDraw = setInterval(() => {
        on = !on
        ctx.fillStyle = on ? '#000000' : '#010101'
        ctx.fillRect(0, 0, 2, 2)
      }, 500)
      const video = document.createElement('video')
      video.muted = true
      video.setAttribute('muted', '')
      video.setAttribute('playsinline', '')
      video.setAttribute('aria-hidden', 'true')
      video.style.cssText = 'position:fixed;bottom:0;right:0;width:1px;height:1px;opacity:0.01;pointer-events:none;'
      video.srcObject = stream
      document.body.appendChild(video)
      noSleepVideo = video
      video.play().catch(() => {})
    } catch { /* non-critical */ }
  }

  function stopNoSleepFallback(): void {
    if (noSleepDraw) { clearInterval(noSleepDraw); noSleepDraw = null }
    if (!noSleepVideo) return
    try {
      noSleepVideo.pause()
      const s = noSleepVideo.srcObject as MediaStream | null
      if (s) s.getTracks().forEach(t => t.stop())
      noSleepVideo.srcObject = null
      noSleepVideo.remove()
    } catch { /* ignore */ }
    noSleepVideo = null
  }

  async function acquireWakeLock(): Promise<void> {
    // Fallback zawsze — trzyma ekran nawet gdy natywne API po cichu nie zadziała.
    startNoSleepFallback()
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await navigator.wakeLock.request('screen')
        wakeLock.addEventListener('release', () => { wakeLock = null })
      }
    } catch { /* user denied or tab hidden — non-critical */ }
  }

  function releaseWakeLock(): void {
    stopNoSleepFallback()
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
      // Po powrocie do karty: natywny lock trzeba wziąć ponownie, wideo wznowić.
      if (!wakeLock) acquireWakeLock()
      else startNoSleepFallback()
    }
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  // Sprzątanie przy odmontowaniu komponentu: bez tego każde wejście w trening
  // dokłada trwały listener (i przy powrocie karty odpala kolejny wake lock / wideo).
  // getCurrentScope() — rejestrujemy tylko gdy jest scope (jest w setupie komponentu;
  // brak np. w testach jednostkowych wołających composable bezpośrednio).
  if (getCurrentScope()) {
    onScopeDispose(() => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
      stopRest()
    })
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
