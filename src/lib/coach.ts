// AI Coach — analiza trendów per ćwiczenie + czat z trenerem (port z legacy).
// Czyste buildery promptów + walidacja (testowalne). Wywołania sieciowe robi useCoach.
//
// Uzupełnia (nie dubluje) weeklyReport: tygodniowy raport = digest 14 dni,
// Coach = trendy per ćwiczenie (stagnacja/progres/regres) + interaktywne Q&A.

import { callClaude, parseClaudeJSON } from './ai'
import type { Workout } from './analytics'

export const COACH_MIN_WORKOUTS = 3
const ANALYSIS_MAX_HISTORY = 30        // ile ostatnich treningów bierzemy pod uwagę
const SESSIONS_PER_EXERCISE = 6        // ile ostatnich sesji per ćwiczenie trafia do AI
const CHAT_HISTORY_SESSIONS = 12       // ile treningów w kontekście czatu

export const COACH_INSIGHT_TYPES = ['warning', 'progress', 'tip', 'success'] as const
export type CoachInsightType = typeof COACH_INSIGHT_TYPES[number]

export interface CoachInsight {
  type: CoachInsightType
  title: string
  message: string
}

export interface CoachAnalysis {
  insights: CoachInsight[]
  summary: string
}

export interface CoachMessage {
  role: 'user' | 'assistant'
  text: string
}

export const COACH_CHAT_SUGGESTIONS: string[] = [
  'Czy widzisz u mnie stagnację? Co zmienić?',
  'Jak bezpiecznie zwiększać ciężary?',
  'Jak rozłożyć treningi na tydzień przy moim celu?'
]

// Reprezentatywna seria treningu dla ćwiczenia: najcięższa seria (tie-break: więcej powt.).
function topSet(sets: { weight: number; reps: number }[]): { weight: number; reps: number } | null {
  let best: { weight: number; reps: number } | null = null
  for (const s of sets) {
    const w = Number(s.weight) || 0
    const r = Number(s.reps) || 0
    if (w <= 0 || r <= 0) continue
    if (!best || w > best.weight || (w === best.weight && r > best.reps)) best = { weight: w, reps: r }
  }
  return best
}

interface ExerciseSession { date: string; type: string; kg: number; reps: number }

// Buduje mapę: nazwa ćwiczenia → chronologiczne najcięższe serie (ostatnie N sesji).
function buildExerciseTrends(history: Workout[]): Record<string, ExerciseSession[]> {
  const recent = [...history]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-ANALYSIS_MAX_HISTORY)

  const map = new Map<string, ExerciseSession[]>()
  for (const w of recent) {
    const date = new Date(w.date).toISOString().slice(0, 10)
    for (const ex of w.exercises || []) {
      const ts = topSet(ex.sets || [])
      if (!ts) continue
      if (!map.has(ex.name)) map.set(ex.name, [])
      map.get(ex.name)!.push({ date, type: w.type || '—', kg: ts.weight, reps: ts.reps })
    }
  }

  const out: Record<string, ExerciseSession[]> = {}
  for (const [name, sessions] of map) {
    if (sessions.length >= 2) out[name] = sessions.slice(-SESSIONS_PER_EXERCISE)
  }
  return out
}

export function buildCoachAnalysisPrompt(history: Workout[]): string {
  const trends = buildExerciseTrends(history)
  const totalsByType: Record<string, number> = {}
  for (const w of history) totalsByType[w.type || '—'] = (totalsByType[w.type || '—'] || 0) + 1
  const lastWeek = history.filter(w => new Date(w.date).getTime() > Date.now() - 7 * 86400000).length
  const typeLine = Object.entries(totalsByType).map(([t, n]) => `${t}: ${n}`).join(', ')

  return `Jesteś analitykiem danych treningowych. Analizujesz wyłącznie liczby z historii — zero wymyślania, zero ogólników.

DANE:
- Łącznie treningów: ${history.length}
- Rozkład typów: ${typeLine || 'brak'}
- Treningi w ostatnim tygodniu: ${lastWeek}

HISTORIA CIĘŻARÓW (każde ćwiczenie osobno, chronologicznie, najcięższa seria = kg×powt):
${JSON.stringify(trends, null, 1)}

ZASADY — przestrzegaj bezwzględnie:
1. Każde ćwiczenie analizuj OSOBNO. Nie łącz różnych ćwiczeń (np. sztanga vs hantle) w jedną obserwację, nawet dla tej samej partii.
2. Podawaj TYLKO obserwacje wynikające WPROST z danych. Brak wyraźnego trendu → nie twórz porady dla tego ćwiczenia.
3. Stagnacja = ten sam ciężar w ≥3 kolejnych sesjach. Progres = wyraźny wzrost ciężaru. Regres = spadek ciężaru między sesjami.
4. Dla każdej obserwacji podaj konkretne liczby (np. "4 sesje po 60 kg z rzędu").
5. Balans typów treningów komentuj tylko przy wyraźnej różnicy.
6. Zwracaj się per "Ty", po polsku, ton rzeczowy. Max 5 insightów — tylko najważniejsze.

Zwróć WYŁĄCZNIE poprawny JSON (bez markdown, bez komentarzy, bez tekstu przed/po):
{
  "insights": [
    { "type": "warning|progress|tip|success", "title": "krótki tytuł (max 6 słów)", "message": "obserwacja z liczbami (1-2 zdania, max 160 znaków)" }
  ],
  "summary": "jedno zdanie podsumowania na bazie danych (max 200 znaków)"
}

Typy: "warning" = stagnacja/regres/zaniedbana partia; "progress" = wyraźny wzrost; "tip" = sugestia z danych; "success" = rekord/najlepszy wynik.`
}

export function normalizeCoachAnalysis(parsed: Record<string, unknown>): CoachAnalysis {
  const rawInsights = Array.isArray(parsed.insights) ? parsed.insights : []
  const insights: CoachInsight[] = rawInsights
    .filter((i: any) =>
      i && typeof i === 'object' &&
      typeof i.title === 'string' &&
      typeof i.message === 'string' &&
      COACH_INSIGHT_TYPES.includes(i.type)
    )
    .slice(0, 5)
    .map((i: any) => ({
      type: i.type as CoachInsightType,
      title: String(i.title).trim().slice(0, 60),
      message: String(i.message).trim().slice(0, 200)
    }))
  const summary = typeof parsed.summary === 'string' ? parsed.summary.trim().slice(0, 240) : ''
  return { insights, summary }
}

export async function runCoachAnalysis(history: Workout[], opts: { signal?: AbortSignal } = {}): Promise<CoachAnalysis> {
  if (history.length < COACH_MIN_WORKOUTS) {
    throw new Error(`Potrzeba min. ${COACH_MIN_WORKOUTS} treningów do analizy.`)
  }
  const prompt = buildCoachAnalysisPrompt(history)
  const text = await callClaude({ prompt, maxTokens: 1500, signal: opts.signal })
  const parsed = parseClaudeJSON(text)
  if (!Array.isArray(parsed.insights)) {
    throw new Error('AI zwróciło złą strukturę analizy — spróbuj ponownie.')
  }
  return normalizeCoachAnalysis(parsed)
}

// Kompaktowa historia do kontekstu czatu.
function chatHistorySnapshot(history: Workout[]): string {
  const recent = [...history]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, CHAT_HISTORY_SESSIONS)
  if (!recent.length) return 'brak danych'
  return recent.map(w => {
    const date = new Date(w.date).toISOString().slice(0, 10)
    const exs = (w.exercises || []).map(ex => {
      const ts = topSet(ex.sets || [])
      return ts ? `${ex.name} ${ts.weight}kg×${ts.reps}` : ex.name
    }).join(', ')
    return `${date} [${w.type || '—'}] ${exs || '—'}`
  }).join('\n')
}

export function buildCoachChatPrompt(opts: { goalLabel: string; history: Workout[]; messages: CoachMessage[] }): string {
  const convo = opts.messages.map(m => (m.role === 'user' ? 'Użytkownik: ' : 'Coach: ') + m.text).join('\n')
  return `Jesteś doświadczonym trenerem siłowym. Odpowiadasz po polsku, rzeczowo i krótko (max 4–5 zdań), konkretnie i praktycznie. Opierasz się na danych użytkownika, nie zmyślasz.

CEL UŻYTKOWNIKA: ${opts.goalLabel || '—'}
OSTATNIE TRENINGI (najcięższa seria per ćwiczenie):
${chatHistorySnapshot(opts.history)}

ROZMOWA:
${convo}

Odpowiedz na ostatnią wiadomość użytkownika jako Coach. Zwykły tekst, bez markdown.`
}

export async function runCoachChat(
  opts: { goalLabel: string; history: Workout[]; messages: CoachMessage[]; signal?: AbortSignal }
): Promise<string> {
  const prompt = buildCoachChatPrompt(opts)
  const reply = await callClaude({ prompt, maxTokens: 600, signal: opts.signal })
  return (reply || '').trim()
}
