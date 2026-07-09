// ─────────────────────────────────────────────────────────────────────────────
//  Dane premium (STORED) keyowane po id ćwiczenia — warstwa dostrajająca reguły
//  deriveExerciseProfile(). Trzymane OSOBNO od exerciseDb.ts (fakty: nazwa/mięsień/
//  sprzęt), żeby nie mieszać danych bazowych z metrykami i nie dotykać istniejącej
//  bazy. Ćwiczenia bez wpisu tutaj korzystają wyłącznie z reguł (derive).
//
//  Zakres: pełny PUSH (41 ćwiczeń). Wartości zweryfikowane biomechanicznie
//  (peakTension, stretchStimulus 0–10, jointStress 0–10, injuryRisk,
//  contraindications). Pull/Legs — kolejne fazy.
// ─────────────────────────────────────────────────────────────────────────────

import type { PremiumExerciseFields, PeakTension, InjuryRisk, JointStress, Exercise } from './exerciseModel'
import type { ExerciseEntry } from './exerciseDb'

// Skrót do zwięzłego zapisu: peak, stretch, {bark/łokieć/nadgarstek/L}, ryzyko, przeciwwskazania.
type JS = Partial<Pick<JointStress, 'shoulder' | 'elbow' | 'wrist' | 'lowerBack'>>
function p(peak: PeakTension, stretch: number, js: JS, risk: InjuryRisk, contra: string[] = []): PremiumExerciseFields {
  return {
    mechanics: { peakTension: peak, stretchStimulus: stretch },
    jointStress: js,
    safety: contra.length ? { injuryRisk: risk, contraindications: contra } : { injuryRisk: risk }
  }
}

export const EXERCISE_PREMIUM: Record<string, PremiumExerciseFields> = {
  // ── KLATKA GÓRNA ──
  'wyciskanie-sztangi-na-lawce-skosnej':  p('mid',        6, { shoulder: 6, elbow: 4, wrist: 4, lowerBack: 3 }, 'medium',   ['shoulder_impingement']),
  'wyciskanie-hantli-na-lawce-skosnej':   p('stretch',    8, { shoulder: 5, elbow: 4, wrist: 3, lowerBack: 2 }, 'low',      ['shoulder_impingement']),
  'wyciskanie-na-maszynie-na-skosie':     p('mid',        5, { shoulder: 4, elbow: 3, wrist: 2, lowerBack: 1 }, 'very_low'),
  'rozpietki-hantlami-na-lawce-skosnej':  p('stretch',    9, { shoulder: 6, elbow: 2, wrist: 2, lowerBack: 2 }, 'medium',   ['shoulder_impingement']),
  'krzyzowanie-linek-dolne':              p('contraction', 5, { shoulder: 4, elbow: 2, wrist: 2, lowerBack: 2 }, 'low'),
  'pompki-z-nogami-na-podwyzszeniu':      p('mid',        5, { shoulder: 4, elbow: 3, wrist: 5, lowerBack: 2 }, 'low',      ['wrist_pain']),

  // ── KLATKA ŚRODKOWA ──
  'wyciskanie-sztangi-na-lawce-poziomej': p('mid',        6, { shoulder: 6, elbow: 4, wrist: 4, lowerBack: 3 }, 'medium',   ['shoulder_impingement']),
  'wyciskanie-hantli-na-lawce-poziomej':  p('stretch',    8, { shoulder: 5, elbow: 4, wrist: 3, lowerBack: 2 }, 'low',      ['shoulder_impingement']),
  'wyciskanie-na-maszynie':               p('mid',        5, { shoulder: 4, elbow: 3, wrist: 2, lowerBack: 1 }, 'very_low'),
  'pompki-klasyczne':                     p('mid',        5, { shoulder: 3, elbow: 3, wrist: 5, lowerBack: 2 }, 'very_low', ['wrist_pain']),
  'rozpietki-hantlami-na-lawce-poziomej': p('stretch',    9, { shoulder: 6, elbow: 2, wrist: 2, lowerBack: 2 }, 'medium',   ['shoulder_impingement']),
  'rozpietki-na-maszynie':                p('contraction', 6, { shoulder: 4, elbow: 2, wrist: 2, lowerBack: 1 }, 'low',      ['shoulder_impingement']),
  'krzyzowanie-linek':                    p('contraction', 5, { shoulder: 4, elbow: 2, wrist: 2, lowerBack: 2 }, 'low'),

  // ── KLATKA DOLNA ──
  'wyciskanie-sztangi-na-lawce-ujemnej':  p('mid',        5, { shoulder: 5, elbow: 4, wrist: 4, lowerBack: 2 }, 'low',      ['shoulder_impingement']),
  'wyciskanie-hantli-na-lawce-ujemnej':   p('stretch',    7, { shoulder: 4, elbow: 4, wrist: 3, lowerBack: 2 }, 'low'),
  'pompki-na-poreczach':                  p('stretch',    8, { shoulder: 7, elbow: 5, wrist: 4, lowerBack: 2 }, 'high',     ['shoulder_impingement', 'ac_joint']),
  'krzyzowanie-linek-gorne':              p('contraction', 5, { shoulder: 4, elbow: 2, wrist: 2, lowerBack: 2 }, 'low'),

  // ── BARKI PRZEDNIE ──
  'wyciskanie-sztangi-nad-glowe':         p('mid',        4, { shoulder: 6, elbow: 4, wrist: 4, lowerBack: 6 }, 'medium',   ['shoulder_impingement', 'lumbar_disc']),
  'wyciskanie-hantli-nad-glowe':          p('mid',        4, { shoulder: 5, elbow: 4, wrist: 3, lowerBack: 5 }, 'medium',   ['shoulder_impingement']),
  'wyciskanie-hantli-siedzac':            p('mid',        4, { shoulder: 5, elbow: 4, wrist: 3, lowerBack: 3 }, 'low',      ['shoulder_impingement']),
  'wyciskanie-arnolda':                   p('mid',        5, { shoulder: 6, elbow: 3, wrist: 3, lowerBack: 3 }, 'medium',   ['shoulder_impingement']),
  'wyciskanie-nad-glowa-na-maszynie':     p('mid',        4, { shoulder: 4, elbow: 3, wrist: 2, lowerBack: 2 }, 'low'),
  'wznosy-hantli-przodem':                p('contraction', 3, { shoulder: 5, elbow: 1, wrist: 2, lowerBack: 2 }, 'low',      ['shoulder_impingement']),
  'wznosy-przodem-na-wyciagu':            p('contraction', 4, { shoulder: 4, elbow: 1, wrist: 2, lowerBack: 2 }, 'low',      ['shoulder_impingement']),

  // ── BARKI BOCZNE ──
  'wznosy-hantli-bokiem':                 p('contraction', 2, { shoulder: 4, elbow: 1, wrist: 2, lowerBack: 2 }, 'low',      ['shoulder_impingement']),
  'wznosy-hantli-bokiem-siedzac':         p('contraction', 2, { shoulder: 4, elbow: 1, wrist: 2, lowerBack: 1 }, 'low',      ['shoulder_impingement']),
  'wznosy-bokiem-na-wyciagu':             p('contraction', 4, { shoulder: 4, elbow: 1, wrist: 2, lowerBack: 2 }, 'low'),
  'wznosy-bokiem-na-maszynie':            p('contraction', 3, { shoulder: 3, elbow: 1, wrist: 1, lowerBack: 1 }, 'very_low'),
  'wioslowanie-sztangi-pod-brode':        p('contraction', 2, { shoulder: 6, elbow: 3, wrist: 3, lowerBack: 3 }, 'medium',   ['shoulder_impingement']),

  // ── TRICEPS — GŁOWA DŁUGA ──
  'francuskie-wyciskanie-sztangi':        p('stretch',    7, { shoulder: 3, elbow: 6, wrist: 3, lowerBack: 2 }, 'medium',   ['elbow_pain']),
  'francuskie-wyciskanie-sztanga-ez':     p('stretch',    7, { shoulder: 3, elbow: 5, wrist: 2, lowerBack: 2 }, 'low',      ['elbow_pain']),
  'francuskie-wyciskanie-hantli':         p('stretch',    7, { shoulder: 3, elbow: 5, wrist: 2, lowerBack: 2 }, 'low',      ['elbow_pain']),
  'wyprosty-triceps-nad-glowa-na-wyciagu': p('stretch',   8, { shoulder: 4, elbow: 5, wrist: 2, lowerBack: 2 }, 'low',      ['elbow_pain']),
  'wyprosty-triceps-nad-glowa-z-hantla':  p('stretch',    8, { shoulder: 4, elbow: 5, wrist: 2, lowerBack: 3 }, 'low',      ['elbow_pain', 'shoulder_impingement']),
  'wyprosty-triceps-nad-glowa-jednorecz': p('stretch',    8, { shoulder: 4, elbow: 5, wrist: 2, lowerBack: 2 }, 'low',      ['elbow_pain']),

  // ── TRICEPS — GŁOWA BOCZNA ──
  'wyprosty-triceps-na-wyciagu':          p('contraction', 3, { shoulder: 2, elbow: 4, wrist: 2, lowerBack: 1 }, 'very_low', ['elbow_pain']),
  'pushdown-z-lina':                      p('contraction', 3, { shoulder: 2, elbow: 4, wrist: 2, lowerBack: 1 }, 'very_low'),
  'wyprosty-triceps-na-wyciagu-jednorecz': p('contraction', 3, { shoulder: 2, elbow: 4, wrist: 2, lowerBack: 1 }, 'very_low'),
  'wyprosty-hantla-w-opadzie':            p('contraction', 2, { shoulder: 3, elbow: 4, wrist: 2, lowerBack: 3 }, 'low'),

  // ── TRICEPS — GŁOWA PRZYŚRODKOWA ──
  'wyciskanie-waskim-chwytem':            p('mid',        5, { shoulder: 4, elbow: 5, wrist: 5, lowerBack: 3 }, 'medium',   ['elbow_pain', 'wrist_pain']),
  'pompki-diamentowe':                    p('mid',        5, { shoulder: 3, elbow: 5, wrist: 6, lowerBack: 2 }, 'low',      ['wrist_pain', 'elbow_pain']),
}

/** Scala fakty (ExerciseEntry) z warstwą premium → pełny Exercise dla derive()/score(). */
export function withPremium(entry: ExerciseEntry): Exercise {
  return { ...entry, ...(EXERCISE_PREMIUM[entry.id] ?? {}) }
}
