// Promise-based dialogi zastępujące natywne alert/confirm/prompt.
// Renderowane przez <DialogContainer /> globalnie w App.vue.
//
// Użycie:
//   const dialog = useDialog()
//   await dialog.alert('Zapisano!')
//   if (await dialog.confirm('Usunąć?')) { ... }
//   const name = await dialog.prompt('Nazwa:', 'default')  // null jeśli cancel

import { ref } from 'vue'

// Pojedynczy aktywny dialog w danym momencie (kolejne czekają).
const current = ref(null)
const queue = []

function open(spec) {
  return new Promise(resolve => {
    const dialog = {
      ...spec,
      resolve: (value) => {
        resolve(value)
        current.value = null
        if (queue.length) current.value = queue.shift()
      }
    }
    if (current.value) queue.push(dialog)
    else current.value = dialog
  })
}

export function useDialog() {
  return {
    current,
    alert(message, opts = {}) {
      return open({ type: 'alert', message, ...opts })
    },
    confirm(message, opts = {}) {
      return open({ type: 'confirm', message, ...opts })
    },
    prompt(message, defaultValue = '', opts = {}) {
      return open({ type: 'prompt', message, defaultValue, ...opts })
    }
  }
}
