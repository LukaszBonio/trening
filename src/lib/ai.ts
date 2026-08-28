// AI helper — calls Claude API via Cloudflare Worker proxy.
// Worker URL can be overridden by localStorage 'tp_proxy_url' for testing.

import { PRIMARY_TO_GROUP } from './workoutSchema'
import { chooseSplit, estimateWeeklyVolume } from './weeklyVolume'
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
  /** Stabilna część promptu (instrukcje/katalog) → trafia do `system`. */
  system?: string
  /** Gdy true, `system` wysyłany jest jako blok z `cache_control` (prompt caching). */
  cacheSystem?: boolean
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
  // Uwaga zapisana przez użytkownika na koniec treningu (tylko plany Ani) — zasila AI.
  note?: string
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
  // Ćwiczenia użyte w innych dniach programu — do wykluczenia (rotacja między dniami).
  excludeExercises?: string[]
  // Krótki opis kontekstu programu (dni/tydz, częstotliwość partii) — nudge objętości.
  programContext?: string
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

export async function callClaude({ prompt, system, cacheSystem = false, maxTokens = 2500, signal, timeoutMs = 60000 }: CallClaudeOptions): Promise<string> {
  const body: Record<string, unknown> = {
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }]
  }
  // system jako blok z cache_control → Anthropic prompt caching: stabilny prefiks
  // (instrukcje + katalog ćwiczeń) liczony raz i pobierany z cache przy powtórnych
  // generowaniach tej samej konfiguracji (TTL ~5 min). Bez cache — zwykły string.
  if (system) {
    body.system = cacheSystem
      ? [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }]
      : system
  }
  const data = await _postToProxy(body, signal, timeoutMs)
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
  legs:    ['quads', 'hamstrings', 'glutes', 'adductors', 'calves', 'abs', 'obliques', 'core', 'back_lower'],
  upper_a: ['chest_upper', 'chest_middle', 'chest_lower', 'shoulder_front', 'shoulder_side', 'shoulder_rear', 'back_lats', 'back_middle', 'back_upper', 'biceps_long', 'biceps_short', 'biceps_brach', 'triceps_long', 'triceps_lat', 'triceps_med', 'forearms'],
  upper_b: ['chest_upper', 'chest_middle', 'chest_lower', 'shoulder_front', 'shoulder_side', 'shoulder_rear', 'back_lats', 'back_middle', 'back_upper', 'biceps_long', 'biceps_short', 'biceps_brach', 'triceps_long', 'triceps_lat', 'triceps_med', 'forearms'],
  lower_a: ['quads', 'hamstrings', 'glutes', 'adductors', 'calves', 'abs', 'obliques', 'core', 'back_lower'],
  lower_b: ['quads', 'hamstrings', 'glutes', 'adductors', 'calves', 'abs', 'obliques', 'core', 'back_lower'],
  fbw_a:   ['chest_middle', 'chest_upper', 'back_lats', 'back_middle', 'shoulder_front', 'shoulder_side', 'shoulder_rear', 'quads', 'hamstrings', 'glutes', 'biceps_short', 'triceps_lat', 'abs', 'core'],
  fbw_b:   ['chest_middle', 'chest_upper', 'back_lats', 'back_middle', 'back_lower', 'shoulder_front', 'shoulder_side', 'quads', 'hamstrings', 'glutes', 'triceps_long', 'triceps_lat', 'abs', 'core'],
  fbw_c:   ['chest_middle', 'chest_upper', 'back_lats', 'back_middle', 'shoulder_front', 'shoulder_side', 'shoulder_rear', 'quads', 'hamstrings', 'glutes', 'biceps_short', 'calves', 'core'],
  // Arnold Split — dzień Klatka+Plecy oraz dzień Barki+Ramiona (Faza 3: nowa metoda z reguł).
  chest_back:     ['chest_upper', 'chest_middle', 'chest_lower', 'back_lats', 'back_middle', 'back_upper', 'back_lower'],
  shoulders_arms: ['shoulder_front', 'shoulder_side', 'shoulder_rear', 'biceps_long', 'biceps_short', 'biceps_brach', 'triceps_long', 'triceps_lat', 'triceps_med', 'forearms'],
  // Bro Split — pojedyncza partia dziennie (Klatka / Plecy / Barki / Ramiona; nogi = 'legs').
  day_chest:     ['chest_upper', 'chest_middle', 'chest_lower'],
  day_back:      ['back_lats', 'back_middle', 'back_upper', 'back_lower'],
  day_shoulders: ['shoulder_front', 'shoulder_side', 'shoulder_rear'],
  day_arms:      ['biceps_long', 'biceps_short', 'biceps_brach', 'triceps_long', 'triceps_lat', 'triceps_med', 'forearms'],
  // Torso / Limbs — Tułów (klatka+plecy+barki) oraz Kończyny (nogi+ramiona).
  torso:         ['chest_upper', 'chest_middle', 'chest_lower', 'back_lats', 'back_middle', 'back_upper', 'shoulder_front', 'shoulder_side', 'shoulder_rear'],
  limbs:         ['quads', 'hamstrings', 'glutes', 'calves', 'back_lower', 'biceps_long', 'biceps_short', 'biceps_brach', 'triceps_long', 'triceps_lat', 'triceps_med'],
  // Plan korekcyjny Ani — bez klatki/przednich barków/tricepsa/bicepsa (górna część minimalna).
  ania:    ['core', 'abs', 'obliques', 'glutes', 'adductors', 'hamstrings', 'quads', 'back_lats', 'back_middle', 'back_lower', 'back_upper', 'shoulder_rear', 'calves'],
  // Ania Dzień 1 — kręgosłup (głęboka stabilizacja lędźwi) + górne plecy + postawa/łopatki.
  ania_a:  ['core', 'abs', 'obliques', 'back_middle', 'back_lats', 'back_lower', 'back_upper', 'shoulder_rear'],
  // Ania Dzień 2 — core + pośladki + tylna taśma + stabilizacja kolana.
  ania_b:  ['core', 'abs', 'obliques', 'glutes', 'adductors', 'hamstrings', 'quads']
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
      'Nie wybieraj więcej niż 2 ćwiczeń o tej samej kombinacji muscleHead + movementPattern (np. trzech wariantów wyciskania poziomego na chest_middle). Różne głowy tego samego wzorca są dozwolone.'
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
      'Nie wybieraj więcej niż 2 ćwiczeń o tej samej kombinacji muscleHead + movementPattern (np. trzech wariantów wyciskania poziomego na chest_middle). Różne głowy tego samego wzorca są dozwolone.'
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
      'Nie wybieraj więcej niż 2 ćwiczeń o tej samej kombinacji muscleHead + movementPattern (np. trzech wariantów wyciskania poziomego na chest_middle). Różne głowy tego samego wzorca są dozwolone.'
    ]
  },
  upper_a: {
    label: 'UPPER A',
    expectedCount: 7,
    structure: `Zbalansowany push/pull (kolejność musi być zachowana):
1. KLATKA — wyciskanie poziome (muscleHead: "chest_middle", compound): sztanga lub hantle, ławka pozioma.
2. PLECY — ciąg pionowy (muscleHead: "back_lats", compound): podciąganie lub ściąganie drążka wyciągu górnego.
3. BARK — wyciskanie nad głowę (muscleHead: "shoulder_front", compound): OHP / wyciskanie hantli nad głowę / Arnold.
4. PLECY — wiosłowanie poziome (muscleHead: "back_middle", compound): wiosłowanie sztangą/hantlą/na maszynie.
5. BARK BOCZNY (muscleHead: "shoulder_side", isolation): wznosy bokiem — szerokość barków.
6. BICEPS (muscleHead: "biceps_short" lub "biceps_long", isolation): uginanie ze sztangą/hantlami.
7. TRICEPS (muscleHead: "triceps_long" lub "triceps_lat", isolation): pushdown / francuskie / wąski chwyt.`,
    selection: [
      'Pozycje 1-4 muszą być compound. Pozycje 5-7 to izolacja.',
      'Zachowaj balans push/pull (2 klatka+bark pchający : 2 plecy) i łącz ruchy poziome z pionowymi.',
      'Nie twórz planu wyłącznie na maszynach — pierwsze wyciskanie i wiosłowanie ze sztangą lub hantlami.',
      'Nie wybieraj więcej niż 2 ćwiczeń o tej samej kombinacji muscleHead + movementPattern (np. trzech wariantów wyciskania poziomego na chest_middle). Różne głowy tego samego wzorca są dozwolone.'
    ]
  },
  upper_b: {
    label: 'UPPER B',
    expectedCount: 7,
    structure: `Wariant objętościowy z akcentem na skos i tylny bark (kolejność zachowana, inne ćwiczenia niż Upper A):
1. KLATKA GÓRNA — skos dodatni (muscleHead: "chest_upper", compound): wyciskanie skośne sztangą/hantlami.
2. PLECY — wiosłowanie poziome (muscleHead: "back_middle", compound).
3. KLATKA ISOLATION (muscleHead: dowolny "chest_*", isolation): rozpiętki / cable crossover.
4. PLECY — ciąg pionowy (muscleHead: "back_lats", compound): podciąganie / ściąganie drążka.
5. BARK TYLNY (muscleHead: "shoulder_rear", isolation): face pull / odwrotne rozpiętki — priorytet, brak go na Upper A.
6. BICEPS (muscleHead: "biceps_long" lub "biceps_brach", isolation): uginanie na skosie / młotkowe.
7. TRICEPS (muscleHead: "triceps_long" lub "triceps_lat", isolation).`,
    selection: [
      'Pozycje 1, 2, 4 muszą być compound. Pozycje 3, 5, 6, 7 to izolacja.',
      'Wybieraj warianty z większą objętością (8-15 powt).',
      'OBOWIĄZKOWO uwzględnij tylny bark (shoulder_rear) — dopełnia Upper A, który go nie ma.',
      'Nie wybieraj więcej niż 2 ćwiczeń o tej samej kombinacji muscleHead + movementPattern (np. trzech wariantów wyciskania poziomego na chest_middle). Różne głowy tego samego wzorca są dozwolone.'
    ]
  },
  lower_a: {
    label: 'LOWER A',
    expectedCount: 6,
    structure: `Priorytet czworogłowy (kolejność zachowana):
1. PRZYSIAD (muscleHead: "quads", compound): przysiad ze sztangą / przedni / hack / suwnica.
2. HIP HINGE (muscleHead: "back_lower" lub "hamstrings", compound): martwy ciąg rumuński (RDL).
3. JEDNOSTRONNE (muscleHead: "quads", compound): wykroki / przysiad bułgarski / wchodzenie na skrzynię — praca jednonóż (stabilizacja, pośladki, przywodziciele).
4. HAMSTRING (muscleHead: "hamstrings", isolation): uginanie nóg leżąc/siedząc / nordic.
5. ŁYDKI (muscleHead: "calves", isolation): wspięcia na palce.
6. CORE (muscleHead: "core" lub "abs", isolation): deska / brzuszki / unoszenie nóg.`,
    selection: [
      'Pozycja 1 to przysiad, pozycja 2 to hip hinge (RDL/martwy ciąg) — obie compound.',
      'Pozycja 3 MUSI być ruchem jednostronnym (jednonóż) — wykroki, przysiad bułgarski lub wchodzenie na skrzynię.',
      'Zachowaj balans przód/tył uda.',
      'Nie wybieraj więcej niż 2 ćwiczeń o tej samej kombinacji muscleHead + movementPattern (np. trzech wariantów wyciskania poziomego na chest_middle). Różne głowy tego samego wzorca są dozwolone.'
    ]
  },
  lower_b: {
    label: 'LOWER B',
    expectedCount: 6,
    structure: `Priorytet hip hinge / tylna taśma (kolejność zachowana, inne ćwiczenia niż Lower A):
1. MARTWY CIĄG / HIP HINGE (muscleHead: "back_lower", compound): martwy ciąg klasyczny / rumuński / sumo.
2. POŚLADKI (muscleHead: "glutes", compound): hip thrust / most biodrowy ze sztangą.
3. CZWOROGŁOWY (muscleHead: "quads", compound): przysiad przedni / leg press / hack.
4. HAMSTRING (muscleHead: "hamstrings", isolation): uginanie nóg / glute ham raise.
5. ŁYDKI (muscleHead: "calves", isolation).
6. CORE (muscleHead: "core" lub "abs", isolation).`,
    selection: [
      'Pozycja 1 to martwy ciąg / hip hinge, pozycja 2 to akcent na pośladki — obie compound.',
      'Zachowaj balans przód/tył uda z przewagą tylnej taśmy.',
      'Łącz ruchy obustronne i jednostronne.',
      'Nie wybieraj więcej niż 2 ćwiczeń o tej samej kombinacji muscleHead + movementPattern (np. trzech wariantów wyciskania poziomego na chest_middle). Różne głowy tego samego wzorca są dozwolone.'
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
  // Arnold Split — dzień KLATKA + PLECY.
  chest_back: {
    label: 'ARNOLD — KLATKA + PLECY',
    expectedCount: 8,
    structure: `Naprzemiennie klatka/plecy (kolejność zachowana, balans 4:4):
1. KLATKA — wyciskanie poziome (muscleHead: "chest_middle", compound).
2. PLECY — wiosłowanie poziome (muscleHead: "back_middle", compound).
3. KLATKA GÓRNA — skos dodatni (muscleHead: "chest_upper", compound).
4. PLECY — ciąg pionowy (muscleHead: "back_lats", compound): podciąganie / ściąganie drążka.
5. KLATKA ISOLATION (muscleHead: dowolny "chest_*", isolation): rozpiętki / cable crossover.
6. PLECY — drugi ciąg (muscleHead: "back_lats" lub "back_middle", compound): inny wzorzec niż poz. 2 i 4.
7. KLATKA DOLNA / pełne rozciągnięcie (muscleHead: "chest_lower", isolation lub compound): dip / high cable crossover.
8. PLECY — najszersze / kaptur (muscleHead: "back_upper" lub "back_lats", isolation): pullover / ściąganie na prostych ramionach / wzruszenia.`,
    selection: [
      'Pozycje 1-4 muszą być compound. Balans klatka:plecy dokładnie 4:4.',
      'Łącz wzorce poziome i pionowe zarówno dla klatki, jak i pleców.',
      'Nie twórz planu wyłącznie na maszynach — pierwsze wyciskanie i wiosłowanie ze sztangą lub hantlami.',
      'Nie wybieraj więcej niż 2 ćwiczeń o tej samej kombinacji muscleHead + movementPattern (np. trzech wariantów wyciskania poziomego na chest_middle). Różne głowy tego samego wzorca są dozwolone.'
    ]
  },
  // Arnold Split — dzień BARKI + RAMIONA.
  shoulders_arms: {
    label: 'ARNOLD — BARKI + RAMIONA',
    expectedCount: 7,
    structure: `Barki + ramiona (kolejność zachowana):
1. BARK — wyciskanie nad głowę (muscleHead: "shoulder_front", compound): OHP / hantle / Arnold press.
2. BARK BOCZNY (muscleHead: "shoulder_side", isolation): wznosy bokiem — szerokość barków.
3. BARK TYLNY (muscleHead: "shoulder_rear", isolation): face pull / odwrotne rozpiętki.
4. BICEPS (muscleHead: "biceps_short" lub "biceps_long", isolation): uginanie ze sztangą/hantlami.
5. TRICEPS (muscleHead: "triceps_long", isolation): overhead / francuskie wyciskanie.
6. BICEPS (muscleHead: "biceps_long" lub "biceps_brach", isolation): inny kąt/chwyt niż poz. 4 (skos / młotkowe).
7. TRICEPS (muscleHead: "triceps_lat", isolation): pushdown / wąski chwyt.`,
    selection: [
      'Pozycja 1 to compound (wyciskanie nad głowę); pozostałe to izolacja.',
      'Biceps i triceps mają po dwa RÓŻNE warianty (inny kąt/chwyt).',
      'Bark boczny i tylny obowiązkowo — dopełniają barki po dniu wyciskań.',
      'Nie wybieraj więcej niż 2 ćwiczeń o tej samej kombinacji muscleHead + movementPattern (np. trzech wariantów wyciskania poziomego na chest_middle). Różne głowy tego samego wzorca są dozwolone.'
    ]
  },
  // Bro Split — dzień KLATKA.
  day_chest: {
    label: 'KLATKA',
    expectedCount: 5,
    structure: `Cała klatka, wszystkie kąty (kolejność zachowana):
1. WYCISKANIE POZIOME (muscleHead: "chest_middle", compound): sztanga lub hantle.
2. WYCISKANIE SKOŚNE dodatnie (muscleHead: "chest_upper", compound).
3. KLATKA DOLNA (muscleHead: "chest_lower", compound): dip / ławka ujemna.
4. ROZPIĘTKI / rozciągnięcie (muscleHead: dowolny "chest_*", isolation): rozpiętki / cable crossover.
5. DRUGA ISOLATION pod innym kątem (muscleHead: dowolny "chest_*", isolation): np. high/low cable crossover.`,
    selection: [
      'Pozycje 1-3 muszą być compound, pod różnymi kątami (poziom, skos, dół).',
      'Pierwsze wyciskanie ze sztangą lub hantlami (nie maszyna).',
      'Nie wybieraj więcej niż 2 ćwiczeń o tej samej kombinacji muscleHead + movementPattern (np. trzech wariantów wyciskania poziomego na chest_middle). Różne głowy tego samego wzorca są dozwolone.'
    ]
  },
  // Bro Split — dzień PLECY.
  day_back: {
    label: 'PLECY',
    expectedCount: 6,
    structure: `Kompletne plecy (kolejność zachowana):
1. CIĄG CIĘŻKI (muscleHead: "back_lower" lub "back_middle", compound): martwy ciąg lub ciężkie wiosłowanie sztangą.
2. CIĄG PIONOWY (muscleHead: "back_lats", compound): podciąganie / ściąganie drążka.
3. WIOSŁOWANIE POZIOME (muscleHead: "back_middle", compound): inny wariant niż poz. 1.
4. DRUGI CIĄG PIONOWY/POZIOMY (muscleHead: "back_lats" lub "back_middle", compound): inny chwyt/kąt.
5. NAJSZERSZE ISOLATION (muscleHead: "back_lats", isolation): ściąganie na prostych ramionach / pullover.
6. KAPTUR / GÓRNY GRZBIET (muscleHead: "back_upper", isolation): wzruszenia barków.`,
    selection: [
      'Pozycje 1-4 muszą być compound; łącz ciągi pionowe i poziome.',
      'Co najmniej 2 różne wzorce ciągnięcia (pion + poziom).',
      'Nie wybieraj więcej niż 2 ćwiczeń o tej samej kombinacji muscleHead + movementPattern (np. trzech wariantów wyciskania poziomego na chest_middle). Różne głowy tego samego wzorca są dozwolone.'
    ]
  },
  // Bro Split — dzień BARKI.
  day_shoulders: {
    label: 'BARKI',
    expectedCount: 5,
    structure: `Wszystkie aktony barków (kolejność zachowana):
1. WYCISKANIE NAD GŁOWĘ (muscleHead: "shoulder_front", compound): OHP / hantle / Arnold press.
2. BARK BOCZNY (muscleHead: "shoulder_side", isolation): wznosy bokiem.
3. BARK TYLNY (muscleHead: "shoulder_rear", isolation): face pull / odwrotne rozpiętki.
4. DRUGI BARK BOCZNY pod innym kątem (muscleHead: "shoulder_side", isolation): wyciąg / maszyna / wiosłowanie pod brodę.
5. DRUGI BARK TYLNY lub kaptur (muscleHead: "shoulder_rear", isolation).`,
    selection: [
      'Pozycja 1 to compound; reszta izolacja z akcentem na bok i tył (szerokość + postawa).',
      'Bok i tył po dwa warianty — najczęściej zaniedbane aktony.',
      'Nie wybieraj więcej niż 2 ćwiczeń o tej samej kombinacji muscleHead + movementPattern (np. trzech wariantów wyciskania poziomego na chest_middle). Różne głowy tego samego wzorca są dozwolone.'
    ]
  },
  // Bro Split — dzień RAMIONA.
  day_arms: {
    label: 'RAMIONA',
    expectedCount: 6,
    structure: `Biceps + triceps naprzemiennie (kolejność zachowana, balans 3:3):
1. BICEPS baza (muscleHead: "biceps_short", isolation): uginanie ze sztangą.
2. TRICEPS baza (muscleHead: "triceps_long", isolation): francuskie / overhead / wyciskanie wąskim.
3. BICEPS drugi kąt (muscleHead: "biceps_long", isolation): uginanie na skosie / modlitewnik.
4. TRICEPS drugi kąt (muscleHead: "triceps_lat", isolation): pushdown.
5. BICEPS / ramienny (muscleHead: "biceps_brach", isolation): hammer curl.
6. TRICEPS wykończenie lub PRZEDRAMIĘ (muscleHead: "triceps_lat" lub "forearms", isolation).`,
    selection: [
      'Balans biceps:triceps dokładnie 3:3; każdy pod różnymi kątami.',
      'Łącz warianty ze sztangą, hantlami i wyciągiem.',
      'Nie wybieraj więcej niż 2 ćwiczeń o tej samej kombinacji muscleHead + movementPattern (np. trzech wariantów wyciskania poziomego na chest_middle). Różne głowy tego samego wzorca są dozwolone.'
    ]
  },
  // Torso / Limbs — dzień TUŁÓW (klatka + plecy + barki).
  torso: {
    label: 'TUŁÓW',
    expectedCount: 8,
    structure: `Cała góra: klatka + plecy + barki (kolejność zachowana):
1. KLATKA — wyciskanie poziome (muscleHead: "chest_middle", compound).
2. PLECY — wiosłowanie poziome (muscleHead: "back_middle", compound).
3. KLATKA GÓRNA — skos (muscleHead: "chest_upper", compound).
4. PLECY — ciąg pionowy (muscleHead: "back_lats", compound): podciąganie / ściąganie.
5. BARK — wyciskanie nad głowę (muscleHead: "shoulder_front", compound).
6. KLATKA ISOLATION (muscleHead: dowolny "chest_*", isolation).
7. BARK BOCZNY (muscleHead: "shoulder_side", isolation).
8. BARK TYLNY (muscleHead: "shoulder_rear", isolation).`,
    selection: [
      'Pozycje 1-5 muszą być compound; balans push/pull na górze.',
      'Łącz wzorce poziome i pionowe dla klatki i pleców.',
      'Nie wybieraj więcej niż 2 ćwiczeń o tej samej kombinacji muscleHead + movementPattern (np. trzech wariantów wyciskania poziomego na chest_middle). Różne głowy tego samego wzorca są dozwolone.'
    ]
  },
  // Torso / Limbs — dzień KOŃCZYNY (nogi + ramiona).
  limbs: {
    label: 'KOŃCZYNY',
    expectedCount: 8,
    structure: `Nogi + ramiona (kolejność zachowana):
1. PRZYSIAD (muscleHead: "quads", compound).
2. HIP HINGE (muscleHead: "back_lower" lub "hamstrings", compound): RDL / martwy ciąg.
3. CZWOROGŁOWY accessory (muscleHead: "quads"): leg press / wykroki.
4. HAMSTRING (muscleHead: "hamstrings", isolation): uginanie nóg.
5. BICEPS (muscleHead: "biceps_short" lub "biceps_long", isolation).
6. TRICEPS (muscleHead: "triceps_long" lub "triceps_lat", isolation).
7. ŁYDKI (muscleHead: "calves", isolation).
8. BICEPS lub TRICEPS drugi wariant (muscleHead: "biceps_brach" lub "triceps_lat", isolation).`,
    selection: [
      'Pozycje 1-3 to nogi compound (przysiad + hinge + accessory).',
      'Ramiona: po jednym-dwa biceps/triceps; łydki obowiązkowo.',
      'Nie wybieraj więcej niż 2 ćwiczeń o tej samej kombinacji muscleHead + movementPattern (np. trzech wariantów wyciskania poziomego na chest_middle). Różne głowy tego samego wzorca są dozwolone.'
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
  },
  // Ania — Dzień 1: kręgosłup lędźwiowy (głęboka stabilizacja) + górne plecy + postawa.
  ania_a: {
    label: 'ANIA — DZIEŃ 1: KRĘGOSŁUP I POSTAWA',
    expectedCount: 5,
    structure: '2× głęboka stabilizacja lędźwi/core + 2× górne plecy (wiosłowanie/ściąganie) + 1× łopatki/tylne barki/postawa',
    selection: [
      'Priorytet: głębokie stabilizatory kręgosłupa lędźwiowego (bez obciążonego zginania/wyprostu lędźwi).',
      'Górne plecy i łopatki — korekcja zaokrąglonych ramion i wysuniętej głowy.',
      'Kręgosłup neutralny, bez osiowego obciążania.'
    ]
  },
  // Ania — Dzień 2: core + pośladki + tylna taśma + stabilizacja kolana.
  ania_b: {
    label: 'ANIA — DZIEŃ 2: CORE I POŚLADKI',
    expectedCount: 5,
    structure: '2× core (aktywacja + izometria) + 2× pośladki (wyprost bioder + odwodzenie) + 1× tylna taśma',
    selection: [
      'Priorytet: wzmocnienie core i pośladków przy neutralnym kręgosłupie.',
      'Kolano (MCL) bez koślawości, rotacji i głębokiego zgięcia pod obciążeniem.',
      'Bez osiowego obciążania kręgosłupa.'
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
      // movementPattern podawany surową wartością enum — dokładnie w formie, jakiej
      // model ma użyć w polu "movementPattern" JSON-a. Sloty struktury opisane są
      // wzorcem („ciąg pionowy"), więc bez tego model musiałby zgadywać z nazwy.
      lines.push(`- ${ex.name} (${EQUIPMENT_LABEL[ex.equipment]}, ${ex.exerciseType}, ${ex.movementPattern})`)
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
  // Generator programu: ćwiczenia z innych dni (rotacja) + kontekst tygodnia.
  excludeExercises?: string[]
  programContext?: string
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
// DZIEŃ 1 — Kręgosłup lędźwiowy (głęboka stabilizacja) + górne plecy + postawa/łopatki.
const ANIA_A_SLOTS: AniaSlot[] = [
  {
    title: 'Głęboka stabilizacja lędźwi (anti-extension, kręgosłup neutralny)',
    primaryMuscle: 'core', muscleHead: 'core', exerciseType: 'isolation', movementPattern: 'core',
    options: [
      { name: 'Martwy robak', equip: 'masa_ciala', level: 'baza' },
      { name: 'Martwy robak z wyprostem nogi', equip: 'masa_ciala', level: 'progresja' },
      { name: 'Ptak-pies', equip: 'masa_ciala', level: 'anty-rotacja' }
    ]
  },
  {
    title: 'Izometria tułowia (stabilizacja anty-rotacyjna/boczna)',
    primaryMuscle: 'core', muscleHead: 'core', exerciseType: 'isolation', movementPattern: 'core',
    options: [
      { name: 'Deska', equip: 'masa_ciala', level: 'izometria' },
      { name: 'Deska bokiem', equip: 'masa_ciala', level: 'progresja (skolioza/skośne)' },
      { name: 'Pallof press', equip: 'guma', level: 'anty-rotacja z oporem' }
    ]
  },
  {
    title: 'Górne plecy — wiosłowanie (retrakcja łopatek)',
    primaryMuscle: 'back', muscleHead: 'back_middle', exerciseType: 'compound', movementPattern: 'horizontal_pull',
    options: [
      { name: 'Wiosłowanie australijskie', equip: 'masa_ciala', level: 'baza (masa ciała)' },
      { name: 'Wiosłowanie z gumą', equip: 'guma', level: 'z oporem' },
      { name: 'Wiosłowanie hantlą w podparciu', equip: 'hantle', level: 'wariant z hantlami' },
      { name: 'Wiosłowanie na maszynie', equip: 'maszyna', level: 'wariant na siłowni' }
    ]
  },
  {
    title: 'Najszersze / ściąganie łopatek w dół',
    primaryMuscle: 'back', muscleHead: 'back_upper', exerciseType: 'compound', movementPattern: 'vertical_pull',
    options: [
      { name: 'Wznosy T-Y-W leżąc', equip: 'masa_ciala', level: 'baza (postawa)' },
      { name: 'Ściąganie drążka wyciągu górnego', equip: 'maszyna', level: 'wariant na siłowni' }
    ]
  },
  {
    title: 'Tylne barki + korekcja zaokrąglonych ramion i ustawienia głowy',
    primaryMuscle: 'rear_shoulders', muscleHead: 'shoulder_rear', exerciseType: 'isolation', movementPattern: 'shoulder_isolation',
    options: [
      { name: 'Wall angels', equip: 'masa_ciala', level: 'korekcja głowy/łopatek' },
      { name: 'Band pull-apart', equip: 'guma', level: 'baza z gumą' },
      { name: 'Wznosy hantli w opadzie', equip: 'hantle', level: 'wariant z hantlami' },
      { name: 'Face pull', equip: 'maszyna', level: 'wariant na siłowni' }
    ]
  }
]

// DZIEŃ 2 — Core + pośladki + tylna taśma + stabilizacja kolana.
const ANIA_B_SLOTS: AniaSlot[] = [
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
  }
]

// Menu per dzień. buildAniaPrompt wybiera zestaw wg typu (ania_a / ania_b).
// Legacy 'ania' → Dzień 2 (najbliższy dawnemu profilowi core/pośladki), ale UI już
// nie tworzy planów tego typu (istnieje tylko dla starych rekordów historii).
const ANIA_DAYS: Record<string, { title: string; slots: AniaSlot[] }> = {
  ania_a: { title: 'Dzień 1 — Kręgosłup i postawa', slots: ANIA_A_SLOTS },
  ania_b: { title: 'Dzień 2 — Core i pośladki', slots: ANIA_B_SLOTS },
  ania:   { title: 'Core i pośladki', slots: ANIA_B_SLOTS }
}

// Dedykowany builder promptu dla planu Ani. Reużywa formatSessionCompact + reguł pól,
// ale z profilem korekcyjnym, przeciwwskazaniami i progresją przez trudność (nie ciężar).
// Eksportowane dla testów.
export function buildAniaPrompt({ type, equipmentTags, avoid, recentSessions }: BuildPromptOptions): string {
  // Masa ciała zawsze dostępna (baza). Reszta wg zaznaczenia usera.
  const selected = new Set<AniaEquip>(['masa_ciala'])
  for (const t of (equipmentTags || [])) {
    if (t === 'guma' || t === 'hantle' || t === 'maszyna') selected.add(t)
  }
  const equipSummary = [...selected].map(t => ANIA_EQUIP_LABEL[t]).join(', ')
  const hasHistory = recentSessions.length > 0
  const day = ANIA_DAYS[type] || ANIA_DAYS.ania_b
  const slots = day.slots
  const td = TYPE_DETAILS[type] || TYPE_DETAILS.ania
  const parts: string[] = []

  parts.push(`Jesteś trenerem personalnym specjalizującym się w treningu korekcyjnym i pracy z osobami początkującymi ze schorzeniami kręgosłupa i stawów. Ułóż BEZPIECZNY, korekcyjno-wzmacniający plan treningowy dla konkretnej osoby (Ania). To ${day.title} w dwudniowym podziale. Dostępny sprzęt: ${equipSummary}.`)

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
  slots.forEach((slot, i) => {
    const shown = slot.options.filter(o => selected.has(o.equip))
    const optText = shown.map(o => `"${o.name}" (${ANIA_EQUIP_LABEL[o.equip]}, ${o.level})`).join('; ')
    menuLines.push(`SLOT ${i + 1} — ${slot.title}\n  primaryMuscle: "${slot.primaryMuscle}", muscleHead: "${slot.muscleHead}", exerciseType: "${slot.exerciseType}", movementPattern: "${slot.movementPattern}"\n  Wybierz 1 z: ${optText}`)
  })
  parts.push(`MENU ĆWICZEŃ — wybierz DOKŁADNIE JEDNO ćwiczenie dla każdego z ${td.expectedCount} slotów (kolejność zachowana). Używaj nazw DOKŁADNIE jak w menu oraz podanych wartości primaryMuscle/muscleHead/exerciseType/movementPattern dla danego slotu:\n${menuLines.join('\n')}`)

  if (avoid && avoid.trim()) {
    parts.push(`DODATKOWO UNIKAJ: ${avoid.trim()}`)
  }

  // Uwagi zapisane przez użytkownika na koniec poprzednich treningów Ani — AI ma je
  // uwzględnić przy doborze wariantu i bezpieczeństwie (np. ból → łatwiejszy wariant).
  const noteLines = recentSessions
    .filter(s => typeof s.note === 'string' && s.note.trim())
    .map(s => {
      const d = new Date(s.date)
      const label = Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10) + ': '
      return `- ${label}${s.note!.trim()}`
    })
  if (noteLines.length) {
    parts.push(`UWAGI UŻYTKOWNIKA z ostatnich treningów (traktuj priorytetowo — dostosuj dobór/trudność, zachowaj bezpieczeństwo):\n${noteLines.join('\n')}`)
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
2. PROGRESJA:
   - Ćwiczenia z masą ciała/gumą → progresuj TRUDNOŚCIĄ: więcej powtórzeń w zakresie, dłuższy czas izometrii, LUB trudniejszy wariant z menu (np. "Most biodrowy" → "Most biodrowy jednonóż", "Martwy robak" → "Martwy robak z wyprostem nogi").
   - Ćwiczenia OBCIĄŻONE (hantle/maszyna: Hip thrust, Odwodzenie nóg na maszynie, Uginanie nóg, Wiosłowanie na maszynie/hantlą, Face pull) → progresuj CIĘŻAREM: przy komfortowym wykonaniu górnego zakresu podnieś obciążenie o mały krok. Aplikacja i tak podpowie ciężar z historii — Ty ustaw sensowny punkt startowy.
   - stagnation → zmień wariant w obrębie slotu na inny bodziec.
   - overreaching → cofnij do łatwiejszego/lżejszego wariantu i zmniejsz objętość.
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
      "suggestedWeight": LICZBA_LUB_NULL
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
- "suggestedWeight": dla wariantów OBCIĄŻONYCH (hantle/maszyna) podaj lekki ciężar startowy w kg (liczba); dla masy ciała/gumy zawsze null.
- "tip": max 60 znaków, kluczowa wskazówka bezpieczeństwa/techniki (np. "Kręgosłup neutralny, napnij brzuch").
- Ten plan to trening wzmacniająco-korekcyjny, nie terapia medyczna. Priorytetem jest bezpieczeństwo.`)

  return parts.join('\n\n')
}

// Zwraca prompt rozbity na `system` (stabilny prefiks: kontekst + struktura + katalog
// + schemat JSON + reguły — zależy TYLKO od konfiguracji, nie od historii → cache'owalny)
// oraz `user` (dynamika: różnorodność, historia, analiza, avoid, progresja).
export function buildPrompt(opts: BuildPromptOptions): { system: string; user: string } {
  if (opts.type.startsWith('ania')) return { system: '', user: buildAniaPrompt(opts) }
  const { type, goal, equipment, avoid, recentSessions } = opts
  const td = TYPE_DETAILS[type] || TYPE_DETAILS.push
  const goalDesc = GOAL_HINTS[goal] || GOAL_HINTS.mass
  const hasHistory = recentSessions.length > 0

  const catalog = buildExerciseCatalog(type, equipment, goal, opts.level, opts.injuries)
  const allowedHeads = MUSCLE_HEADS_BY_TYPE[type] || []

  // ===== SYSTEM — stabilne dla danej konfiguracji (type/equipment/goal/level/injuries) =====
  const sys: string[] = []

  sys.push(`Jesteś doświadczonym trenerem siłowym. Wygeneruj plan treningowy typu ${td.label} dla osoby trenującej w ${equipment}.`)
  sys.push(`Cel: ${goalDesc}`)
  sys.push(`Struktura:\n${td.structure}`)

  if (catalog) sys.push(catalog.text)

  // Reguły doboru + fallback. Przy samej masie ciała reguły typu „pierwsze wyciskanie
  // ze sztangą lub hantlami" są NIEWYKONALNE (katalog ma wtedy wyłącznie własna_waga),
  // więc jawnie je unieważniamy — inaczej model dostaje sprzeczne polecenie.
  const allowedEq = EQUIPMENT_ACCESS[equipment] || ALL_EQUIPMENT
  const onlyBodyweight = allowedEq.length === 1 && allowedEq[0] === 'własna_waga'

  const selectionRules = [
    ...td.selection.map((s: string) => `- ${s}`),
    '- Nie duplikuj tego samego ćwiczenia w planie.',
    '- Jeżeli dla danej pozycji brak ćwiczenia spełniającego wymagany sprzęt, wybierz odpowiednik zachowujący ten sam movementPattern i muscleHead — NIE zastępuj go innym wzorcem ruchowym (np. brak ciągu pionowego nie uzasadnia drugiego wiosłowania).'
  ]
  if (onlyBodyweight) {
    selectionRules.push('- SPRZĘT: dostępna jest WYŁĄCZNIE masa ciała. Reguły powyżej wymagające sztangi, hantli, maszyn lub wyciągu NIE OBOWIĄZUJĄ — zamiast nich wybierz najtrudniejszy sensowny wariant z masą ciała, zachowując wymagany wzorzec ruchowy.')
  }

  sys.push(`DOBÓR ĆWICZEŃ:\n${selectionRules.join('\n')}`)

  sys.push(`Zwróć WYŁĄCZNIE poprawny JSON w formacie (bez markdown, bez komentarzy):
{
  "name": "krótka nazwa planu (max 40 znaków, po polsku)",
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

  sys.push(`KRYTYCZNE:
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

  sys.push(`WAŻNE:
- Wszystkie pola są wymagane.
${setsRule}
- "reps" musi być stringiem z zakresem ('6-8', '10-12', '12-15').
- RÓŻNICUJ "reps"${goal === 'cut' ? '' : ' i "sets"'} wg charakteru ćwiczenia — NIE przypisuj tej samej wartości wszystkim pozycjom. Wewnątrz widełek celu:
  • ciężkie wielostawowe (compound, pozycje otwierające: przysiad, martwy ciąg, wyciskanie, wiosłowanie) → DOLNA część zakresu powtórzeń${goal === 'cut' ? '' : ', więcej serii'};
  • izolacja i małe partie (wznosy bokiem, uginanie ramion, łydki, core) → GÓRNA część zakresu${goal === 'cut' ? '' : ', mniej serii'};
  • ćwiczenia izometryczne (deska, Copenhagen plank, Pallof press) → "reps" jako czas ('30-45s'), nie liczba powtórzeń.
${nameRule}
- "primaryMuscle" musi być jedną z: ${PRIMARY_MUSCLES.map((m: string) => `"${m}"`).join(', ')}.
- "muscleHead" musi być jedną z (dozwolone dla typu ${td.label}): ${allowedHeads.map((h: string) => `"${h}"`).join(', ')}.
- "exerciseType" musi być jedną z: ${EXERCISE_TYPES.map((t: string) => `"${t}"`).join(', ')}.
- "movementPattern" musi być jedną z: ${MOVEMENT_PATTERNS.map((p: string) => `"${p}"`).join(', ')}.
- "suggestedWeight" musi być liczbą (w kg) lub null.
- Liczba ćwiczeń musi być DOKŁADNIE ${td.expectedCount} — nie pomijaj i nie dodawaj ćwiczeń.
- Wybieraj wyłącznie ćwiczenia możliwe do wykonania przy dostępnym sprzęcie — nie proponuj maszyn ani wyciągów, jeśli sprzęt to "dom z hantlami" lub "dom bez sprzętu (calisthenics)".
- Tip ma być krótki i praktyczny.`)

  // ===== USER — dynamiczne (historia/avoid/progresja) =====
  const usr: string[] = []

  usr.push('Wygeneruj teraz plan zgodnie z powyższymi zasadami i strukturą.')

  // Kontekst programu (dni/tydz, częstotliwość partii) — nudge doboru liczby serii.
  if (opts.programContext) {
    usr.push(`KONTEKST PROGRAMU: ${opts.programContext}`)
  }

  // Rotacja między dniami programu — nie powtarzaj ćwiczeń z innych dni.
  if (opts.excludeExercises && opts.excludeExercises.length) {
    usr.push(`NIE UŻYWAJ tych ćwiczeń (są już w innych dniach tego programu — zadbaj o różnorodność, wybierz inne warianty tej samej partii): ${opts.excludeExercises.join(', ')}.`)
  }

  if (hasHistory) {
    usr.push(`RÓŻNORODNOŚĆ:
- Nie wybieraj identycznego zestawu ćwiczeń przy każdym generowaniu.
- Zachowaj strukturę planu, ale rotuj ćwiczenia pomiędzy równoważnymi wariantami.
- Preferuj ćwiczenia, które nie występowały w ostatnich ${recentSessions.length} treningach tego typu.
- Dopuszczalne jest powtórzenie głównego ćwiczenia bazowego, jeśli jest uzasadnione historią progresji.`)
  }

  if (avoid && avoid.trim()) {
    usr.push(`UNIKAJ: ${avoid.trim()}`)
  }

  if (hasHistory) {
    usr.push(`OSTATNIE SESJE (${recentSessions.length}) — kompaktowo, weight x reps:
${recentSessions.map(formatSessionCompact).join('\n\n')}`)

    // ANALIZA per partia — AI ocenia status każdej partii z historii i dobiera
    // ćwiczenia strategicznie. Zwraca wynik w polu "analysis" — UI pokazuje to userowi.
    usr.push(`ANALIZA HISTORII — przeprowadź ją i ZWRÓĆ wynik w polu "analysis" w JSON:
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

    usr.push(`DODATKOWO: w zwracanym JSON dołącz pole "analysis" na najwyższym poziomie (obok "name" i "exercises"), w formacie:
"analysis": [
  { "muscle": "nazwa partii po polsku (np. klatka, barki, triceps)", "status": "progress|stagnation|overreaching|weakly_covered", "note": "krótkie uzasadnienie (max 80 znaków, np. 'Wyciskanie sztangi stoi 2 sesje — zmieniam na hantle')" }
]`)
  }

  usr.push(`ZASADY PROGRESJI:
${hasHistory
  ? `- Dla ćwiczeń obecnych w historii analizuj ostatnie wykonania.
- Jeśli wszystkie serie osiągnęły górną granicę zakresu powtórzeń, zwiększ ciężar o 2.5-5%.
- Jeśli większość serii była w środku zakresu, pozostaw ciężar bez zmian.
- Jeśli użytkownik nie osiągnął dolnej granicy zakresu, zmniejsz ciężar o 2.5-5%.
- Zwracaj realistyczne wartości dla danego ćwiczenia.
- Dla nowych ćwiczeń (brak w historii) ustaw "suggestedWeight": null.`
  : `- Brak historii treningowej — dla każdego ćwiczenia ustaw "suggestedWeight": null.`}`)

  return { system: sys.join('\n\n'), user: usr.join('\n\n') }
}

// Cap długości user-input "avoid" — chroni przed nadużyciem promptu (kosztem tokenów)
// i prostym prompt injection (długie wpisy mogą próbować nadpisywać instrukcje).
const MAX_AVOID_LENGTH = 200

// In-memory cache krótkotrwały (5 min) — chroni przed double-click / przypadkowym
// powtórzonym requestem przy tej samej konfiguracji. NIE cachujemy długoterminowo
// bo każdorazowe generowanie ma dawać różnorodność (zob. sekcja RÓŻNORODNOŚĆ w prompcie).
const _planCache = new Map<string, CacheEntry>()
const PLAN_CACHE_TTL_MS = 5 * 60 * 1000

function planCacheKey({ type, goal, equipment, avoid, recentSessions, equipmentTags, level, injuries, excludeExercises }: BuildPromptOptions): string {
  // Klucz zawiera tylko stabilne wejście — historia identyfikowana po id ostatnich sesji.
  const sessionsKey = recentSessions.map((s: RecentSession) => s.id || String(s.date)).join(',')
  const tagsKey = (equipmentTags || []).slice().sort().join('+')
  const injKey = (injuries || []).slice().sort().join('+')
  // excludeExercises różnicuje dni programu tego samego typu (np. 2× push) → osobny cache.
  const exclKey = (excludeExercises || []).slice().sort().join('+')
  return `${type}|${goal}|${equipment}|${avoid}|${tagsKey}|${level || ''}|${injKey}|${sessionsKey}|${exclKey}`
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
    if (goal === 'cut' && !type.startsWith('ania')) ex.sets = 3
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
  excludeExercises,
  programContext,
  signal
}: GenerateAIPlanOptions): Promise<AIPlan> {
  // Sanityzacja: ucinamy do MAX_AVOID_LENGTH, usuwamy znaki nowej linii (które mogłyby
  // wstrzyknąć nowe "instrukcje" do prompta).
  const safeAvoid = String(avoid || '').replace(/[\r\n]+/g, ' ').slice(0, MAX_AVOID_LENGTH).trim()

  // Cache hit dla identycznego wejścia (chroni przed double-click). TTL 5 min.
  const cacheKey = planCacheKey({ type, goal, equipment, avoid: safeAvoid, recentSessions, equipmentTags, level, injuries, excludeExercises })
  const cached = getCachedPlan(cacheKey)
  if (cached) return cached

  const { system, user } = buildPrompt({ type, goal, equipment, avoid: safeAvoid, recentSessions, equipmentTags, level, injuries, excludeExercises, programContext })

  // 1 silent retry przy błędzie parse — czasem Claude zwraca tekst zaczynający się od ```json
  // lub pełen JSON z jednym brakiem; ponowna próba w 90% przypadków wystarcza.
  let text: string | undefined, plan: Record<string, unknown> | undefined
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      // system (stabilny prefiks: reguły + katalog) z prompt-cachingiem; user = dynamika.
      text = await callClaude({ prompt: user, system, cacheSystem: !!system, maxTokens: 3000, signal })
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

// === Generator programu tygodniowego (Faza 1) ===
// Orkiestracja: wybór splitu wg liczby dni → dla każdego dnia wołamy istniejący silnik
// z wykluczeniem ćwiczeń z innych dni (rotacja) + kontekstem programu. Sekwencyjnie,
// żeby każdy kolejny dzień „widział" i omijał ćwiczenia poprzednich.
export interface ProgramDay { type: string; label: string; plan: AIPlan }
export interface GeneratedProgram {
  daysPerWeek: number
  split: string
  splitLabel: string
  goal: string
  level: string
  equipment: string
  days: ProgramDay[]
  volumeByGroup: Record<string, number>
  strict?: boolean
  sessionMinutes?: number | null
}
export interface GenerateProgramOptions {
  daysPerWeek: number
  goal: string
  equipment?: string
  level?: string
  injuries?: string[]
  splitOverride?: string | null
  // Faza 2: twardsze egzekwowanie objętości/nauki + budżet czasu sesji.
  strict?: boolean
  sessionMinutes?: number
  onProgress?: (done: number, total: number, label: string) => void
  signal?: AbortSignal
}

// Buduje opis kontekstu dnia dla promptu (współdzielony przez generateProgram i regenerateDay).
function programContextFor(
  dayLabel: string, splitLabel: string, total: number,
  strict?: boolean, sessionMinutes?: number, goal?: string
): string {
  // Przy celu „siła" główny bój ma się POWTARZAĆ między dniami (progresja siłowa),
  // więc reguła rotacji nie może go obejmować — inaczej prompt przeczy wykluczeniom.
  const rotation = goal === 'strength'
    ? 'Nie powtarzaj ćwiczeń pomocniczych z innych dni programu, ALE główny bój (pozycja 1) możesz — i powinieneś — powtórzyć, jeśli służy progresji siłowej.'
    : 'Nie powtarzaj ćwiczeń z innych dni programu.'
  const base = `${total} dni/tydzień, split ${splitLabel}. Ten dzień to „${dayLabel}". Dobierz liczbę serii na ćwiczenie (3–4) tak, aby tygodniowa objętość każdej partii mieściła się w normie hipertrofii. ${rotation}`
  const time = sessionMinutes ? ` Budżet czasu sesji ~${sessionMinutes} min — dobierz liczbę serii tak, aby sesja się w nim zmieściła.` : ''
  const strictNote = strict
    ? ' TRYB STRICT: bezwzględnie trzymaj się limitów objętości i częstotliwości oraz kolejności ćwiczeń zgodnej z wiedzą o hipertrofii. Jeżeli wymagania są sprzeczne — popraw je i wybierz naukowo optymalny wariant zamiast realizować ślepo.'
    : ''
  return `${base}${time}${strictNote}`
}

export async function generateProgram(opts: GenerateProgramOptions): Promise<GeneratedProgram> {
  const { daysPerWeek, goal, equipment = 'siłownia', level, injuries, splitOverride, strict, sessionMinutes, onProgress, signal } = opts
  const split = chooseSplit(daysPerWeek, splitOverride)
  const total = split.days.length
  const days: ProgramDay[] = []
  const used: string[] = []

  for (let i = 0; i < total; i++) {
    const d = split.days[i]
    onProgress?.(i, total, d.label)
    const plan = await generateAIPlan({
      type: d.type,
      goal,
      equipment,
      level,
      injuries,
      recentSessions: [],
      excludeExercises: [...used],
      programContext: programContextFor(d.label, split.splitLabel, total, strict, sessionMinutes, goal),
      signal
    })
    days.push({ type: d.type, label: d.label, plan })
    // Rotacja ćwiczeń między dniami. WYJĄTEK dla celu „siła": główny bój (slot 1)
    // NIE trafia do wykluczeń — w treningu siłowym powtarzanie tego samego boju
    // 2×/tydzień (przysiad, wyciskanie, martwy) jest fundamentem progresji, a nie
    // błędem. Pozostałe ćwiczenia dnia rotują normalnie.
    const skipFirst = goal === 'strength'
    for (const [j, ex] of plan.exercises.entries()) {
      if (skipFirst && j === 0) continue
      used.push(ex.name)
    }
  }
  onProgress?.(total, total, '')

  return {
    daysPerWeek: total,
    split: split.split,
    splitLabel: split.splitLabel,
    goal,
    level: level || 'intermediate',
    equipment,
    days,
    volumeByGroup: estimateWeeklyVolume(days),
    strict: !!strict,
    sessionMinutes: sessionMinutes ?? null
  }
}

// Regeneruje POJEDYNCZY dzień programu (wykluczając ćwiczenia z pozostałych dni).
// Zwraca nowy ProgramDay — wywołujący podmienia go w programie i przelicza objętość.
export async function regenerateDay(
  program: GeneratedProgram, index: number,
  opts: { strict?: boolean; sessionMinutes?: number; signal?: AbortSignal } = {}
): Promise<ProgramDay> {
  const day = program.days[index]
  // Przy celu „siła" główne boje (pozycja 1) innych dni nie blokują tego dnia —
  // spójne z regułą rotacji w generateProgram.
  const skipFirst = program.goal === 'strength'
  const used = program.days
    .filter((_, i) => i !== index)
    .flatMap(d => d.plan.exercises.filter((_, j) => !(skipFirst && j === 0)).map(e => e.name))
  const plan = await generateAIPlan({
    type: day.type,
    goal: program.goal,
    equipment: program.equipment,
    level: program.level,
    recentSessions: [],
    excludeExercises: used,
    programContext: programContextFor(day.label, program.splitLabel, program.days.length, opts.strict, opts.sessionMinutes, program.goal),
    signal: opts.signal
  })
  return { type: day.type, label: day.label, plan }
}
