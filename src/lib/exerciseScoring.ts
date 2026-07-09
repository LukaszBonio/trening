// ─────────────────────────────────────────────────────────────────────────────
//  Ocena ćwiczenia — CZYSTA FUNKCJA kontekstowa (nie pole w bazie!).
//
//  `exerciseRating` celowo nie istnieje jako dana: ocena zależy od celu i poziomu
//  użytkownika (pod hipertrofię ≠ pod siłę), więc liczymy ją na żądanie z profilu
//  derive(). Przechowywana ocena rozjeżdżałaby się z resztą pól (łamie DRY).
// ─────────────────────────────────────────────────────────────────────────────

import { deriveExerciseProfile, type Exercise, type TrainingLevel, type TrainingGoalTag } from './exerciseModel'

export interface ScoringContext {
  goal: TrainingGoalTag
  level: TrainingLevel
  /** Tagi kontuzji użytkownika (dopasowywane do safety.contraindications). */
  injuries?: string[]
}

export interface ExerciseScore {
  /** Wynik 0–100 (wyższy = lepszy dobór w danym kontekście). */
  total: number
  /** Twardy filtr: false = ćwiczenie przeciwwskazane (total = 0). */
  eligible: boolean
  /** Rozbicie składników (transparentność + debugowanie generatora). */
  breakdown: {
    stimulus: number
    sfr: number
    safety: number
    technique: number
  }
}

// Waga poziomu użytkownika → tolerancja trudnej techniki (0 = brak, 1 = pełna).
const LEVEL_SKILL: Record<TrainingLevel, number> = {
  absolute_beginner: 0.15, novice: 0.3, beginner: 0.45, early_intermediate: 0.6,
  intermediate: 0.72, late_intermediate: 0.82, advanced: 0.92, elite: 1
}

/**
 * Ocenia dopasowanie ćwiczenia do (cel, poziom, kontuzje). Deterministyczna,
 * bez efektów ubocznych — nadaje się do sortowania kandydatów w generatorze.
 */
export function scoreExercise(ex: Exercise, ctx: ScoringContext): ExerciseScore {
  const p = deriveExerciseProfile(ex)

  // 1) Twardy filtr kontuzji: przeciwwskazanie = dyskwalifikacja.
  const contra = ex.safety?.contraindications ?? []
  const injuries = ctx.injuries ?? []
  const eligible = !injuries.some(i => contra.includes(i))
  if (!eligible) {
    return { total: 0, eligible: false, breakdown: { stimulus: 0, sfr: 0, safety: 0, technique: 0 } }
  }

  // 2) Bodziec zależny od celu.
  let stimulus: number
  switch (ctx.goal) {
    case 'strength':
    case 'power':
      stimulus = 0.7 * p.strengthStimulus + 0.3 * p.hypertrophyStimulus
      break
    case 'endurance':
    case 'fat_loss':
      // niższy koszt regeneracji cenniejszy przy wysokiej częstotliwości/objętości
      stimulus = 0.6 * p.hypertrophyStimulus + 0.4 * (10 - p.recoveryCost)
      break
    case 'hypertrophy':
      stimulus = 0.6 * p.hypertrophyStimulus + 0.4 * p.stretchStimulus
      break
    default: // general
      stimulus = 0.5 * p.hypertrophyStimulus + 0.5 * p.strengthStimulus
  }

  // 3) SFR — premiujemy wysoki bodziec na jednostkę zmęczenia.
  const sfr = p.sfr

  // 4) Bezpieczeństwo — kara za ryzyko kontuzji (miękka, gdy user ma jakieś kontuzje).
  const riskPenalty = injuryRiskPenalty(ex) * (injuries.length ? 1 : 0.5)
  const safety = clamp(10 - riskPenalty)

  // 5) Technika — kara, gdy trudność przewyższa umiejętności poziomu.
  const skill = LEVEL_SKILL[ctx.level]
  const techGap = Math.max(0, p.techniqueDifficulty / 10 - skill)  // 0..1
  const technique = clamp(10 - techGap * 12)                        // duży gap mocno karze

  // Wagi składników (suma = 1). Skala 0–100.
  const total = clamp(
    0.42 * stimulus + 0.23 * sfr + 0.20 * safety + 0.15 * technique,
    0, 10
  ) * 10

  return {
    total: Math.round(total),
    eligible: true,
    breakdown: {
      stimulus: round1(stimulus),
      sfr: round1(sfr),
      safety: round1(safety),
      technique: round1(technique)
    }
  }
}

function injuryRiskPenalty(ex: Exercise): number {
  switch (ex.safety?.injuryRisk) {
    case 'very_high': return 8
    case 'high': return 6
    case 'medium': return 3.5
    case 'low': return 1.5
    case 'very_low': return 0.5
    default: return 2 // brak danych → neutralnie-ostrożnie
  }
}

const clamp = (n: number, lo = 0, hi = 10): number => Math.max(lo, Math.min(hi, n))
const round1 = (n: number): number => Math.round(n * 10) / 10
