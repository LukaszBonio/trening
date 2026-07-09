// ─────────────────────────────────────────────────────────────────────────────
//  Premium exercise model — warstwa "STORED (rzadkie) → derive() (reguły) → score()"
//
//  Zasada: nie przechowujemy 4500 ręcznych liczb. Autor zapisuje w ExerciseEntry
//  TYLKO to, czego reguła biomechaniczna nie wyprowadzi jednoznacznie (opcjonalne
//  grupy poniżej). `deriveExerciseProfile()` dopełnia resztę deterministycznie z
//  cech ruchu (pattern, equipment, typ). STORED zawsze wygrywa nad regułą.
//
//  Ten plik NIE modyfikuje istniejącego exerciseDb.ts ani generatora — rozszerza
//  model addytywnie (wszystkie pola opcjonalne). Nieimportowany = tree-shaken.
// ─────────────────────────────────────────────────────────────────────────────

import type { Equipment, ExerciseType, MovementPattern, ExerciseEntry } from './exerciseDb'
import type { MuscleKey } from './muscles'

// ── Słowniki domenowe ────────────────────────────────────────────────────────

// Poziom zaawansowania UŻYTKOWNIKA (pełny opisowy model powstanie w fazie „profile";
// tu tylko typ, używany m.in. w recommendedRIR). Świadomie nie mieszamy opisów
// poziomów do faktów o ćwiczeniu.
export type TrainingLevel =
  | 'absolute_beginner' | 'novice' | 'beginner' | 'early_intermediate'
  | 'intermediate' | 'late_intermediate' | 'advanced' | 'elite'

export type TrainingGoalTag =
  | 'hypertrophy' | 'strength' | 'power' | 'endurance' | 'fat_loss' | 'general'

export type RangeOfMotion = 'short' | 'medium' | 'long'
export type ResistanceCurve = 'lengthened' | 'mid' | 'shortened' | 'constant' | 'variable'
export type PeakTension = 'stretch' | 'mid' | 'contraction'
export type InjuryRisk = 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
export type ExercisePriority = 'primary' | 'secondary' | 'accessory' | 'finisher'

// ── Opcjonalne grupy STORED (dopisywane do ExerciseEntry gdy reguła nie wystarcza) ──

export interface ExerciseMechanics {
  rangeOfMotion?: RangeOfMotion
  resistanceCurve?: ResistanceCurve
  peakTension?: PeakTension
  /** 0–10: potencjał stretch-mediated hypertrophy (napięcie w wydłużeniu). */
  stretchStimulus?: number
}

export interface ExerciseMetrics {
  /** 0–10 bodziec hipertroficzny. */ hypertrophy?: number
  /** 0–10 bodziec siłowy. */ strength?: number
  /** 0–10 zmęczenie ogólnoustrojowe (CNS/systemic). */ fatigueSystemic?: number
  /** 0–10 zmęczenie lokalne partii. */ fatigueLocal?: number
  /** 0–10 wymagana technika. */ techniqueDifficulty?: number
  /** 0–10 wymagana stabilizacja. */ stabilityRequirement?: number
  /** 0–10 wymagana mobilność. */ mobilityRequirement?: number
}

/** 0–10 obciążenie stawu; zapisujemy tylko stawy istotne dla ćwiczenia. */
export interface JointStress {
  shoulder: number; elbow: number; wrist: number; hip: number
  knee: number; ankle: number; lowerBack: number; neck: number
}

export interface MuscleInvolvement {
  secondary?: MuscleKey[]
  synergists?: MuscleKey[]
  stabilizers?: MuscleKey[]
}

export interface ExerciseSafety {
  injuryRisk?: InjuryRisk
  /** Tagi schorzeń wykluczających, np. 'lumbar_disc', 'mcl', 'shoulder_impingement'. */
  contraindications?: string[]
  commonInjuries?: string[]
}

export interface ExerciseCoaching {
  advantages?: string[]
  disadvantages?: string[]
  commonMistakes?: string[]
  cues?: string[]
}

export interface ExerciseProgramming {
  priority?: ExercisePriority
  bestFor?: TrainingGoalTag[]
  optimalRepRange?: string
  acceptableRepRange?: string
  /** np. '3-1-1-0' (ekscentryk-pauza-koncentryk-pauza). */
  recommendedTempo?: string
  recommendedRIR?: Partial<Record<TrainingLevel, string>>
}

/** Referencje po ID ćwiczeń (nie po nazwie) — integralność, brak literówek. */
export interface ExerciseRelations {
  alternatives?: string[]
  regressions?: string[]
  progressions?: string[]
  related?: string[]
  equipmentAlternatives?: string[]
}

export interface PremiumExerciseFields {
  mechanics?: ExerciseMechanics
  metrics?: ExerciseMetrics
  jointStress?: Partial<JointStress>
  muscles?: MuscleInvolvement
  safety?: ExerciseSafety
  coaching?: ExerciseCoaching
  programming?: ExerciseProgramming
  relations?: ExerciseRelations
}

/**
 * Ćwiczenie z opcjonalnymi polami premium. Ponieważ wszystkie grupy są opcjonalne,
 * każdy istniejący ExerciseEntry jest poprawnym Exercise (bez migracji danych).
 */
export type Exercise = ExerciseEntry & PremiumExerciseFields

// ── Warstwa DERIVED — w pełni wypełniony profil liczony z reguł + STORED ─────────

export interface DerivedExerciseProfile {
  rangeOfMotion: RangeOfMotion
  resistanceCurve: ResistanceCurve
  peakTension: PeakTension
  stretchStimulus: number       // 0–10
  hypertrophyStimulus: number   // 0–10
  strengthStimulus: number      // 0–10
  fatigueSystemic: number       // 0–10
  fatigueLocal: number          // 0–10
  spinalLoading: number         // 0–10 (== jointStress.lowerBack, ale zawsze wypełnione)
  maxJointStress: number        // 0–10 (najbardziej obciążony staw)
  techniqueDifficulty: number   // 0–10
  sfr: number                   // Stimulus-to-Fatigue Ratio (0–10, wyższy = lepszy)
  recoveryCost: number          // 0–10 (koszt regeneracji)
}

const clamp = (n: number, lo = 0, hi = 10): number => Math.max(lo, Math.min(hi, n))

// Wzorce wielostawowe „ciężkie" — wysokie zmęczenie ogólnoustrojowe.
const HEAVY_PATTERNS: MovementPattern[] = ['squat', 'hinge', 'vertical_push', 'horizontal_push']

// ── Reguły biomechaniczne (deterministyczne defaulty; STORED je nadpisuje) ──────

function ruleResistanceCurve(eq: Equipment, pattern: MovementPattern): ResistanceCurve {
  if (eq === 'wyciąg') return 'constant'          // wyciąg = stały opór na całym ROM
  if (eq === 'maszyna') return 'variable'         // krzywki maszyn = zmienny opór
  // wolny ciężar: opór grawitacyjny — profil zależy od ramienia dźwigni
  if (pattern === 'shoulder_isolation' || pattern === 'elbow_flexion') return 'mid'
  return 'variable'
}

function ruleRangeOfMotion(type: ExerciseType, pattern: MovementPattern): RangeOfMotion {
  if (pattern === 'calf' || pattern === 'core') return 'short'
  if (type === 'compound') return 'long'
  return 'medium'
}

function rulePeakTension(pattern: MovementPattern): PeakTension {
  // Heurystyka: pchanie/przysiad — napięcie w połowie/wydłużeniu; ściąganie — w skurczu.
  if (pattern === 'horizontal_pull' || pattern === 'vertical_pull') return 'contraction'
  if (pattern === 'hinge' || pattern === 'squat') return 'stretch'
  return 'mid'
}

function ruleFatigueSystemic(type: ExerciseType, eq: Equipment, pattern: MovementPattern): number {
  if (type === 'isolation') return 2.5
  let base = HEAVY_PATTERNS.includes(pattern) ? 6 : 4.5   // compound
  if (eq === 'sztanga') base += 1.5                       // wolny ciężar + stabilizacja
  else if (eq === 'maszyna' || eq === 'wyciąg') base -= 1 // maszyna zdejmuje stabilizację
  return clamp(base)
}

function ruleFatigueLocal(type: ExerciseType): number {
  return type === 'isolation' ? 6 : 4.5 // izolacja koncentruje zmęczenie lokalnie
}

function ruleSpinalLoading(eq: Equipment, pattern: MovementPattern): number {
  if (pattern === 'hinge') return eq === 'sztanga' ? 9 : 6
  if (pattern === 'squat') return eq === 'sztanga' ? 8 : (eq === 'maszyna' ? 3 : 5)
  if (pattern === 'horizontal_pull') return eq === 'sztanga' ? 6 : 3 // wiosłowanie w opadzie
  if (pattern === 'vertical_push') return eq === 'sztanga' ? 5 : 3    // OHP stojąc
  if (pattern === 'core') return 2
  return 1.5
}

// Bazowy bodziec, gdy metrics.* nie podano.
function ruleHypertrophyStimulus(type: ExerciseType): number {
  return type === 'compound' ? 7 : 6 // izolacja bywa świetna lokalnie → tylko lekko niżej
}
function ruleStrengthStimulus(type: ExerciseType, eq: Equipment): number {
  if (type !== 'compound') return 3
  return eq === 'sztanga' ? 8.5 : (eq === 'maszyna' ? 5.5 : 7) // sztanga = najlepszy overload
}
function ruleStretchStimulus(peak: PeakTension): number {
  return peak === 'stretch' ? 8 : peak === 'mid' ? 5 : 3
}

/**
 * Buduje w pełni wypełniony profil. STORED (ex.mechanics/metrics/jointStress...) ma
 * pierwszeństwo nad regułą. `sfr` i `recoveryCost` są ZAWSZE liczone (nie przechowywane).
 */
export function deriveExerciseProfile(ex: Exercise): DerivedExerciseProfile {
  const m = ex.mechanics ?? {}
  const met = ex.metrics ?? {}
  const js = ex.jointStress ?? {}

  const rangeOfMotion = m.rangeOfMotion ?? ruleRangeOfMotion(ex.exerciseType, ex.movementPattern)
  const resistanceCurve = m.resistanceCurve ?? ruleResistanceCurve(ex.equipment, ex.movementPattern)
  const peakTension = m.peakTension ?? rulePeakTension(ex.movementPattern)

  const stretchStimulus = m.stretchStimulus ?? ruleStretchStimulus(peakTension)
  const hypertrophyStimulus = met.hypertrophy ?? ruleHypertrophyStimulus(ex.exerciseType)
  const strengthStimulus = met.strength ?? ruleStrengthStimulus(ex.exerciseType, ex.equipment)

  const fatigueSystemic = met.fatigueSystemic ?? ruleFatigueSystemic(ex.exerciseType, ex.equipment, ex.movementPattern)
  const fatigueLocal = met.fatigueLocal ?? ruleFatigueLocal(ex.exerciseType)
  const spinalLoading = js.lowerBack ?? ruleSpinalLoading(ex.equipment, ex.movementPattern)
  const techniqueDifficulty = met.techniqueDifficulty ?? deriveTechniqueFromDifficulty(ex)

  const jointValues = Object.values(js).filter((v): v is number => typeof v === 'number')
  const maxJointStress = jointValues.length ? Math.max(...jointValues, spinalLoading) : spinalLoading

  // SFR = ile bodźca dostajemy na jednostkę zmęczenia. Izolacja/maszyna zwykle wysoko.
  const sfr = clamp((hypertrophyStimulus / Math.max(fatigueSystemic, 1)) * 3)
  // Koszt regeneracji: głównie systemic + kręgosłup + najcięższy staw.
  const recoveryCost = clamp(0.5 * fatigueSystemic + 0.3 * spinalLoading + 0.2 * maxJointStress)

  return {
    rangeOfMotion, resistanceCurve, peakTension, stretchStimulus,
    hypertrophyStimulus, strengthStimulus, fatigueSystemic, fatigueLocal,
    spinalLoading, maxJointStress, techniqueDifficulty, sfr, recoveryCost
  }
}

// Fallback techniki z istniejącego pola difficulty (dopóki brak metrics.techniqueDifficulty).
function deriveTechniqueFromDifficulty(ex: Exercise): number {
  switch (ex.difficulty) {
    case 'advanced': return 7.5
    case 'intermediate': return 5
    default: return 2.5
  }
}
