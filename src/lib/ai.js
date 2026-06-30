// AI helper — calls Claude API via Cloudflare Worker proxy.
// Worker URL can be overridden by localStorage 'tp_proxy_url' for testing.

import { PRIMARY_TO_GROUP } from './workoutSchema.js'

// Worker proxy URL — można nadpisać przez `.env` (VITE_AI_PROXY_URL) lub localStorage 'tp_proxy_url'.
const DEFAULT_PROXY = import.meta.env?.VITE_AI_PROXY_URL || 'https://trening-pro-api.lukasz-mateusz-bonio.workers.dev'
const MODEL = 'claude-sonnet-4-6'

export function getProxyUrl() {
  try {
    return localStorage.getItem('tp_proxy_url') || DEFAULT_PROXY
  } catch {
    return DEFAULT_PROXY
  }
}

export async function callClaude({ prompt, maxTokens = 2500, signal, timeoutMs = 60000 }) {
  if (!navigator.onLine) {
    throw new Error('Brak połączenia z internetem')
  }
  // Default 60s timeout — wcześniej request mógł wisieć indefinitely jeśli user nie podał signal.
  const timeoutCtrl = new AbortController()
  const timer = setTimeout(() => timeoutCtrl.abort(), timeoutMs)
  // Połącz user signal z timeout signal.
  const onUserAbort = () => timeoutCtrl.abort()
  if (signal) signal.addEventListener('abort', onUserAbort)
  let resp
  try {
    resp = await fetch(getProxyUrl(), {
      method: 'POST',
      signal: timeoutCtrl.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }]
      })
    })
  } finally {
    clearTimeout(timer)
    if (signal) signal.removeEventListener('abort', onUserAbort)
  }

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err.error?.message || `HTTP ${resp.status}`)
  }
  const data = await resp.json()
  if (!Array.isArray(data.content)) throw new Error('Pusta odpowiedź API')
  const text = data.content.map(c => c.text || '').join('')
  return text.replace(/```json|```/g, '').trim()
}

export function parseClaudeJSON(rawText) {
  let parsed
  try { parsed = JSON.parse(rawText) }
  catch { throw new Error('AI nie zwróciło poprawnego JSON-a — spróbuj ponownie') }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Nieprawidłowy format odpowiedzi — spróbuj ponownie')
  }
  return parsed
}

// Dozwolone wartości dla pól w odpowiedzi AI.
// PRIMARY_MUSCLES wyprowadzone z PRIMARY_TO_GROUP — jedno źródło prawdy.
export const PRIMARY_MUSCLES = Object.keys(PRIMARY_TO_GROUP)
export const EXERCISE_TYPES = ['compound', 'isolation']
export const MOVEMENT_PATTERNS = [
  'horizontal_push', 'vertical_push',
  'horizontal_pull', 'vertical_pull',
  'squat', 'hinge', 'lunge', 'calf', 'core',
  'elbow_flexion', 'elbow_extension', 'shoulder_isolation'
]

// Dozwolone głowy mięśniowe (muscleHead) per typ treningu — używane do walidacji
// w `generateAIPlan` i jako lista hintów dla AI w prompcie.
export const MUSCLE_HEADS_BY_TYPE = {
  push:    ['chest_upper', 'chest_middle', 'chest_lower', 'shoulder_front', 'shoulder_side', 'triceps_long', 'triceps_lat', 'triceps_med'],
  pull:    ['back_lats', 'back_middle', 'back_upper', 'back_lower', 'shoulder_rear', 'biceps_long', 'biceps_short', 'biceps_brach', 'forearms'],
  legs:    ['quads', 'hamstrings', 'glutes', 'adductors', 'calves', 'abs', 'obliques', 'core'],
  upper_a: ['chest_upper', 'chest_middle', 'chest_lower', 'shoulder_front', 'shoulder_side', 'shoulder_rear', 'back_lats', 'back_middle', 'back_upper', 'biceps_long', 'biceps_short', 'biceps_brach', 'triceps_long', 'triceps_lat', 'triceps_med'],
  upper_b: ['chest_upper', 'chest_middle', 'chest_lower', 'shoulder_front', 'shoulder_side', 'shoulder_rear', 'back_lats', 'back_middle', 'back_upper', 'biceps_long', 'biceps_short', 'biceps_brach', 'triceps_long', 'triceps_lat', 'triceps_med'],
  lower_a: ['quads', 'hamstrings', 'glutes', 'adductors', 'calves', 'abs', 'obliques', 'core'],
  lower_b: ['quads', 'hamstrings', 'glutes', 'adductors', 'calves', 'abs', 'obliques', 'core'],
  fbw_a:   ['chest_middle', 'chest_upper', 'back_lats', 'back_middle', 'shoulder_front', 'shoulder_side', 'shoulder_rear', 'quads', 'hamstrings', 'glutes', 'biceps_short', 'triceps_lat', 'abs', 'core'],
  fbw_b:   ['chest_middle', 'chest_upper', 'back_lats', 'back_middle', 'back_lower', 'shoulder_front', 'shoulder_side', 'quads', 'hamstrings', 'glutes', 'triceps_long', 'triceps_lat', 'abs', 'core'],
  fbw_c:   ['chest_middle', 'chest_upper', 'back_lats', 'back_middle', 'shoulder_front', 'shoulder_side', 'shoulder_rear', 'quads', 'hamstrings', 'glutes', 'biceps_short', 'calves', 'core']
}

// Szczegóły dla każdego typu treningu — struktura, zasady doboru, oczekiwana liczba ćwiczeń.
const TYPE_DETAILS = {
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
  }
}

const GOAL_HINTS = {
  mass:          'masa mięśniowa: 8-12 powtórzeń, 3-4 serie, tempo umiarkowane',
  strength:      'siła: 3-6 powtórzeń, 4-5 serii, ciężary submaksymalne',
  endurance:     'wytrzymałość mięśniowa: 15-20 powtórzeń, 2-4 serie, krótkie przerwy',
  cut:           'redukcja tkanki tłuszczowej: 10-15 powtórzeń, DOKŁADNIE 3 serie dla KAŻDEGO ćwiczenia (dobitka opcjonalna na żywo), krótsze przerwy 60-90s',
  recomposition: 'rekompozycja: 6-12 powtórzeń, 3-4 serie, nacisk na progresję obciążenia'
}

// Kompaktowy zapis sesji do prompta — bez RPE, bez notatek.
// Format: "- <nazwa>: 60x10, 60x10, 60x8"
function formatSessionCompact(session) {
  const date = new Date(session.date).toISOString().slice(0, 10)
  const lines = session.exercises.map(ex => {
    const sets = ex.sets
      .map(s => `${s.weight || 0}x${s.reps || 0}`)
      .join(', ')
    return `- ${ex.name}: ${sets}`
  })
  return `Sesja ${date}:\n${lines.join('\n')}`
}

function buildPrompt({ type, goal, equipment, avoid, recentSessions }) {
  const td = TYPE_DETAILS[type] || TYPE_DETAILS.push
  const goalDesc = GOAL_HINTS[goal] || GOAL_HINTS.mass
  const hasHistory = recentSessions.length > 0

  const parts = []

  parts.push(`Wygeneruj plan treningowy typu ${td.label} dla osoby trenującej w ${equipment}.`)
  parts.push(`Cel: ${goalDesc}`)
  parts.push(`Struktura:\n${td.structure}`)

  if (hasHistory) {
    parts.push(`RÓŻNORODNOŚĆ:
- Nie wybieraj identycznego zestawu ćwiczeń przy każdym generowaniu.
- Zachowaj strukturę planu, ale rotuj ćwiczenia pomiędzy równoważnymi wariantami.
- Preferuj ćwiczenia, które nie występowały w ostatnich ${recentSessions.length} treningach tego typu.
- Dopuszczalne jest powtórzenie głównego ćwiczenia bazowego, jeśli jest uzasadnione historią progresji.`)
  }

  parts.push(`DOBÓR ĆWICZEŃ:
${td.selection.map(s => `- ${s}`).join('\n')}
- Nie duplikuj tego samego ćwiczenia w planie.`)

  if (avoid && avoid.trim()) {
    parts.push(`UNIKAJ: ${avoid.trim()}`)
  }

  if (hasHistory) {
    parts.push(`OSTATNIE SESJE (${recentSessions.length}) — kompaktowo, weight x reps:
${recentSessions.map(formatSessionCompact).join('\n\n')}`)
  }

  const allowedHeads = MUSCLE_HEADS_BY_TYPE[type] || []
  parts.push(`Zwróć WYŁĄCZNIE poprawny JSON w formacie (bez markdown, bez komentarzy):
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

  parts.push(`KRYTYCZNE:
- Odpowiedź musi zawierać WYŁĄCZNIE poprawny JSON.
- Nie używaj markdown.
- Nie używaj bloków \`\`\`json.
- Nie dodawaj żadnych wyjaśnień przed ani po JSON.
- Odpowiedź musi rozpoczynać się od znaku { i kończyć znakiem }.`)

  const setsRule = goal === 'cut'
    ? '- "sets" musi być DOKŁADNIE 3 dla KAŻDEGO ćwiczenia (cel = redukcja, dobitka jest opcjonalna i decydowana w trakcie sesji).'
    : '- "sets" musi być liczbą (3, 4, 5).'

  parts.push(`WAŻNE:
- Wszystkie pola są wymagane.
${setsRule}
- "reps" musi być stringiem z zakresem ('6-8', '10-12', '12-15').
- Nazwy ćwiczeń wyłącznie po polsku, standardowe (np. "Wyciskanie sztangi na ławce poziomej", "Przysiad ze sztangą", "Martwy ciąg rumuński").
- "primaryMuscle" musi być jedną z: ${PRIMARY_MUSCLES.map(m => `"${m}"`).join(', ')}.
- "muscleHead" musi być jedną z (dozwolone dla typu ${td.label}): ${allowedHeads.map(h => `"${h}"`).join(', ')}.
- "exerciseType" musi być jedną z: ${EXERCISE_TYPES.map(t => `"${t}"`).join(', ')}.
- "movementPattern" musi być jedną z: ${MOVEMENT_PATTERNS.map(p => `"${p}"`).join(', ')}.
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
const _planCache = new Map()
const PLAN_CACHE_TTL_MS = 5 * 60 * 1000

function planCacheKey({ type, goal, equipment, avoid, recentSessions }) {
  // Klucz zawiera tylko stabilne wejście — historia identyfikowana po id ostatnich sesji.
  const sessionsKey = recentSessions.map(s => s.id || s.date).join(',')
  return `${type}|${goal}|${equipment}|${avoid}|${sessionsKey}`
}

function getCachedPlan(key) {
  const entry = _planCache.get(key)
  if (!entry) return null
  if (entry.expiresAt < Date.now()) {
    _planCache.delete(key)
    return null
  }
  return entry.plan
}

function setCachedPlan(key, plan) {
  _planCache.set(key, { plan, expiresAt: Date.now() + PLAN_CACHE_TTL_MS })
}

export async function generateAIPlan({
  type,
  goal,
  equipment = 'siłownia',
  avoid = '',
  recentSessions = [],
  signal
}) {
  const td = TYPE_DETAILS[type] || TYPE_DETAILS.push
  // Sanityzacja: ucinamy do MAX_AVOID_LENGTH, usuwamy znaki nowej linii (które mogłyby
  // wstrzyknąć nowe "instrukcje" do prompta).
  const safeAvoid = String(avoid || '').replace(/[\r\n]+/g, ' ').slice(0, MAX_AVOID_LENGTH).trim()

  // Cache hit dla identycznego wejścia (chroni przed double-click). TTL 5 min.
  const cacheKey = planCacheKey({ type, goal, equipment, avoid: safeAvoid, recentSessions })
  const cached = getCachedPlan(cacheKey)
  if (cached) return cached

  const prompt = buildPrompt({ type, goal, equipment, avoid: safeAvoid, recentSessions })

  // 1 silent retry przy błędzie parse — czasem Claude zwraca tekst zaczynający się od ```json
  // lub pełen JSON z jednym brakiem; ponowna próba w 90% przypadków wystarcza.
  let text, plan, lastErr
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      text = await callClaude({ prompt, maxTokens: 3000, signal })
      plan = parseClaudeJSON(text)
      break
    } catch (e) {
      lastErr = e
      if (e.name === 'AbortError') throw e
      if (attempt === 1) throw e
    }
  }

  if (!plan.name || !Array.isArray(plan.exercises) || !plan.exercises.length) {
    throw new Error('AI zwróciło niepoprawny plan — spróbuj ponownie')
  }

  // Twarda walidacja: liczba ćwiczeń musi się zgadzać ze strukturą
  if (plan.exercises.length !== td.expectedCount) {
    throw new Error(`AI zwróciło ${plan.exercises.length} ćwiczeń zamiast ${td.expectedCount} — spróbuj ponownie`)
  }

  const allowedHeadsForType = MUSCLE_HEADS_BY_TYPE[type] || []
  for (const ex of plan.exercises) {
    if (!ex.name || typeof ex.sets !== 'number' || !ex.reps) {
      throw new Error('AI zwróciło ćwiczenie z brakującymi polami — spróbuj ponownie')
    }
    // Wymuszenie 3 serii dla redukcji — niezależnie od tego co AI zwróciło.
    if (goal === 'cut') ex.sets = 3
    // Miękka walidacja: spoza dozwolonych wartości → null (nie odrzucamy planu)
    if (!PRIMARY_MUSCLES.includes(ex.primaryMuscle)) ex.primaryMuscle = null
    if (!allowedHeadsForType.includes(ex.muscleHead)) ex.muscleHead = null
    if (!EXERCISE_TYPES.includes(ex.exerciseType)) ex.exerciseType = null
    if (!MOVEMENT_PATTERNS.includes(ex.movementPattern)) ex.movementPattern = null
    // Normalizacja suggestedWeight — może przyjść jako string/null/undefined
    if (ex.suggestedWeight != null) {
      const w = Number(ex.suggestedWeight)
      ex.suggestedWeight = Number.isFinite(w) && w > 0 ? w : null
    } else {
      ex.suggestedWeight = null
    }
  }
  setCachedPlan(cacheKey, plan)
  return plan
}
