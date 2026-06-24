// Schemat grupowania ćwiczeń wg partii mięśniowej per typ treningu.
// Skopiowany z legacy/index.html (line 2278+) — zachowuje znajomy układ kart.

import { detectMuscle } from './db.js'

export const WORKOUT_SCHEMA = {
  push: [
    { id: 'klatka',  count: 3, muscles: ['chest_upper', 'chest_middle', 'chest_lower'] },
    { id: 'barki',   count: 2, muscles: ['shoulder_front', 'shoulder_side'] },
    { id: 'triceps', count: 2, muscles: ['triceps_long', 'triceps_lat', 'triceps_med'] },
  ],
  pull: [
    { id: 'plecy',      count: 4, muscles: ['back_lats', 'back_middle', 'back_upper', 'back_lower'] },
    { id: 'barki',      count: 1, muscles: ['shoulder_rear'] },
    { id: 'biceps',     count: 2, muscles: ['biceps_long', 'biceps_short', 'biceps_brach'] },
    { id: 'przedramię', count: 1, muscles: ['forearms'] },
  ],
  legs: [
    { id: 'czworogłowy', count: 2, muscles: ['quads'] },
    { id: 'hamstring',   count: 2, muscles: ['hamstrings'] },
    { id: 'pośladki',    count: 1, muscles: ['glutes', 'adductors'] },
    { id: 'łydki',       count: 1, muscles: ['calves'] },
    { id: 'core',        count: 1, muscles: ['abs', 'obliques', 'core'] },
  ],
  upper_a: [
    { id: 'klatka', count: 2 }, { id: 'plecy', count: 2 },
    { id: 'barki', count: 1 }, { id: 'biceps', count: 1 }, { id: 'triceps', count: 1 },
  ],
  upper_b: [
    { id: 'klatka', count: 2 }, { id: 'plecy', count: 2 },
    { id: 'barki', count: 1 }, { id: 'biceps', count: 1 }, { id: 'triceps', count: 1 },
  ],
  lower_a: [
    { id: 'czworogłowy', count: 2 }, { id: 'hamstring', count: 2 },
    { id: 'pośladki', count: 1 }, { id: 'łydki', count: 1 },
  ],
  lower_b: [
    { id: 'czworogłowy', count: 2 }, { id: 'hamstring', count: 2 },
    { id: 'pośladki', count: 1 }, { id: 'łydki', count: 1 },
  ],
  fbw_a: [
    { id: 'czworogłowy', count: 1 }, { id: 'klatka', count: 1 }, { id: 'plecy', count: 1 },
    { id: 'barki', count: 1 }, { id: 'hamstring', count: 1 }, { id: 'biceps', count: 1 }, { id: 'core', count: 1 },
  ],
  fbw_b: [
    { id: 'hamstring', count: 1 }, { id: 'klatka', count: 1 }, { id: 'plecy', count: 1 },
    { id: 'czworogłowy', count: 1 }, { id: 'barki', count: 1 }, { id: 'triceps', count: 1 }, { id: 'core', count: 1 },
  ],
  fbw_c: [
    { id: 'czworogłowy', count: 1 }, { id: 'klatka', count: 1 }, { id: 'plecy', count: 1 },
    { id: 'pośladki', count: 1 }, { id: 'barki', count: 1 }, { id: 'biceps', count: 1 }, { id: 'łydki', count: 1 },
  ],
}

// Mapowanie głów mięśniowych na partie (auto-generated z WORKOUT_SCHEMA)
export const MUSCLE_TO_GROUP = {}
Object.values(WORKOUT_SCHEMA).forEach(groups => {
  groups.forEach(g => {
    if (g.muscles) g.muscles.forEach(m => { MUSCLE_TO_GROUP[m] = g.id })
  })
})

// Kolejność partii per typ treningu (auto-generated)
export const GROUP_ORDER = {}
Object.entries(WORKOUT_SCHEMA).forEach(([type, groups]) => {
  GROUP_ORDER[type] = groups.map(g => g.id)
})

// Schemat indeksowy dla planów AI (deterministyczny układ niezależny od nazw)
export const INDEX_GROUPS = {}
Object.entries(WORKOUT_SCHEMA).forEach(([type, groups]) => {
  INDEX_GROUPS[type] = groups.map(g => ({ group: g.id, count: g.count }))
})

// Mapowanie primaryMuscle (klucze angielskie z planów AI) na klucze grup używane w GROUP_LABELS.
// Używane w statystykach: jeśli ex.primaryMuscle jest ustawione (plan AI), używamy tego
// zamiast detectMuscle(ex.name) — dzięki temu plany AI od razu trafiają we właściwą partię.
export const PRIMARY_TO_GROUP = {
  chest: 'klatka',
  shoulders: 'barki',
  rear_shoulders: 'barki',
  triceps: 'triceps',
  back: 'plecy',
  biceps: 'biceps',
  forearms: 'przedramię',
  quads: 'czworogłowy',
  hamstrings: 'hamstring',
  glutes: 'pośladki',
  calves: 'łydki',
  core: 'core'
}

export const GROUP_LABELS = {
  'klatka':      { name: 'Klatka piersiowa', icon: 'ti-shirt' },
  'barki':       { name: 'Barki', icon: 'ti-user' },
  'triceps':     { name: 'Triceps', icon: 'ti-hand-three-fingers' },
  'plecy':       { name: 'Plecy', icon: 'ti-stretching' },
  'biceps':      { name: 'Biceps', icon: 'ti-barbell' },
  'przedramię':  { name: 'Przedramię', icon: 'ti-hand-finger' },
  'czworogłowy': { name: 'Czworogłowy', icon: 'ti-run' },
  'hamstring':   { name: 'Hamstring', icon: 'ti-stretching-2' },
  'pośladki':    { name: 'Pośladki', icon: 'ti-disc' },
  'łydki':       { name: 'Łydki', icon: 'ti-walk' },
  'core':        { name: 'Core / Brzuch', icon: 'ti-target' },
  'inne':        { name: 'Pozostałe', icon: 'ti-circle-dot' }
}

/**
 * Grupuje ćwiczenia z aktywnej sesji wg partii mięśniowej.
 * Zwraca: [{ groupId, label, icon, exerciseIndices: [i,i,...] }]
 *
 * @param {Array} exercises - ćwiczenia z aktywnej sesji (każde z `name`)
 * @param {string} type - typ treningu (push/pull/legs/upper_a/...)
 * @param {string} source - 'ai' | 'library' | 'custom' (decyduje o algorytmie grupowania)
 */
function makeGroup(groupId, exerciseIndices) {
  return {
    groupId,
    label: GROUP_LABELS[groupId]?.name || groupId,
    icon: GROUP_LABELS[groupId]?.icon || 'ti-circle-dot',
    exerciseIndices
  }
}

// Grupowanie po wykrytej partii (zachowuje kolejność per typ ze schematu).
function groupByDetectedMuscle(exercises, type) {
  const order = GROUP_ORDER[type] || ['inne']
  const groupMap = {}
  const unknownIndices = []

  exercises.forEach((ex, idx) => {
    const muscle = detectMuscle(ex.name)
    const groupId = muscle ? MUSCLE_TO_GROUP[muscle] : null
    if (groupId) {
      if (!groupMap[groupId]) groupMap[groupId] = []
      groupMap[groupId].push(idx)
    } else {
      unknownIndices.push(idx)
    }
  })

  return { groupMap, unknownIndices, order }
}

export function groupExercisesByMuscle(exercises, type, source = 'library') {
  const { groupMap, unknownIndices, order } = groupByDetectedMuscle(exercises, type)

  // Liczymy "trafność" wykrycia: ile ćwiczeń znaleźliśmy w schemacie
  const detectedCount = exercises.length - unknownIndices.length
  const detectionRatio = exercises.length > 0 ? detectedCount / exercises.length : 0

  // === Tryb AI: jeśli detekcja słaba (< 60%), używamy index-based fallback ===
  // Tak też plany AI z nietypowymi nazwami nadal się sensownie pogrupują.
  if (source === 'ai' && detectionRatio < 0.6 && INDEX_GROUPS[type]) {
    const schema = INDEX_GROUPS[type]
    const result = []
    let cursor = 0
    schema.forEach(({ group, count }) => {
      const slice = exercises.slice(cursor, cursor + count)
      if (slice.length) {
        result.push(makeGroup(group, slice.map((_, i) => cursor + i)))
      }
      cursor += count
    })
    if (cursor < exercises.length && result.length) {
      const last = result[result.length - 1]
      for (let i = cursor; i < exercises.length; i++) last.exerciseIndices.push(i)
    }
    return result
  }

  // === Standardowe grupowanie po muscle (library/custom/AI z dobrymi nazwami) ===
  const result = []
  order.forEach(g => {
    if (groupMap[g] && groupMap[g].length) {
      result.push(makeGroup(g, groupMap[g]))
      delete groupMap[g]
    }
  })
  // Dorzuć grupy nieujęte w schemacie (np. core dla push)
  Object.keys(groupMap).forEach(g => {
    result.push(makeGroup(g, groupMap[g]))
  })

  // Niezdetekowane ćwiczenia (custom nazwy AI lub user): przypisz w pobliżu
  // najbliższego sąsiada w oryginalnej kolejności zamiast wrzucać do "Inne".
  if (unknownIndices.length) {
    for (const orphanIdx of unknownIndices) {
      // Znajdź grupę najbliższego sąsiada (prev/next) w oryginalnej kolejności
      let assigned = false
      for (let delta = 1; delta < exercises.length && !assigned; delta++) {
        for (const dir of [-1, 1]) {
          const neighbor = orphanIdx + delta * dir
          if (neighbor < 0 || neighbor >= exercises.length) continue
          const targetGroup = result.find(g => g.exerciseIndices.includes(neighbor))
          if (targetGroup) {
            targetGroup.exerciseIndices.push(orphanIdx)
            targetGroup.exerciseIndices.sort((a, b) => a - b)
            assigned = true
            break
          }
        }
      }
      if (!assigned) {
        // Naprawdę nic nie pasuje → "Inne"
        const inne = result.find(g => g.groupId === 'inne')
        if (inne) inne.exerciseIndices.push(orphanIdx)
        else result.push(makeGroup('inne', [orphanIdx]))
      }
    }
  }

  return result
}
