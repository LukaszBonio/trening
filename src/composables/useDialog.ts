import { ref } from 'vue'

export interface DialogSpec {
  type: 'alert' | 'confirm' | 'prompt'
  message: string
  defaultValue?: string
  resolve: (value: unknown) => void
  [key: string]: unknown
}

interface DialogOptions {
  [key: string]: unknown
}

const current = ref<DialogSpec | null>(null)
const queue: DialogSpec[] = []

function open(spec: Omit<DialogSpec, 'resolve'>): Promise<unknown> {
  return new Promise(resolve => {
    const dialog: DialogSpec = {
      ...spec,
      resolve: (value: unknown) => {
        resolve(value)
        current.value = null
        if (queue.length) current.value = queue.shift()!
      }
    }
    if (current.value) queue.push(dialog)
    else current.value = dialog
  })
}

export function useDialog() {
  return {
    current,
    alert(message: string, opts: DialogOptions = {}) {
      return open({ type: 'alert', message, ...opts })
    },
    confirm(message: string, opts: DialogOptions = {}) {
      return open({ type: 'confirm', message, ...opts })
    },
    prompt(message: string, defaultValue = '', opts: DialogOptions = {}) {
      return open({ type: 'prompt', message, defaultValue, ...opts })
    }
  }
}
