import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'info' | 'success' | 'error'
  actionLabel: string | null
  action: (() => void) | null
  duration: number
}

interface ToastOptions {
  type?: Toast['type']
  duration?: number
  actionLabel?: string
  action?: () => void
}

const toasts = ref<Toast[]>([])
let _id = 0
const _timers = new Map<number, ReturnType<typeof setTimeout>>()

function show(message: string, opts: ToastOptions = {}): number {
  const id = ++_id
  const duration = opts.duration ?? 5000
  const toast: Toast = {
    id,
    message,
    type: opts.type || 'info',
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

function dismiss(id: number): void {
  const t = _timers.get(id)
  if (t) { clearTimeout(t); _timers.delete(id) }
  toasts.value = toasts.value.filter(x => x.id !== id)
}

function runAction(toast: Toast): void {
  if (toast.action) toast.action()
  dismiss(toast.id)
}

export function useToast() {
  return {
    toasts,
    show,
    success: (message: string, opts: ToastOptions = {}) => show(message, { ...opts, type: 'success' }),
    error: (message: string, opts: ToastOptions = {}) => show(message, { ...opts, type: 'error' }),
    dismiss,
    runAction
  }
}
