// Szczegóły techniczne ćwiczeń — dane STORED per id (wzorzec jak exercisePremium).
// Rozszerzają bazę exerciseDb o pełny arkusz techniczny: dokładny sprzęt i uchwyt,
// pozycję startową, wykonanie krok po kroku, zakres ruchu, mięśnie, błędy i wskazówki.
// Wyświetlane w UI w modalu "?" przy ćwiczeniu (ExerciseInfoModal).
//
// Dane (~3000 linii) są ŁADOWANE LENIWIE (dynamic import) — nie wchodzą do chunku
// widoku Trening. Ścieżka na gorąco (przycisk „?") potrzebuje tylko `hasExerciseDetails`
// (czy ćwiczenie jest w bazie), a pełny arkusz dociąga się przy otwarciu modala/coacha.
import { findExerciseByName } from './exerciseDb'

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

// Lekki, synchroniczny check dla ścieżki na gorąco (przycisk „?"). Każde ćwiczenie
// z bazy MA arkusz (niezmiennik pilnowany testem pokrycia), więc wystarczy sprawdzić
// obecność w bazie — bez ładowania ciężkich danych.
export function hasExerciseDetails(name: string): boolean {
  return !!findExerciseByName(name)
}

// Leniwe załadowanie + cache pełnej mapy arkuszy (dynamic import 3 plików danych).
let _cache: Record<string, ExerciseDetails> | null = null
async function loadMap(): Promise<Record<string, ExerciseDetails>> {
  if (_cache) return _cache
  const [push, pull, legs] = await Promise.all([
    import('./exerciseDetailsPush'),
    import('./exerciseDetailsPull'),
    import('./exerciseDetailsLegs')
  ])
  _cache = { ...push.PUSH_DETAILS, ...pull.PULL_DETAILS, ...legs.LEGS_DETAILS }
  return _cache
}

export async function loadExerciseDetailsById(id: string): Promise<ExerciseDetails | null> {
  return (await loadMap())[id] || null
}

/** Szczegóły po nazwie (kanonicznej lub aliasie) — null dla ćwiczeń spoza bazy. Leniwe. */
export async function loadExerciseDetailsByName(name: string): Promise<ExerciseDetails | null> {
  const ex = findExerciseByName(name)
  if (!ex) return null
  return (await loadMap())[ex.id] || null
}
