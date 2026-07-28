// Warstwa tygodniowa generatora programów (Faza 1).
// - docelowa objętość serii/tydz per partia (zakresy hipertrofii, skalowane poziomem),
// - wybór splitu wg liczby dni,
// - estymacja realnej objętości z wygenerowanego programu (feedback vs cele).
// Czyste funkcje — bez Vue/sieci, łatwe do testowania.

import { PRIMARY_TO_GROUP, GROUP_LABELS } from './workoutSchema'
import { detectMuscle } from './muscles'
import { MUSCLE_TO_GROUP } from './workoutSchema'

// Grupy zgodne z GROUP_LABELS/PRIMARY_TO_GROUP. Klucz = id grupy.
export type VolumeGroup =
  | 'klatka' | 'plecy' | 'barki' | 'biceps' | 'triceps'
  | 'czworogłowy' | 'hamstring' | 'pośladki' | 'łydki' | 'core'

// Zakresy serii/tydz (baza dla średniozaawansowanego = środek zakresu).
// Początkujący → dolna granica (MEV), zaawansowany → górna (MAV).
const VOLUME_RANGES: Record<VolumeGroup, [number, number]> = {
  'klatka':      [10, 18],
  'plecy':       [12, 20],
  'barki':       [12, 20],
  'biceps':      [8, 16],
  'triceps':     [8, 16],
  'czworogłowy': [10, 18],
  'hamstring':   [8, 16],
  'pośladki':    [8, 16],
  'łydki':       [8, 16],
  'core':        [6, 14],
}

const LEVEL_FACTOR: Record<string, number> = {
  beginner: 0.15,
  intermediate: 0.5,
  advanced: 0.9,
}

/** Docelowa tygodniowa liczba serii per partia, skalowana poziomem. */
export function weeklyTargets(level = 'intermediate'): Record<VolumeGroup, number> {
  const f = LEVEL_FACTOR[level] ?? 0.5
  const out = {} as Record<VolumeGroup, number>
  for (const g of Object.keys(VOLUME_RANGES) as VolumeGroup[]) {
    const [min, max] = VOLUME_RANGES[g]
    out[g] = Math.round(min + (max - min) * f)
  }
  return out
}

/** Surowy zakres [min, max] dla partii — do oceny „w normie / za mało / za dużo". */
export function volumeRange(group: string): [number, number] | null {
  return VOLUME_RANGES[group as VolumeGroup] || null
}

// --- Wybór splitu wg liczby dni ---

export interface SplitDay { type: string; label: string }
export interface SplitPlan { split: string; splitLabel: string; days: SplitDay[] }

export const DAY_LABEL: Record<string, string> = {
  push: 'Push', pull: 'Pull', legs: 'Legs',
  upper_a: 'Upper A', upper_b: 'Upper B', lower_a: 'Lower A', lower_b: 'Lower B',
  fbw_a: 'FBW A', fbw_b: 'FBW B', fbw_c: 'FBW C',
  chest_back: 'Klatka + Plecy', shoulders_arms: 'Barki + Ramiona',
  day_chest: 'Klatka', day_back: 'Plecy', day_shoulders: 'Barki', day_arms: 'Ramiona',
  torso: 'Tułów', limbs: 'Kończyny',
}

const SPLIT_LABEL: Record<string, string> = {
  ppl: 'Push / Pull / Legs',
  upperLower: 'Upper / Lower',
  fbw: 'Full Body Workout',
  hybryda: 'Hybryda (Upper/Lower + PPL)',
  arnold: 'Arnold Split',
  bro: 'Bro Split',
  torsoLimbs: 'Torso / Limbs',
}

// Cykliczne rozłożenie sekwencji typów na N dni (z powtórzeniem dla większej częstotliwości).
function cycle(types: string[], days: number): SplitDay[] {
  return Array.from({ length: days }, (_, i) => {
    const type = types[i % types.length]
    return { type, label: DAY_LABEL[type] || type }
  })
}

const PPL = ['push', 'pull', 'legs']
const UL = ['upper_a', 'lower_a', 'upper_b', 'lower_b']
const FBW = ['fbw_a', 'fbw_b', 'fbw_c']
const ARNOLD = ['chest_back', 'shoulders_arms', 'legs']
const BRO = ['day_chest', 'day_back', 'day_shoulders', 'legs', 'day_arms']
const TORSO_LIMBS = ['torso', 'limbs']

/**
 * Dobór splitu na podstawie liczby dni/tydzień. `override` wymusza system
 * ('ppl' | 'upperLower' | 'fbw'); bez niego generator wybiera sensowny domyślny.
 */
export function chooseSplit(days: number, override?: string | null): SplitPlan {
  const d = Math.max(2, Math.min(6, Math.round(days) || 3))

  if (override === 'ppl') return { split: 'ppl', splitLabel: SPLIT_LABEL.ppl, days: cycle(PPL, d) }
  if (override === 'fbw') return { split: 'fbw', splitLabel: SPLIT_LABEL.fbw, days: cycle(FBW, d) }
  if (override === 'upperLower') return { split: 'upperLower', splitLabel: SPLIT_LABEL.upperLower, days: cycle(UL, d) }
  if (override === 'arnold') return { split: 'arnold', splitLabel: SPLIT_LABEL.arnold, days: cycle(ARNOLD, d) }
  if (override === 'bro') return { split: 'bro', splitLabel: SPLIT_LABEL.bro, days: cycle(BRO, d) }
  if (override === 'torsoLimbs') return { split: 'torsoLimbs', splitLabel: SPLIT_LABEL.torsoLimbs, days: cycle(TORSO_LIMBS, d) }

  // Auto — najsensowniejszy split dla danej liczby dni.
  switch (d) {
    case 2: return { split: 'upperLower', splitLabel: SPLIT_LABEL.upperLower, days: cycle(['upper_a', 'lower_a'], 2) }
    case 3: return { split: 'ppl', splitLabel: SPLIT_LABEL.ppl, days: cycle(PPL, 3) }
    case 4: return { split: 'upperLower', splitLabel: SPLIT_LABEL.upperLower, days: cycle(UL, 4) }
    case 5: return {
      split: 'hybryda', splitLabel: SPLIT_LABEL.hybryda,
      days: cycle(['upper_a', 'lower_a', 'push', 'pull', 'legs'], 5)
    }
    default: return { split: 'ppl', splitLabel: SPLIT_LABEL.ppl, days: cycle(PPL, 6) } // 6 → PPL ×2
  }
}

/** Warianty splitu dostępne do ręcznego nadpisania w UI. */
export const SPLIT_OPTIONS = [
  { key: null, label: 'Auto (dobierz najlepszy)' },
  { key: 'ppl', label: 'Push / Pull / Legs' },
  { key: 'upperLower', label: 'Upper / Lower' },
  { key: 'fbw', label: 'Full Body' },
  { key: 'arnold', label: 'Arnold Split' },
  { key: 'bro', label: 'Bro Split' },
  { key: 'torsoLimbs', label: 'Torso / Limbs' },
]

// --- Estymacja realnej objętości z wygenerowanego programu ---

interface ProgExercise { name: string; primaryMuscle?: string | null; sets?: number }
interface ProgDay { plan: { exercises: ProgExercise[] } }

/** Do której grupy objętości należy ćwiczenie (primaryMuscle z AI, fallback: detekcja z nazwy). */
function groupOf(ex: ProgExercise): string | null {
  if (ex.primaryMuscle && PRIMARY_TO_GROUP[ex.primaryMuscle]) return PRIMARY_TO_GROUP[ex.primaryMuscle]
  const m = detectMuscle(ex.name)
  return m ? (MUSCLE_TO_GROUP[m] || null) : null
}

/** Sumaryczna liczba serii/tydz per partia w wygenerowanym programie. */
export function estimateWeeklyVolume(days: ProgDay[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const day of days) {
    for (const ex of day.plan.exercises || []) {
      const g = groupOf(ex)
      if (!g) continue
      out[g] = (out[g] || 0) + (Number(ex.sets) || 0)
    }
  }
  return out
}

/** Ocena partii vs cel: 'low' | 'ok' | 'high' (wg zakresu MEV–MAV). */
export function volumeStatus(group: string, sets: number): 'low' | 'ok' | 'high' | 'unknown' {
  const range = volumeRange(group)
  if (!range) return 'unknown'
  if (sets < range[0]) return 'low'
  if (sets > range[1]) return 'high'
  return 'ok'
}

// --- Walidacja programu (Faza 2) ---

export interface VolumeIssue {
  group: string
  label: string
  sets: number
  range: [number, number]
  status: 'low' | 'high'
}

export interface ProgramAnalysis {
  issues: VolumeIssue[]        // partie poza zakresem (za mało / za dużo)
  ok: boolean                  // brak problemów
  volumeByGroup: Record<string, number>
}

/**
 * Walidacja tygodniowej objętości programu vs zakresy hipertrofii.
 * Zwraca partie poza normą — do pokazania userowi (i twardego pilnowania w Strict Mode).
 */
export function analyzeProgram(days: ProgDay[], _level = 'intermediate'): ProgramAnalysis {
  const vol = estimateWeeklyVolume(days)
  const issues: VolumeIssue[] = []
  for (const g of Object.keys(VOLUME_RANGES) as VolumeGroup[]) {
    const sets = vol[g] || 0
    const st = volumeStatus(g, sets)
    if (st === 'low' || st === 'high') {
      issues.push({ group: g, label: GROUP_LABELS[g]?.name || g, sets, range: VOLUME_RANGES[g], status: st })
    }
  }
  return { issues, ok: issues.length === 0, volumeByGroup: vol }
}
