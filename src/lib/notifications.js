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
  gain.gain.exponentialRampToValueAtTime(0.35, startAt + 0.015)
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
    singleBeep(ctx, t0,        880, 0.14)
    singleBeep(ctx, t0 + 0.20, 880, 0.14)
    singleBeep(ctx, t0 + 0.40, 1320, 0.25)
  } catch (e) {
    console.warn('[beep] failed:', e)
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
