// ============================================================================
// TRENING PRO - Baza danych: plany offline + słownik głów mięśniowych
//
// Push:  3 klatka (1× poziom/dół, 1× skos+, 1× izolacja/kable)
//        2 barki  (1× wyciskanie, 1× wznosy)
//        2 triceps
//        = 7 ćwiczeń
//
// Pull:  4 plecy  (1× wertykalne: podciąganie/lat pulldown,
//                  1× horyzontalne: wiosłowanie,
//                  1× inna płaszczyzna/akcent,
//                  1× jednostronne lub odmienne)
//        1 tylne barki (TYLKO: face pull / reverse fly / odwrotne rozpiętki)
//        2 biceps
//        1 przedramię
//        = 8 ćwiczeń
//
// Legs:  2 czworogłowy (1× wielostawowe: przysiad/leg press,
//                        1× izolacja lub jednostronne)
//        2 hamstring+pośladki (1× hip hinge: RDL/martwy na prostych,
//                               1× zgięcie kolana lub hip thrust: leg curl/hip thrust)
//        1 jednostronne (wykroki, Bulgarian split squat)
//        1 łydki
//        1 core
//        = 7 ćwiczeń
// ============================================================================

export const MUSCLE_NAMES = {
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

export const EXERCISE_TO_MUSCLE = {
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
  'wyciskanie sztangi z klatki':                   'shoulder_front',
  'upright row':                                   'shoulder_front',
  'wiosłowanie sztangi pod brodę':                 'shoulder_front',
  'wiosłowanie hantli pod brodę':                  'shoulder_front',
  // BARKI - BOCZNE
  'wznosy hantli bokiem':                          'shoulder_side',
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
  'wyprosty na ławce rzymskiej':                   'back_lower',
  // BICEPS - DŁUGA GŁOWA
  'uginanie ramion ze sztangą wąskim chwytem':     'biceps_long',
  'uginanie hantli na modlitewniku':               'biceps_long',
  'preacher curl':                                 'biceps_long',
  'uginanie hantli na ławce skośnej':              'biceps_long',
  'concentration curl':                            'biceps_long',
  'uginanie koncentryczne':                        'biceps_long',
  'scott curl':                                    'biceps_long',
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
  'cable curl':                                    'biceps_short',
  'uginanie ramion ze sztangą stojąc':             'biceps_short',
  'uginanie z liną':                               'biceps_short',
  // RAMIENNY
  'uginanie hantli młotkowo':                      'biceps_brach',
  'uginanie zottmana':                              'forearms',
  'zottman curl':                                   'forearms',
  'uginanie młotkowe':                             'biceps_brach',
  'hammer curl':                                   'biceps_brach',
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
  'hack squat':                                    'quads',
  'przysiad bułgarski':                            'quads',
  'goblet squat':                                  'quads',
  'sissy squat':                                   'quads',
  'sumo squat':                                    'quads',
  'przysiad sumo':                                 'quads',
  'przysiad z hantlem':                            'quads',
  // NOGI - HAMSTRING
  'martwy ciąg rumuński':                          'hamstrings',
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
  // JEDNONÓŻ (mapowane na quads żeby wchodziły do grupy czworogłowy)
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
  'wiosłowanie hantlem w opadzie':                 'back_lats',
  'wiosłowanie jednoręcz':                         'back_lats',
  'ab wheel':                                      'core',
  'brzuszki':                                      'abs',
  'crunch':                                        'abs',
  'unoszenie nóg':                                 'abs',
  'leg raise':                                     'abs',
  'hanging leg raise':                             'abs',
  'russian twist':                                 'obliques',
  'skłony boczne':                                 'obliques'
};

export function detectMuscle(exerciseName) {
  if (!exerciseName) return null;
  const name = exerciseName.toLowerCase().trim();
  const keys = Object.keys(EXERCISE_TO_MUSCLE).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (name.includes(key)) return EXERCISE_TO_MUSCLE[key];
  }
  return null;
}

const EQUIPMENT_KEYWORDS = [
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
  { pattern: 'hip thrust', label: 'Sztanga', icon: 'ti-barbell' },
  { pattern: 'face pull', label: 'Wyciąg', icon: 'ti-arrow-down-circle' },
  { pattern: 'crossover', label: 'Wyciąg', icon: 'ti-arrow-down-circle' },
  { pattern: 'rozpiętk', label: 'Hantle', icon: 'ti-barbell' },
  { pattern: 'wznosy', label: 'Hantle', icon: 'ti-barbell' },
  { pattern: 'curl', label: 'Hantle', icon: 'ti-barbell' },
  { pattern: 'uginanie nóg', label: 'Maszyna', icon: 'ti-settings-cog' },
  { pattern: 'prostowanie nóg', label: 'Maszyna', icon: 'ti-settings-cog' },
  { pattern: 'przysiad', label: 'Sztanga', icon: 'ti-barbell' },
  { pattern: 'martwy ciąg', label: 'Sztanga', icon: 'ti-barbell' },
  { pattern: 'wyciskanie', label: 'Sztanga', icon: 'ti-barbell' },
  { pattern: 'wiosłowanie', label: 'Sztanga', icon: 'ti-barbell' },
]

export function detectEquipment(exerciseName) {
  if (!exerciseName) return null
  const name = exerciseName.toLowerCase().trim()
  for (const eq of EQUIPMENT_KEYWORDS) {
    if (name.includes(eq.pattern)) return { label: eq.label, icon: eq.icon }
  }
  return null
}

// ==========================================================================
// PLANY PUSH — struktura 3/2/2
// 3 ćwiczenia na klatkę | 2 na barki (przednie + boczne) | 2 na triceps
// ==========================================================================
export const PLANS = {
  push: [
    {
      name: 'Push klasyczny',
      exercises: [
        // KLATKA (3)
        { name: 'Wyciskanie sztangi na ławce poziomej', sets: 4, reps: '6-8', tip: 'Łopatki ściągnięte, mostek w górę' },
        { name: 'Wyciskanie hantli na ławce skośnej', sets: 3, reps: '8-10', tip: 'Skos 30°, kontroluj ekscentryk' },
        { name: 'Rozpiętki na maszynie', sets: 3, reps: '12-15', tip: 'Ścisk klatki na końcu ruchu' },
        // BARKI (2)
        { name: 'Wyciskanie żołnierskie', sets: 3, reps: '8-10', tip: 'Stabilny tułów, łokcie pod sztangą' },
        { name: 'Wznosy hantli bokiem', sets: 3, reps: '12-15', tip: 'Do poziomu barków, łokcie lekko ugięte' },
        // TRICEPS (2)
        { name: 'Wyprosty triceps na wyciągu', sets: 3, reps: '12-15', tip: 'Łokcie przy tułowiu przez cały ruch' },
        { name: 'Francuskie wyciskanie sztangi', sets: 3, reps: '10-12', tip: 'Łokcie nieruchome, kontroluj' }
      ]
    },
    {
      name: 'Push klatka górna',
      exercises: [
        // KLATKA (3)
        { name: 'Wyciskanie sztangi na ławce skośnej', sets: 4, reps: '6-8', tip: 'Skos 30-45°, mostek w górę' },
        { name: 'Wyciskanie hantli na ławce skośnej', sets: 3, reps: '8-10', tip: 'Pełen zakres ruchu' },
        { name: 'Rozpiętki na ławce skośnej', sets: 3, reps: '10-12', tip: 'Czuj rozciąganie klatki górnej' },
        // BARKI (2)
        { name: 'Wyciskanie arnolda', sets: 3, reps: '10-12', tip: 'Rotacja dłoni podczas ruchu' },
        { name: 'Wznosy hantli bokiem', sets: 3, reps: '12-15', tip: 'Barki boczne — do poziomu' },
        // TRICEPS (2)
        { name: 'Pushdown z liną', sets: 3, reps: '12-15', tip: 'Rozszerz linę na końcu ruchu' },
        { name: 'Francuskie wyciskanie sztangi', sets: 3, reps: '10-12', tip: 'Triceps długa głowa' }
      ]
    },
    {
      name: 'Push siłowy',
      exercises: [
        // KLATKA (3)
        { name: 'Wyciskanie sztangi na ławce poziomej', sets: 5, reps: '4-6', tip: 'Eksplozja w górę, kontrola w dół' },
        { name: 'Wyciskanie hantli na ławce skośnej', sets: 3, reps: '6-8', tip: 'Ciężkie hantle, pełen zakres' },
        { name: 'Dipy na poręczach', sets: 3, reps: '8-12', tip: 'Pochyl tułów — klatka dolna' },
        // BARKI (2)
        { name: 'Wyciskanie żołnierskie', sets: 4, reps: '4-6', tip: 'Tułów napięty, sztanga w linii' },
        { name: 'Wznosy hantli bokiem', sets: 3, reps: '10-12', tip: 'Płynny ruch, bez bujania' },
        // TRICEPS (2)
        { name: 'Wyciskanie wąskim chwytem', sets: 3, reps: '6-8', tip: 'Łokcie blisko ciała' },
        { name: 'Overhead triceps extension hantlem', sets: 3, reps: '10-12', tip: 'Oburącz za głowę' }
      ]
    },
    {
      name: 'Push na rzeźbę',
      exercises: [
        // KLATKA (3)
        { name: 'Wyciskanie hantli na ławce skośnej', sets: 3, reps: '12-15', tip: 'Lekkie ciężary, perfekcyjna technika' },
        { name: 'Wyciskanie sztangi na ławce poziomej', sets: 3, reps: '12-15', tip: 'Tempo 2-1-2' },
        { name: 'Cable crossover', sets: 3, reps: '15-20', tip: 'Ścisk na końcu, krzyżuj dłonie' },
        // BARKI (2)
        { name: 'Wznosy hantli bokiem', sets: 4, reps: '15-20', tip: 'Barki boczne — wysoki volume' },
        { name: 'Wznosy hantli przodem', sets: 3, reps: '15-20', tip: 'Barki przednie naprzemiennie' },
        // TRICEPS (2)
        { name: 'Pushdown z liną', sets: 3, reps: '15-20', tip: 'Wykończ triceps' },
        { name: 'Cable triceps pushdown', sets: 3, reps: '15-20', tip: 'Pełen wyprost na końcu' }
      ]
    },
    {
      name: 'Push z hantlami',
      exercises: [
        // KLATKA (3)
        { name: 'Wyciskanie hantli na ławce poziomej', sets: 3, reps: '8-10', tip: 'Pełna ścieżka, kontroluj na dole' },
        { name: 'Wyciskanie hantli na ławce skośnej', sets: 3, reps: '8-10', tip: 'Skos 30°' },
        { name: 'Chest press na maszynie', sets: 3, reps: '10-12', tip: 'Stabilna pozycja, ścisk klatki' },
        // BARKI (2)
        { name: 'Wyciskanie hantli nad głowę', sets: 3, reps: '8-10', tip: 'Siedząc lub stojąc' },
        { name: 'Wznosy hantli bokiem', sets: 3, reps: '12-15', tip: 'Do poziomu barków' },
        // TRICEPS (2)
        { name: 'Overhead triceps extension hantlem', sets: 3, reps: '10-12', tip: 'Oburącz za głowę' },
        { name: 'Kickback hantlem', sets: 3, reps: '12-15', tip: 'Tułów równoległy do podłogi' }
      ]
    },
    {
      name: 'Push z superseriami',
      exercises: [
        // KLATKA (3)
        { name: 'Wyciskanie sztangi na ławce poziomej', sets: 3, reps: '8-10', tip: 'Superseria z rozpiętkami' },
        { name: 'Rozpiętki na maszynie', sets: 3, reps: '12-15', tip: 'Bez przerwy po wyciskaniu' },
        { name: 'Wyciskanie hantli na ławce skośnej', sets: 3, reps: '10-12', tip: 'Klatka górna' },
        // BARKI (2)
        { name: 'Wyciskanie żołnierskie hantlami', sets: 3, reps: '8-10', tip: 'Superseria z wznosami bokiem' },
        { name: 'Wznosy hantli bokiem', sets: 3, reps: '12-15', tip: 'Bez przerwy po wyciskaniu' },
        // TRICEPS (2)
        { name: 'Francuskie wyciskanie sztangi', sets: 3, reps: '10-12', tip: 'Superseria z pushdownem' },
        { name: 'Pushdown z liną', sets: 3, reps: '12-15', tip: 'Bez przerwy po francuskim' }
      ]
    },
    {
      name: 'Push pełna klatka',
      exercises: [
        // KLATKA (3)
        { name: 'Wyciskanie sztangi na ławce skośnej', sets: 3, reps: '8-10', tip: 'Klatka górna' },
        { name: 'Wyciskanie sztangi na ławce poziomej', sets: 3, reps: '8-10', tip: 'Klatka środkowa' },
        { name: 'Dipy na poręczach', sets: 3, reps: '10-15', tip: 'Klatka dolna — pochyl tułów' },
        // BARKI (2)
        { name: 'Wyciskanie żołnierskie', sets: 3, reps: '8-10', tip: 'Barki przednie' },
        { name: 'Wznosy hantli bokiem', sets: 3, reps: '12-15', tip: 'Barki boczne' },
        // TRICEPS (2)
        { name: 'Wyprosty triceps na wyciągu', sets: 3, reps: '12-15', tip: 'Boczna głowa tricepsa' },
        { name: 'Overhead triceps extension hantlem', sets: 3, reps: '10-12', tip: 'Długa głowa tricepsa' }
      ]
    },
    {
      name: 'Push cable i maszyny',
      exercises: [
        // KLATKA (3)
        { name: 'Cable crossover', sets: 3, reps: '12-15', tip: 'Ścisk klatki, skrzyżuj dłonie' },
        { name: 'Chest press na maszynie', sets: 3, reps: '10-12', tip: 'Stabilna pozycja' },
        { name: 'Wyciskanie na suwnicy', sets: 3, reps: '10-12', tip: 'Kontrolowana trajektoria' },
        // BARKI (2)
        { name: 'Lateral raise na maszynie', sets: 4, reps: '12-15', tip: 'Barki boczne bez kompensacji' },
        { name: 'Wznosy hantli przodem', sets: 3, reps: '12-15', tip: 'Barki przednie naprzemiennie' },
        // TRICEPS (2)
        { name: 'Cable triceps pushdown', sets: 3, reps: '12-15', tip: 'Łokcie przy tułowiu' },
        { name: 'Single arm pushdown', sets: 3, reps: '12-15', tip: 'Jednorącz — lepsza izolacja' }
      ]
    },
    {
      name: 'Push na masę',
      exercises: [
        // KLATKA (3)
        { name: 'Wyciskanie sztangi na ławce poziomej', sets: 4, reps: '8-10', tip: 'Główne ćwiczenie — duży ciężar' },
        { name: 'Wyciskanie sztangi na ławce skośnej', sets: 4, reps: '8-10', tip: 'Klatka górna' },
        { name: 'Rozpiętki na maszynie', sets: 3, reps: '10-12', tip: 'Izolacja klatki' },
        // BARKI (2)
        { name: 'Wyciskanie żołnierskie', sets: 4, reps: '8-10', tip: 'Barki — kompletna partia' },
        { name: 'Wznosy hantli bokiem', sets: 3, reps: '12-15', tip: 'Barki boczne' },
        // TRICEPS (2)
        { name: 'Wyciskanie wąskim chwytem', sets: 3, reps: '8-10', tip: 'Triceps siłowo' },
        { name: 'Pushdown z liną', sets: 3, reps: '12-15', tip: 'Wykończenie tricepsa' }
      ]
    },
    {
      name: 'Push dolna i górna klatka',
      exercises: [
        // KLATKA (3)
        { name: 'Wyciskanie hantli na ławce skośnej', sets: 3, reps: '8-10', tip: 'Klatka górna — skos 30°' },
        { name: 'Wyciskanie na suwnicy', sets: 3, reps: '10-12', tip: 'Stabilna trajektoria' },
        { name: 'Krzyżowanie linek dolne', sets: 3, reps: '12-15', tip: 'Klatka dolna — wyciąg dolny' },
        // BARKI (2)
        { name: 'Wznosy hantli bokiem', sets: 3, reps: '12-15', tip: 'Barki boczne do poziomu' },
        { name: 'Wznosy hantli przodem', sets: 3, reps: '12-15', tip: 'Barki przednie' },
        // TRICEPS (2)
        { name: 'Overhead triceps extension hantlem', sets: 3, reps: '10-12', tip: 'Oburącz za głowę' },
        { name: 'Pushdown z liną', sets: 3, reps: '12-15', tip: 'Wykończenie' }
      ]
    }
  ],

  // ==========================================================================
  // PLANY PULL — struktura 3/2/2
  // 3 ćwiczenia na plecy | 2 na tylne barki | 2 na biceps
  // ==========================================================================
  pull: [
    {
      name: 'Pull klasyczny',
      exercises: [
        // PLECY (4)
        { name: 'Martwy ciąg klasyczny', sets: 4, reps: '5-6', tip: 'Plecy proste, sztanga blisko ciała' },
        { name: 'Podciąganie szerokim chwytem', sets: 3, reps: '6-10', tip: 'Ściągnij łopatki w dół' },
        { name: 'Wiosłowanie sztangą w opadzie', sets: 3, reps: '8-10', tip: 'Tułów stabilny, do brzucha' },
        { name: 'Wiosłowanie hantlem jednoręcz', sets: 3, reps: '10-12', tip: 'Jednostronnie, pełen zakres' },
        // TYLNE BARKI (1)
        { name: 'Face pull', sets: 3, reps: '15-20', tip: 'Łokcie wysoko, ciągnij do twarzy' },
        // BICEPS (2)
        { name: 'Uginanie ze sztangą EZ', sets: 3, reps: '10-12', tip: 'Bez bujania, kontroluj' },
        { name: 'Uginanie hantli młotkowo', sets: 3, reps: '10-12', tip: 'Brachialis — objętość ramion' },
        // PRZEDRAMIĘ (1)
        { name: 'Uginanie hantli młotkowo', sets: 3, reps: '10-12', tip: 'Brachialis i przedramię' }
      
      ]
    },
    {
      name: 'Pull bez martwego ciągu',
      exercises: [
        // PLECY (4)
        { name: 'Podciąganie nachwytem', sets: 4, reps: '6-10', tip: 'Broda nad drążek' },
        { name: 'Wiosłowanie sztangą', sets: 3, reps: '8-10', tip: 'Pochyl się 45°' },
        { name: 'Ściąganie drążka wyciągu górnego', sets: 3, reps: '10-12', tip: 'Szerokim chwytem' },
        { name: 'Wiosłowanie hantlem jednoręcz', sets: 3, reps: '10-12', tip: 'Jednostronnie, kolano na ławce' },
        // TYLNE BARKI (1)
        { name: 'Cable face pull', sets: 3, reps: '15-20', tip: 'Tylne barki i rotatory' },
        // BICEPS (2)
        { name: 'Uginanie hantli', sets: 3, reps: '10-12', tip: 'Naprzemiennie, supinacja' },
        { name: 'Uginanie hantli młotkowo', sets: 3, reps: '10-12', tip: 'Brachialis' },
        // PRZEDRAMIĘ (1)
        { name: 'Uginanie zottmana', sets: 3, reps: '10-12', tip: 'Supinacja i pronacja — pełne przedramię' }
      
      ]
    },
    {
      name: 'Pull grubość pleców',
      exercises: [
        // PLECY (4)
        { name: 'Martwy ciąg klasyczny', sets: 4, reps: '4-6', tip: 'Maksymalne ciężary' },
        { name: 'Wiosłowanie sztangą Pendlay', sets: 4, reps: '6-8', tip: 'Każde powt. z ziemi' },
        { name: 'Wiosłowanie hantlem jednoręcz', sets: 3, reps: '10-12', tip: 'Skupienie na ściskaniu' },
        { name: 'Ściąganie drążka wyciągu górnego', sets: 3, reps: '10-12', tip: 'Wertykalnie — szerokość pleców' },
        // TYLNE BARKI (1)
        { name: 'Face pull', sets: 3, reps: '15-20', tip: 'Łokcie na poziomie barków' },
        // BICEPS (2)
        { name: 'Uginanie ramion ze sztangą', sets: 3, reps: '8-10', tip: 'Cięższe ciężary' },
        { name: 'Uginanie hantli młotkowo', sets: 3, reps: '10-12', tip: 'Brachialis' },
        // PRZEDRAMIĘ (1)
        { name: 'Uginanie hantli młotkowo', sets: 3, reps: '12-15', tip: 'Neutralny chwyt — brachialis' }
      
      ]
    },
    {
      name: 'Pull szerokość pleców',
      exercises: [
        // PLECY (4)
        { name: 'Podciąganie szerokim chwytem', sets: 4, reps: '6-10', tip: 'Najszersze — główne' },
        { name: 'Ściąganie drążka wyciągu górnego', sets: 3, reps: '10-12', tip: 'Powolny ekscentryk' },
        { name: 'Wyciąg górny podchwytem', sets: 3, reps: '10-12', tip: 'Podchwyt — więcej dołu pleców' },
        { name: 'Wiosłowanie na wyciągu siedząc', sets: 3, reps: '10-12', tip: 'Horyzontalnie — grubość pleców' },
        // TYLNE BARKI (1)
        { name: 'Cable face pull', sets: 3, reps: '15-20', tip: 'Zdrowe barki tylne' },
        // BICEPS (2)
        { name: 'Uginanie hantli młotkowo', sets: 3, reps: '10-12', tip: 'Brachialis' },
        { name: 'Uginanie ze sztangą EZ', sets: 3, reps: '10-12', tip: 'Klasyczne' },
        // PRZEDRAMIĘ (1)
        { name: 'Uginanie zottmana', sets: 3, reps: '10-12', tip: 'Rotacja nadgarstka na górze' }
      
      ]
    },
    {
      name: 'Pull z naciskiem na biceps',
      exercises: [
        // PLECY (4)
        { name: 'Podciąganie podchwytem wąskim', sets: 3, reps: '8-10', tip: 'Wąski chwyt — mocno biceps' },
        { name: 'Wiosłowanie sztangą wąskim chwytem', sets: 3, reps: '8-10', tip: 'Podchwyt, łokcie przy tułowiu' },
        { name: 'Ściąganie drążka wyciągu górnego', sets: 3, reps: '10-12', tip: 'Szerokość pleców' },
        { name: 'Wiosłowanie hantlem jednoręcz', sets: 3, reps: '10-12', tip: 'Jednostronnie, pełen zakres' },
        // TYLNE BARKI (1)
        { name: 'Face pull', sets: 3, reps: '15-20', tip: 'Tylne barki i rotatory' },
        // BICEPS (2)
        { name: 'Uginanie ramion ze sztangą stojąc', sets: 4, reps: '8-10', tip: 'Klasyczne, bez bujania' },
        { name: 'Uginanie hantli na modlitewniku', sets: 3, reps: '10-12', tip: 'Izolacja bicepsa' },
        // PRZEDRAMIĘ (1)
        { name: 'Uginanie hantli młotkowo', sets: 3, reps: '10-12', tip: 'Przedramię i brachialis' }
      
      ]
    },
    {
      name: 'Pull siłowy',
      exercises: [
        // PLECY (4)
        { name: 'Martwy ciąg klasyczny', sets: 5, reps: '3-5', tip: 'Maksymalne ciężary' },
        { name: 'Podciąganie z obciążeniem', sets: 4, reps: '4-6', tip: 'Pas z talerzem' },
        { name: 'Wiosłowanie sztangą', sets: 4, reps: '5-6', tip: 'Cięższe ciężary' },
        { name: 'Wiosłowanie hantlem jednoręcz', sets: 3, reps: '8-10', tip: 'Jednostronnie, dociążenie pleców' },
        // TYLNE BARKI (1)
        { name: 'Face pull', sets: 3, reps: '15-20', tip: 'Rotatory — zdrowie barków' },
        // BICEPS (2)
        { name: 'Uginanie ramion ze sztangą', sets: 3, reps: '6-8', tip: 'Cięższe ciężary' },
        { name: 'Uginanie hantli młotkowo', sets: 3, reps: '8-10', tip: 'Siłowo' },
        // PRZEDRAMIĘ (1)
        { name: 'Uginanie zottmana', sets: 3, reps: '10-12', tip: 'Pełna rotacja przedramienia' }
      
      ]
    },
    {
      name: 'Pull cable i wyciągi',
      exercises: [
        // PLECY (4)
        { name: 'Ściąganie drążka wyciągu górnego', sets: 3, reps: '10-12', tip: 'Szerokim chwytem do klatki' },
        { name: 'Wyciąg górny podchwytem', sets: 3, reps: '10-12', tip: 'Podchwyt — biceps' },
        { name: 'Wiosłowanie na wyciągu siedząc', sets: 3, reps: '10-12', tip: 'Do brzucha' },
        { name: 'Wiosłowanie hantlem jednoręcz', sets: 3, reps: '10-12', tip: 'Jednostronnie — uzupełnienie wyciągów' },
        // TYLNE BARKI (1)
        { name: 'Cable face pull', sets: 3, reps: '15-20', tip: 'Zdrowe barki' },
        // BICEPS (2)
        { name: 'Uginanie z liną', sets: 3, reps: '12-15', tip: 'Biceps przez wyciąg' },
        { name: 'Uginanie hantli młotkowo', sets: 3, reps: '10-12', tip: 'Wykończenie brachialis' },
        // PRZEDRAMIĘ (1)
        { name: 'Uginanie hantli młotkowo', sets: 3, reps: '12-15', tip: 'Neutralny chwyt, stojąc' }
      
      ]
    },
    {
      name: 'Pull z superseriami',
      exercises: [
        // PLECY (4)
        { name: 'Podciąganie szerokim chwytem', sets: 3, reps: '6-10', tip: 'Superseria z wiosłowaniem' },
        { name: 'Wiosłowanie hantlem jednoręcz', sets: 3, reps: '10-12', tip: 'Bez przerwy po podciąganiu' },
        { name: 'Wiosłowanie sztangą', sets: 3, reps: '8-10', tip: 'Główne ćwiczenie pleców' },
        { name: 'Ściąganie drążka wyciągu górnego', sets: 3, reps: '10-12', tip: 'Wertykalnie — dobicie najszerszego' },
        // TYLNE BARKI (1)
        { name: 'Face pull', sets: 3, reps: '15-20', tip: 'Tylne barki' },
        // BICEPS (2)
        { name: 'Uginanie ze sztangą EZ', sets: 3, reps: '10-12', tip: 'Superseria z hantlami' },
        { name: 'Uginanie hantli', sets: 3, reps: '10-12', tip: 'Bez przerwy' },
        // PRZEDRAMIĘ (1)
        { name: 'Uginanie zottmana', sets: 3, reps: '12-15', tip: 'Powolna rotacja — kontroluj' }
      
      ]
    },
    {
      name: 'Pull izolacja bicepsa',
      exercises: [
        // PLECY (4)
        { name: 'Podciąganie szerokim chwytem', sets: 3, reps: '6-10', tip: 'Plecy — rozgrzewka' },
        { name: 'Wiosłowanie na maszynie', sets: 3, reps: '10-12', tip: 'Stabilna pozycja' },
        { name: 'Ściąganie drążka wyciągu górnego', sets: 3, reps: '10-12', tip: 'Szerokość pleców' },
        { name: 'Wiosłowanie hantlem jednoręcz', sets: 3, reps: '10-12', tip: 'Jednostronnie — symetria pleców' },
        // TYLNE BARKI (1)
        { name: 'Cable face pull', sets: 3, reps: '15-20', tip: 'Tylne barki i zdrowie rotatorów' },
        // BICEPS (2)
        { name: 'Concentration curl hantlem', sets: 3, reps: '10-12', tip: 'Łokieć na udzie' },
        { name: 'Uginanie hantli na modlitewniku', sets: 3, reps: '10-12', tip: 'Długa głowa bicepsa' },
        // PRZEDRAMIĘ (1)
        { name: 'Uginanie hantli młotkowo', sets: 3, reps: '10-12', tip: 'Brachialis — objętość ramion' }
      
      ]
    },
    {
      name: 'Pull pełne plecy',
      exercises: [
        // PLECY (4)
        { name: 'Martwy ciąg klasyczny', sets: 3, reps: '5-6', tip: 'Plecy dolne' },
        { name: 'Podciąganie szerokim chwytem', sets: 3, reps: '6-10', tip: 'Plecy szerokie' },
        { name: 'Wiosłowanie sztangą w opadzie', sets: 3, reps: '8-10', tip: 'Plecy środkowe' },
        { name: 'Wiosłowanie hantlem jednoręcz', sets: 3, reps: '10-12', tip: 'Plecy — symetria jednostronna' },
        // TYLNE BARKI (1)
        { name: 'Face pull', sets: 3, reps: '15-20', tip: 'Tylne barki — nie pomijaj!' },
        // BICEPS (2)
        { name: 'Uginanie ze sztangą EZ', sets: 3, reps: '8-10', tip: 'Biceps — główne' },
        { name: 'Uginanie hantli', sets: 3, reps: '10-12', tip: 'Naprzemiennie, supinacja' },
        // PRZEDRAMIĘ (1)
        { name: 'Uginanie zottmana', sets: 3, reps: '10-12', tip: 'Pronacja i supinacja naprzemiennie' }
      
      ]
    }
  ],

  // ==========================================================================
  // PLANY LEGS — 5-6 ćwiczeń, ~15-22 serii
  // 1-2 quad dominant (6-8 serii) | 1-2 hamstring/pośladki (6-8 serii)
  // | 1 jednostronne (2-4 serie) | łydki (3-6 serii)
  // ==========================================================================
  legs: [
    {
      name: 'Legs klasyczny',
      exercises: [
        // QUAD DOMINANT (7 serii)
        { name: 'Przysiad ze sztangą', sets: 4, reps: '6-8', tip: 'Sztanga na grzbiecie, biodra w dół' },
        { name: 'Leg press', sets: 3, reps: '10-12', tip: 'Stopy na środku platformy' },
        // HAMSTRING / POŚLADKI (7 serii)
        { name: 'Martwy ciąg rumuński', sets: 4, reps: '8-10', tip: 'Biodra do tyłu, plecy proste' },
        { name: 'Uginanie nóg leżąc', sets: 3, reps: '10-12', tip: 'Pełen zakres, nie szarp' },
        // JEDNOSTRONNE (3 serie)
        { name: 'Bulgarian split squat', sets: 3, reps: '8-10 na nogę', tip: 'Tylna noga na ławce' },
        // ŁYDKI (4 serie)
        { name: 'Wspięcia na palce stojąc', sets: 4, reps: '12-15', tip: 'Pełna amplituda, zatrzymaj na górze' },
        // CORE (1)
        { name: 'Plank', sets: 3, reps: '30-45 sek', tip: 'Ciało w linii prostej, oddychaj' }
      
      ]
    },
    {
      name: 'Legs z naciskiem na czworogłowy',
      exercises: [
        // QUAD DOMINANT (7 serii)
        { name: 'Przysiad przedni', sets: 4, reps: '6-8', tip: 'Sztanga na barkach z przodu' },
        { name: 'Hack squat', sets: 3, reps: '10-12', tip: 'Stopy nisko — akcentuje czworogłowy' },
        // HAMSTRING / POŚLADKI (6 serii)
        { name: 'Martwy ciąg rumuński', sets: 3, reps: '10-12', tip: 'Hamstring i pośladki' },
        { name: 'Uginanie nóg leżąc', sets: 3, reps: '12-15', tip: 'Izolacja hamstring' },
        // JEDNOSTRONNE (3 serie)
        { name: 'Wykroki ze sztangą', sets: 3, reps: '10-12 na nogę', tip: 'Kolano nie wystaje za stopę' },
        // ŁYDKI (3 serie)
        { name: 'Wspięcia na palce stojąc', sets: 3, reps: '15-20', tip: 'Łydki' },
        // CORE (1)
        { name: 'Hanging leg raise', sets: 3, reps: '10-15', tip: 'Nogi proste, kontroluj opuszczanie' }
      
      ]
    },
    {
      name: 'Legs hamstring i pośladki',
      exercises: [
        // QUAD DOMINANT (6 serii)
        { name: 'Przysiad ze sztangą', sets: 3, reps: '8-10', tip: 'Klasyczny przysiad' },
        { name: 'Leg press', sets: 3, reps: '10-12', tip: 'Stopy wyżej — więcej pośladków' },
        // HAMSTRING / POŚLADKI (8 serii)
        { name: 'Martwy ciąg rumuński', sets: 4, reps: '6-8', tip: 'Hamstring — główne' },
        { name: 'Hip thrust', sets: 4, reps: '8-10', tip: 'Pośladki — ścisk na górze' },
        // JEDNOSTRONNE (2 serie)
        { name: 'Single leg hip thrust', sets: 2, reps: '10-12 na nogę', tip: 'Jednonóż — silniejsza izolacja' },
        // ŁYDKI (4 serie)
        { name: 'Wspięcia na palce siedząc', sets: 4, reps: '15-20', tip: 'Płaszczkowaty' },
        // CORE (1)
        { name: 'Plank', sets: 3, reps: '45-60 sek', tip: 'Aktywny core przez cały czas' }
      
      ]
    },
    {
      name: 'Legs siłowy',
      exercises: [
        // QUAD DOMINANT (8 serii)
        { name: 'Przysiad ze sztangą', sets: 5, reps: '3-5', tip: 'Maksymalne ciężary' },
        { name: 'Leg press', sets: 3, reps: '6-8', tip: 'Bardzo ciężki' },
        // HAMSTRING / POŚLADKI (7 serii)
        { name: 'Martwy ciąg rumuński', sets: 4, reps: '5-6', tip: 'Cięższe ciężary' },
        { name: 'Uginanie nóg leżąc', sets: 3, reps: '8-10', tip: 'Kontroluj' },
        // JEDNOSTRONNE (3 serie)
        { name: 'Bulgarian split squat', sets: 3, reps: '6-8 na nogę', tip: 'Z ciężarem' },
        // ŁYDKI (3 serie)
        { name: 'Wspięcia na palce ze sztangą', sets: 3, reps: '8-10', tip: 'Łydki siłowo' },
        // CORE (1)
        { name: 'Ab wheel', sets: 3, reps: '8-12', tip: 'Rollout — napięty brzuch przez cały ruch' }
      
      ]
    },
    {
      name: 'Legs bez przysiadu',
      exercises: [
        // QUAD DOMINANT (7 serii)
        { name: 'Leg press', sets: 4, reps: '8-12', tip: 'Bezpieczna alternatywa przysiadu' },
        { name: 'Hack squat', sets: 3, reps: '10-12', tip: 'Czworogłowy bez obciążenia kręgosłupa' },
        // HAMSTRING / POŚLADKI (7 serii)
        { name: 'Martwy ciąg rumuński', sets: 3, reps: '10-12', tip: 'Hamstring i pośladki' },
        { name: 'Hip thrust', sets: 4, reps: '10-12', tip: 'Pośladki bez obciążenia kręgosłupa' },
        // JEDNOSTRONNE (3 serie)
        { name: 'Wykroki z hantlami', sets: 3, reps: '12-15', tip: 'Naprzemiennie w ruchu' },
        // ŁYDKI (3 serie)
        { name: 'Wspięcia na palce stojąc', sets: 3, reps: '12-15', tip: 'Łydki' },
        // CORE (1)
        { name: 'Hanging leg raise', sets: 3, reps: '12-15', tip: 'Bez bujania, powoli w dół' }
      
      ]
    },
    {
      name: 'Legs na rzeźbę',
      exercises: [
        // QUAD DOMINANT (6 serii)
        { name: 'Przysiad ze sztangą', sets: 3, reps: '12-15', tip: 'Lżejsze, więcej powtórzeń' },
        { name: 'Leg press', sets: 3, reps: '15-20', tip: 'Średni ciężar, tempo' },
        // HAMSTRING / POŚLADKI (6 serii)
        { name: 'Martwy ciąg rumuński', sets: 3, reps: '12-15', tip: 'Tempo 2-1-2' },
        { name: 'Hip thrust', sets: 3, reps: '15-20', tip: 'Pośladki — rzeźba' },
        // JEDNOSTRONNE (3 serie)
        { name: 'Wykroki', sets: 3, reps: '15-20 na nogę', tip: 'Z hantlami w rękach' },
        // ŁYDKI (4 serie)
        { name: 'Wspięcia na palce stojąc', sets: 4, reps: '20-25', tip: 'Łydki — wysokie powt.' },
        // CORE (1)
        { name: 'Plank', sets: 3, reps: '30-60 sek', tip: 'Biodra nie za wysoko, nie za nisko' }
      
      ]
    },
    {
      name: 'Legs z hip thrustem',
      exercises: [
        // QUAD DOMINANT (6 serii)
        { name: 'Przysiad ze sztangą', sets: 3, reps: '8-10', tip: 'Klasyczny przysiad' },
        { name: 'Leg press', sets: 3, reps: '10-12', tip: 'Stopy wyżej — pośladki' },
        // HAMSTRING / POŚLADKI (7 serii)
        { name: 'Hip thrust', sets: 4, reps: '8-10', tip: 'Główne ćwiczenie pośladków' },
        { name: 'Martwy ciąg rumuński', sets: 3, reps: '10-12', tip: 'Hamstring' },
        // JEDNOSTRONNE (3 serie)
        { name: 'Bulgarian split squat', sets: 3, reps: '10-12 na nogę', tip: 'Pochyl — więcej pośladków' },
        // ŁYDKI (3 serie)
        { name: 'Wspięcia na palce stojąc', sets: 3, reps: '15-20', tip: 'Łydki' },
        // CORE (1)
        { name: 'Ab wheel', sets: 3, reps: '10-12', tip: 'Kolana lub stopy — wybierz poziom' }
      
      ]
    },
    {
      name: 'Legs kondycyjny',
      exercises: [
        // QUAD DOMINANT (6 serii)
        { name: 'Goblet squat', sets: 3, reps: '12-15', tip: 'Hantel pod brodą, dynamicznie' },
        { name: 'Leg press', sets: 3, reps: '15-20', tip: 'Średni ciężar, tempo' },
        // HAMSTRING / POŚLADKI (6 serii)
        { name: 'Martwy ciąg rumuński', sets: 3, reps: '12-15', tip: 'Hamstring' },
        { name: 'Hip thrust', sets: 3, reps: '15-20', tip: 'Pośladki dynamicznie' },
        // JEDNOSTRONNE (3 serie)
        { name: 'Wykroki', sets: 3, reps: '15-20 na nogę', tip: 'Naprzemiennie, bez przerwy' },
        // ŁYDKI (3 serie)
        { name: 'Wspięcia na palce stojąc', sets: 3, reps: '20-30', tip: 'Łydki — kondycja' },
        // CORE (1)
        { name: 'Hanging leg raise', sets: 3, reps: '10-12', tip: 'Na drążku, proste nogi do poziomu' }
      
      ]
    },
    {
      name: 'Legs sumo',
      exercises: [
        // QUAD DOMINANT (7 serii)
        { name: 'Przysiad sumo', sets: 4, reps: '8-10', tip: 'Stopy szeroko, kolana śledzą stopy' },
        { name: 'Leg press', sets: 3, reps: '10-12', tip: 'Stopy szeroko — przywodziciele' },
        // HAMSTRING / POŚLADKI (7 serii)
        { name: 'Martwy ciąg rumuński', sets: 4, reps: '8-10', tip: 'Hamstring i pośladki' },
        { name: 'Odwodzenie nóg na maszynie', sets: 3, reps: '12-15', tip: 'Przywodziciele i pośladki' },
        // JEDNOSTRONNE (3 serie)
        { name: 'Bulgarian split squat', sets: 3, reps: '8-10 na nogę', tip: 'Tylna noga na ławce' },
        // ŁYDKI (3 serie)
        { name: 'Wspięcia na palce stojąc', sets: 3, reps: '15-20', tip: 'Łydki' },
        // CORE (1)
        { name: 'Plank', sets: 4, reps: '30-45 sek', tip: 'Seria po łydkach — dobry finisz' }
      
      ]
    },
    {
      name: 'Legs jednonóż',
      exercises: [
        // QUAD DOMINANT (7 serii)
        { name: 'Bulgarian split squat', sets: 4, reps: '8-10 na nogę', tip: 'Tylna noga na ławce' },
        { name: 'Step-up', sets: 3, reps: '10-12 na nogę', tip: 'Pchaj piętą' },
        // HAMSTRING / POŚLADKI (6 serii)
        { name: 'Single leg RDL', sets: 3, reps: '10-12 na nogę', tip: 'Balans na jednej nodze' },
        { name: 'Single leg hip thrust', sets: 3, reps: '10-12 na nogę', tip: 'Ścisk pośladka' },
        // JEDNOSTRONNE — tu całość jest jednonożna, dodajemy łydki jednonóż
        { name: 'Wykroki z hantlami', sets: 3, reps: '12-15', tip: 'Naprzemiennie w ruchu' },
        // ŁYDKI (3 serie)
        { name: 'Wspięcia jednonóż', sets: 3, reps: '12-15 na nogę', tip: 'Pełen zakres łydki' },
        // CORE (1)
        { name: 'Ab wheel', sets: 3, reps: '8-10', tip: 'Pełny rollout — core i biodra' }
      
      ]
    }
  ]
};

// ==========================================================================
// UPPER A — klatka+plecy+barki+ramiona — masa/siła
// ==========================================================================
const PLANS_UPPER_A = [
  {
    name: 'Upper A klasyczny',
    exercises: [
      { name: 'Wyciskanie sztangi na ławce poziomej', sets: 4, reps: '5-8', tip: 'Łopatki ściągnięte, eksplozja w górę' },
      { name: 'Wiosłowanie sztangą w opadzie', sets: 4, reps: '6-10', tip: 'Do brzucha, tułów stabilny' },
      { name: 'Wyciskanie hantli na ławce skośnej', sets: 3, reps: '8-12', tip: 'Skos 30°, pełen zakres' },
      { name: 'Podciąganie szerokim chwytem', sets: 3, reps: '8-12', tip: 'Ściągnij łopatki w dół' },
      { name: 'Wyciskanie żołnierskie', sets: 3, reps: '6-10', tip: 'Stabilny tułów, łokcie pod sztangą' },
      { name: 'Uginanie ze sztangą EZ', sets: 3, reps: '10-15', tip: 'Bez bujania, kontroluj' },
      { name: 'Wyprosty triceps na wyciągu', sets: 3, reps: '10-15', tip: 'Łokcie przy tułowiu' }
    ]
  },
  {
    name: 'Upper A siłowy',
    exercises: [
      { name: 'Wyciskanie sztangi na ławce poziomej', sets: 5, reps: '3-6', tip: 'Maksymalne ciężary, pełne skupienie' },
      { name: 'Wiosłowanie sztangą w opadzie', sets: 4, reps: '5-8', tip: 'Ciężko, plecy proste' },
      { name: 'Wyciskanie sztangi na ławce skośnej', sets: 3, reps: '6-8', tip: 'Klatka górna' },
      { name: 'Ściąganie drążka szerokim chwytem', sets: 3, reps: '8-10', tip: 'Lat pulldown — pełen zakres' },
      { name: 'Wyciskanie żołnierskie', sets: 4, reps: '4-6', tip: 'Tułów napięty, kontrola' },
      { name: 'Uginanie ramion ze sztangą', sets: 3, reps: '8-12', tip: 'Siłowo — biceps' },
      { name: 'Wyciskanie wąskim chwytem', sets: 3, reps: '6-10', tip: 'Triceps — łokcie blisko ciała' }
    ]
  },
  {
    name: 'Upper A z hantlami',
    exercises: [
      { name: 'Wyciskanie hantli na ławce poziomej', sets: 4, reps: '8-10', tip: 'Pełna ścieżka, dotknij klatki' },
      { name: 'Wiosłowanie hantlem w opadzie', sets: 4, reps: '8-10', tip: 'Jednoręcz — lepsza izolacja' },
      { name: 'Wyciskanie hantli na ławce skośnej', sets: 3, reps: '8-12', tip: 'Klatka górna' },
      { name: 'Podciąganie nachwytem', sets: 3, reps: '6-10', tip: 'Do brody, kontroluj opuszczanie' },
      { name: 'Wyciskanie hantli nad głowę', sets: 3, reps: '8-12', tip: 'Siedząc lub stojąc' },
      { name: 'Uginanie hantli naprzemiennie', sets: 3, reps: '10-15', tip: 'Supinacja na górze' },
      { name: 'Overhead triceps extension hantlem', sets: 3, reps: '10-15', tip: 'Oburącz za głowę' }
    ]
  }
];

// ==========================================================================
// UPPER B — klatka+plecy+barki+ramiona — masa/siła — inne ćwiczenia niż A
// ==========================================================================
const PLANS_UPPER_B = [
  {
    name: 'Upper B klasyczny',
    exercises: [
      { name: 'Wyciskanie hantli na ławce poziomej', sets: 4, reps: '6-10', tip: 'Pełen zakres, dłonie do siebie' },
      { name: 'Podciąganie nachwytem', sets: 4, reps: '6-10', tip: 'Szeroki chwyt, łopatki w dół' },
      { name: 'Wiosłowanie na maszynie siedzące', sets: 3, reps: '8-12', tip: 'Seated row — łokcie blisko ciała' },
      { name: 'Wyciskanie hantli siedząc nad głowę', sets: 3, reps: '8-12', tip: 'Barki — pełen zakres' },
      { name: 'Wznosy hantli bokiem', sets: 3, reps: '12-20', tip: 'Do poziomu barków, łokcie ugięte' },
      { name: 'Uginanie hantli młotkowo', sets: 3, reps: '10-15', tip: 'Brachialis i przedramię' },
      { name: 'Pushdown z liną', sets: 3, reps: '10-15', tip: 'Rozszerz linę na końcu ruchu' }
    ]
  },
  {
    name: 'Upper B klatka górna',
    exercises: [
      { name: 'Wyciskanie hantli na ławce skośnej', sets: 4, reps: '8-12', tip: 'Skos 30-45°, klatka górna' },
      { name: 'Ściąganie drążka szerokim chwytem', sets: 4, reps: '6-10', tip: 'Lat pulldown — szeroki chwyt' },
      { name: 'Wiosłowanie hantlem jednoręcz', sets: 3, reps: '8-12', tip: 'Pełen zakres, do biodra' },
      { name: 'Wyciskanie arnolda', sets: 3, reps: '8-12', tip: 'Rotacja dłoni podczas ruchu' },
      { name: 'Wznosy hantli bokiem', sets: 3, reps: '12-20', tip: 'Barki boczne' },
      { name: 'Uginanie ze sztangą EZ', sets: 3, reps: '10-15', tip: 'Wąski chwyt — biceps krótki' },
      { name: 'Francuskie wyciskanie sztangi', sets: 3, reps: '10-15', tip: 'Triceps długa głowa' }
    ]
  },
  {
    name: 'Upper B cable i maszyny',
    exercises: [
      { name: 'Chest press na maszynie', sets: 4, reps: '8-12', tip: 'Stabilna pozycja, ścisk klatki' },
      { name: 'Ściąganie drążka wąskim chwytem', sets: 4, reps: '8-12', tip: 'Łokcie blisko ciała' },
      { name: 'Cable crossover', sets: 3, reps: '12-15', tip: 'Ścisk klatki, skrzyżuj dłonie' },
      { name: 'Wyciskanie hantli siedząc nad głowę', sets: 3, reps: '8-12', tip: 'Barki' },
      { name: 'Face pull', sets: 3, reps: '12-20', tip: 'Łokcie wysoko, tylne barki' },
      { name: 'Uginanie na modlitewniku', sets: 3, reps: '10-15', tip: 'Łokieć unieruchomiony' },
      { name: 'Cable triceps pushdown', sets: 3, reps: '12-15', tip: 'Łokcie przy tułowiu' }
    ]
  }
];

// ==========================================================================
// LOWER A — czworogłowy + hamstring/pośladki + łydki + core
// ==========================================================================
const PLANS_LOWER_A = [
  {
    name: 'Lower A klasyczny',
    exercises: [
      { name: 'Przysiad ze sztangą', sets: 4, reps: '5-8', tip: 'Głęboko, kolana śledzą stopy' },
      { name: 'Martwy ciąg rumuński', sets: 4, reps: '6-10', tip: 'Hamstring — poczuj rozciąganie' },
      { name: 'Wykroki z hantlami', sets: 3, reps: '8-12', tip: 'Naprzemiennie, kolano nie za linię stopy' },
      { name: 'Uginanie nóg leżąc', sets: 3, reps: '10-15', tip: 'Kontrolowane opuszczanie' },
      { name: 'Wspięcia na palce stojąc', sets: 4, reps: '12-20', tip: 'Pełen zakres, chwila na górze' },
      { name: 'Hanging leg raise', sets: 3, reps: '10-15', tip: 'Nogi proste, kontroluj opuszczanie' }
    ]
  },
  {
    name: 'Lower A siłowy',
    exercises: [
      { name: 'Przysiad ze sztangą', sets: 5, reps: '3-6', tip: 'Maksymalne ciężary, pas bezpieczeństwa' },
      { name: 'Martwy ciąg rumuński', sets: 4, reps: '5-8', tip: 'Ciężko, plecy proste przez cały ruch' },
      { name: 'Bulgarian split squat', sets: 3, reps: '6-8 na nogę', tip: 'Tylna noga na ławce, z ciężarem' },
      { name: 'Uginanie nóg leżąc', sets: 3, reps: '8-12', tip: 'Hamstring izolacja' },
      { name: 'Wspięcia na palce ze sztangą', sets: 3, reps: '8-10', tip: 'Łydki siłowo' },
      { name: 'Ab wheel', sets: 3, reps: '8-12', tip: 'Rollout — napięty brzuch' }
    ]
  },
  {
    name: 'Lower A quad dominant',
    exercises: [
      { name: 'Przysiad ze sztangą', sets: 4, reps: '6-10', tip: 'Wąski rozstaw — więcej czworogłowych' },
      { name: 'Leg press', sets: 3, reps: '8-12', tip: 'Stopy nisko i wąsko' },
      { name: 'Wyprosty nóg siedząc', sets: 3, reps: '10-15', tip: 'Izolacja czworogłowego' },
      { name: 'Martwy ciąg rumuński', sets: 4, reps: '8-10', tip: 'Balans — dołóż hamstring' },
      { name: 'Wspięcia na palce stojąc', sets: 4, reps: '15-20', tip: 'Łydki — pełen zakres' },
      { name: 'Plank', sets: 3, reps: '45-60 sek', tip: 'Biodra w linii, napięty brzuch' }
    ]
  }
];

// ==========================================================================
// LOWER B — hamstring/pośladki + czworogłowy + łydki + core
// ==========================================================================
const PLANS_LOWER_B = [
  {
    name: 'Lower B pośladki i hamstring',
    exercises: [
      { name: 'Martwy ciąg klasyczny', sets: 4, reps: '3-6', tip: 'Plecy proste, sztanga blisko ciała' },
      { name: 'Front squat', sets: 4, reps: '6-10', tip: 'Łokcie wysokie, tułów pionowo' },
      { name: 'Hip thrust', sets: 3, reps: '8-12', tip: 'Ścisk pośladków na górze' },
      { name: 'Wyprosty nóg siedząc', sets: 3, reps: '10-15', tip: 'Czworogłowy — wykończenie' },
      { name: 'Wspięcia na palce siedząc', sets: 4, reps: '12-20', tip: 'Płaszczkowaty — siedzenie' },
      { name: 'Plank', sets: 3, reps: '45-60 sek', tip: 'Aktywny core' }
    ]
  },
  {
    name: 'Lower B hip hinge',
    exercises: [
      { name: 'Martwy ciąg klasyczny', sets: 3, reps: '4-6', tip: 'Siłowo — pas bezpieczeństwa' },
      { name: 'Hack squat', sets: 4, reps: '6-10', tip: 'Maszyna — czworogłowy bez kręgosłupa' },
      { name: 'Hip thrust', sets: 3, reps: '8-12', tip: 'Pośladki — główne ćwiczenie Lower B' },
      { name: 'Uginanie nóg leżąc', sets: 3, reps: '10-15', tip: 'Hamstring izolacja' },
      { name: 'Wspięcia na palce stojąc', sets: 4, reps: '12-20', tip: 'Łydki' },
      { name: 'Ab wheel', sets: 3, reps: '8-12', tip: 'Core — rollout' }
    ]
  },
  {
    name: 'Lower B na maszynach',
    exercises: [
      { name: 'Leg press', sets: 4, reps: '8-12', tip: 'Stopy wysoko — więcej pośladków' },
      { name: 'Hack squat', sets: 3, reps: '8-12', tip: 'Stopy wąsko — czworogłowy' },
      { name: 'Hip thrust', sets: 4, reps: '8-12', tip: 'Ze sztangą — pośladki' },
      { name: 'Uginanie nóg leżąc', sets: 3, reps: '10-15', tip: 'Maszyna hamstring' },
      { name: 'Wspięcia na palce siedząc', sets: 4, reps: '15-20', tip: 'Łydki na maszynie' },
      { name: 'Hanging leg raise', sets: 3, reps: '10-15', tip: 'Na drążku' }
    ]
  }
];

// ==========================================================================
// FBW A — przysiad + bench + wiosłowanie + OHP + hamstring + biceps + core
// ==========================================================================
const PLANS_FBW_A = [
  {
    name: 'FBW A klasyczny',
    exercises: [
      { name: 'Przysiad ze sztangą', sets: 4, reps: '5-8', tip: 'Głęboko, kolana za palce stóp' },
      { name: 'Wyciskanie sztangi na ławce poziomej', sets: 4, reps: '5-8', tip: 'Łopatki ściągnięte' },
      { name: 'Wiosłowanie sztangą w opadzie', sets: 4, reps: '6-10', tip: 'Do brzucha, plecy proste' },
      { name: 'Wyciskanie żołnierskie', sets: 3, reps: '6-10', tip: 'Barki — stabilny tułów' },
      { name: 'Uginanie nóg leżąc', sets: 3, reps: '10-15', tip: 'Hamstring — kontroluj opuszczanie' },
      { name: 'Uginanie ze sztangą EZ', sets: 3, reps: '10-15', tip: 'Biceps — bez bujania' },
      { name: 'Hanging leg raise', sets: 3, reps: '10-15', tip: 'Core — nogi proste' }
    ]
  },
  {
    name: 'FBW A siłowy',
    exercises: [
      { name: 'Przysiad ze sztangą', sets: 5, reps: '3-5', tip: 'Maksymalne ciężary' },
      { name: 'Wyciskanie sztangi na ławce poziomej', sets: 4, reps: '4-6', tip: 'Eksplozja w górę' },
      { name: 'Wiosłowanie sztangą w opadzie', sets: 4, reps: '5-8', tip: 'Ciężko, kontrola' },
      { name: 'Wyciskanie żołnierskie', sets: 3, reps: '5-8', tip: 'Press siłowy' },
      { name: 'Martwy ciąg rumuński', sets: 3, reps: '6-8', tip: 'Hamstring i dolne plecy' },
      { name: 'Uginanie hantli młotkowo', sets: 2, reps: '10-12', tip: 'Brachialis' },
      { name: 'Ab wheel', sets: 3, reps: '8-12', tip: 'Rollout — core' }
    ]
  }
];

// ==========================================================================
// FBW B — martwy ciąg + skos + podciąganie + split squat + wznosy + triceps
// ==========================================================================
const PLANS_FBW_B = [
  {
    name: 'FBW B pulling',
    exercises: [
      { name: 'Martwy ciąg klasyczny', sets: 3, reps: '3-5', tip: 'Plecy proste, sztanga blisko ciała' },
      { name: 'Wyciskanie hantli na ławce skośnej', sets: 4, reps: '8-12', tip: 'Skos 30°, klatka górna' },
      { name: 'Podciąganie szerokim chwytem', sets: 4, reps: '6-10', tip: 'Do brody, łopatki w dół' },
      { name: 'Bulgarian split squat', sets: 3, reps: '8-12 na nogę', tip: 'Tylna noga na ławce' },
      { name: 'Wznosy hantli bokiem', sets: 3, reps: '12-20', tip: 'Barki boczne' },
      { name: 'Wyciskanie wąskim chwytem', sets: 3, reps: '10-15', tip: 'Triceps — łokcie blisko' },
      { name: 'Plank', sets: 3, reps: '45-60 sek', tip: 'Core — napięty przez cały czas' }
    ]
  },
  {
    name: 'FBW B hantlowy',
    exercises: [
      { name: 'Martwy ciąg rumuński', sets: 4, reps: '6-10', tip: 'Hamstring i pośladki' },
      { name: 'Wyciskanie hantli na ławce skośnej', sets: 3, reps: '8-12', tip: 'Klatka górna' },
      { name: 'Ściąganie drążka szerokim chwytem', sets: 4, reps: '8-12', tip: 'Lat pulldown' },
      { name: 'Wykroki z hantlami', sets: 3, reps: '10-12 na nogę', tip: 'Naprzemiennie w ruchu' },
      { name: 'Wznosy hantli bokiem', sets: 3, reps: '12-20', tip: 'Do poziomu barków' },
      { name: 'Francuskie wyciskanie sztangi', sets: 3, reps: '10-15', tip: 'Triceps długa głowa' },
      { name: 'Brzuszki na drążku', sets: 3, reps: '12-15', tip: 'Kontroluj górę i dół' }
    ]
  }
];

// ==========================================================================
// FBW C — front squat + bench hantle + wiosłowanie + hip thrust + face pull
// ==========================================================================
const PLANS_FBW_C = [
  {
    name: 'FBW C kompletny',
    exercises: [
      { name: 'Front squat', sets: 4, reps: '6-10', tip: 'Łokcie wysokie, tułów pionowo' },
      { name: 'Wyciskanie hantli na ławce poziomej', sets: 4, reps: '6-10', tip: 'Pełen zakres, dłonie równoległe' },
      { name: 'Wiosłowanie hantlem jednoręcz', sets: 4, reps: '8-12', tip: 'Do biodra, łopatka w ruchu' },
      { name: 'Hip thrust', sets: 3, reps: '8-12', tip: 'Pośladki — ścisk na górze' },
      { name: 'Face pull', sets: 3, reps: '12-20', tip: 'Tylne barki i rotacja zewn.' },
      { name: 'Uginanie ze sztangą EZ', sets: 2, reps: '10-15', tip: 'Biceps' },
      { name: 'Wspięcia na palce stojąc', sets: 4, reps: '12-20', tip: 'Łydki — pełen zakres' }
    ]
  },
  {
    name: 'FBW C hack squat',
    exercises: [
      { name: 'Hack squat', sets: 4, reps: '8-12', tip: 'Maszyna — czworogłowy bez kręgosłupa' },
      { name: 'Wyciskanie hantli na ławce skośnej', sets: 3, reps: '8-12', tip: 'Klatka górna' },
      { name: 'Wiosłowanie na maszynie siedzące', sets: 4, reps: '8-12', tip: 'Łokcie blisko ciała' },
      { name: 'Hip thrust', sets: 3, reps: '8-12', tip: 'Ze sztangą — pośladki i hamstring' },
      { name: 'Face pull', sets: 3, reps: '12-20', tip: 'Tylne barki — zdrowe barki' },
      { name: 'Uginanie hantli naprzemiennie', sets: 2, reps: '10-15', tip: 'Biceps' },
      { name: 'Wspięcia na palce siedząc', sets: 4, reps: '15-20', tip: 'Płaszczkowaty' }
    ]
  }
];

PLANS['upper_a'] = PLANS_UPPER_A;
PLANS['upper_b'] = PLANS_UPPER_B;
PLANS['lower_a'] = PLANS_LOWER_A;
PLANS['lower_b'] = PLANS_LOWER_B;
PLANS['fbw_a']   = PLANS_FBW_A;
PLANS['fbw_b']   = PLANS_FBW_B;
PLANS['fbw_c']   = PLANS_FBW_C;


export function getRandomPlan(type) {
const list = PLANS[type];
if (!list || !list.length) return null;
return list[Math.floor(Math.random() * list.length)];
}

export function getMuscleName(key) {
return MUSCLE_NAMES[key] || key;
}

/**
 * Znajduje alternatywne ćwiczenia angażujące tę samą partię mięśniową.
 * Zwraca tablicę nazw ćwiczeń (max N, bez bieżącego).
 */
export function findSubstitutes(exerciseName, max = 5) {
  const targetMuscle = detectMuscle(exerciseName)
  if (!targetMuscle) return []
  const currentNorm = exerciseName.toLowerCase().trim()
  const candidates = []
  for (const [exName, muscle] of Object.entries(EXERCISE_TO_MUSCLE)) {
    if (muscle !== targetMuscle) continue
    if (exName === currentNorm) continue
    const display = exName.charAt(0).toUpperCase() + exName.slice(1)
    if (!candidates.includes(display)) candidates.push(display)
  }
  if (candidates.length <= max) return candidates
  // Deterministyczny shuffle bazujący na nazwie wejścia
  const seed = exerciseName.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const shuffled = [...candidates].sort((a, b) => {
    const ha = (a.length + a.charCodeAt(0) + seed) % 100
    const hb = (b.length + b.charCodeAt(0) + seed) % 100
    return ha - hb
  })
  return shuffled.slice(0, max)
}

/**
 * URL do wyszukiwania YouTube dla danej techniki ćwiczenia.
 */
export function youtubeSearchUrl(exerciseName) {
  const query = encodeURIComponent(exerciseName + ' technika ćwiczenia')
  return `https://www.youtube.com/results?search_query=${query}`
}
// graphify test
