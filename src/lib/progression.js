// Deterministyczna logika progresji ciężaru — zastępuje wcześniejsze sugestie AI
// które potrafiły halucynować absurdalne wartości. Bazuje na faktach: ostatniej serii
// danego ćwiczenia (waga, powtórzenia, RPE jeśli wpisane) + docelowy zakres powtórzeń.
//
// Algorytm (priorytet od najwyższego):
//   Z RPE (preferowane — najdokładniejsze):
//     RPE ≥ 9.5 i nie zakres reps  → -5%   (za ciężko)
//     RPE ≥ 9                       → utrzymaj  (na granicy)
//     RPE ≤ 6 i max reps            → +5%   (za lekko)
//     RPE ≤ 8 i max reps            → +2.5kg / +1kg / +0.5kg (mała progresja)
//     pozostałe                     → utrzymaj
//   Bez RPE (fallback):
//     osiągnął max reps             → +2.5kg / +1kg / +0.5kg
//     nie osiągnął min reps         → -5%
//     pozostałe                     → utrzymaj
//
// Zaokrąglenia uwzględniają sensowne przyrosty siłowni:
//   - waga ≥ 40kg → krok 2.5kg (typowe talerze)
//   - 20-40kg     → krok 1kg
//   - < 20kg      → krok 0.5kg (małe hantle, izolacja)

import { lastSetFor } from './analytics.js'

/**
 * Parse range powtórzeń (np. "10-12" → [10, 12], "8" → [8, 8]).
 * Fallback do [8, 12] dla nieparsowalnych wartości.
 */
export function parseRepsRange(reps) {
  if (typeof reps !== 'string') return [8, 12]
  const m = reps.match(/(\d+)\s*-\s*(\d+)/)
  if (m) return [parseInt(m[1], 10), parseInt(m[2], 10)]
  const single = reps.match(/(\d+)/)
  if (single) {
    const v = parseInt(single[1], 10)
    return [v, v]
  }
  return [8, 12]
}

/**
 * Zaokrąglij wagę do sensownego kroku zależnego od jej skali.
 */
export function roundToPlateStep(weight) {
  if (weight <= 0) return 0
  const step = weight >= 40 ? 2.5 : (weight >= 20 ? 1 : 0.5)
  return Math.round(weight / step) * step
}

/**
 * Krok progresji w górę dla danej wagi (mała progresja przy osiągnięciu max reps).
 */
function smallProgressionIncrement(weight) {
  if (weight >= 50) return 2.5
  if (weight >= 20) return 1
  return 0.5
}

/**
 * Sugestia kolejnego ciężaru dla ćwiczenia bazująca na ostatniej sesji.
 *
 * @param {Array} history - workouts.history (z lastSetFor pobierze najnowszą serię)
 * @param {string} exerciseName - nazwa ćwiczenia
 * @param {string} targetReps - docelowy zakres powt. (np. "10-12")
 * @returns {{weight: number, reason: string, basedOn: object} | null}
 *   - weight: sugerowana waga (już zaokrąglona)
 *   - reason: krótkie polskie uzasadnienie (do UI hint)
 *   - basedOn: ostatnia seria która stała się podstawą
 */
export function suggestNextWeight(history, exerciseName, targetReps) {
  const last = lastSetFor(history, exerciseName)
  if (!last || !last.weight || last.weight <= 0) return null

  const [minReps, maxReps] = parseRepsRange(targetReps)
  const { weight, reps, rpe } = last

  let nextWeight = weight
  let reason = 'utrzymaj ciężar'

  if (rpe != null && rpe > 0) {
    // === Decyzja z RPE ===
    if (rpe >= 9.5 && reps < minReps) {
      nextWeight = weight * 0.95
      reason = `RPE ${rpe} i poniżej zakresu → −5%`
    } else if (rpe >= 9) {
      nextWeight = weight
      reason = `RPE ${rpe} — utrzymaj`
    } else if (rpe <= 6 && reps >= maxReps) {
      nextWeight = weight * 1.05
      reason = `RPE ${rpe} i max powt. → +5%`
    } else if (rpe <= 8 && reps >= maxReps) {
      const inc = smallProgressionIncrement(weight)
      nextWeight = weight + inc
      reason = `RPE ${rpe} i max powt. → +${inc}kg`
    } else {
      reason = `RPE ${rpe} — utrzymaj`
    }
  } else {
    // === Decyzja bez RPE (fallback) ===
    if (reps >= maxReps) {
      const inc = smallProgressionIncrement(weight)
      nextWeight = weight + inc
      reason = `max powt. (${reps}/${maxReps}) → +${inc}kg`
    } else if (reps < minReps) {
      nextWeight = weight * 0.95
      reason = `poniżej zakresu (${reps}/${minReps}) → −5%`
    } else {
      reason = `${reps}/${maxReps} powt. — utrzymaj`
    }
  }

  return {
    weight: roundToPlateStep(nextWeight),
    reason,
    basedOn: last
  }
}
