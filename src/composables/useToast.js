// Globalny system toastów z opcjonalnym undo action.
// Użycie:
//   const toast = useToast()
//   toast.show('Trening usunięty', { actionLabel: 'Cofnij', action: () => restore() })
//   toast.success('Zapisano!')
//   toast.error('Błąd zapisu')

import { ref } from 'vue'

const toasts = ref([])
let _id = 0
const _timers = new Map()

function show(message, opts = {}) {
  const id = ++_id
  const duration = opts.duration ?? 5000
  const toast = {
    id,
    message,
    type: opts.type || 'info', // 'info' | 'success' | 'error'
    actionLabel: opts.actionLabel || null,
    action: opts.action || null,
    duration
  }
  toasts.value.push(toast)
  if (duration > 0) {
    const t = setTimeout(() => dismiss(id), duration)
    _timers.set(id, t)
  }
  return id
}

function dismiss(id) {
  const t = _timers.get(id)
  if (t) { clearTimeout(t); _timers.delete(id) }
  toasts.value = toasts.value.filter(x => x.id !== id)
}

function runAction(toast) {
  if (toast.action) toast.action()
  dismiss(toast.id)
}

export function useToast() {
  return {
    toasts,
    show,
    success: (message, opts = {}) => show(message, { ...opts, type: 'success' }),
    error: (message, opts = {}) => show(message, { ...opts, type: 'error' }),
    dismiss,
    runAction
  }
}
