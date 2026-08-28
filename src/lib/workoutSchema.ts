// Schemat grupowania ćwiczeń wg partii mięśniowej per typ treningu.
// Skopiowany z legacy/index.html (line 2278+) — zachowuje znajomy układ kart.

import { detectMuscle } from './muscles'
import type { MuscleKey } from './muscles'

// --- Types ---

export type WorkoutType =
  | 'push' | 'pull' | 'legs'
  | 'upper_a' | 'upper_b'
  | 'lower_a' | 'lower_b'
  | 'fbw_a' | 'fbw_b' | 'fbw_c'
  | 'chest_back' | 'shoulders_arms'
  | 'day_chest' | 'day_back' | 'day_shoulders' | 'day_arms'
  | 'torso' | 'limbs'
  | 'ania' | 'ania_a' | 'ania_b'

export type GroupId =
  | 'klatka' | 'barki' | 'triceps'
  | 'plecy' | 'biceps' | 'przedramię'
  | 'czworogłowy' | 'hamstring' | 'pośladki' | 'łydki'
  | 'core' | 'inne'

export type ExerciseSource = 'ai' | 'library' | 'custom'

export interface SchemaGroup {
  id: GroupId
  count: number
  muscles?: MuscleKey[]
}

export interface IndexGroup {
  group: GroupId
  count: number
}

export interface GroupLabel {
  name: string
  icon: string
}

export interface ExerciseGroup {
  groupId: GroupId
  label: string
  icon: string
  exerciseIndices: number[]
}

export interface Exercise {
  name: string
  primaryMuscle?: string
  [key: string]: unknown
}

// --- Constants ---

export const WORKOUT_SCHEMA: Record<WorkoutType, SchemaGroup[]> = {
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
  // upper_a: 8 ćwiczeń — klatka 1, plecy 2, barki 3 (OHP + bocz + tylny), biceps 1, triceps 1
  upper_a: [
    { id: 'klatka', count: 1 }, { id: 'plecy', count: 2 },
    { id: 'barki', count: 3 }, { id: 'biceps', count: 1 }, { id: 'triceps', count: 1 },
  ],
  // upper_b: 7 — klatka 2 (skos + dolna), plecy 2, barki 1 (tylny), biceps 1, triceps 1
  upper_b: [
    { id: 'klatka', count: 2 }, { id: 'plecy', count: 2 },
    { id: 'barki', count: 1 }, { id: 'biceps', count: 1 }, { id: 'triceps', count: 1 },
  ],
  // lower_a: 7 — czworogłowy 2 (przysiad + jednostronne), hamstring 2 (RDL + uginanie),
  // pośladki 1 (hip thrust), łydki 1, core 1
  lower_a: [
    { id: 'czworogłowy', count: 2 }, { id: 'hamstring', count: 2 },
    { id: 'pośladki', count: 1 }, { id: 'łydki', count: 1 }, { id: 'core', count: 1 },
  ],
  // lower_b: 7 — hamstring 2 (hinge + uginanie), pośladki 2 (hip thrust + odwodzenie),
  // czworogłowy 1, łydki 1, core 1 (skośne)
  lower_b: [
    { id: 'czworogłowy', count: 1 }, { id: 'hamstring', count: 2 },
    { id: 'pośladki', count: 2 }, { id: 'łydki', count: 1 }, { id: 'core', count: 1 },
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
  // Arnold Split
  chest_back: [
    { id: 'klatka', count: 4 }, { id: 'plecy', count: 4 },
  ],
  shoulders_arms: [
    { id: 'barki', count: 3 }, { id: 'biceps', count: 2 }, { id: 'triceps', count: 2 },
  ],
  // Bro Split
  day_chest:     [{ id: 'klatka', count: 5 }],
  day_back:      [{ id: 'plecy', count: 6 }],
  day_shoulders: [{ id: 'barki', count: 5 }],
  day_arms:      [{ id: 'biceps', count: 3 }, { id: 'triceps', count: 3 }],
  // Torso / Limbs
  torso: [
    { id: 'klatka', count: 3 }, { id: 'plecy', count: 3 }, { id: 'barki', count: 2 },
  ],
  limbs: [
    { id: 'czworogłowy', count: 3 }, { id: 'hamstring', count: 1 },
    { id: 'biceps', count: 1 }, { id: 'triceps', count: 1 }, { id: 'łydki', count: 1 },
  ],
  // Plan korekcyjno-wzmacniający "Ćwiczenia dla Ani" — kolejność slotów zgodna z promptem
  // (aktywacja core → stabilizacja → pośladki → biodro → tylna taśma → kolano → plecy → łopatki).
  ania: [
    { id: 'core',        count: 2, muscles: ['core', 'abs', 'obliques'] },
    { id: 'pośladki',    count: 2, muscles: ['glutes', 'adductors'] },
    { id: 'hamstring',   count: 1, muscles: ['hamstrings'] },
    { id: 'czworogłowy', count: 1, muscles: ['quads'] },
    { id: 'plecy',       count: 1, muscles: ['back_lats', 'back_middle', 'back_lower', 'back_upper'] },
    { id: 'barki',       count: 1, muscles: ['shoulder_rear'] },
  ],
  // Ania Dzień 1 — kręgosłup lędźwiowy (głęboka stabilizacja) + górne plecy + postawa/łopatki.
  ania_a: [
    { id: 'core',   count: 2, muscles: ['core', 'abs', 'obliques'] },
    { id: 'plecy',  count: 2, muscles: ['back_middle', 'back_upper', 'back_lats', 'back_lower'] },
    { id: 'barki',  count: 1, muscles: ['shoulder_rear'] },
  ],
  // Ania Dzień 2 — core + pośladki + tylna taśma.
  ania_b: [
    { id: 'core',      count: 2, muscles: ['core', 'abs', 'obliques'] },
    { id: 'pośladki',  count: 2, muscles: ['glutes', 'adductors'] },
    { id: 'hamstring', count: 1, muscles: ['hamstrings'] },
  ],
}

// Mapowanie głów mięśniowych na partie (auto-generated z WORKOUT_SCHEMA)
export const MUSCLE_TO_GROUP: Record<string, GroupId> = {}
Object.values(WORKOUT_SCHEMA).forEach((groups: SchemaGroup[]) => {
  groups.forEach((g: SchemaGroup) => {
    if (g.muscles) g.muscles.forEach((m: MuscleKey) => { MUSCLE_TO_GROUP[m] = g.id })
  })
})

// Kolejność partii per typ treningu (auto-generated)
export const GROUP_ORDER: Record<string, GroupId[]> = {}
Object.entries(WORKOUT_SCHEMA).forEach(([type, groups]: [string, SchemaGroup[]]) => {
  GROUP_ORDER[type] = groups.map((g: SchemaGroup) => g.id)
})

// Schemat indeksowy dla planów AI (deterministyczny układ niezależny od nazw)
export const INDEX_GROUPS: Record<string, IndexGroup[]> = {}
Object.entries(WORKOUT_SCHEMA).forEach(([type, groups]: [string, SchemaGroup[]]) => {
  INDEX_GROUPS[type] = groups.map((g: SchemaGroup) => ({ group: g.id, count: g.count }))
})

// Mapowanie primaryMuscle (klucze angielskie z planów AI) na klucze grup używane w GROUP_LABELS.
// Używane w statystykach: jeśli ex.primaryMuscle jest ustawione (plan AI), używamy tego
// zamiast detectMuscle(ex.name) — dzięki temu plany AI od razu trafiają we właściwą partię.
export const PRIMARY_TO_GROUP: Record<string, GroupId> = {
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
  adductors: 'pośladki',
  calves: 'łydki',
  core: 'core'
}

export const GROUP_LABELS: Record<GroupId, GroupLabel> = {
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

// --- Functions ---

/**
 * Grupuje ćwiczenia z aktywnej sesji wg partii mięśniowej.
 * Zwraca: [{ groupId, label, icon, exerciseIndices: [i,i,...] }]
 */
function makeGroup(groupId: GroupId, exerciseIndices: number[]): ExerciseGroup {
  return {
    groupId,
    label: GROUP_LABELS[groupId]?.name || groupId,
    icon: GROUP_LABELS[groupId]?.icon || 'ti-circle-dot',
    exerciseIndices
  }
}

interface DetectedResult {
  groupMap: Record<string, number[]>
  unknownIndices: number[]
  order: GroupId[]
}

// Grupowanie po wykrytej partii (zachowuje kolejność per typ ze schematu).
function groupByDetectedMuscle(exercises: Exercise[], type: string): DetectedResult {
  const order: GroupId[] = GROUP_ORDER[type] || ['inne']
  const groupMap: Record<string, number[]> = {}
  const unknownIndices: number[] = []

  exercises.forEach((ex: Exercise, idx: number) => {
    const muscle: MuscleKey | null = detectMuscle(ex.name)
    const groupId: GroupId | undefined = muscle ? MUSCLE_TO_GROUP[muscle] as GroupId : undefined
    if (groupId) {
      if (!groupMap[groupId]) groupMap[groupId] = []
      groupMap[groupId].push(idx)
    } else {
      unknownIndices.push(idx)
    }
  })

  return { groupMap, unknownIndices, order }
}

export function groupExercisesByMuscle(
  exercises: Exercise[],
  type: string,
  source: ExerciseSource = 'library'
): ExerciseGroup[] {
  const { groupMap, unknownIndices, order } = groupByDetectedMuscle(exercises, type)

  // Liczymy "trafność" wykrycia: ile ćwiczeń znaleźliśmy w schemacie
  const detectedCount: number = exercises.length - unknownIndices.length
  const detectionRatio: number = exercises.length > 0 ? detectedCount / exercises.length : 0

  // === Tryb AI: jeśli detekcja słaba (< 60%), używamy index-based fallback ===
  // Tak też plany AI z nietypowymi nazwami nadal się sensownie pogrupują.
  if (source === 'ai' && detectionRatio < 0.6 && INDEX_GROUPS[type]) {
    const schema: IndexGroup[] = INDEX_GROUPS[type]
    const result: ExerciseGroup[] = []
    let cursor: number = 0
    schema.forEach(({ group, count }: IndexGroup) => {
      const slice: Exercise[] = exercises.slice(cursor, cursor + count)
      if (slice.length) {
        result.push(makeGroup(group, slice.map((_: Exercise, i: number) => cursor + i)))
      }
      cursor += count
    })
    if (cursor < exercises.length && result.length) {
      const last: ExerciseGroup = result[result.length - 1]
      for (let i: number = cursor; i < exercises.length; i++) last.exerciseIndices.push(i)
    }
    return result
  }

  // === Standardowe grupowanie po muscle (library/custom/AI z dobrymi nazwami) ===
  const result: ExerciseGroup[] = []
  order.forEach((g: GroupId) => {
    if (groupMap[g] && groupMap[g].length) {
      result.push(makeGroup(g, groupMap[g]))
      delete groupMap[g]
    }
  })
  // Dorzuć grupy nieujęte w schemacie (np. core dla push)
  Object.keys(groupMap).forEach((g: string) => {
    result.push(makeGroup(g as GroupId, groupMap[g]))
  })

  // Niezdetekowane ćwiczenia (custom nazwy AI lub user): przypisz w pobliżu
  // najbliższego sąsiada w oryginalnej kolejności zamiast wrzucać do "Inne".
  if (unknownIndices.length) {
    for (const orphanIdx of unknownIndices) {
      // Znajdź grupę najbliższego sąsiada (prev/next) w oryginalnej kolejności
      let assigned: boolean = false
      for (let delta: number = 1; delta < exercises.length && !assigned; delta++) {
        for (const dir of [-1, 1]) {
          const neighbor: number = orphanIdx + delta * dir
          if (neighbor < 0 || neighbor >= exercises.length) continue
          const targetGroup: ExerciseGroup | undefined = result.find(
            (g: ExerciseGroup) => g.exerciseIndices.includes(neighbor)
          )
          if (targetGroup) {
            targetGroup.exerciseIndices.push(orphanIdx)
            targetGroup.exerciseIndices.sort((a: number, b: number) => a - b)
            assigned = true
            break
          }
        }
      }
      if (!assigned) {
        // Naprawdę nic nie pasuje → "Inne"
        const inne: ExerciseGroup | undefined = result.find(
          (g: ExerciseGroup) => g.groupId === 'inne'
        )
        if (inne) inne.exerciseIndices.push(orphanIdx)
        else result.push(makeGroup('inne', [orphanIdx]))
      }
    }
  }

  return result
}
