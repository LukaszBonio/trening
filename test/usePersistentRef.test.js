import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { usePersistentRef } from '../src/composables/usePersistentRef.js'

beforeAll(() => {
  if (typeof globalThis.localStorage === 'undefined') {
    const store = new Map()
    globalThis.localStorage = {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
      clear: () => store.clear()
    }
  }
})

beforeEach(() => { localStorage.clear() })

describe('usePersistentRef', () => {
  it('zwraca default gdy localStorage pusty', () => {
    const data = usePersistentRef('test_key', [])
    expect(data.value).toEqual([])
  })

  it('zwraca default z factory function', () => {
    const data = usePersistentRef('test_key', () => ({ a: 1 }))
    expect(data.value).toEqual({ a: 1 })
  })

  it('ładuje istniejącą wartość z localStorage', () => {
    localStorage.setItem('test_key', JSON.stringify([1, 2, 3]))
    const data = usePersistentRef('test_key', [])
    expect(data.value).toEqual([1, 2, 3])
  })

  it('zwraca default przy zepsutym JSON w localStorage', () => {
    localStorage.setItem('test_key', 'not-json{{{')
    const data = usePersistentRef('test_key', 'fallback')
    expect(data.value).toBe('fallback')
  })

  it('nie mutuje default przy wielokrotnych wywołaniach', () => {
    const def = [1, 2]
    const a = usePersistentRef('key_a', def)
    a.value.push(3)
    const b = usePersistentRef('key_b', def)
    expect(b.value).toEqual([1, 2])
  })

  it('obsługuje string jako wartość (nie tylko obiekty)', () => {
    localStorage.setItem('str_key', JSON.stringify('hello'))
    const data = usePersistentRef('str_key', 'default')
    expect(data.value).toBe('hello')
  })
})
