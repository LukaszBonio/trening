// AI helper — calls Claude API via Cloudflare Worker proxy.
// Worker URL can be overridden by localStorage 'tp_proxy_url' for testing.

import { PRIMARY_TO_GROUP } from './workoutSchema'
import { getAuthToken } from './auth'
import { translateExerciseName } from './substitutions'
import { getExercisesForHeads, findExerciseByName, type Equipment, type ExerciseEntry } from './exerciseDb'
import { scoreExercise } from './exerciseScoring'
import { withPremium } from './exercisePremium'
import type { TrainingGoalTag } from './exerciseModel'

// Mapowanie celu treningowego (z ustawień) na tag używany przez scoreExercise.
const GOAL_TO_TAG: Record<string, TrainingGoalTag> = {
  mass: 'hypertrophy',
  strength: 'strength',
  cut: 'fat_loss',
  endurance: 'endurance',
  recomposition: 'general'
}

// --- Interfaces ---

interface CallClaudeOptions {
  prompt: string
  maxTokens?: number
  signal?: AbortSignal
  timeoutMs?: number
}

interface ClaudeContentBlock {
  text?: string
}

interface ClaudeErrorResponse {
  error?: { message?: string }
}

// Definicja narzędzia (tool use) przekazywana do modelu.
export interface ClaudeTool {
  name: string
  description: string
  input_schema: Record<string, unknown>
}

// Wiadomość w formacie messages API — content może być tekstem albo tablicą bloków
// (text / tool_use / tool_result) w pętli narzędziowej.
export interface ClaudeRawMessage {
  role: 'user' | 'assistant'
  content: string | Array<Record<string, unknown>>
}

export interface ClaudeRawResponse {
  content: Array<Record<string, any>>
  stop_reason: string
}

interface CallClaudeRawOptions {
  messages: ClaudeRawMessage[]
  system?: string
  tools?: ClaudeTool[]
  toolChoice?: Record<string, unknown>
  maxTokens?: number
  signal?: AbortSignal
  timeoutMs?: number
}

export interface AIExercise {
  name: string
  primaryMuscle: string | null
  muscleHead: string | null
  exerciseType: string | null
  movementPattern: string | null
  sets: number
  reps: string
  tip: string
  suggestedWeight: number | null
}

export interface AnalysisEntry {
  muscle: string
  status: 'progress' | 'stagnation' | 'overreaching' | 'weakly_covered'
  note: string
}

export interface AIPlan {
  name: string
  exercises: AIExercise[]
  analysis: AnalysisEntry[]
}

interface SessionSet {
  weight?: number
  reps?: number
}

interface SessionExercise {
  name: string
  sets: SessionSet[]
}

export interface RecentSession {
  id?: string
  date: string | number | Date
  exercises: SessionExercise[]
}

interface GenerateAIPlanOptions {
  type: string
  goal: string
  equipment?: string
  avoid?: string
  recentSessions?: RecentSession[]
  equipmentTags?: string[]
  level?: string
  injuries?: string[]
  signal?: AbortSignal
}

interface TypeDetail {
  label: string
  expectedCount: number
  structure: string
  selection: string[]
}

interface CacheEntry {
  plan: AIPlan
  expiresAt: number
}

// --- Constants ---

// Worker proxy URL — można nadpisać przez `.env` (VITE_AI_PROXY_URL) lub localStorage 'tp_proxy_url'.
const DEFAULT_PROXY: string = import.meta.env?.VITE_AI_PROXY_URL || 'https://trening-pro-api.lukasz-mateusz-bonio.workers.dev'
const MODEL = 'claude-sonnet-5'

function getProxyUrl(): string {
  try {
    return localStorage.getItem('tp_proxy_url') || DEFAULT_PROXY
  } catch {
    return DEFAULT_PROXY
  }
}

// Wspólny POST do proxy z obsługą timeoutu + abortu. Zwraca sparsowany JSON odpowiedzi.
// thinking: disabled — sonnet-5 domyślnie włącza adaptive thinking, co zjadałoby budżet
// max_tokens (ryzyko ucięcia planu JSON) i dokładałoby koszt/latencję; wyłączamy świadomie.
async function _postToProxy(
  body: Record<string, unknown>,
  signal?: AbortSignal,
  timeoutMs = 60000
): Promise<Record<string, any>> {
  if (!navigator.onLine) {
    throw new Error('Brak połączenia z internetem')
  }
  // Sygnał już anulowany przed wejściem (np. szybki re-generate z tym samym signal) —
  // listener 'abort' by się nie odpalił, więc przerywamy od razu.
  if (signal?.aborted) throw new DOMException('Przerwano', 'AbortError')
  // Default 60s timeout — wcześniej request mógł wisieć indefinitely jeśli user nie podał signal.
  const timeoutCtrl = new AbortController()
  const timer = setTimeout(() => timeoutCtrl.abort(), timeoutMs)
  const onUserAbort = (): void => timeoutCtrl.abort()
  if (signal) signal.addEventListener('abort', onUserAbort)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getAuthToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  let resp: Response
  try {
    resp = await fetch(getProxyUrl(), {
      method: 'POST',
      signal: timeoutCtrl.signal,
      headers,
      body: JSON.stringify({ model: MODEL, thinking: { type: 'disabled' }, ...body })
    })
  } finally {
    clearTimeout(timer)
    if (signal) signal.removeEventListener('abort', onUserAbort)
  }

  if (!resp.ok) {
    const err: ClaudeErrorResponse = await resp.json().catch(() => ({}))
    throw new Error(err.error?.message || `HTTP ${resp.status}`)
  }
  return await resp.json()
}

export async function callClaude({ prompt, maxTokens = 2500, signal, timeoutMs = 60000 }: CallClaudeOptions): Promise<string> {
  const data = await _postToProxy(
    { max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] },
    signal,
    timeoutMs
  )
  if (!Array.isArray(data.content)) throw new Error('Pusta odpowiedź API')
  const text = data.content.map((c: ClaudeContentBlock) => c.text || '').join('')
  return text.replace(/```json|```/g, '').trim()
}

// Wywołanie w formacie messages API z obsługą narzędzi (tool use). Zwraca surową
// odpowiedź (bloki content + stop_reason), by wywołujący mógł prowadzić pętlę narzędziową.
export async function callClaudeRaw(opts: CallClaudeRawOptions): Promise<ClaudeRawResponse> {
  const body: Record<string, unknown> = {
    max_tokens: opts.maxTokens ?? 1024,
    messages: opts.messages
  }
  if (opts.system) body.system = opts.system
  if (opts.tools && opts.tools.length) body.tools = opts.tools
  if (opts.toolChoice) body.tool_choice = opts.toolChoice
  const data = await _postToProxy(body, opts.signal, opts.timeoutMs ?? 60000)
  if (!Array.isArray(data.content)) throw new Error('Pusta odpowiedź API')
  return { content: data.content, stop_reason: data.stop_reason || 'end_turn' }
}

export function parseClaudeJSON(rawText: string): Record<string, unknown> {
  let parsed: unknown
  try { parsed = JSON.parse(rawText) }
  catch { throw new Error('AI nie zwróciło poprawnego JSON-a — spróbuj ponownie') }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Nieprawidłowy format odpowiedzi — spróbuj ponownie')
  }
  return parsed as Record<string, unknown>
}

// Dozwolone wartości dla pól w odpowiedzi AI.
// PRIMARY_MUSCLES wyprowadzone z PRIMARY_TO_GROUP — jedno źródło prawdy.
export const PRIMARY_MUSCLES: string[] = Object.keys(PRIMARY_TO_GROUP)
const EXERCISE_TYPES: string[] = ['compound', 'isolation']
const MOVEMENT_PATTERNS: string[] = [
  'horizontal_push', 'vertical_push',
  'horizontal_pull', 'vertical_pull',
  'squat', 'hinge', 'lunge', 'calf', 'core',
  'elbow_flexion', 'elbow_extension', 'shoulder_isolation'
]

// Dozwolone głowy mięśniowe (muscleHead) per typ treningu — używane do walidacji
// w `generateAIPlan` i jako lista hintów dla AI w prompcie.
export const MUSCLE_HEADS_BY_TYPE: Record<string, string[]> = {
  push:    ['chest_upper', 'chest_middle', 'chest_lower', 'shoulder_front', 'shoulder_side', 'triceps_long', 'triceps_lat', 'triceps_med'],
  pull:    ['back_lats', 'back_middle', 'back_upper', 'back_lower', 'shoulder_rear', 'biceps_long', 'biceps_short', 'biceps_brach', 'forearms'],
  legs:    ['quads', 'hamstrings', 'glutes', 'adductors', 'calves', 'abs', 'obliques', 'core'],
  upper_a: ['chest_upper', 'chest_middle', 'chest_lower', 'shoulder_front', 'shoulder_side', 'shoulder_rear', 'back_lats', 'back_middle', 'back_upper', 'biceps_long', 'biceps_short', 'biceps_brach', 'triceps_long', 'triceps_lat', 'triceps_med'],
  upper_b: ['chest_upper', 'chest_middle', 'chest_lower', 'shoulder_front', 'shoulder_side', 'shoulder_rear', 'back_lats', 'back_middle', 'back_upper', 'biceps_long', 'biceps_short', 'biceps_brach', 'triceps_long', 'triceps_lat', 'triceps_med'],
  lower_a: ['quads', 'hamstrings', 'glutes', 'adductors', 'calves', 'abs', 'obliques', 'core'],
  lower_b: ['quads', 'hamstrings', 'glutes', 'adductors', 'calves', 'abs', 'obliques', 'core'],
  fbw_a:   ['chest_middle', 'chest_upper', 'back_lats', 'back_middle', 'shoulder_front', 'shoulder_side', 'shoulder_rear', 'quads', 'hamstrings', 'glutes', 'biceps_short', 'triceps_lat', 'abs', 'core'],
  fbw_b:   ['chest_middle', 'chest_upper', 'back_lats', 'back_middle', 'back_lower', 'shoulder_front', 'shoulder_side', 'quads', 'hamstrings', 'glutes', 'triceps_long', 'triceps_lat', 'abs', 'core'],
  fbw_c:   ['chest_middle', 'chest_upper', 'back_lats', 'back_middle', 'shoulder_front', 'shoulder_side', 'shoulder_rear', 'quads', 'hamstrings', 'glutes', 'biceps_short', 'calves', 'core'],
  // Plan korekcyjny Ani — bez klatki/przednich barków/tricepsa/bicepsa (górna część minimalna).
  ania:    ['core', 'abs', 'obliques', 'glutes', 'adductors', 'hamstrings', 'quads', 'back_lats', 'back_middle', 'back_lower', 'back_upper', 'shoulder_rear', 'calves']
}

// Szczegóły dla każdego typu treningu — struktura, zasady doboru, oczekiwana liczba ćwiczeń.
const TYPE_DETAILS: Record<string, TypeDetail> = {
  push: {
    label: 'PUSH',
    expectedCount: 7,
    structure: `Format 3/2/2 z dokładnym rozkładem (kolejność musi być zachowana):
1. KLATKA ŚRODKOWA (muscleHead: "chest_middle") — wyciskanie poziome (sztanga lub hantle, ławka pozioma).
2. KLATKA GÓRNA (muscleHead: "chest_upper") — skos dodatni (wyciskanie skośne dodatnie sztangą lub hantlami).
3. KLATKA ISOLATION (muscleHead: dowolny z "chest_*") — rozpiętki, cable crossover, butterfly. Akcent na pełen zakres rozciągnięcia.
4. BARK PRZEDNI (muscleHead: "shoulder_front") — wyciskanie nad głowę: OHP, Arnold press, wyciskanie hantli nad głowę.
5. BARK BOCZNY (muscleHead: "shoulder_side") — wznosy bokiem (hantle, wyciąg lub maszyna). Priorytet dla rozwoju szerokości barków.
6. TRICEPS GŁOWA DŁUGA (muscleHead: "triceps_long") — overhead extension, francuskie wyciskanie, skull crusher. Wymaga podniesionej ręki.
7. TRICEPS GŁOWA BOCZNA/PRZYŚRODKOWA (muscleHead: "triceps_lat" lub "triceps_med") — pushdown, wyciskanie wąskim chwytem, kickback.`,
    selection: [
      'Pierwsze ćwiczenie musi być ćwiczeniem wielostawowym (compound).',
      'Pozycje 1, 2, 4 muszą być compound. Pozycje 3, 5, 6, 7 mogą być isolation.',
      'Nie twórz planów opartych wyłącznie na maszynach — pierwsze wyciskanie powinno być ze sztangą lub hantlami.',
      'Łącz wyciskania poziome, skośne i ruchy nad głowę dla balansu klatki i barków.',
      'NIE umieszczaj ćwiczeń na tylny bark (shoulder_rear) — to jest na PULL day.',
      'Nie wybieraj więcej niż dwóch bardzo podobnych ćwiczeń.'
    ]
  },
  pull: {
    label: 'PULL',
    expectedCount: 8,
    structure: '4 ćwiczenia na plecy + 1 na tylne barki + 2 na biceps + 1 na przedramię',
    selection: [
      'Pierwsze ćwiczenie musi być ćwiczeniem wielostawowym.',
      'Co najmniej 2 ćwiczenia muszą być ćwiczeniami bazowymi.',
      'Łącz ruchy pionowe (podciąganie, wyciąg górny) i poziome (wiosłowania).',
      'Unikaj planów opartych wyłącznie na wyciągach.',
      'Nie wybieraj więcej niż dwóch bardzo podobnych ćwiczeń.'
    ]
  },
  legs: {
    label: 'LEGS',
    expectedCount: 7,
    structure: '2 quad-dominant + 2 hamstring/pośladki + 1 jednostronne + 1 łydki + 1 core',
    selection: [
      'Pierwsze ćwiczenie musi być ćwiczeniem wielostawowym (przysiad lub martwy).',
      'Co najmniej 2 ćwiczenia muszą być ćwiczeniami bazowymi.',
      'Zachowaj balans pomiędzy przednią i tylną taśmą mięśniową.',
      'Zachowuj balans pomiędzy maszynami i wolnymi ciężarami.',
      'Nie wybieraj więcej niż dwóch bardzo podobnych ćwiczeń.'
    ]
  },
  upper_a: {
    label: 'UPPER A',
    expectedCount: 7,
    structure: '2 klatka + 2 plecy + 1 barki + 1 biceps + 1 triceps (7 ćwiczeń) — wariant bazowy',
    selection: [
      'Pierwsze ćwiczenie musi być ćwiczeniem wielostawowym (wyciskanie lub wiosłowanie).',
      'Co najmniej 2 ćwiczenia muszą być ćwiczeniami bazowymi.',
      'Zachowaj balans push/pull w obrębie planu.',
      'Łącz ruchy poziome i pionowe.',
      'Nie wybieraj więcej niż dwóch bardzo podobnych ćwiczeń.'
    ]
  },
  upper_b: {
    label: 'UPPER B',
    expectedCount: 7,
    structure: '2 klatka + 2 plecy + 1 barki + 1 biceps + 1 triceps (7 ćwiczeń) — wariant objętościowy, inne ćwiczenia niż Upper A',
    selection: [
      'Pierwsze ćwiczenie musi być ćwiczeniem wielostawowym (wyciskanie lub wiosłowanie).',
      'Co najmniej 2 ćwiczenia muszą być ćwiczeniami bazowymi.',
      'Wybieraj warianty z większą objętością (8-15 powt).',
      'Łącz ruchy poziome i pionowe.',
      'Nie wybieraj więcej niż dwóch bardzo podobnych ćwiczeń.'
    ]
  },
  lower_a: {
    label: 'LOWER A',
    expectedCount: 6,
    structure: '2 quad-dominant + 2 hamstring/pośladki + 1 łydki + 1 core (6 ćwiczeń) — priorytet czworogłowy',
    selection: [
      'Pierwsze ćwiczenie musi być przysiadem lub wariantem przysiadowym.',
      'Co najmniej 2 ćwiczenia muszą być ćwiczeniami bazowymi.',
      'Zachowaj balans przód/tył uda.',
      'Łącz ruchy obustronne i jednostronne.',
      'Nie wybieraj więcej niż dwóch bardzo podobnych ćwiczeń.'
    ]
  },
  lower_b: {
    label: 'LOWER B',
    expectedCount: 6,
    structure: '2 hamstring/pośladki dominantne + 2 czworogłowy + 1 łydki + 1 core (6 ćwiczeń) — priorytet hip hinge',
    selection: [
      'Pierwsze ćwiczenie musi być martwym ciągiem lub hip hinge.',
      'Co najmniej 2 ćwiczenia muszą być ćwiczeniami bazowymi.',
      'Zachowaj balans przód/tył uda.',
      'Łącz ruchy obustronne i jednostronne.',
      'Nie wybieraj więcej niż dwóch bardzo podobnych ćwiczeń.'
    ]
  },
  fbw_a: {
    label: 'FBW A',
    expectedCount: 7,
    structure: 'przysiad + bench + wiosłowanie + OHP + hamstring + biceps + core (7 ćwiczeń)',
    selection: [
      'Pierwsze ćwiczenie musi być wielostawowe (przysiad lub martwy).',
      'Każda główna partia (nogi, klatka, plecy, barki) ma jedno reprezentatywne ćwiczenie.',
      'Wybieraj ćwiczenia efektywne czasowo (duży stosunek zaangażowanych mięśni).',
      'Unikaj nadmiaru ćwiczeń izolowanych.'
    ]
  },
  fbw_b: {
    label: 'FBW B',
    expectedCount: 7,
    structure: 'martwy ciąg + skos klatka + podciąganie + split squat + wznosy + triceps + core (7 ćwiczeń)',
    selection: [
      'Pierwsze ćwiczenie musi być martwym ciągiem (klasyczny lub wariant).',
      'Każda główna partia (nogi, klatka, plecy, barki) ma jedno reprezentatywne ćwiczenie.',
      'Wybieraj ćwiczenia efektywne czasowo.',
      'Unikaj nadmiaru ćwiczeń izolowanych.'
    ]
  },
  fbw_c: {
    label: 'FBW C',
    expectedCount: 7,
    structure: 'front squat + bench hantle + wiosłowanie + hip thrust + face pull + biceps + łydki (7 ćwiczeń)',
    selection: [
      'Pierwsze ćwiczenie musi być front squatem lub wariantem przedniego przysiadu.',
      'Plan eksponuje pośladki (hip thrust) i tylne barki (face pull).',
      'Wybieraj ćwiczenia efektywne czasowo.',
      'Unikaj nadmiaru ćwiczeń izolowanych.'
    ]
  },
  // Plan korekcyjno-wzmacniający dla Ani. Ma własny builder promptu (buildAniaPrompt),
  // więc structure/selection są tu tylko informacyjne — normalizePlan używa expectedCount.
  ania: {
    label: 'ĆWICZENIA DLA ANI',
    expectedCount: 8,
    structure: '2× core/stabilizacja + 2× pośladki/biodro + 1× tylna taśma + 1× czworogłowy/kolano + 1× plecy/postawa + 1× łopatki/postawa',
    selection: [
      'Wyłącznie bezpieczne ćwiczenia dla osoby początkującej ze schorzeniami kręgosłupa i kolana.',
      'Kręgosłup w pozycji neutralnej, bez obciążonego zginania lędźwi i osiowego obciążania.',
      'Kolano bez koślawości, rotacji i głębokiego zgięcia pod obciążeniem.'
    ]
  }
}

// Mapowanie ustawienia sprzętu (z AIGenerator.vue) → dostępne kategorie sprzętu w bazie ćwiczeń.
// Nieznana wartość → pełny dostęp (zachowanie jak na siłowni).
const EQUIPMENT_ACCESS: Record<string, Equipment[]> = {
  'siłownia':                        ['sztanga', 'hantle', 'maszyna', 'wyciąg', 'własna_waga'],
  'dom z hantlami':                  ['hantle', 'własna_waga'],
  'dom bez sprzętu (calisthenics)':  ['własna_waga']
}
const ALL_EQUIPMENT: Equipment[] = ['sztanga', 'hantle', 'maszyna', 'wyciąg', 'własna_waga']

const EQUIPMENT_LABEL: Record<Equipment, string> = {
  'sztanga': 'sztanga',
  'hantle': 'hantle',
  'maszyna': 'maszyna',
  'wyciąg': 'wyciąg',
  'własna_waga': 'własna waga'
}

interface ExerciseCatalog {
  text: string
  // strict = baza pokrywa strukturę z zapasem → AI musi wybierać wyłącznie z listy.
  // Przy małej liczbie ćwiczeń (np. trening w domu) pozwalamy AI uzupełnić braki.
  strict: boolean
}

// Buduje sekcję promptu z listą dozwolonych ćwiczeń dla danego typu treningu i sprzętu.
// Grupowanie po muscleHead — AI widzi które ćwiczenia pasują do których slotów struktury.
// Eksportowane dla testów (czysta funkcja).
export function buildExerciseCatalog(
  type: string,
  equipment: string,
  goal: string = 'mass',
  level: string = 'intermediate',
  injuries: string[] = []
): ExerciseCatalog | null {
  const heads = MUSCLE_HEADS_BY_TYPE[type] || []
  const allowed = EQUIPMENT_ACCESS[equipment] || ALL_EQUIPMENT
  const all = getExercisesForHeads(heads, allowed)
  if (!all.length) return null

  // Filtr bezpieczeństwa: usuń ćwiczenia przeciwwskazane przy zaznaczonych kontuzjach.
  const list = injuries.length
    ? all.filter(ex => {
        const contra = withPremium(ex).safety?.contraindications ?? []
        return !injuries.some(i => contra.includes(i))
      })
    : all
  const filteredOut = all.length - list.length
  if (!list.length) return null

  const td = TYPE_DETAILS[type] || TYPE_DETAILS.push
  const strict = list.length >= td.expectedCount * 2

  // Ocena dopasowania do celu i poziomu (premium model) — cache po id.
  const tag = GOAL_TO_TAG[goal] || 'general'
  const lvl = level as import('./exerciseModel').TrainingLevel
  const scoreCache = new Map<string, number>()
  const fit = (ex: ExerciseEntry): number => {
    let s = scoreCache.get(ex.id)
    if (s === undefined) {
      s = scoreExercise(withPremium(ex), { goal: tag, level: lvl, injuries }).total
      scoreCache.set(ex.id, s)
    }
    return s
  }

  const byHead = new Map<string, ExerciseEntry[]>()
  for (const h of heads) byHead.set(h, [])
  for (const ex of list) byHead.get(ex.muscleHead)?.push(ex)

  // Gdy dostępny jest sprzęt obciążeniowy (siłownia / dom z hantlami), ćwiczenia z masą
  // ciała schodzą niżej w rankingu każdej grupy — AI (nudge „preferuj wyżej") sięga
  // wtedy najpierw po sztangę/hantle/maszynę/wyciąg. Przy samej kalistenice bez zmian.
  const preferLoaded = allowed.some(eq => eq !== 'własna_waga')
  const eqRank = (ex: ExerciseEntry) => (preferLoaded && ex.equipment === 'własna_waga' ? 1 : 0)

  const lines: string[] = []
  for (const [head, exs] of byHead) {
    if (!exs.length) continue
    // W obrębie grupy: najlepiej dopasowane do celu jako pierwsze (nudge dla AI),
    // a przy dostępnym sprzęcie — ćwiczenia obciążeniowe przed masą ciała.
    exs.sort((a, b) => eqRank(a) - eqRank(b) || fit(b) - fit(a))
    lines.push(`[${head}]`)
    for (const ex of exs) {
      lines.push(`- ${ex.name} (${EQUIPMENT_LABEL[ex.equipment]}, ${ex.exerciseType})`)
    }
  }

  const orderNote = ' W każdej grupie ćwiczenia są uszeregowane od najlepiej dopasowanego do celu — przy równorzędnych wyborach preferuj wyżej na liście.'
  const safetyNote = filteredOut > 0
    ? ' Ćwiczenia przeciwwskazane przy zgłoszonych dolegliwościach zostały pominięte — NIE dodawaj ich spoza listy.'
    : ''
  const header = strict
    ? `BAZA ĆWICZEŃ — wybieraj WYŁĄCZNIE z poniższej listy. Przepisuj nazwy DOKŁADNIE (co do znaku). Nie wymyślaj ćwiczeń spoza listy.${orderNote}${safetyNote}`
    : `BAZA ĆWICZEŃ — preferuj ćwiczenia z poniższej listy (przepisuj nazwy DOKŁADNIE). Jeżeli dla wymaganego slotu struktury lista nie zawiera pasującego ćwiczenia, możesz dodać standardowe ćwiczenie spoza listy (polska nazwa, wykonalne przy dostępnym sprzęcie).${orderNote}${safetyNote}`

  return { text: `${header}\n${lines.join('\n')}`, strict }
}

const GOAL_HINTS: Record<string, string> = {
  mass:          'masa mięśniowa: 8-12 powtórzeń, 3-4 serie, tempo umiarkowane',
  strength:      'siła: 3-6 powtórzeń, 4-5 serii, ciężary submaksymalne',
  endurance:     'wytrzymałość mięśniowa: 15-20 powtórzeń, 2-4 serie, krótkie przerwy',
  cut:           'redukcja tkanki tłuszczowej: 10-15 powtórzeń, DOKŁADNIE 3 serie dla KAŻDEGO ćwiczenia (dobitka opcjonalna na żywo), krótsze przerwy 60-90s',
  recomposition: 'rekompozycja: 6-12 powtórzeń, 3-4 serie, nacisk na progresję obciążenia'
}

// Kompaktowy zapis sesji do prompta — bez RPE, bez notatek.
// Format: "- <nazwa>: 60x10, 60x10, 60x8"
export function formatSessionCompact(session: RecentSession): string {
  // Guard na niepoprawną datę — jedna uszkodzona sesja nie może wywalić całego
  // generowania planu (toISOString() rzuca RangeError przy Invalid Date).
  const parsed = new Date(session.date)
  const date = Number.isNaN(parsed.getTime()) ? 'bez daty' : parsed.toISOString().slice(0, 10)
  const lines = session.exercises.map((ex: SessionExercise) => {
    const sets = ex.sets
      .map((s: SessionSet) => `${s.weight || 0}x${s.reps || 0}`)
      .join(', ')
    return `- ${ex.name}: ${sets}`
  })
  return `Sesja ${date}:\n${lines.join('\n')}`
}

interface BuildPromptOptions {
  type: string
  goal: string
  equipment: string
  avoid: string
  recentSessions: RecentSession[]
  // Kategorie sprzętu dla planu Ani (checkboxy). Ignorowane przez pozostałe typy.
  equipmentTags?: string[]
  // Profil użytkownika — wpływa na dobór/filtr ćwiczeń w katalogu.
  level?: string
  injuries?: string[]
}

// === Plan korekcyjny "Ćwiczenia dla Ani" ===
// Kuratorowane menu BEZPIECZNYCH ćwiczeń per slot struktury. Każda opcja ma tag sprzętu
// (do filtrowania wg dostępności) i poziom (baza→progresja). AI wybiera 1 opcję/slot;
// progresję trudności dobiera na podstawie historii. NIE ma tu ćwiczeń przeciwwskazanych
// (brak przysiadu ze sztangą, martwego ciągu, osiowego obciążania kręgosłupa).
// Kategorie sprzętu wybierane przez usera dla planu Ani (checkboxy w UI).
// 'masa_ciala' jest zawsze dostępna (baza). 'maszyna' obejmuje też wyciągi.
// Sztanga świadomie nieobecna — osiowe obciążanie kręgosłupa to przeciwwskazanie.
export type AniaEquip = 'masa_ciala' | 'guma' | 'hantle' | 'maszyna'

const ANIA_EQUIP_LABEL: Record<AniaEquip, string> = {
  masa_ciala: 'masa ciała',
  guma: 'guma oporowa',
  hantle: 'hantle / kettle',
  maszyna: 'maszyna / wyciąg'
}

interface AniaOption { name: string; equip: AniaEquip; level: string }
interface AniaSlot {
  title: string
  primaryMuscle: string
  muscleHead: string
  exerciseType: ExerciseType
  movementPattern: string
  options: AniaOption[]
}

// Kuratorowane menu. Każdy slot MA co najmniej jedną opcję na masę ciała (fallback,
// bo 'masa_ciala' jest zawsze zaznaczona). Nazwy pokrywające się z bazą ćwiczeń
// (exerciseDb) dostają metadane z bazy w normalizePlan.
const ANIA_SLOTS: AniaSlot[] = [
  {
    title: 'Aktywacja core (leżąc, kręgosłup neutralny)',
    primaryMuscle: 'core', muscleHead: 'core', exerciseType: 'isolation', movementPattern: 'core',
    options: [
      { name: 'Martwy robak', equip: 'masa_ciala', level: 'baza' },
      { name: 'Martwy robak z wyprostem nogi', equip: 'masa_ciala', level: 'progresja' },
      { name: 'Pallof press', equip: 'guma', level: 'anty-rotacja' }
    ]
  },
  {
    title: 'Stabilizacja kręgosłupa / izometria core',
    primaryMuscle: 'core', muscleHead: 'core', exerciseType: 'isolation', movementPattern: 'core',
    options: [
      { name: 'Ptak-pies', equip: 'masa_ciala', level: 'baza' },
      { name: 'Deska', equip: 'masa_ciala', level: 'izometria' },
      { name: 'Deska bokiem', equip: 'masa_ciala', level: 'progresja (skolioza/skośne)' }
    ]
  },
  {
    title: 'Pośladki — wyprost bioder (neutralne lędźwie)',
    primaryMuscle: 'glutes', muscleHead: 'glutes', exerciseType: 'compound', movementPattern: 'hinge',
    options: [
      { name: 'Most biodrowy', equip: 'masa_ciala', level: 'baza' },
      { name: 'Most biodrowy jednonóż', equip: 'masa_ciala', level: 'progresja' },
      { name: 'Most biodrowy z gumą', equip: 'guma', level: 'progresja z oporem' },
      { name: 'Hip thrust', equip: 'hantle', level: 'progresja z obciążeniem' }
    ]
  },
  {
    title: 'Stabilizacja miednicy — odwodzenie biodra',
    primaryMuscle: 'glutes', muscleHead: 'glutes', exerciseType: 'isolation', movementPattern: 'hinge',
    options: [
      { name: 'Muszelka', equip: 'masa_ciala', level: 'baza' },
      { name: 'Odwodzenie nogi leżąc bokiem', equip: 'masa_ciala', level: 'progresja' },
      { name: 'Muszelka z gumą', equip: 'guma', level: 'progresja z oporem' },
      { name: 'Odwodzenie nóg na maszynie', equip: 'maszyna', level: 'wariant na siłowni' }
    ]
  },
  {
    title: 'Tylna taśma — dwugłowe uda (bez obciążania lędźwi)',
    primaryMuscle: 'hamstrings', muscleHead: 'hamstrings', exerciseType: 'isolation', movementPattern: 'hinge',
    options: [
      { name: 'Most biodrowy ze zsuwaniem pięt', equip: 'masa_ciala', level: 'baza' },
      { name: 'Uginanie nóg z gumą', equip: 'guma', level: 'z oporem' },
      { name: 'Uginanie nóg leżąc', equip: 'maszyna', level: 'wariant na siłowni' },
      { name: 'Uginanie nóg siedząc', equip: 'maszyna', level: 'wariant na siłowni' }
    ]
  },
  {
    title: 'Czworogłowy / stabilizacja kolana (MCL — kontrolowany zakres, bez koślawości)',
    primaryMuscle: 'quads', muscleHead: 'quads', exerciseType: 'isolation', movementPattern: 'squat',
    options: [
      { name: 'Wall sit', equip: 'masa_ciala', level: 'baza (izometria)' },
      { name: 'Przysiad z hantlem do ławki', equip: 'hantle', level: 'progresja (ograniczony zakres)' },
      { name: 'Wyprosty nóg', equip: 'maszyna', level: 'wariant na siłowni (lekki)' }
    ]
  },
  {
    title: 'Plecy / postawa — ściąganie łopatek',
    primaryMuscle: 'back', muscleHead: 'back_middle', exerciseType: 'compound', movementPattern: 'horizontal_pull',
    options: [
      { name: 'Wznosy T-Y-W leżąc', equip: 'masa_ciala', level: 'baza (postawa)' },
      { name: 'Wiosłowanie z gumą', equip: 'guma', level: 'z oporem' },
      { name: 'Wiosłowanie hantlą w podparciu', equip: 'hantle', level: 'wariant z hantlami' },
      { name: 'Wiosłowanie na maszynie', equip: 'maszyna', level: 'wariant na siłowni' },
      { name: 'Ściąganie drążka wyciągu górnego', equip: 'maszyna', level: 'wariant na siłowni' }
    ]
  },
  {
    title: 'Łopatki + górny grzbiet + korekcja ustawienia głowy',
    primaryMuscle: 'rear_shoulders', muscleHead: 'shoulder_rear', exerciseType: 'isolation', movementPattern: 'shoulder_isolation',
    options: [
      { name: 'Wall angels', equip: 'masa_ciala', level: 'korekcja głowy/łopatek' },
      { name: 'Band pull-apart', equip: 'guma', level: 'baza z gumą' },
      { name: 'Face pull', equip: 'maszyna', level: 'wariant na siłowni' }
    ]
  }
]

// Dedykowany builder promptu dla planu Ani. Reużywa formatSessionCompact + reguł pól,
// ale z profilem korekcyjnym, przeciwwskazaniami i progresją przez trudność (nie ciężar).
// Eksportowane dla testów.
export function buildAniaPrompt({ equipmentTags, avoid, recentSessions }: BuildPromptOptions): string {
  // Masa ciała zawsze dostępna (baza). Reszta wg zaznaczenia usera.
  const selected = new Set<AniaEquip>(['masa_ciala'])
  for (const t of (equipmentTags || [])) {
    if (t === 'guma' || t === 'hantle' || t === 'maszyna') selected.add(t)
  }
  const equipSummary = [...selected].map(t => ANIA_EQUIP_LABEL[t]).join(', ')
  const hasHistory = recentSessions.length > 0
  const td = TYPE_DETAILS.ania
  const parts: string[] = []

  parts.push(`Jesteś trenerem personalnym specjalizującym się w treningu korekcyjnym i pracy z osobami początkującymi ze schorzeniami kręgosłupa i stawów. Ułóż BEZPIECZNY, korekcyjno-wzmacniający plan treningowy dla konkretnej osoby (Ania). Dostępny sprzęt: ${equipSummary}.`)

  parts.push(`PROFIL:
- Kobieta, POCZĄTKUJĄCA (brak doświadczenia z treningiem siłowym).
- Schorzenia i ograniczenia: dyskopatia odcinka lędźwiowego, rwa kulszowa, przodopochylenie miednicy, wysunięta do przodu głowa (forward head posture), skolioza, wystająca łopatka, kolano po naderwaniu więzadła MCL.`)

  parts.push(`CELE (wg priorytetu):
1. Wzmocnienie mięśni stabilizujących kręgosłup (core głęboki + przykręgosłupowe).
2. Wzmocnienie dolnej części ciała — pośladki, tylna taśma, dwugłowe i czworogłowe ud.
3. Poprawa stabilizacji miednicy i kolana.
4. Poprawa postawy — wzmacnianie grzbietu i łopatek, korekcja ustawienia głowy i barków.
5. Górna część ciała (ramiona) tylko jako uzupełnienie — minimalny nacisk.`)

  parts.push(`TWARDE PRZECIWWSKAZANIA (bezwzględnie):
- Kręgosłup zawsze w pozycji NEUTRALNEJ, z napięciem brzucha. ZAKAZ obciążonego zginania lędźwi (brzuszki, sit-upy, skłony z ciężarem).
- ZAKAZ osiowego obciążania kręgosłupa (przysiad ze sztangą na plecach, martwy ciąg z obciążeniem, wyciskanie sztangi nad głowę stojąc z ciężarem).
- Kolano (MCL): bez ruchów bocznych/rotacyjnych, bez koślawienia, bez głębokiego zgięcia pod obciążeniem, bez wyskoków. Zakres kontrolowany i bezbolesny.
- Bez ćwiczeń balistycznych i szarpanych. Przy rwie kulszowej unikaj mocnego zgięcia bioder z zaokrąglonymi plecami.`)

  // Menu — filtrowane wg zaznaczonych kategorii sprzętu. Każdy slot = jedno ćwiczenie.
  // Masa ciała zawsze w secie → każdy slot ma co najmniej opcję na masę ciała.
  const menuLines: string[] = []
  ANIA_SLOTS.forEach((slot, i) => {
    const shown = slot.options.filter(o => selected.has(o.equip))
    const optText = shown.map(o => `"${o.name}" (${ANIA_EQUIP_LABEL[o.equip]}, ${o.level})`).join('; ')
    menuLines.push(`SLOT ${i + 1} — ${slot.title}\n  primaryMuscle: "${slot.primaryMuscle}", muscleHead: "${slot.muscleHead}", exerciseType: "${slot.exerciseType}", movementPattern: "${slot.movementPattern}"\n  Wybierz 1 z: ${optText}`)
  })
  parts.push(`MENU ĆWICZEŃ — wybierz DOKŁADNIE JEDNO ćwiczenie dla każdego z ${td.expectedCount} slotów (kolejność zachowana). Używaj nazw DOKŁADNIE jak w menu oraz podanych wartości primaryMuscle/muscleHead/exerciseType/movementPattern dla danego slotu:\n${menuLines.join('\n')}`)

  if (avoid && avoid.trim()) {
    parts.push(`DODATKOWO UNIKAJ: ${avoid.trim()}`)
  }

  if (hasHistory) {
    parts.push(`OSTATNIE SESJE (${recentSessions.length}) — weight x reps (przy izometrii czas):
${recentSessions.map(formatSessionCompact).join('\n\n')}`)

    parts.push(`ANALIZA POSTĘPÓW — przeprowadź i ZWRÓĆ wynik w polu "analysis" w JSON:
1. Dla każdej partii widocznej w historii (core, pośladki, hamstring, czworogłowy, plecy, barki) oceń status:
   - "progress" — powtórzenia/czas rosną, ćwiczenia wykonywane komfortownie
   - "stagnation" — brak postępu przez 2+ sesje
   - "overreaching" — spadek jakości/objawy przeciążenia
   - "weakly_covered" — partia słabo pokryta w historii
2. PROGRESJA (BEZ zwiększania ciężaru — plan na masie ciała):
   - progress → zwiększ trudność: więcej powtórzeń w zakresie, dłuższy czas izometrii, LUB trudniejszy wariant z menu (np. "Most biodrowy" → "Most biodrowy jednonóż", "Martwy robak" → "Martwy robak z wyprostem nogi").
   - stagnation → zmień wariant w obrębie slotu na inny bodziec.
   - overreaching → cofnij do łatwiejszego wariantu i zmniejsz objętość.
   - weakly_covered → upewnij się, że slot jest solidnie pokryty.
3. Zachowaj bezpieczeństwo i pełną strukturę ${td.expectedCount} ćwiczeń.`)
  } else {
    parts.push(`BRAK HISTORII — to pierwszy trening. Wybierz dla każdego slotu NAJŁATWIEJSZY, bazowy wariant. Skup się na nauce wzorca ruchowego i aktywacji właściwych mięśni.`)
  }

  const analysisField = hasHistory
    ? `,
  "analysis": [
    { "muscle": "nazwa partii po polsku (np. core, pośladki)", "status": "progress|stagnation|overreaching|weakly_covered", "note": "krótkie uzasadnienie (max 80 znaków)" }
  ]`
    : ''
  parts.push(`Zwróć WYŁĄCZNIE poprawny JSON (bez markdown, bez komentarzy, bez tekstu przed/po). Odpowiedź musi zaczynać się od { i kończyć }:
{
  "name": "Ćwiczenia wzmacniające dla Ani"${analysisField},
  "exercises": [
    {
      "name": "nazwa ćwiczenia z menu",
      "primaryMuscle": "PARTIA_ENG",
      "muscleHead": "GŁOWA_MIĘŚNIA",
      "exerciseType": "compound|isolation",
      "movementPattern": "WZORZEC",
      "sets": LICZBA,
      "reps": "ZAKRES lub CZAS jako string",
      "tip": "krótka wskazówka bezpieczeństwa (max 60 znaków)",
      "suggestedWeight": null
    }
  ]
}`)

  parts.push(`REGUŁY PÓL (przestrzegaj dokładnie):
- Liczba ćwiczeń: DOKŁADNIE ${td.expectedCount} (po jednym z każdego slotu, w kolejności slotów).
- "name": dokładna nazwa z menu.
- "primaryMuscle": użyj wartości podanej przy slocie (jedna z: ${PRIMARY_MUSCLES.map(m => `"${m}"`).join(', ')}).
- "muscleHead": użyj wartości podanej przy slocie.
- "exerciseType": ${EXERCISE_TYPES.map(t => `"${t}"`).join(', ')}.
- "movementPattern": ${MOVEMENT_PATTERNS.map(p => `"${p}"`).join(', ')}.
- "sets": liczba 2 lub 3 (początkująca — niska/umiarkowana objętość).
- "reps": string — zakres powtórzeń ("10-15") lub czas dla izometrii ("20-30s").
- "suggestedWeight": zawsze null (plan na masie ciała / minimalnym obciążeniu).
- "tip": max 60 znaków, kluczowa wskazówka bezpieczeństwa/techniki (np. "Kręgosłup neutralny, napnij brzuch").
- Ten plan to trening wzmacniająco-korekcyjny, nie terapia medyczna. Priorytetem jest bezpieczeństwo.`)

  return parts.join('\n\n')
}

function buildPrompt(opts: BuildPromptOptions): string {
  if (opts.type === 'ania') return buildAniaPrompt(opts)
  const { type, goal, equipment, avoid, recentSessions } = opts
  const td = TYPE_DETAILS[type] || TYPE_DETAILS.push
  const goalDesc = GOAL_HINTS[goal] || GOAL_HINTS.mass
  const hasHistory = recentSessions.length > 0

  const parts: string[] = []

  parts.push(`Wygeneruj plan treningowy typu ${td.label} dla osoby trenującej w ${equipment}.`)
  parts.push(`Cel: ${goalDesc}`)
  parts.push(`Struktura:\n${td.structure}`)

  const catalog = buildExerciseCatalog(type, equipment, goal, opts.level, opts.injuries)
  if (catalog) parts.push(catalog.text)

  if (hasHistory) {
    parts.push(`RÓŻNORODNOŚĆ:
- Nie wybieraj identycznego zestawu ćwiczeń przy każdym generowaniu.
- Zachowaj strukturę planu, ale rotuj ćwiczenia pomiędzy równoważnymi wariantami.
- Preferuj ćwiczenia, które nie występowały w ostatnich ${recentSessions.length} treningach tego typu.
- Dopuszczalne jest powtórzenie głównego ćwiczenia bazowego, jeśli jest uzasadnione historią progresji.`)
  }

  parts.push(`DOBÓR ĆWICZEŃ:
${td.selection.map((s: string) => `- ${s}`).join('\n')}
- Nie duplikuj tego samego ćwiczenia w planie.`)

  if (avoid && avoid.trim()) {
    parts.push(`UNIKAJ: ${avoid.trim()}`)
  }

  if (hasHistory) {
    parts.push(`OSTATNIE SESJE (${recentSessions.length}) — kompaktowo, weight x reps:
${recentSessions.map(formatSessionCompact).join('\n\n')}`)

    // ANALIZA per partia — AI ocenia status każdej partii z historii i dobiera
    // ćwiczenia strategicznie. Zwraca wynik w polu "analysis" — UI pokazuje to userowi.
    parts.push(`ANALIZA HISTORII — przeprowadź ją i ZWRÓĆ wynik w polu "analysis" w JSON:
1. Dla każdej partii (klatka, barki, triceps, plecy, biceps, czworogłowy, hamstring, pośladki, łydki, core itd.) widocznej w historii oceń status:
   - "progress" — waga lub powtórzenia rosną sesja po sesji
   - "stagnation" — waga stoi przez 2+ ostatnie sesje przy podobnej liczbie powt. (potrzebny nowy bodziec)
   - "overreaching" — wysokie zmęczenie sesja po sesji + spadek powt. (potrzebne odciążenie)
   - "weakly_covered" — partia ma mało serii w historii lub nie była trenowana niedawno

2. DOBÓR ĆWICZEŃ WG ANALIZY:
   - Dla partii w STAGNACJI: WYBIERZ INNY WARIANT niż w ostatnich sesjach (np. zmień sztangę na hantle, poziomą ławkę na skos, prosty drążek na neutralny chwyt, free weight na maszynę). Nowy bodziec = nowa progresja.
   - Dla partii w PROGRESS: ZACHOWAJ główne ćwiczenia bazowe z ostatnich sesji aby kontynuować adaptację. Możesz zmienić tylko ćwiczenia accessory/isolation.
   - Dla partii w OVERREACHING: wybierz LŻEJSZE warianty (więcej maszyn, więcej izolacji, mniej wielostawowych). Zmniejsz nacisk na partię.
   - Dla WEAKLY_COVERED partii: upewnij się że jest reprezentowana w planie zgodnie ze strukturą.

3. Nie pomijaj wymaganej struktury — analiza wpływa na DOBÓR konkretnych ćwiczeń, nie na ich liczbę ani głowy mięśniowe.`)
  }

  const allowedHeads = MUSCLE_HEADS_BY_TYPE[type] || []
  const analysisField = hasHistory
    ? `,
  "analysis": [
    { "muscle": "nazwa partii po polsku (np. klatka, barki, triceps)", "status": "progress|stagnation|overreaching|weakly_covered", "note": "krótkie uzasadnienie (max 80 znaków, np. 'Wyciskanie sztangi stoi 2 sesje — zmieniam na hantle')" }
  ]`
    : ''
  parts.push(`Zwróć WYŁĄCZNIE poprawny JSON w formacie (bez markdown, bez komentarzy):
{
  "name": "krótka nazwa planu (max 40 znaków, po polsku)"${analysisField},
  "exercises": [
    {
      "name": "nazwa ćwiczenia po polsku",
      "primaryMuscle": "PARTIA_ENG",
      "muscleHead": "GŁOWA_MIĘŚNIA",
      "exerciseType": "compound|isolation",
      "movementPattern": "WZORZEC",
      "sets": LICZBA,
      "reps": "ZAKRES jako string",
      "tip": "krótka wskazówka (max 60 znaków)",
      "suggestedWeight": LICZBA_LUB_NULL
    }
  ]
}`)

  parts.push(`KRYTYCZNE:
- Odpowiedź musi zawierać WYŁĄCZNIE poprawny JSON.
- Nie używaj markdown.
- Nie używaj bloków \`\`\`json.
- Nie dodawaj żadnych wyjaśnień przed ani po JSON.
- Odpowiedź musi rozpoczynać się od znaku { i kończyć znakiem }.`)

  const setsRule = goal === 'cut'
    ? '- "sets" musi być DOKŁADNIE 3 dla KAŻDEGO ćwiczenia (cel = redukcja, dobitka jest opcjonalna i decydowana w trakcie sesji).'
    : '- "sets" musi być liczbą (3, 4, 5).'

  const nameRule = catalog?.strict
    ? '- "name" musi być DOKŁADNĄ nazwą z sekcji BAZA ĆWICZEŃ — przepisz co do znaku, bez modyfikacji.'
    : '- Nazwy ćwiczeń wyłącznie po polsku. Preferuj dokładne nazwy z sekcji BAZA ĆWICZEŃ.'

  parts.push(`WAŻNE:
- Wszystkie pola są wymagane.
${setsRule}
- "reps" musi być stringiem z zakresem ('6-8', '10-12', '12-15').
${nameRule}
- "primaryMuscle" musi być jedną z: ${PRIMARY_MUSCLES.map((m: string) => `"${m}"`).join(', ')}.
- "muscleHead" musi być jedną z (dozwolone dla typu ${td.label}): ${allowedHeads.map((h: string) => `"${h}"`).join(', ')}.
- "exerciseType" musi być jedną z: ${EXERCISE_TYPES.map((t: string) => `"${t}"`).join(', ')}.
- "movementPattern" musi być jedną z: ${MOVEMENT_PATTERNS.map((p: string) => `"${p}"`).join(', ')}.
- "suggestedWeight" musi być liczbą (w kg) lub null.
- Liczba ćwiczeń musi być DOKŁADNIE ${td.expectedCount} — nie pomijaj i nie dodawaj ćwiczeń.
- Wybieraj wyłącznie ćwiczenia możliwe do wykonania przy dostępnym sprzęcie — nie proponuj maszyn ani wyciągów, jeśli sprzęt to "dom z hantlami" lub "dom bez sprzętu (calisthenics)".
- Tip ma być krótki i praktyczny.`)

  parts.push(`ZASADY PROGRESJI:
${hasHistory
  ? `- Dla ćwiczeń obecnych w historii analizuj ostatnie wykonania.
- Jeśli wszystkie serie osiągnęły górną granicę zakresu powtórzeń, zwiększ ciężar o 2.5-5%.
- Jeśli większość serii była w środku zakresu, pozostaw ciężar bez zmian.
- Jeśli użytkownik nie osiągnął dolnej granicy zakresu, zmniejsz ciężar o 2.5-5%.
- Zwracaj realistyczne wartości dla danego ćwiczenia.
- Dla nowych ćwiczeń (brak w historii) ustaw "suggestedWeight": null.`
  : `- Brak historii treningowej — dla każdego ćwiczenia ustaw "suggestedWeight": null.`}`)

  return parts.join('\n\n')
}

// Cap długości user-input "avoid" — chroni przed nadużyciem promptu (kosztem tokenów)
// i prostym prompt injection (długie wpisy mogą próbować nadpisywać instrukcje).
const MAX_AVOID_LENGTH = 200

// In-memory cache krótkotrwały (5 min) — chroni przed double-click / przypadkowym
// powtórzonym requestem przy tej samej konfiguracji. NIE cachujemy długoterminowo
// bo każdorazowe generowanie ma dawać różnorodność (zob. sekcja RÓŻNORODNOŚĆ w prompcie).
const _planCache = new Map<string, CacheEntry>()
const PLAN_CACHE_TTL_MS = 5 * 60 * 1000

function planCacheKey({ type, goal, equipment, avoid, recentSessions, equipmentTags, level, injuries }: BuildPromptOptions): string {
  // Klucz zawiera tylko stabilne wejście — historia identyfikowana po id ostatnich sesji.
  const sessionsKey = recentSessions.map((s: RecentSession) => s.id || String(s.date)).join(',')
  const tagsKey = (equipmentTags || []).slice().sort().join('+')
  const injKey = (injuries || []).slice().sort().join('+')
  return `${type}|${goal}|${equipment}|${avoid}|${tagsKey}|${level || ''}|${injKey}|${sessionsKey}`
}

function getCachedPlan(key: string): AIPlan | null {
  const entry = _planCache.get(key)
  if (!entry) return null
  if (entry.expiresAt < Date.now()) {
    _planCache.delete(key)
    return null
  }
  // Klon — UI mutuje plan (podmiana ćwiczeń w podglądzie), więc nie wolno oddać
  // referencji trzymanej w cache, bo mutacje wyciekłyby do kolejnych trafień.
  return structuredClone(entry.plan)
}

function setCachedPlan(key: string, plan: AIPlan): void {
  // Klon przy zapisie — pierwszy wywołujący dostaje własny obiekt (normalized),
  // a cache trzyma niezależną kopię odporną na późniejsze mutacje w UI.
  _planCache.set(key, { plan: structuredClone(plan), expiresAt: Date.now() + PLAN_CACHE_TTL_MS })
}

// Dozwolone statusy analizy per partia (zwracane przez AI gdy była historia).
const ALLOWED_ANALYSIS_STATUS: string[] = ['progress', 'stagnation', 'overreaching', 'weakly_covered']

// Walidacja + normalizacja surowego planu z AI. Czysta funkcja (bez sieci) — testowalna.
// Rzuca błąd przy twardych naruszeniach (brak nazwy/ćwiczeń, zła liczba ćwiczeń,
// brakujące pola ćwiczenia). Miękkie naruszenia (zła partia/głowa/typ) → null.
export function normalizePlan(plan: Record<string, any>, { type, goal }: { type: string; goal: string }): AIPlan {
  const td = TYPE_DETAILS[type] || TYPE_DETAILS.push

  if (!plan || !plan.name || !Array.isArray(plan.exercises) || !plan.exercises.length) {
    throw new Error('AI zwróciło niepoprawny plan — spróbuj ponownie')
  }

  // Twarda walidacja: liczba ćwiczeń musi się zgadzać ze strukturą
  if (plan.exercises.length !== td.expectedCount) {
    throw new Error(`AI zwróciło ${plan.exercises.length} ćwiczeń zamiast ${td.expectedCount} — spróbuj ponownie`)
  }

  // Normalizacja pola analysis (z planów AI gdy była historia) — UI to pokaże.
  if (Array.isArray(plan.analysis)) {
    plan.analysis = plan.analysis
      .filter((a: any) => a && typeof a.muscle === 'string' && ALLOWED_ANALYSIS_STATUS.includes(a.status))
      .map((a: any) => ({
        muscle: String(a.muscle).trim().slice(0, 40),
        status: a.status,
        note: typeof a.note === 'string' ? a.note.trim().slice(0, 120) : ''
      }))
  } else {
    plan.analysis = []
  }

  const allowedHeadsForType = MUSCLE_HEADS_BY_TYPE[type] || []
  for (const ex of plan.exercises) {
    if (!ex.name || typeof ex.sets !== 'number' || !ex.reps) {
      throw new Error('AI zwróciło ćwiczenie z brakującymi polami — spróbuj ponownie')
    }
    ex.name = translateExerciseName(ex.name)
    // Wymuszenie 3 serii dla redukcji — niezależnie od tego co AI zwróciło.
    // Plan Ani wyłączony: progresja idzie przez trudność/powtórzenia (2-3 serie), nie ciężar.
    if (goal === 'cut' && type !== 'ania') ex.sets = 3
    // Ćwiczenie z bazy → baza jest źródłem prawdy: kanoniczna nazwa + metadata
    // z bazy nadpisują to co zwróciło AI (AI może się mylić, baza nie).
    const dbEx = findExerciseByName(ex.name)
    if (dbEx) {
      ex.name = dbEx.name
      ex.primaryMuscle = dbEx.primaryMuscle
      ex.muscleHead = dbEx.muscleHead
      ex.exerciseType = dbEx.exerciseType
      ex.movementPattern = dbEx.movementPattern
    } else {
      // Miękka walidacja (ćwiczenie spoza bazy): spoza dozwolonych wartości → null
      if (!PRIMARY_MUSCLES.includes(ex.primaryMuscle)) ex.primaryMuscle = null
      if (!allowedHeadsForType.includes(ex.muscleHead)) ex.muscleHead = null
      if (!EXERCISE_TYPES.includes(ex.exerciseType)) ex.exerciseType = null
      if (!MOVEMENT_PATTERNS.includes(ex.movementPattern)) ex.movementPattern = null
    }
    // Normalizacja suggestedWeight — może przyjść jako string/null/undefined
    if (ex.suggestedWeight != null) {
      const w = Number(ex.suggestedWeight)
      ex.suggestedWeight = Number.isFinite(w) && w > 0 ? w : null
    } else {
      ex.suggestedWeight = null
    }
  }
  return plan as unknown as AIPlan
}

export async function generateAIPlan({
  type,
  goal,
  equipment = 'siłownia',
  avoid = '',
  recentSessions = [],
  equipmentTags,
  level,
  injuries,
  signal
}: GenerateAIPlanOptions): Promise<AIPlan> {
  // Sanityzacja: ucinamy do MAX_AVOID_LENGTH, usuwamy znaki nowej linii (które mogłyby
  // wstrzyknąć nowe "instrukcje" do prompta).
  const safeAvoid = String(avoid || '').replace(/[\r\n]+/g, ' ').slice(0, MAX_AVOID_LENGTH).trim()

  // Cache hit dla identycznego wejścia (chroni przed double-click). TTL 5 min.
  const cacheKey = planCacheKey({ type, goal, equipment, avoid: safeAvoid, recentSessions, equipmentTags, level, injuries })
  const cached = getCachedPlan(cacheKey)
  if (cached) return cached

  const prompt = buildPrompt({ type, goal, equipment, avoid: safeAvoid, recentSessions, equipmentTags, level, injuries })

  // 1 silent retry przy błędzie parse — czasem Claude zwraca tekst zaczynający się od ```json
  // lub pełen JSON z jednym brakiem; ponowna próba w 90% przypadków wystarcza.
  let text: string | undefined, plan: Record<string, unknown> | undefined
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      text = await callClaude({ prompt, maxTokens: 3000, signal })
      plan = parseClaudeJSON(text)
      break
    } catch (e: any) {
      if (e.name === 'AbortError') throw e
      if (attempt === 1) throw e
    }
  }

  const normalized = normalizePlan(plan!, { type, goal })
  setCachedPlan(cacheKey, normalized)
  return normalized
}
