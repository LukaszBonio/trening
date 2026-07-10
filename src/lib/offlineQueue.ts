// Offline queue dla cloud sync.
// Idea: zamiast synchronicznego push do Supabase, kolejkujemy operacje.
// Jeśli online → wykonujemy natychmiast. Jeśli offline → trzymamy w queue.
// Po przywróceniu połączenia (online event) → flush queue z exponential backoff.

const STORAGE_KEY = 'tp_sync_queue_v1'
const MAX_RETRIES = 6
const BASE_DELAY = 1000  // 1s, podwaja się przy każdej próbie

interface QueueOperation {
  id: string
  type: string
  payload: unknown
  attempts: number
  createdAt: number
  lastError?: string
}

type OperationHandler = (payload: unknown) => Promise<void>

interface EventListener {
  event: string
  fn: (data?: unknown) => void
}

function load(): QueueOperation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(queue: QueueOperation[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(queue)) } catch {}
}

class OfflineQueue {
  queue: QueueOperation[]
  processing: boolean
  handlers: Map<string, OperationHandler>
  listeners: EventListener[]

  constructor() {
    this.queue = load()
    this.processing = false
    this.handlers = new Map()  // type → async function
    this.listeners = []
    this.bindEvents()
  }

  bindEvents(): void {
    if (typeof window === 'undefined') return
    window.addEventListener('online', () => {
      this.emit('online')
      this.flush()
    })
    window.addEventListener('offline', () => this.emit('offline'))
  }

  registerHandler(type: string, fn: OperationHandler): void {
    this.handlers.set(type, fn)
  }

  enqueue(type: string, payload: unknown): void {
    const op: QueueOperation = {
      id: `op_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      payload,
      attempts: 0,
      createdAt: Date.now()
    }
    this.queue.push(op)
    save(this.queue)
    this.emit('change')
    if (this.isOnline()) this.flush()
  }

  isOnline(): boolean {
    return typeof navigator === 'undefined' ? true : navigator.onLine
  }

  size(): number { return this.queue.length }

  async flush(): Promise<void> {
    if (this.processing) return
    if (!this.isOnline()) return
    this.processing = true
    this.emit('flush-start')

    while (this.queue.length && this.isOnline()) {
      const op = this.queue[0]
      const handler = this.handlers.get(op.type)
      if (!handler) {
        // Handler jeszcze niezarejestrowany (np. event 'online' przyszedł zanim
        // cloud.init() podpiął handlery). NIE kasujemy operacji — przerywamy flush;
        // ponowi się po rejestracji handlerów / kolejnym flushu. Wcześniej shift()
        // tutaj kasował niezsynchronizowane zmiany na trwałe.
        console.warn('[offlineQueue] no handler yet for type:', op.type, '— flush odłożony')
        break
      }
      try {
        await handler(op.payload)
        this.queue.shift()
        save(this.queue)
        this.emit('change')
      } catch (e: unknown) {
        op.attempts++
        op.lastError = e instanceof Error ? e.message : String(e)
        if (op.attempts >= MAX_RETRIES) {
          console.error('[offlineQueue] max retries exhausted, dropping op:', op)
          this.queue.shift()
          save(this.queue)
          this.emit('failed', op)
          window.dispatchEvent(new CustomEvent('sync-failed', { detail: { operation: op } }))
        } else {
          save(this.queue)
          const delay = BASE_DELAY * Math.pow(2, op.attempts - 1)
          this.emit('retry', { op, delay })
          await new Promise<void>(r => setTimeout(r, delay))
        }
      }
    }

    this.processing = false
    this.emit('flush-end')
  }

  on(event: string, fn: (data?: unknown) => void): () => void {
    this.listeners.push({ event, fn })
    return () => {
      this.listeners = this.listeners.filter(l => l.fn !== fn)
    }
  }

  emit(event: string, data?: unknown): void {
    for (const l of this.listeners) {
      if (l.event === event) {
        try { l.fn(data) } catch (e) { console.error(e) }
      }
    }
  }

  clear(): void {
    this.queue = []
    save(this.queue)
    this.emit('change')
  }
}

export const offlineQueue = new OfflineQueue()
