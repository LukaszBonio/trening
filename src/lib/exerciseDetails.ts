// Szczegóły techniczne ćwiczeń — dane STORED per id (wzorzec jak exercisePremium).
// Rozszerzają bazę exerciseDb o pełny arkusz techniczny: dokładny sprzęt i uchwyt,
// pozycję startową, wykonanie krok po kroku, zakres ruchu, mięśnie, błędy i wskazówki.
// Wyświetlane w UI w modalu "?" przy ćwiczeniu (ExerciseInfoModal).
import { findExerciseByName } from './exerciseDb'
import { PUSH_DETAILS } from './exerciseDetailsPush'
import { PULL_DETAILS } from './exerciseDetailsPull'
import { LEGS_DETAILS } from './exerciseDetailsLegs'

export interface ExerciseDetails {
  /** Dokładny rodzaj sprzętu, np. "sztanga prosta", "sztanga EZ", "wyciąg górny", "suwnica Smitha" */
  equipmentDetail: string
  /** Uchwyt/akcesorium, np. "lina (rope)", "drążek prosty", "uchwyt V"; null gdy nie dotyczy */
  attachment: string | null
  /** Pozycja startowa — ustawienie ciała i sprzętu (1-2 zdania) */
  startPosition: string
  /** Technika wykonania krok po kroku (3-6 kroków) */
  execution: string[]
  /** Zakres ruchu: od jakiej pozycji do jakiej (1 zdanie) */
  rangeOfMotion: string
  /** Mięśnie główne (polskie nazwy) */
  musclesPrimary: string[]
  /** Mięśnie pomocnicze (polskie nazwy) */
  musclesSecondary: string[]
  /** Najczęstsze błędy (3-5) */
  commonMistakes: string[]
  /** Praktyczne wskazówki poprawiające technikę (2-4) */
  tips: string[]
}

export const EXERCISE_DETAILS: Record<string, ExerciseDetails> = {
  ...PUSH_DETAILS,
  ...PULL_DETAILS,
  ...LEGS_DETAILS
}

export function getExerciseDetailsById(id: string): ExerciseDetails | null {
  return EXERCISE_DETAILS[id] || null
}

/** Szczegóły po nazwie ćwiczenia (kanonicznej lub aliasie) — null dla ćwiczeń spoza bazy. */
export function getExerciseDetailsByName(name: string): ExerciseDetails | null {
  const ex = findExerciseByName(name)
  return ex ? (EXERCISE_DETAILS[ex.id] || null) : null
}
