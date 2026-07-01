import { ref, watch } from 'vue'

export function usePersistentRef(key, defaultValue) {
  function load() {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return typeof defaultValue === 'function' ? defaultValue() : JSON.parse(JSON.stringify(defaultValue))
      return JSON.parse(raw)
    } catch {
      return typeof defaultValue === 'function' ? defaultValue() : JSON.parse(JSON.stringify(defaultValue))
    }
  }

  const data = ref(load())

  watch(data, (v) => {
    try { localStorage.setItem(key, JSON.stringify(v)) } catch {}
  }, { deep: true })

  return data
}
