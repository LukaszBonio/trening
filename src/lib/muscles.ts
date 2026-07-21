import { findExerciseByName, type Equipment } from './exerciseDb'

export type MuscleKey =
  | 'chest_upper' | 'chest_middle' | 'chest_lower'
  | 'shoulder_front' | 'shoulder_side' | 'shoulder_rear'
  | 'back_upper' | 'back_lats' | 'back_middle' | 'back_lower'
  | 'biceps_long' | 'biceps_short' | 'biceps_brach'
  | 'triceps_long' | 'triceps_lat' | 'triceps_med'
  | 'forearms'
  | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'adductors'
  | 'abs' | 'obliques' | 'core';

export interface EquipmentInfo {
  label: string;
  icon: string;
}

interface EquipmentKeyword {
  pattern: string;
  label: string;
  icon: string;
}

const MUSCLE_NAMES: Record<MuscleKey, string> = {
  'chest_upper':    'Klatka górna',
  'chest_middle':   'Klatka środkowa',
  'chest_lower':    'Klatka dolna',
  'shoulder_front': 'Barki przednie',
  'shoulder_side':  'Barki boczne',
  'shoulder_rear':  'Barki tylne',
  'back_upper':     'Plecy górne (kapturowy)',
  'back_lats':      'Plecy szerokie (najszersze)',
  'back_middle':    'Plecy środkowe (równoległoboczne)',
  'back_lower':     'Plecy dolne (prostowniki)',
  'biceps_long':    'Biceps - głowa długa',
  'biceps_short':   'Biceps - głowa krótka',
  'biceps_brach':   'Ramienny (brachialis)',
  'triceps_long':   'Triceps - głowa długa',
  'triceps_lat':    'Triceps - głowa boczna',
  'triceps_med':    'Triceps - głowa przyśrodkowa',
  'forearms':       'Przedramię',
  'quads':          'Czworogłowy uda',
  'hamstrings':     'Dwugłowy uda (hamstring)',
  'glutes':         'Pośladki',
  'calves':         'Łydki',
  'adductors':      'Przywodziciele',
  'abs':            'Brzuch (proste)',
  'obliques':       'Brzuch skośne',
  'core':           'Core (głębokie stabilizatory)'
};

export const EXERCISE_TO_MUSCLE: Record<string, MuscleKey> = {
  // KLATKA - GÓRNA
  'wyciskanie sztangi na ławce skośnej dodatniej': 'chest_upper',
  'wyciskanie sztangi na ławce skośnej':           'chest_upper',
  'wyciskanie sztangi skośnej':                    'chest_upper',
  'wyciskanie hantli na skosie':                   'chest_upper',
  'wyciskanie hantli na ławce skośnej':            'chest_upper',
  'rozpiętki na skosie':                           'chest_upper',
  'rozpiętki na ławce skośnej':                    'chest_upper',
  'wyciskanie na skosie':                          'chest_upper',
  'wyciskanie sztangi wąskim chwytem na skosie':   'chest_upper',
  'pompki z nogami uniesionymi':                   'chest_upper',
  'cable crossover górny':                         'chest_upper',
  'krzyżowanie linek górne':                       'chest_upper',
  // KLATKA - DOLNA
  'wyciskanie na ławce ujemnej':                   'chest_lower',
  'pompki na poręczach':                           'chest_lower',
  'dipy':                                          'chest_lower',
  'krzyżowanie linek dolne':                       'chest_lower',
  'cable crossover dolny':                         'chest_lower',
  // KLATKA - ŚRODKOWA
  'wyciskanie sztangi na ławce poziomej':          'chest_middle',
  'wyciskanie sztangi na ławce płaskiej':          'chest_middle',
  'wyciskanie sztangi':                            'chest_middle',
  'wyciskanie hantli na ławce poziomej':           'chest_middle',
  'wyciskanie hantli na ławce płaskiej':           'chest_middle',
  'wyciskanie hantli':                             'chest_middle',
  'rozpiętki na ławce poziomej':                   'chest_middle',
  'rozpiętki na ławce płaskiej':                   'chest_middle',
  'rozpiętki':                                     'chest_middle',
  'rozpiętki na maszynie':                         'chest_middle',
  'butterfly':                                     'chest_middle',
  'pompki klasyczne':                              'chest_middle',
  'pompki':                                        'chest_middle',
  'wyciskanie na maszynie':                        'chest_middle',
  'krzyżowanie linek':                             'chest_middle',
  'cable crossover':                               'chest_middle',
  'chest press na maszynie':                       'chest_middle',
  'wyciskanie na suwnicy':                         'chest_middle',
  'pompki z obciążeniem':                          'chest_middle',
  'maszyna motyl':                                 'chest_middle',
  'peck deck':                                     'chest_middle',
  'flyes':                                         'chest_middle',
  'odwodzenie hantli na klatkę':                   'chest_middle',
  // BARKI - PRZEDNIE
  'wyciskanie żołnierskie':                        'shoulder_front',
  'wyciskanie sztangi nad głowę':                  'shoulder_front',
  'wyciskanie hantli nad głowę':                   'shoulder_front',
  'wyciskanie hantli siedząc':                     'shoulder_front',
  'wyciskanie arnolda':                            'shoulder_front',
  'arnold press':                                  'shoulder_front',
  'overhead press':                                'shoulder_front',
  'wznosy hantli przodem':                         'shoulder_front',
  'front raise':                                   'shoulder_front',
  'unoszenie hantli przodem':                      'shoulder_front',
  'wyciskanie sztangi z klatki':                   'shoulder_front',
  'upright row':                                   'shoulder_front',
  'wiosłowanie sztangi pod brodę':                 'shoulder_front',
  'wiosłowanie hantli pod brodę':                  'shoulder_front',
  // BARKI - BOCZNE
  'wznosy hantli bokiem':                          'shoulder_side',
  'wznosy hantlami bokiem':                        'shoulder_side',
  'wznosy bokiem z hantlami':                      'shoulder_side',
  'wznosy bokiem':                                 'shoulder_side',
  'unoszenie ramion bokiem':                       'shoulder_side',
  'unoszenie hantli bokiem':                       'shoulder_side',
  'lateral raise':                                 'shoulder_side',
  'wznosy hantli bokiem siedząc':                  'shoulder_side',
  'wznosy hantli bokiem stojąc':                   'shoulder_side',
  'wznosy bokiem na wyciągu':                      'shoulder_side',
  'lateral raise na maszynie':                     'shoulder_side',
  'wznosy bokiem na maszynie':                     'shoulder_side',
  'cable lateral raise':                           'shoulder_side',
  // BARKI - TYLNE
  'odwrotne rozpiętki':                            'shoulder_rear',
  'face pull':                                     'shoulder_rear',
  'face pulls':                                    'shoulder_rear',
  'wznosy hantli w opadzie':                       'shoulder_rear',
  'rear delt fly':                                 'shoulder_rear',
  'reverse fly':                                   'shoulder_rear',
  'reverse pec deck':                              'shoulder_rear',
  'odwrotne rozpiętki na maszynie':                'shoulder_rear',
  'wznosy w opadzie z liną':                       'shoulder_rear',
  'cable face pull':                               'shoulder_rear',
  'wiosłowanie szerokim chwytem':                  'shoulder_rear',
  // PLECY - SZEROKIE
  'podciąganie szerokim chwytem':                  'back_lats',
  'podciąganie nachwytem':                         'back_lats',
  'podciąganie':                                   'back_lats',
  'pull up':                                       'back_lats',
  'pull-up':                                       'back_lats',
  'ściąganie drążka wyciągu górnego':              'back_lats',
  'ściąganie drążka':                              'back_lats',
  'lat pulldown':                                  'back_lats',
  'wyciąg górny':                                  'back_lats',
  'pullover':                                      'back_lats',
  'podciąganie podchwytem wąskim':                 'back_lats',
  'chin up':                                       'back_lats',
  'chin-up':                                       'back_lats',
  'ściąganie drążka podchwytem':                   'back_lats',
  'wyciąg górny podchwytem':                       'back_lats',
  'straight arm pulldown':                         'back_lats',
  'podciąganie z obciążeniem':                     'back_lats',
  // PLECY - ŚRODKOWE
  'wiosłowanie sztangą w opadzie':                 'back_middle',
  'wiosłowanie sztangą':                           'back_middle',
  'wiosłowanie pendlay':                           'back_middle',
  'wiosłowanie hantlą':                            'back_middle',
  'wiosłowanie t-bar':                             'back_middle',
  'wiosłowanie wąskim chwytem':                    'back_middle',
  'wiosłowanie sztangą wąskim chwytem':            'back_middle',
  'wiosłowanie na wyciągu':                        'back_middle',
  'wiosłowanie na wyciągu siedząc':                'back_middle',
  'seated row':                                    'back_middle',
  'seal row':                                      'back_middle',
  'chest supported row':                           'back_middle',
  'wiosłowanie z podparciem klatki':               'back_middle',
  'wiosłowanie na maszynie':                       'back_middle',
  // PLECY - GÓRNE
  'wzruszenia barków':                             'back_upper',
  'shrugs':                                        'back_upper',
  'wzruszenia hantli':                             'back_upper',
  'wzruszenia sztangi':                            'back_upper',
  // PLECY - DOLNE
  'martwy ciąg klasyczny':                         'back_lower',
  'martwy ciąg':                                   'back_lower',
  'deadlift':                                      'back_lower',
  'hyperextension':                                'back_lower',
  'wyprosty pleców':                               'back_lower',
  'prostowanie pleców':                            'back_lower',
  'back extension':                                'back_lower',
  'wyprosty na ławce rzymskiej':                   'back_lower',
  // BICEPS - DŁUGA GŁOWA
  'uginanie ramion ze sztangą wąskim chwytem':     'biceps_long',
  'uginanie hantli na modlitewniku':               'biceps_long',
  'preacher curl':                                 'biceps_long',
  'uginanie hantli na ławce skośnej':              'biceps_long',
  'concentration curl':                            'biceps_long',
  'uginanie koncentryczne':                        'biceps_long',
  'scott curl':                                    'biceps_long',
  'ławce scotta':                                  'biceps_long',
  'spider curl':                                   'biceps_long',
  // BICEPS - KRÓTKA GŁOWA
  'uginanie ramion ze sztangą':                    'biceps_short',
  'uginanie ze sztangą ez':                        'biceps_short',
  'uginanie sztangi':                              'biceps_short',
  'uginanie ramion z hantlami stojąc':             'biceps_short',
  'uginanie ramion z hantlami':                    'biceps_short',
  'uginanie hantli':                               'biceps_short',
  'biceps curl':                                   'biceps_short',
  'uginanie na wyciągu':                           'biceps_short',
  'uginanie ramion na wyciągu':                    'biceps_short',
  'cable curl':                                    'biceps_short',
  'uginanie ramion ze sztangą stojąc':             'biceps_short',
  'uginanie z liną':                               'biceps_short',
  // RAMIENNY + PRZEDRAMIĘ
  'uginanie hantli młotkowo':                      'biceps_brach',
  'uginanie młotkowe':                             'biceps_brach',
  'hammer curl':                                   'biceps_brach',
  // PRZEDRAMIĘ
  'uginanie zottmana':                              'forearms',
  'zottman curl':                                   'forearms',
  'uginanie nadgarstków':                           'forearms',
  'wrist curl':                                     'forearms',
  // TRICEPS - DŁUGA GŁOWA
  'francuskie wyciskanie sztangi':                 'triceps_long',
  'francuskie wyciskanie':                         'triceps_long',
  'wyciskanie francuskie':                         'triceps_long',
  'french press':                                  'triceps_long',
  'overhead triceps extension':                    'triceps_long',
  'wyprosty triceps nad głowę':                    'triceps_long',
  'skull crusher':                                 'triceps_long',
  'skullcrusher':                                  'triceps_long',
  'wyprosty hantla nad głowę':                     'triceps_long',
  'overhead cable triceps extension':              'triceps_long',
  'overhead triceps extension hantlem':            'triceps_long',
  'francuskie wyciskanie hantla':                  'triceps_long',
  // TRICEPS - BOCZNA GŁOWA
  'wyprosty triceps na wyciągu':                   'triceps_lat',
  'prostowanie ramion na wyciągu':                 'triceps_lat',
  'prostowanie ramion':                            'triceps_lat',
  'wyprost ramion':                                'triceps_lat',
  'wyprosty ramion':                               'triceps_lat',
  'pushdown':                                      'triceps_lat',
  'pushdown z liną':                               'triceps_lat',
  'triceps z liną':                                'triceps_lat',
  'triceps na wyciągu':                            'triceps_lat',
  'cable triceps pushdown':                        'triceps_lat',
  'single arm pushdown':                           'triceps_lat',
  'wyprosty jednorącz na wyciągu':                 'triceps_lat',
  // TRICEPS - PRZYŚRODKOWA
  'wyciskanie wąskim chwytem':                     'triceps_med',
  'close grip bench press':                        'triceps_med',
  'pompki diamentowe':                             'triceps_med',
  'pompki wąsko':                                  'triceps_med',
  'diamond push':                                  'triceps_med',
  'kickback':                                      'triceps_med',
  'wyprosty hantla w opadzie':                     'triceps_med',
  // NOGI - CZWOROGŁOWY
  'przysiad ze sztangą':                           'quads',
  'przysiad':                                      'quads',
  'back squat':                                    'quads',
  'front squat':                                   'quads',
  'przysiad przedni':                              'quads',
  'leg press':                                     'quads',
  'wyciskanie nogami':                             'quads',
  'wyprosty nóg':                                  'quads',
  'leg extension':                                 'quads',
  'wypychanie nóg':                                'quads',
  'prostowanie nóg':                               'quads',
  'hack squat':                                    'quads',
  'przysiad bułgarski':                            'quads',
  'goblet squat':                                  'quads',
  'sissy squat':                                   'quads',
  'sumo squat':                                    'quads',
  'przysiad sumo':                                 'quads',
  'przysiad z hantlem':                            'quads',
  // NOGI - HAMSTRING
  'martwy ciąg rumuński':                          'hamstrings',
  'rumuński martwy ciąg':                          'hamstrings',
  'rdl':                                           'hamstrings',
  'romanian deadlift':                             'hamstrings',
  'martwy ciąg na prostych nogach':                'hamstrings',
  'uginanie nóg leżąc':                            'hamstrings',
  'uginanie nóg':                                  'hamstrings',
  'leg curl':                                      'hamstrings',
  'nordic curl':                                   'hamstrings',
  'glute ham raise':                               'hamstrings',
  'single leg rdl':                                'hamstrings',
  'martwy ciąg jednonóż':                          'hamstrings',
  'uginanie nóg stojąc':                           'hamstrings',
  // POŚLADKI
  'hip thrust':                                    'glutes',
  'hip thrusty':                                   'glutes',
  'wypychanie bioder':                             'glutes',
  'glute bridge':                                  'glutes',
  'most biodrowy':                                 'glutes',
  'odwodzenia nóg':                                'glutes',
  'cable kickback':                                'glutes',
  'hip abduction':                                 'glutes',
  'odwodzenie nóg na maszynie':                    'glutes',
  'single leg hip thrust':                         'glutes',
  'hip thrust jednonóż':                           'glutes',
  'donkey kick':                                   'glutes',
  // JEDNONÓŻ
  'bulgarian split squat':                         'quads',
  'bułgarski przysiad':                            'quads',
  'wykroki':                                       'quads',
  'wykroki naprzemienne':                          'quads',
  'wykroki chodzące':                              'quads',
  'reverse lunge':                                 'quads',
  'wykroki ze sztangą':                            'quads',
  'wykroki z hantlami':                            'quads',
  'step up':                                       'quads',
  'step-up':                                       'quads',
  'wchodzenie na skrzynię':                        'quads',
  'split squat':                                   'quads',
  // ŁYDKI
  'wspięcia na palce stojąc':                      'calves',
  'wspięcia na palce':                             'calves',
  'wspięcia na łydki':                             'calves',
  'wspięcia na łydkach':                           'calves',
  'unoszenie na palce':                            'calves',
  'unoszenie piętami':                             'calves',
  'standing calf raise':                           'calves',
  'wspięcia na palce siedząc':                     'calves',
  'seated calf raise':                             'calves',
  'donkey calf raise':                             'calves',
  'wspięcia na palce ze sztangą':                  'calves',
  'wspięcia jednonóż':                             'calves',
  // BRZUCH
  'plank':                                         'core',
  'deska':                                         'core',
  'rollout':                                       'core',
  'uginanie na modlitewniku':                      'biceps_short',
  'uginanie ramion na modlitewniku':               'biceps_short',
  'wiosłowanie hantlem jednoręcz':                 'back_lats',
  'wiosłowanie hantlem jednorącz':                 'back_lats',
  'wiosłowanie hantlem w opadzie':                 'back_lats',
  'wiosłowanie jednoręcz':                         'back_lats',
  'ab wheel':                                      'core',
  'brzuszki':                                      'abs',
  'crunch':                                        'abs',
  'unoszenie nóg':                                 'abs',
  'leg raise':                                     'abs',
  'hanging leg raise':                             'abs',
  'russian twist':                                 'obliques',
  'skłony boczne':                                 'obliques',
  // KOREKCYJNE / STABILIZACJA — plan "Ćwiczenia dla Ani"
  'martwy robak':                                  'core',
  'dead bug':                                      'core',
  'ptak-pies':                                     'core',
  'ptak pies':                                     'core',
  'bird dog':                                      'core',
  'pallof press':                                  'core',
  'deska bokiem':                                  'obliques',
  'side plank':                                    'obliques',
  'muszelka':                                      'glutes',
  'clamshell':                                     'glutes',
  'odwodzenie nogi leżąc bokiem':                  'glutes',
  'most biodrowy jednonóż':                        'glutes',
  'wall sit':                                      'quads',
  'przysiad izometryczny przy ścianie':            'quads',
  'przysiad izometryczny':                         'quads',
  'wall angels':                                   'shoulder_rear',
  'anioły przy ścianie':                           'shoulder_rear',
  'band pull-apart':                               'shoulder_rear',
  'rozciąganie gumy w bok':                        'shoulder_rear',
  'wiosłowanie z gumą':                            'back_middle',
  'uginanie nóg z gumą':                           'hamstrings',
  'most biodrowy ze zsuwaniem pięt':               'hamstrings',
  'most biodrowy z gumą':                          'glutes',
  'muszelka z gumą':                               'glutes',
  'wznosy t-y-w leżąc':                            'back_middle',
  'wznosy t-y-w':                                  'back_middle'
};

const SORTED_MUSCLE_KEYS: string[] = Object.keys(EXERCISE_TO_MUSCLE).sort((a, b) => b.length - a.length);
const _muscleCache: Map<string, MuscleKey | null> = new Map();

export function detectMuscle(exerciseName: string | null | undefined): MuscleKey | null {
  if (!exerciseName) return null;
  const name: string = exerciseName.toLowerCase().trim();
  if (_muscleCache.has(name)) return _muscleCache.get(name)!;
  let result: MuscleKey | null = null;
  for (const key of SORTED_MUSCLE_KEYS) {
    if (name.includes(key)) { result = EXERCISE_TO_MUSCLE[key]; break; }
  }
  _muscleCache.set(name, result);
  return result;
}

const EQUIPMENT_KEYWORDS: EquipmentKeyword[] = [
  { pattern: 'sztang', label: 'Sztanga', icon: 'ti-barbell' },
  { pattern: 'hantl', label: 'Hantle', icon: 'ti-barbell' },
  { pattern: 'maszyn', label: 'Maszyna', icon: 'ti-settings-cog' },
  { pattern: 'wyciąg', label: 'Wyciąg', icon: 'ti-arrow-down-circle' },
  { pattern: 'cable', label: 'Wyciąg', icon: 'ti-arrow-down-circle' },
  { pattern: 'pushdown', label: 'Wyciąg', icon: 'ti-arrow-down-circle' },
  { pattern: 'pulldown', label: 'Wyciąg', icon: 'ti-arrow-down-circle' },
  { pattern: 'hack squat', label: 'Maszyna', icon: 'ti-settings-cog' },
  { pattern: 'leg press', label: 'Maszyna', icon: 'ti-settings-cog' },
  { pattern: 'smith', label: 'Maszyna', icon: 'ti-settings-cog' },
  { pattern: 'dipy', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'podciąg', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'pompk', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'plank', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'deska', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'nordic', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'glute ham', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'glute bridge', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'most biodrowy', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'brzuszk', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'unoszenie nóg', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'ab wheel', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'rollout', label: 'Własna waga', icon: 'ti-user' },
  // KOREKCYJNE (plan Ani) — masa ciała / guma. MUSZĄ być przed generycznymi
  // wzorcami ('przysiad'→Sztanga, 'wyciskanie'→Sztanga), inaczej złapią zły sprzęt.
  { pattern: 'martwy robak', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'dead bug', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'ptak-pies', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'ptak pies', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'bird dog', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'muszelka', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'clamshell', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'odwodzenie nogi leżąc', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'wall sit', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'przysiad izometryczny', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'przysiad przy ścianie', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'wall angel', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'anioły przy ścianie', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'pull-apart', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'pull apart', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'pallof', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'wznosy t-y-w', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'z gumą', label: 'Własna waga', icon: 'ti-user' },
  { pattern: 'hip thrust', label: 'Sztanga', icon: 'ti-barbell' },
  { pattern: 'wypychanie bioder', label: 'Sztanga', icon: 'ti-barbell' },
  { pattern: 'pullover', label: 'Hantle', icon: 'ti-barbell' },
  { pattern: 'face pull', label: 'Wyciąg', icon: 'ti-arrow-down-circle' },
  { pattern: 'crossover', label: 'Wyciąg', icon: 'ti-arrow-down-circle' },
  { pattern: 'krzyżowanie', label: 'Wyciąg', icon: 'ti-arrow-down-circle' },
  { pattern: 'rozpiętk', label: 'Hantle', icon: 'ti-barbell' },
  { pattern: 'wznosy', label: 'Hantle', icon: 'ti-barbell' },
  { pattern: 'wspięci', label: 'Maszyna', icon: 'ti-settings-cog' },
  { pattern: 'wyprosty nóg', label: 'Maszyna', icon: 'ti-settings-cog' },
  { pattern: 'odwodzenie nóg', label: 'Maszyna', icon: 'ti-settings-cog' },
  { pattern: 'curl', label: 'Hantle', icon: 'ti-barbell' },
  { pattern: 'uginanie nóg', label: 'Maszyna', icon: 'ti-settings-cog' },
  { pattern: 'prostowanie nóg', label: 'Maszyna', icon: 'ti-settings-cog' },
  { pattern: 'przysiad', label: 'Sztanga', icon: 'ti-barbell' },
  { pattern: 'martwy ciąg', label: 'Sztanga', icon: 'ti-barbell' },
  { pattern: 'wyciskanie', label: 'Sztanga', icon: 'ti-barbell' },
  { pattern: 'wiosłowanie', label: 'Sztanga', icon: 'ti-barbell' },
];

// Sprzęt z bazy → etykieta + ikona chipu. Baza jest źródłem prawdy dla ćwiczeń,
// które w niej są (np. „Przysiad bułgarski" = hantle, a nie sztanga jak sugeruje
// generyczny wzorzec „przysiad"). Nazwy spoza bazy lecą heurystyką słów kluczowych.
const EQUIPMENT_INFO: Record<Equipment, EquipmentInfo> = {
  sztanga:     { label: 'Sztanga', icon: 'ti-barbell' },
  hantle:      { label: 'Hantle', icon: 'ti-barbell' },
  maszyna:     { label: 'Maszyna', icon: 'ti-settings-cog' },
  'wyciąg':    { label: 'Wyciąg', icon: 'ti-arrow-down-circle' },
  'własna_waga': { label: 'Własna waga', icon: 'ti-user' },
}

export function detectEquipment(exerciseName: string | null | undefined): EquipmentInfo | null {
  if (!exerciseName) return null;
  const fromDb = findExerciseByName(exerciseName);
  if (fromDb) return EQUIPMENT_INFO[fromDb.equipment];
  const name: string = exerciseName.toLowerCase().trim();
  for (const eq of EQUIPMENT_KEYWORDS) {
    if (name.includes(eq.pattern)) return { label: eq.label, icon: eq.icon };
  }
  return null;
}

export function getMuscleName(key: string): string {
  return MUSCLE_NAMES[key as MuscleKey] || key;
}
