// @vitest-environment jsdom
// Rotacja ćwiczeń między dniami programu — z wyjątkiem dla celu „siła".
// Test end-to-end na generateProgram: stubuje proxy i podgląda, co realnie
// trafia do excludeExercises kolejnych dni.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { generateProgram } from '../src/lib/ai.ts'

// Realne ćwiczenia z bazy — pierwsze w każdej liście to „główny bój" (slot 1).
const UPPER = ['Wyciskanie sztangi na ławce poziomej', 'Podciąganie', 'Wiosłowanie sztangą w opadzie',
  'Wyciskanie żołnierskie', 'Wznosy bokiem', 'Uginanie ramion ze sztangą', 'Pushdown z liną', 'Face pull']
const LOWER = ['Przysiad ze sztangą', 'Martwy ciąg rumuński', 'Wykroki', 'Uginanie nóg leżąc',
  'Wspięcia na palce stojąc', 'Deska', 'Leg press', 'Hip thrust']

// Plan zwracany przez „AI" — dopasowany do wymagań odczytanych z promptu
// (liczba ćwiczeń i typ dnia), żeby przejść walidację generateAIPlan.
function fakePlan(system) {
  const count = Number((system.match(/DOKŁADNIE (\d+) — nie pomijaj/) || [])[1] || 7)
  const pool = /typu (UPPER|PUSH|PULL)/.test(system) ? UPPER : LOWER
  return {
    name: 'Plan testowy',
    exercises: Array.from({ length: count }, (_, i) => ({
      name: pool[i % pool.length],
      primaryMuscle: pool === UPPER ? 'chest' : 'quads',
      muscleHead: pool === UPPER ? 'chest_middle' : 'quads',
      exerciseType: i === 0 ? 'compound' : 'isolation',
      movementPattern: pool === UPPER ? 'horizontal_push' : 'squat',
      sets: i === 0 ? 4 : 3,
      reps: i === 0 ? '5-8' : '10-12',
      tip: '',
      suggestedWeight: null
    }))
  }
}

let sentBodies

function stubProxy() {
  sentBodies = []
  globalThis.fetch = vi.fn(async (_url, init) => {
    const body = JSON.parse(init.body)
    sentBodies.push(body)
    const system = Array.isArray(body.system) ? body.system.map(b => b.text).join('\n') : (body.system || '')
    const text = JSON.stringify(fakePlan(system))
    return { ok: true, json: async () => ({ content: [{ text }], stop_reason: 'end_turn' }) }
  })
}

/** Pełny tekst systemu n-tego zapytania (system bywa tablicą bloków przy cachingu). */
function systemText(i) {
  const s = sentBodies[i].system
  return Array.isArray(s) ? s.map(b => b.text).join('\n') : (s || '')
}

/** Treść wiadomości user z n-tego zapytania (tam ląduje lista wykluczeń). */
function userMsg(i) {
  return sentBodies[i].messages[0].content
}

describe('generateProgram — rotacja ćwiczeń między dniami', () => {
  beforeEach(() => {
    stubProxy()
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
  })
  afterEach(() => { vi.restoreAllMocks() })

  const MAIN_D1 = 'Wyciskanie sztangi na ławce poziomej' // slot 1 dnia 1 (UPPER)
  const HELPER_D1 = 'Podciąganie'                        // pomocnicze dnia 1

  it('cel masa: główny bój dnia 1 JEST wykluczony w kolejnych dniach', async () => {
    await generateProgram({ daysPerWeek: 2, goal: 'mass', equipment: 'siłownia', level: 'intermediate', injuries: [] })
    expect(sentBodies.length).toBeGreaterThanOrEqual(2)
    const exclLine = userMsg(1).split('\n').find(l => l.includes('NIE UŻYWAJ')) || ''
    expect(exclLine).toContain(MAIN_D1)     // slot 1 → wykluczony
    expect(exclLine).toContain(HELPER_D1)   // pomocnicze też
    // prompt nie może zachęcać do powtarzania boju przy hipertrofii
    expect(systemText(1)).not.toContain('powinieneś — powtórzyć')
  })

  it('cel siła: główny bój NIE jest wykluczany (progresja 2×/tydz), pomocnicze nadal tak', async () => {
    await generateProgram({ daysPerWeek: 2, goal: 'strength', equipment: 'siłownia', level: 'intermediate', injuries: [] })
    expect(sentBodies.length).toBeGreaterThanOrEqual(2)
    const exclLine = userMsg(1).split('\n').find(l => l.includes('NIE UŻYWAJ')) || ''
    expect(exclLine).not.toContain(MAIN_D1) // slot 1 pominięty…
    expect(exclLine).toContain(HELPER_D1)   // …pomocnicze wykluczone normalnie
    // …a kontekst programu jawnie na to zezwala (inaczej prompt przeczyłby wykluczeniom)
    expect(userMsg(0)).toContain('główny bój (pozycja 1)')
    expect(userMsg(0)).not.toContain('Nie powtarzaj ćwiczeń z innych dni programu.')
  })
})
