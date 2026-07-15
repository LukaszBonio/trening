import { describe, it, expect } from 'vitest'
import {
  buildCoachAnalysisPrompt,
  normalizeCoachAnalysis,
  buildCoachChatSystem,
  executeCoachTool,
  COACH_TOOLS,
  COACH_MIN_WORKOUTS
} from '../src/lib/coach'

function workout(date, type, exercises) {
  return { date, type, exercises }
}
function ex(name, sets) {
  return { name, sets: sets.map(([weight, reps]) => ({ weight, reps })) }
}

const history = [
  workout('2026-07-01', 'push', [ex('Wyciskanie sztangi na ławce poziomej', [[60, 10], [60, 8]])]),
  workout('2026-07-03', 'push', [ex('Wyciskanie sztangi na ławce poziomej', [[60, 10], [60, 9]])]),
  workout('2026-07-05', 'push', [ex('Wyciskanie sztangi na ławce poziomej', [[62.5, 8]])]),
]

describe('buildCoachAnalysisPrompt', () => {
  it('zawiera dane, nazwę ćwiczenia i format JSON', () => {
    const p = buildCoachAnalysisPrompt(history)
    expect(p).toContain('Łącznie treningów: 3')
    expect(p).toContain('Wyciskanie sztangi na ławce poziomej')
    expect(p).toContain('"insights"')
    expect(p).toContain('warning|progress|tip|success')
    expect(p).toContain('Stagnacja')
  })
  it('bierze najcięższą serię per sesja (62.5 z ostatniej sesji)', () => {
    const p = buildCoachAnalysisPrompt(history)
    expect(p).toContain('62.5')
  })
  it('pomija ćwiczenia z <2 sesjami', () => {
    const h = [
      ...history,
      workout('2026-07-06', 'legs', [ex('Przysiad ze sztangą', [[80, 5]])]) // tylko 1 sesja
    ]
    const p = buildCoachAnalysisPrompt(h)
    expect(p).not.toContain('Przysiad ze sztangą')
  })
})

describe('normalizeCoachAnalysis', () => {
  it('filtruje insighty ze złym typem i przycina do 5', () => {
    const parsed = {
      insights: [
        { type: 'progress', title: 'A', message: 'x' },
        { type: 'zly', title: 'B', message: 'y' },        // odrzucony
        { type: 'warning', title: 123, message: 'z' },     // odrzucony (title nie string)
        { type: 'tip', title: 'C', message: 'w' },
        { type: 'success', title: 'D', message: 'v' },
        { type: 'progress', title: 'E', message: 'u' },
        { type: 'warning', title: 'F', message: 't' },
        { type: 'tip', title: 'G', message: 's' } // 6-ty poprawny → obcięty
      ],
      summary: 'ok'
    }
    const out = normalizeCoachAnalysis(parsed)
    expect(out.insights.length).toBe(5)
    expect(out.insights.every(i => ['warning', 'progress', 'tip', 'success'].includes(i.type))).toBe(true)
    expect(out.summary).toBe('ok')
  })
  it('przycina zbyt długie pola', () => {
    const out = normalizeCoachAnalysis({
      insights: [{ type: 'tip', title: 'a'.repeat(100), message: 'b'.repeat(400) }],
      summary: 'c'.repeat(400)
    })
    expect(out.insights[0].title.length).toBe(60)
    expect(out.insights[0].message.length).toBe(200)
    expect(out.summary.length).toBe(240)
  })
  it('brak insights / summary → puste', () => {
    const out = normalizeCoachAnalysis({})
    expect(out.insights).toEqual([])
    expect(out.summary).toBe('')
  })
})

describe('buildCoachChatSystem', () => {
  it('zawiera cel, historię, wskazówkę o narzędziach i "bez markdown"', () => {
    const p = buildCoachChatSystem({ goalLabel: 'Redukcja', history })
    expect(p).toContain('CEL UŻYTKOWNIKA: Redukcja')
    expect(p).toContain('Wyciskanie sztangi na ławce poziomej')
    expect(p).toContain('bez markdown')
    expect(p).toContain('narzędzia')
  })
  it('brak historii → "brak danych"', () => {
    const p = buildCoachChatSystem({ goalLabel: 'Masa', history: [] })
    expect(p).toContain('brak danych')
  })
})

describe('executeCoachTool', () => {
  it('lista_cwiczen zwraca nazwy z liczbą sesji', () => {
    const out = executeCoachTool('lista_cwiczen', {}, history)
    expect(out).toContain('Wyciskanie sztangi na ławce poziomej')
    expect(out).toContain('3×')
  })
  it('progres_cwiczenia zwraca chronologię i rekord', () => {
    const out = executeCoachTool('progres_cwiczenia', { nazwa: 'Wyciskanie sztangi na ławce poziomej' }, history)
    expect(out).toContain('2026-07-05')
    expect(out).toContain('1RM')
    expect(out).toContain('Rekord')
  })
  it('progres_cwiczenia dla nieznanego ćwiczenia → komunikat', () => {
    const out = executeCoachTool('progres_cwiczenia', { nazwa: 'Nie istnieje' }, history)
    expect(out).toContain('Brak danych')
  })
  it('analiza_wzorcow zwraca sekcje balansu', () => {
    const out = executeCoachTool('analiza_wzorcow', {}, history)
    expect(out).toContain('Compound/Isolation')
    expect(out).toContain('Push/Pull')
  })
  it('nieznane narzędzie → komunikat', () => {
    expect(executeCoachTool('xyz', {}, history)).toContain('Nieznane narzędzie')
  })
  it('COACH_TOOLS ma 3 narzędzia z poprawnymi nazwami', () => {
    expect(COACH_TOOLS.map(t => t.name)).toEqual(['lista_cwiczen', 'progres_cwiczenia', 'analiza_wzorcow'])
  })
})

describe('stałe', () => {
  it('COACH_MIN_WORKOUTS = 3', () => {
    expect(COACH_MIN_WORKOUTS).toBe(3)
  })
})
