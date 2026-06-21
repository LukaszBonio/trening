// Helpers for local browser notifications (no server / push subscription).
// Uses Notification API + vibration.

const PERMISSION_KEY = 'tp_notif_permission_asked_v1'

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
