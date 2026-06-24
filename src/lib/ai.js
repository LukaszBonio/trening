// AI helper — calls Claude API via Cloudflare Worker proxy.
// Worker URL can be overridden by localStorage 'tp_proxy_url' for testing.

const DEFAULT_PROXY = 'https://trening-pro-api.lukasz-mateusz-bonio.workers.dev'
const MODEL = 'claude-sonnet-4-6'

export function getProxyUrl() {
  try {
    return localStorage.getItem('tp_proxy_url') || DEFAULT_PROXY
  } catch {
    return DEFAULT_PROXY
  }
}

export async function callClaude({ prompt, maxTokens = 2000, signal }) {
  if (!navigator.onLine) {
    throw new Error('Brak połączenia z internetem')
  }
  const resp = await fetch(getProxyUrl(), {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    })
  })

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

const TYPE_STRUCTURE = {
  push: '3 ćwiczenia na klatkę + 2 na barki (przednie/boczne) + 2 na triceps',
  pull: '4 ćwiczenia na plecy + 1 na tylne barki + 2 na biceps + 1 na przedramię',
  legs: '2 quad-dominant + 2 hamstring/pośladki + 1 jednostronne + 1 łydki + 1 core',
  upper_a: 'klatka + plecy + barki + biceps + triceps (7 ćwiczeń)',
  upper_b: 'klatka + plecy + barki + biceps + triceps — inne ćwiczenia niż A (7 ćwiczeń)',
  lower_a: 'czworogłowy + hamstring/pośladki + łydki + core (6 ćwiczeń)',
  lower_b: 'hamstring/pośladki dominantne + czworogłowy + łydki + core (6 ćwiczeń)',
  fbw_a: 'przysiad + bench + wiosłowanie + OHP + hamstring + biceps + core (7 ćwiczeń)',
  fbw_b: 'martwy + skos + podciąganie + split squat + wznosy + triceps + core (7 ćwiczeń)',
  fbw_c: 'front squat + bench hantle + wiosłowanie + hip thrust + face pull + biceps + łydki (7 ćwiczeń)'
}

const GOAL_HINTS = {
  mass: 'masa mięśniowa: 8-12 powt, 3-4 serii, tempo umiarkowane',
  strength: 'siła: 3-6 powt, 4-5 serii, ciężary submaksymalne',
  endurance: 'wytrzymałość: 12-20 powt, 3 serii, krótsze przerwy',
  cut: 'redukcja/rzeźba: 10-15 powt, 3 serii, podwyższona intensywność',
  recomposition: 'rekompozycja: 6-12 powt, mix siłowo-objętościowy'
}

/**
 * Kompaktowy zapis sesji do prompta — bez RPE, bez notatek.
 * Format: "- <nazwa>: 60x10, 60x10, 60x8"
 */
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

export async function generateAIPlan({
  type,
  goal,
  equipment = 'siłownia',
  avoid = '',
  recentSessions = [],
  signal
}) {
  const struct = TYPE_STRUCTURE[type] || 'standardowy układ'
  const goalDesc = GOAL_HINTS[goal] || GOAL_HINTS.mass
  const avoidLine = avoid.trim() ? `\nUNIKAJ: ${avoid.trim()}` : ''

  const historyBlock = recentSessions.length
    ? `\n\nOSTATNIE SESJE (${recentSessions.length}) — kompaktowo, weight x reps:\n${recentSessions.map(formatSessionCompact).join('\n\n')}`
    : ''

  const progressionHint = recentSessions.length
    ? `\n- Dla ćwiczeń obecnych w historii: zaproponuj "suggestedWeight" (number, w kg) — startowy ciężar na pierwszą serię, lekka progresja względem ostatnich treningów (np. +2.5kg jeśli ostatnio robił w pełnym zakresie powtórzeń, taki sam ciężar jeśli ledwo dobił do dolnej granicy).
- Dla ćwiczeń nowych (brak w historii): "suggestedWeight": null.`
    : `\n- "suggestedWeight": null (brak historii do oszacowania).`

  const prompt = `Wygeneruj plan treningowy typu ${type.toUpperCase()} dla osoby trenującej w ${equipment}.

Cel: ${goalDesc}
Struktura: ${struct}${avoidLine}${historyBlock}

Zwróć WYŁĄCZNIE poprawny JSON w formacie (bez markdown, bez komentarzy):
{
  "name": "krótka nazwa planu (max 40 znaków, po polsku)",
  "exercises": [
    { "name": "nazwa ćwiczenia po polsku", "sets": LICZBA, "reps": "ZAKRES jako string np. '8-10'", "tip": "krótka wskazówka techniczna (max 60 znaków)", "suggestedWeight": LICZBA_LUB_NULL }
  ]
}

WAŻNE:
- Wszystkie pola wymagane.
- "sets" = liczba (3, 4, 5).
- "reps" = string z zakresem ('6-8', '10-12', '12-15').
- Nazwy ćwiczeń po polsku, standardowe (np. "Wyciskanie sztangi na ławce poziomej", "Przysiad ze sztangą", "Martwy ciąg rumuński").
- Trzymaj się struktury i liczby ćwiczeń podanej wyżej.${progressionHint}`

  const text = await callClaude({ prompt, maxTokens: 2000, signal })
  const plan = parseClaudeJSON(text)

  if (!plan.name || !Array.isArray(plan.exercises) || !plan.exercises.length) {
    throw new Error('AI zwróciło niepoprawny plan — spróbuj ponownie')
  }
  for (const ex of plan.exercises) {
    if (!ex.name || typeof ex.sets !== 'number' || !ex.reps) {
      throw new Error('AI zwróciło ćwiczenie z brakującymi polami — spróbuj ponownie')
    }
    // Normalizacja suggestedWeight — może przyjść jako string, null, undefined
    if (ex.suggestedWeight != null) {
      const w = Number(ex.suggestedWeight)
      ex.suggestedWeight = Number.isFinite(w) && w > 0 ? w : null
    } else {
      ex.suggestedWeight = null
    }
  }
  return plan
}
