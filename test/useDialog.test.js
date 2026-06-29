import { describe, it, expect, beforeEach } from 'vitest'
import { useDialog } from '../src/composables/useDialog.js'

beforeEach(() => {
  const d = useDialog()
  d.current.value = null
})

describe('useDialog', () => {
  it('alert ustawia current i resolve zamyka', async () => {
    const d = useDialog()
    const p = d.alert('Info')
    expect(d.current.value).not.toBeNull()
    expect(d.current.value.type).toBe('alert')
    expect(d.current.value.message).toBe('Info')
    d.current.value.resolve(undefined)
    await p
    expect(d.current.value).toBeNull()
  })

  it('confirm resolve(true) zwraca true', async () => {
    const d = useDialog()
    const p = d.confirm('Sure?')
    d.current.value.resolve(true)
    expect(await p).toBe(true)
  })

  it('confirm resolve(false) zwraca false', async () => {
    const d = useDialog()
    const p = d.confirm('Sure?')
    d.current.value.resolve(false)
    expect(await p).toBe(false)
  })

  it('prompt resolve(value) zwraca string', async () => {
    const d = useDialog()
    const p = d.prompt('Name?', 'default')
    expect(d.current.value.type).toBe('prompt')
    expect(d.current.value.defaultValue).toBe('default')
    d.current.value.resolve('myname')
    expect(await p).toBe('myname')
  })

  it('prompt resolve(null) zwraca null (cancel)', async () => {
    const d = useDialog()
    const p = d.prompt('Name?')
    d.current.value.resolve(null)
    expect(await p).toBeNull()
  })

  it('drugi dialog czeka w kolejce', async () => {
    const d = useDialog()
    const p1 = d.confirm('First')
    const p2 = d.confirm('Second')
    expect(d.current.value.message).toBe('First')
    d.current.value.resolve(true)
    expect(await p1).toBe(true)
    // teraz powinien być Second
    expect(d.current.value.message).toBe('Second')
    d.current.value.resolve(false)
    expect(await p2).toBe(false)
  })

  it('opts (title, okLabel, danger) trafiają do dialog state', () => {
    const d = useDialog()
    d.confirm('Delete?', { title: 'Confirm', okLabel: 'Delete', danger: true })
    expect(d.current.value.title).toBe('Confirm')
    expect(d.current.value.okLabel).toBe('Delete')
    expect(d.current.value.danger).toBe(true)
  })
})
