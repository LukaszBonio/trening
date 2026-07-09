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

// Skrót do zwięzłego zapisu: peak, stretch, jointStress (istotne stawy), ryzyko, przeciwwskazania.
type JS = Partial<JointStress>
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

  // ═══════════════ PULL ═══════════════
  // ── PLECY SZEROKIE ──
  'sciaganie-drazka-wyciagu-gornego':     p('contraction', 5, { shoulder: 3, elbow: 3, lowerBack: 2 }, 'very_low'),
  'sciaganie-drazka-podchwytem':          p('contraction', 5, { shoulder: 3, elbow: 4, lowerBack: 2 }, 'low'),
  'sciaganie-drazka-na-prostych-ramionach': p('contraction', 6, { shoulder: 4, lowerBack: 2 }, 'low'),
  'pullover-z-hantla':                    p('stretch',    8, { shoulder: 5, elbow: 2, lowerBack: 2 }, 'medium',   ['shoulder_impingement']),
  'pullover-na-wyciagu':                  p('stretch',    7, { shoulder: 4, lowerBack: 2 }, 'low',      ['shoulder_impingement']),

  // ── PLECY ŚRODKOWE ── (wiosłowania w opadzie mocno obciążają L-kręgosłup)
  'wioslowanie-sztanga-w-opadzie':        p('contraction', 5, { lowerBack: 7, shoulder: 4, elbow: 4 }, 'medium',   ['lumbar_disc']),
  'wioslowanie-hantla':                   p('contraction', 6, { lowerBack: 3, shoulder: 4, elbow: 4 }, 'low'),
  'wioslowanie-pendlay':                  p('contraction', 5, { lowerBack: 7, shoulder: 4, elbow: 4 }, 'medium',   ['lumbar_disc']),
  'wioslowanie-na-wyciagu-siedzac':       p('contraction', 6, { lowerBack: 4, shoulder: 3, elbow: 4 }, 'low'),
  'wioslowanie-t-bar':                    p('contraction', 5, { lowerBack: 6, shoulder: 4, elbow: 4 }, 'medium',   ['lumbar_disc']),
  'wioslowanie-na-maszynie':              p('contraction', 6, { lowerBack: 1, shoulder: 3, elbow: 4 }, 'very_low'),
  'wioslowanie-z-podparciem-klatki':      p('contraction', 6, { lowerBack: 1, shoulder: 3, elbow: 4 }, 'very_low'),

  // ── KAPTUR ──
  'wzruszenia-sztanga':                   p('contraction', 3, { shoulder: 3, wrist: 3, neck: 3 }, 'low'),
  'wzruszenia-hantlami':                  p('contraction', 3, { shoulder: 3, neck: 3 }, 'low'),

  // ── PLECY DOLNE ── (najwyższe osiowe obciążenie w bazie)
  'martwy-ciag-klasyczny':                p('stretch',    6, { lowerBack: 9, hip: 8, knee: 4 }, 'high',     ['lumbar_disc']),
  'martwy-ciag-rumunski':                 p('stretch',    8, { lowerBack: 7, hip: 7 }, 'medium',   ['lumbar_disc']),
  'martwy-ciag-rumunski-hantle':          p('stretch',    8, { lowerBack: 6, hip: 6 }, 'medium',   ['lumbar_disc']),
  'martwy-ciag-sumo':                     p('stretch',    5, { lowerBack: 7, hip: 8, knee: 5 }, 'high',     ['lumbar_disc']),
  'wyprosty-na-lawce-rzymskiej':          p('contraction', 5, { lowerBack: 5, hip: 5 }, 'low'),

  // ── BARKI TYLNE ──
  'wznosy-hantli-w-opadzie':              p('contraction', 3, { shoulder: 4, lowerBack: 4 }, 'low'),
  'odwrotne-rozpietki-na-maszynie':       p('contraction', 3, { shoulder: 3 }, 'very_low'),
  'face-pull':                            p('contraction', 3, { shoulder: 3, elbow: 2 }, 'very_low'),
  'odwrotne-rozpietki-na-wyciagu':        p('contraction', 4, { shoulder: 3, lowerBack: 2 }, 'low'),

  // ── BICEPS + PRZEDRAMIĘ ──
  'uginanie-na-modlitewniku':             p('stretch',    7, { elbow: 5, wrist: 2 }, 'medium',   ['elbow_pain']),
  'uginanie-hantli-na-lawce-skosnej':     p('stretch',    8, { elbow: 4, shoulder: 3 }, 'low'),
  'uginanie-koncentryczne':               p('contraction', 4, { elbow: 3 }, 'very_low'),
  'spider-curl':                          p('contraction', 5, { elbow: 4 }, 'low'),
  'uginanie-ramion-ze-sztanga':           p('mid',        4, { elbow: 4, wrist: 3, lowerBack: 2 }, 'low'),
  'uginanie-ze-sztanga-ez':               p('mid',        4, { elbow: 3, wrist: 2 }, 'very_low'),
  'uginanie-ramion-z-hantlami':           p('mid',        4, { elbow: 3 }, 'very_low'),
  'uginanie-ramion-na-wyciagu':           p('contraction', 4, { elbow: 3 }, 'very_low'),
  'uginanie-hantli-mlotkowo':             p('mid',        4, { elbow: 3 }, 'very_low'),
  'uginanie-mlotkowo-na-wyciagu':         p('contraction', 4, { elbow: 3 }, 'very_low'),
  'uginanie-zottmana':                    p('mid',        4, { elbow: 3, wrist: 4 }, 'low'),
  'uginanie-nadgarstkow-ze-sztanga':      p('contraction', 3, { wrist: 5, elbow: 2 }, 'low',      ['wrist_pain']),

  // ═══════════════ LEGS ═══════════════
  // ── CZWOROGŁOWY ──
  'przysiad-ze-sztanga':                  p('stretch',    7, { lowerBack: 8, knee: 6, hip: 6, ankle: 4 }, 'medium',   ['lumbar_disc', 'knee_pain']),
  'przysiad-przedni':                     p('stretch',    7, { knee: 7, lowerBack: 6, ankle: 5 }, 'medium',   ['knee_pain']),
  'przysiad-z-hantlem':                   p('stretch',    6, { knee: 5, hip: 5, lowerBack: 3 }, 'low'),
  'hack-squat':                           p('stretch',    7, { knee: 7, lowerBack: 3 }, 'medium',   ['knee_pain']),
  'przysiad-na-suwnicy':                  p('stretch',    6, { knee: 6, lowerBack: 4 }, 'low',      ['knee_pain']),
  'wyciskanie-nogami':                    p('mid',        6, { knee: 6, lowerBack: 4 }, 'low',      ['knee_pain']),
  'przysiad-bulgarski':                   p('stretch',    7, { knee: 6, hip: 6 }, 'low',      ['knee_pain']),
  'wykroki-z-hantlami':                   p('stretch',    6, { knee: 6, hip: 5 }, 'low',      ['knee_pain']),
  'wykroki-ze-sztanga':                   p('stretch',    6, { knee: 6, lowerBack: 4 }, 'medium',   ['knee_pain']),
  'wykroki-chodzace':                     p('stretch',    6, { knee: 6, hip: 5 }, 'low',      ['knee_pain']),
  'wchodzenie-na-skrzynie':               p('contraction', 5, { knee: 5, hip: 5 }, 'low',      ['knee_pain']),
  'wyprosty-nog':                         p('contraction', 5, { knee: 6 }, 'low',      ['knee_pain']),

  // ── DWUGŁOWE ──
  'uginanie-nog-lezac':                   p('contraction', 4, { knee: 4 }, 'very_low'),
  'uginanie-nog-siedzac':                 p('stretch',    6, { knee: 4 }, 'very_low'),
  'nordic-curl':                          p('stretch',    8, { knee: 5, lowerBack: 2 }, 'medium',   ['knee_pain']),
  'glute-ham-raise':                      p('stretch',    7, { knee: 5, hip: 4, lowerBack: 3 }, 'low'),

  // ── POŚLADKI ──
  'wypychanie-bioder':                    p('contraction', 4, { hip: 6, lowerBack: 3 }, 'low'),
  'most-biodrowy':                        p('contraction', 3, { hip: 4, lowerBack: 2 }, 'very_low'),
  'most-biodrowy-ze-sztanga':             p('contraction', 3, { hip: 5, lowerBack: 3 }, 'low'),
  'odwodzenie-nog-na-maszynie':           p('contraction', 3, { hip: 3 }, 'very_low'),
  'odwodzenie-nogi-na-wyciagu':           p('contraction', 3, { hip: 3 }, 'very_low'),

  // ── PRZYWODZICIELE ──
  'przywodzenie-nog-na-maszynie':         p('contraction', 5, { hip: 3 }, 'low'),
  'przysiad-sumo-z-hantlem':              p('stretch',    6, { hip: 5, knee: 5, lowerBack: 3 }, 'low',      ['knee_pain']),

  // ── ŁYDKI ──
  'wspięcia-na-palce-stojac':             p('contraction', 7, { ankle: 4 }, 'very_low'),
  'wspięcia-na-palce-siedzac':            p('contraction', 6, { ankle: 4, knee: 3 }, 'very_low'),
  'wspięcia-na-palce-ze-sztanga':         p('contraction', 7, { ankle: 4, lowerBack: 3 }, 'low'),
  'wspięcia-na-palce-na-leg-press':       p('contraction', 7, { ankle: 4 }, 'very_low'),
  'wspięcia-na-palce-jednonoz':           p('contraction', 8, { ankle: 5 }, 'very_low'),

  // ── CORE / BRZUCH ── (zgięcie/rotacja pod obciążeniem → lumbar_disc)
  'brzuszki':                             p('contraction', 3, { lowerBack: 3, neck: 3 }, 'low',      ['lumbar_disc']),
  'brzuszki-na-wyciagu':                  p('contraction', 4, { lowerBack: 3, neck: 2 }, 'low',      ['lumbar_disc']),
  'unoszenie-nog-w-zwisie':               p('contraction', 4, { lowerBack: 3, shoulder: 3 }, 'low'),
  'skrety-rosyjskie':                     p('contraction', 3, { lowerBack: 4 }, 'low',      ['lumbar_disc']),
  'deska':                                p('contraction', 2, { lowerBack: 2, shoulder: 2 }, 'very_low'),
  'ab-wheel-rollout':                     p('stretch',    6, { lowerBack: 5, shoulder: 4 }, 'medium',   ['lumbar_disc']),
}

/** Scala fakty (ExerciseEntry) z warstwą premium → pełny Exercise dla derive()/score(). */
export function withPremium(entry: ExerciseEntry): Exercise {
  return { ...entry, ...(EXERCISE_PREMIUM[entry.id] ?? {}) }
}
