import { ref, watch, type Ref } from 'vue'

export function usePersistentRef<T>(key: string, defaultValue: T | (() => T)): Ref<T> {
  function load(): T {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return typeof defaultValue === 'function' ? (defaultValue as () => T)() : JSON.parse(JSON.stringify(defaultValue))
      return JSON.parse(raw)
    } catch {
      return typeof defaultValue === 'function' ? (defaultValue as () => T)() : JSON.parse(JSON.stringify(defaultValue))
    }
  }

  const data = ref(load()) as Ref<T>

  watch(data, (v) => {
    try { localStorage.setItem(key, JSON.stringify(v)) } catch {}
  }, { deep: true })

  return data
}
