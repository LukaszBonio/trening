// Tygodniowy raport AI — analizuje historię z ostatnich 14 dni i zwraca tekst po polsku.
// Cache w localStorage żeby nie generować na każde wejście (1×/tydzień).

import { callClaude, parseClaudeJSON } from './ai.js'

const CACHE_KEY = 'tp_weekly_report_v1'

/**
 * Buduje kompaktowy snapshot historii dla AI: per dzień typ + ćwiczenia z wagą×powt+RPE.
 */
function buildHistorySnapshot(history, days = 14) {
  const cutoff = Date.now() - days * 86400000
  const recent = history
    .filter(w => new Date(w.date).getTime() >= cutoff)
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  if (!recent.length) return null

  const lines = recent.map(w => {
    const date = new Date(w.date).toISOString().slice(0, 10)
    const exes = w.exercises.map(ex => {
      const sets = ex.sets.map(s => {
        const rpe = s.rpe ? `@RPE${s.rpe}` : ''
        return `${s.weight || 0}x${s.reps || 0}${rpe}`
      }).join(', ')
      return `    - ${ex.name}: ${sets}`
    }).join('\n')
    return `  ${date} (${w.type.toUpperCase()}):\n${exes}`
  }).join('\n')
  return { lines, count: recent.length }
}

/**
 * Generuje tygodniowy raport (1 zapytanie AI). Zwraca:
 *   { summary: string, highlights: string[], suggestions: string[], generatedAt: ISO }
 * Lub rzuca błąd przy fail.
 */
export async function generateWeeklyReport(history, { signal } = {}) {
  const snapshot = buildHistorySnapshot(history, 14)
  if (!snapshot) {
    throw new Error('Brak treningów w ostatnich 14 dniach — nic do podsumowania.')
  }

  const prompt = `Jesteś trenerem osobistym. Przeanalizuj historię treningową ostatnich 14 dni
(${snapshot.count} sesji) i przygotuj krótki raport po polsku.

HISTORIA:
${snapshot.lines}

Zwróć WYŁĄCZNIE poprawny JSON (bez markdown, bez komentarzy) w formacie:
{
  "summary": "2-3 zdania ogólnego podsumowania (max 250 znaków)",
  "highlights": [
    "konkretne osiągnięcie z liczbami, np. 'Ławka pozioma +5kg w 2 tygodnie (60kg → 65kg)' (max 100 znaków per element, 1-4 elementy)"
  ],
  "suggestions": [
    "konkretna sugestia na kolejny tydzień, np. 'Klatka stoi od 2 tygodni — zmień bodziec (hantle zamiast sztangi)' (max 120 znaków per element, 1-4 elementy)"
  ]
}

WAŻNE:
- Bądź konkretny — używaj liczb z historii (kg, powtórzenia, RPE).
- Nie chwalić ogólnie — wskazywać konkretne ćwiczenia.
- Sugestie muszą być wykonalne (np. zmiana ćwiczenia, deload, dodanie partii).
- Nie wymyślaj danych których nie ma w historii.
- Max 4 highlights, max 4 sugestions.
- Odpowiedź MUSI być poprawnym JSON bez markdown/komentarzy.`

  const text = await callClaude({ prompt, maxTokens: 1500, signal })
  const parsed = parseClaudeJSON(text)

  // Normalizacja
  return {
    summary: typeof parsed.summary === 'string' ? parsed.summary.slice(0, 300) : '',
    highlights: Array.isArray(parsed.highlights) ? parsed.highlights.filter(s => typeof s === 'string').slice(0, 4) : [],
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.filter(s => typeof s === 'string').slice(0, 4) : [],
    generatedAt: new Date().toISOString(),
    sessionsCount: snapshot.count
  }
}

/**
 * Lokalny cache 7 dni — żeby nie generować raportu przy każdym wejściu w Statystyki.
 */
export function loadCachedReport() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data?.generatedAt) return null
    const age = Date.now() - new Date(data.generatedAt).getTime()
    if (age > 7 * 86400000) return null  // > 7 dni → stale
    return data
  } catch {
    return null
  }
}

export function saveCachedReport(report) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(report))
  } catch {}
}

export function clearCachedReport() {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {}
}
