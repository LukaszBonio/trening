import { describe, it, expect, beforeEach } from 'vitest'
import { useToast } from '../src/composables/useToast.js'

beforeEach(() => {
  // Reset state między testami
  const t = useToast()
  t.toasts.value = []
})

describe('useToast', () => {
  it('show dodaje toast do listy', () => {
    const t = useToast()
    const id = t.show('Hello')
    expect(t.toasts.value).toHaveLength(1)
    expect(t.toasts.value[0].message).toBe('Hello')
    expect(t.toasts.value[0].id).toBe(id)
    expect(t.toasts.value[0].type).toBe('info')
  })

  it('success/error ustawiają typ', () => {
    const t = useToast()
    t.success('OK')
    t.error('FAIL')
    expect(t.toasts.value.map(x => x.type)).toEqual(['success', 'error'])
  })

  it('dismiss usuwa toast po id', () => {
    const t = useToast()
    const id = t.show('x')
    t.dismiss(id)
    expect(t.toasts.value).toHaveLength(0)
  })

  it('runAction wywołuje action i dismissuje', () => {
    const t = useToast()
    let called = false
    const id = t.show('msg', { actionLabel: 'Cofnij', action: () => { called = true } })
    const toast = t.toasts.value.find(x => x.id === id)
    t.runAction(toast)
    expect(called).toBe(true)
    expect(t.toasts.value.find(x => x.id === id)).toBeUndefined()
  })

  it('auto-dismiss po określonym czasie', async () => {
    const t = useToast()
    t.show('x', { duration: 50 })
    expect(t.toasts.value).toHaveLength(1)
    await new Promise(r => setTimeout(r, 80))
    expect(t.toasts.value).toHaveLength(0)
  })

  it('duration 0 nie auto-dismissuje', async () => {
    const t = useToast()
    t.show('x', { duration: 0 })
    await new Promise(r => setTimeout(r, 30))
    expect(t.toasts.value).toHaveLength(1)
  })
})
