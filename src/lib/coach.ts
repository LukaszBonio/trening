// AI Coach — analiza trendów per ćwiczenie + czat z trenerem (port z legacy).
// Czyste buildery promptów + walidacja (testowalne). Wywołania sieciowe robi useCoach.
//
// Uzupełnia (nie dubluje) weeklyReport: tygodniowy raport = digest 14 dni,
// Coach = trendy per ćwiczenie (stagnacja/progres/regres) + interaktywne Q&A.

import { callClaude, callClaudeRaw, parseClaudeJSON, type ClaudeTool, type ClaudeRawMessage } from './ai'
import {
  uniqueExercises, exerciseProgress, personalRecords,
  compoundIsolationRatio, pushPullRatio, movementPatternBalance, missingMovementPatterns,
  type Workout
} from './analytics'

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

// System prompt czatu — persona + cel + skrót historii + wskazówka o narzędziach.
// Rozmowa idzie osobno w tablicy messages (format tool use), nie w tym stringu.
export function buildCoachChatSystem(opts: { goalLabel: string; history: Workout[] }): string {
  return `Jesteś doświadczonym trenerem siłowym. Odpowiadasz po polsku, rzeczowo i krótko (max 4–5 zdań), konkretnie i praktycznie. Opierasz się na danych użytkownika, nie zmyślasz. Zwykły tekst, bez markdown.

CEL UŻYTKOWNIKA: ${opts.goalLabel || '—'}
OSTATNIE TRENINGI (najcięższa seria per ćwiczenie):
${chatHistorySnapshot(opts.history)}

Masz narzędzia do odpytania danych treningowych użytkownika — użyj ich, gdy pytanie wymaga liczb spoza powyższego skrótu (progres konkretnego ćwiczenia, balans wzorców, pełna lista ćwiczeń). Nie zgaduj wartości, których nie masz — najpierw sięgnij po narzędzie. Gdy dane wystarczają, odpowiedz od razu.`
}

// Narzędzia Coacha — wykonywane po stronie klienta na historii treningów (Pinia).
export const COACH_TOOLS: ClaudeTool[] = [
  {
    name: 'lista_cwiczen',
    description: 'Lista wszystkich ćwiczeń wykonanych przez użytkownika wraz z liczbą sesji. Użyj, by poznać dokładne nazwy przed odpytaniem o progres.',
    input_schema: { type: 'object', properties: {}, additionalProperties: false }
  },
  {
    name: 'progres_cwiczenia',
    description: 'Chronologiczny progres jednego ćwiczenia (data, najlepszy ciężar × powt., szac. 1RM, tonaż) + rekord osobisty. Użyj przy pytaniach o postęp/stagnację danego ćwiczenia.',
    input_schema: {
      type: 'object',
      properties: { nazwa: { type: 'string', description: 'Dokładna nazwa ćwiczenia (jak w lista_cwiczen)' } },
      required: ['nazwa'],
      additionalProperties: false
    }
  },
  {
    name: 'analiza_wzorcow',
    description: 'Balans treningu: udział compound/isolation, stosunek push/pull, rozkład serii wg wzorca ruchowego i fundamentalne wzorce nietrenowane ostatnio. Opcjonalnie zawęź do ostatnich N dni.',
    input_schema: {
      type: 'object',
      properties: { dni: { type: 'integer', description: 'Okno w dniach (np. 30). Pomiń, by objąć całą historię.' } },
      additionalProperties: false
    }
  }
]

// Wykonanie narzędzia — czysta funkcja nad historią (testowalna, bez sieci).
export function executeCoachTool(name: string, input: Record<string, any>, history: Workout[]): string {
  switch (name) {
    case 'lista_cwiczen': {
      const list = uniqueExercises(history).sort((a, b) => b.count - a.count).slice(0, 40)
      return list.length ? list.map(e => `${e.name} — ${e.count}×`).join('\n') : 'Brak zarejestrowanych ćwiczeń.'
    }
    case 'progres_cwiczenia': {
      const nazwa = String(input?.nazwa || '').trim()
      if (!nazwa) return 'Podaj nazwę ćwiczenia.'
      const points = exerciseProgress(history, nazwa)
      if (!points.length) return `Brak danych dla "${nazwa}". Sprawdź dokładną nazwę przez lista_cwiczen.`
      const pr = personalRecords(history).find(p => p.name.toLowerCase() === nazwa.toLowerCase())
      const head = pr ? `Rekord: ${pr.weight}kg×${pr.reps} (1RM≈${pr.best1RM}kg)\n` : ''
      const lines = points.map(p => `${p.date}: ${p.bestWeight}kg×${p.bestReps} (1RM≈${p.best1RM}kg, tonaż ${p.totalVolume}kg)`)
      return head + lines.join('\n')
    }
    case 'analiza_wzorcow': {
      const dni = Number(input?.dni)
      const windowed = Number.isFinite(dni) && dni > 0
      const scoped = windowed
        ? history.filter(w => new Date(w.date).getTime() >= Date.now() - dni * 86400000)
        : history
      const ci = compoundIsolationRatio(scoped)
      const pp = pushPullRatio(scoped)
      const patterns = movementPatternBalance(scoped)
      const missing = missingMovementPatterns(scoped, windowed ? dni : 7)
      const parts: string[] = []
      parts.push(`Compound/Isolation: ${ci.compoundRatio}% compound (${ci.compound} vs ${ci.isolation} ćwiczeń)`)
      parts.push(pp.ratio != null ? `Push/Pull: ${pp.ratio} (${pp.pushSets} push / ${pp.pullSets} pull serii)` : 'Push/Pull: za mało danych')
      if (patterns.length) parts.push('Wzorce (serie): ' + patterns.map(p => `${p.label} ${p.sets}`).join(', '))
      if (missing.length) parts.push('Brakujące fundamentalne wzorce: ' + missing.map(m => m.label).join(', '))
      return parts.join('\n')
    }
    default:
      return `Nieznane narzędzie: ${name}`
  }
}

// Ile rund narzędziowych zanim wymusimy finalną odpowiedź (zabezpieczenie przed pętlą).
const COACH_MAX_TOOL_STEPS = 4

export async function runCoachChat(
  opts: { goalLabel: string; history: Workout[]; messages: CoachMessage[]; signal?: AbortSignal }
): Promise<string> {
  const system = buildCoachChatSystem({ goalLabel: opts.goalLabel, history: opts.history })
  const messages: ClaudeRawMessage[] = opts.messages.map(m => ({ role: m.role, content: m.text }))

  let lastText = ''
  for (let step = 0; step < COACH_MAX_TOOL_STEPS; step++) {
    const res = await callClaudeRaw({ system, messages, tools: COACH_TOOLS, maxTokens: 800, signal: opts.signal })
    const text = res.content.filter(b => b.type === 'text').map(b => b.text || '').join('').trim()
    if (text) lastText = text

    if (res.stop_reason !== 'tool_use') {
      return text || lastText || 'Nie mam na to dobrej odpowiedzi.'
    }

    const toolUses = res.content.filter(b => b.type === 'tool_use')
    if (!toolUses.length) return text || lastText || 'Nie mam na to dobrej odpowiedzi.'

    // Odłóż turę asystenta (z blokami tool_use), potem wyniki narzędzi jako turę użytkownika.
    messages.push({ role: 'assistant', content: res.content })
    const results = toolUses.map(tu => {
      let out: string
      try { out = executeCoachTool(String(tu.name), tu.input || {}, opts.history) }
      catch { out = 'Błąd narzędzia.' }
      return { type: 'tool_result', tool_use_id: tu.id, content: out }
    })
    messages.push({ role: 'user', content: results })
  }

  // Limit rund wyczerpany — wymuś finalną odpowiedź bez narzędzi.
  const res = await callClaudeRaw({ system, messages, maxTokens: 800, signal: opts.signal })
  const text = res.content.filter(b => b.type === 'text').map(b => b.text || '').join('').trim()
  return text || lastText || 'Nie udało się dokończyć odpowiedzi.'
}
