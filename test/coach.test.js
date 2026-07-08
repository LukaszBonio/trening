import { describe, it, expect } from 'vitest'
import {
  buildCoachAnalysisPrompt,
  normalizeCoachAnalysis,
  buildCoachChatPrompt,
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

describe('buildCoachChatPrompt', () => {
  it('zawiera cel, historię i rozmowę', () => {
    const p = buildCoachChatPrompt({
      goalLabel: 'Redukcja',
      history,
      messages: [
        { role: 'user', text: 'Mam stagnację?' },
        { role: 'assistant', text: 'Sprawdźmy dane.' },
        { role: 'user', text: 'No i co?' }
      ]
    })
    expect(p).toContain('CEL UŻYTKOWNIKA: Redukcja')
    expect(p).toContain('Użytkownik: Mam stagnację?')
    expect(p).toContain('Coach: Sprawdźmy dane.')
    expect(p).toContain('Wyciskanie sztangi na ławce poziomej')
    expect(p).toContain('bez markdown')
  })
  it('brak historii → "brak danych"', () => {
    const p = buildCoachChatPrompt({ goalLabel: 'Masa', history: [], messages: [{ role: 'user', text: 'hej' }] })
    expect(p).toContain('brak danych')
  })
})

describe('stałe', () => {
  it('COACH_MIN_WORKOUTS = 3', () => {
    expect(COACH_MIN_WORKOUTS).toBe(3)
  })
})
