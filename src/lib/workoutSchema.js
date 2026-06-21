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
export function groupExercisesByMuscle(exercises, type, source = 'library') {
  // === Tryb AI: grupowanie po indeksie (deterministyczne) ===
  if (source === 'ai' && INDEX_GROUPS[type]) {
    const schema = INDEX_GROUPS[type]
    const result = []
    let cursor = 0
    schema.forEach(({ group, count }) => {
      const slice = exercises.slice(cursor, cursor + count)
      if (slice.length) {
        result.push({
          groupId: group,
          label: GROUP_LABELS[group]?.name || group,
          icon: GROUP_LABELS[group]?.icon || 'ti-circle-dot',
          exerciseIndices: slice.map((_, i) => cursor + i)
        })
      }
      cursor += count
    })
    // Dorzuć nadmiar do ostatniej grupy
    if (cursor < exercises.length && result.length) {
      const last = result[result.length - 1]
      for (let i = cursor; i < exercises.length; i++) last.exerciseIndices.push(i)
    }
    return result
  }

  // === Tryb library/custom: grupowanie po muscle ===
  const order = GROUP_ORDER[type] || ['inne']
  const groupMap = {}
  exercises.forEach((ex, idx) => {
    const muscle = detectMuscle(ex.name)
    const groupId = MUSCLE_TO_GROUP[muscle] || 'inne'
    if (!groupMap[groupId]) groupMap[groupId] = []
    groupMap[groupId].push(idx)
  })
  const result = []
  order.forEach(g => {
    if (groupMap[g] && groupMap[g].length) {
      result.push({
        groupId: g,
        label: GROUP_LABELS[g]?.name || g,
        icon: GROUP_LABELS[g]?.icon || 'ti-circle-dot',
        exerciseIndices: groupMap[g]
      })
      delete groupMap[g]
    }
  })
  // Dorzuć grupy nieujęte w schemacie
  Object.keys(groupMap).forEach(g => {
    result.push({
      groupId: g,
      label: GROUP_LABELS[g]?.name || g,
      icon: GROUP_LABELS[g]?.icon || 'ti-circle-dot',
      exerciseIndices: groupMap[g]
    })
  })
  return result
}
