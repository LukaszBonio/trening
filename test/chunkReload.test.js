// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { isChunkLoadError, reloadForFreshChunks } from '../src/lib/chunkReload.ts'

describe('isChunkLoadError', () => {
  it('wykrywa realne komunikaty błędu ładowania chunku', () => {
    expect(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: http://x/a.js'))).toBe(true)
    expect(isChunkLoadError(new Error('error loading dynamically imported module'))).toBe(true)
    expect(isChunkLoadError(new Error('Importing a module script failed'))).toBe(true)
  })
  it('ignoruje zwykłe błędy aplikacji', () => {
    expect(isChunkLoadError(new Error('cannot read properties of undefined'))).toBe(false)
    expect(isChunkLoadError('losowy string')).toBe(false)
    expect(isChunkLoadError(null)).toBe(false)
  })
})

describe('reloadForFreshChunks', () => {
  let reloadSpy
  beforeEach(() => {
    sessionStorage.clear()
    // window.location.reload nie jest wywoływalny w jsdom — podmieniamy na spy.
    reloadSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadSpy },
      writable: true,
      configurable: true
    })
  })

  it('przeładowuje przy pierwszym wywołaniu i zapisuje znacznik czasu', () => {
    const did = reloadForFreshChunks()
    expect(did).toBe(true)
    expect(reloadSpy).toHaveBeenCalledOnce()
    expect(Number(sessionStorage.getItem('tp_chunk_reload_at'))).toBeGreaterThan(0)
  })

  it('throttluje kolejne wywołania w oknie czasowym (ochrona przed pętlą)', () => {
    reloadForFreshChunks()
    reloadSpy.mockClear()
    const did = reloadForFreshChunks()
    expect(did).toBe(false)
    expect(reloadSpy).not.toHaveBeenCalled()
  })

  it('withinMs=0 wymusza reload pomijając throttling (ręczny przycisk)', () => {
    reloadForFreshChunks()
    reloadSpy.mockClear()
    const did = reloadForFreshChunks(0)
    expect(did).toBe(true)
    expect(reloadSpy).toHaveBeenCalledOnce()
  })
})
