export interface SpeakOptions {
  lang?: string
  rate?: number
  pitch?: number
  volume?: number
}

export type NotificationPermissionState = NotificationPermission | 'unsupported'

const PERMISSION_KEY = 'tp_notif_permission_asked_v1'

let _audioCtx: AudioContext | null = null
function getAudioCtx(): AudioContext | null {
  if (_audioCtx) return _audioCtx
  try {
    const AC = window.AudioContext || (window as any).webkitAudioContext
    if (AC) _audioCtx = new AC()
  } catch {}
  return _audioCtx
}

function singleBeep(ctx: AudioContext, startAt: number, freq: number, duration: number): void {
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

function playTimerEndSound(): void {
  const ctx = getAudioCtx()
  if (!ctx) return
  try {
    if (ctx.state === 'suspended') ctx.resume()
    const t0 = ctx.currentTime
    singleBeep(ctx, t0,        660, 0.18)
    singleBeep(ctx, t0 + 0.22, 880, 0.18)
    singleBeep(ctx, t0 + 0.44, 1100, 0.18)
    singleBeep(ctx, t0 + 0.66, 1320, 0.35)
  } catch (e) {
    console.warn('[beep] failed:', e)
  }
}

function speak(text: string, opts: SpeakOptions = {}): void {
  try {
    if (!('speechSynthesis' in window)) return
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = opts.lang || 'pl-PL'
    utter.rate = opts.rate ?? 1.05
    utter.pitch = opts.pitch ?? 1.0
    utter.volume = opts.volume ?? 1.0
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  } catch (e) {
    console.warn('[speak] failed:', e)
  }
}

export function isSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function permission(): NotificationPermissionState {
  if (!isSupported()) return 'unsupported'
  return Notification.permission
}

export async function requestPermission(): Promise<NotificationPermissionState> {
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

export function notifyTimerEnd(title: string = 'Koniec przerwy', message: string = 'Wracaj do ćwiczeń'): Notification | null {
  try {
    if (navigator.vibrate) navigator.vibrate([400, 100, 400, 100, 400])
  } catch {}
  playTimerEndSound()
  speak(message)
  return notify(title, { body: message, tag: 'rest-timer' })
}

function notify(title: string, options: NotificationOptions = {}): Notification | null {
  try {
    if (navigator.vibrate) navigator.vibrate([300, 100, 300])
  } catch {}
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
