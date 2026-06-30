// Helpers for local browser notifications (no server / push subscription).
// Uses Notification API + vibration + Web Audio beep.

const PERMISSION_KEY = 'tp_notif_permission_asked_v1'

let _audioCtx = null
function getAudioCtx() {
  if (_audioCtx) return _audioCtx
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (AC) _audioCtx = new AC()
  } catch {}
  return _audioCtx
}

function singleBeep(ctx, startAt, freq, duration) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, startAt)
  gain.gain.exponentialRampToValueAtTime(0.55, startAt + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(startAt)
  osc.stop(startAt + duration + 0.02)
}

export function playTimerEndSound() {
  const ctx = getAudioCtx()
  if (!ctx) return
  try {
    if (ctx.state === 'suspended') ctx.resume()
    const t0 = ctx.currentTime
    // Dłuższa, głośniejsza sekwencja końca timera — bardziej zauważalna w hałaśliwej siłowni.
    // 4 dźwięki rosnące + finalny akcent. Gain 0.5 (było 0.35).
    singleBeep(ctx, t0,        660, 0.18)
    singleBeep(ctx, t0 + 0.22, 880, 0.18)
    singleBeep(ctx, t0 + 0.44, 1100, 0.18)
    singleBeep(ctx, t0 + 0.66, 1320, 0.35)
  } catch (e) {
    console.warn('[beep] failed:', e)
  }
}

// Web Speech API — odtwarza komunikat głosowy po polsku.
// Działa offline (na większości urządzeń wykorzystuje wbudowany silnik).
export function speak(text, opts = {}) {
  try {
    if (!('speechSynthesis' in window)) return
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = opts.lang || 'pl-PL'
    utter.rate = opts.rate ?? 1.05
    utter.pitch = opts.pitch ?? 1.0
    utter.volume = opts.volume ?? 1.0
    // Anuluj poprzednie wypowiedzi żeby nie kumulowały się.
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  } catch (e) {
    console.warn('[speak] failed:', e)
  }
}

export function isSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function permission() {
  if (!isSupported()) return 'unsupported'
  return Notification.permission
}

export async function requestPermission() {
  if (!isSupported()) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  try {
    localStorage.setItem(PERMISSION_KEY, '1')
    return await Notification.requestPermission()
  } catch {
    return Notification.permission
  }
}

export function wasAsked() {
  try { return !!localStorage.getItem(PERMISSION_KEY) } catch { return false }
}

// Pełny sygnał końca timera: wibracja + dźwięk + głos + system notification.
// Używaj zamiast `notify()` po końcu odpoczynku.
export function notifyTimerEnd(title = 'Koniec przerwy', message = 'Wracaj do ćwiczeń') {
  // Wibracja
  try {
    if (navigator.vibrate) navigator.vibrate([400, 100, 400, 100, 400])
  } catch {}
  // Dźwięk
  playTimerEndSound()
  // Głos po polsku
  speak(message)
  // System notification
  return notify(title, { body: message, tag: 'rest-timer' })
}

export function notify(title, options = {}) {
  // Always vibrate (works without permission on most mobile)
  try {
    if (navigator.vibrate) navigator.vibrate([300, 100, 300])
  } catch {}
  // Always beep — works offline without notification permission
  playTimerEndSound()

  if (!isSupported() || Notification.permission !== 'granted') return null
  try {
    const notif = new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      silent: false,
      ...options
    })
    notif.onclick = () => {
      window.focus()
      notif.close()
    }
    setTimeout(() => notif.close(), 6000)
    return notif
  } catch (e) {
    console.warn('[notify] failed:', e)
    return null
  }
}
