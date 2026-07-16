import { detectMuscle, EXERCISE_TO_MUSCLE } from './muscles'
import { findExerciseByName } from './exerciseDb'

const _substitutesCache = new Map<string, string[]>();

function normalizeForDedup(name: string): string {
  return name
    .replace(/na ławce płaskiej/g, 'na ławce poziomej')
    .replace(/\bna skosie\b/g, 'na ławce skośnej')
}

// Klucz tożsamości ćwiczenia: id z bazy (rozwiązuje aliasy PL/EN — „hip thrust",
// „hip thrusty" i „wypychanie bioder" to jeden klucz), fallback dla nazw spoza bazy:
// znormalizowany string po tłumaczeniu EN→PL. Naprawia duble typu PL/EN na liście zamian.
function identityKey(name: string): string {
  const direct = findExerciseByName(name)
  if (direct) return `id:${direct.id}`
  const translated = translateExerciseName(name)
  const viaTranslation = findExerciseByName(translated)
  if (viaTranslation) return `id:${viaTranslation.id}`
  return normalizeForDedup(translated.toLowerCase().trim()).replace(/[-\s]/g, '')
}

// Kanoniczna nazwa do wyświetlenia: z bazy jeśli znana, inaczej tłumaczenie EN→PL.
function displayName(name: string): string {
  const direct = findExerciseByName(name)
  if (direct) return direct.name
  const translated = translateExerciseName(name)
  const viaTranslation = findExerciseByName(translated)
  if (viaTranslation) return viaTranslation.name
  const t = translated.toLowerCase().trim()
  return t.charAt(0).toUpperCase() + t.slice(1)
}

export function findSubstitutes(
  exerciseName: string,
  max: number = 5,
  muscleHeadOverride: string | null = null,
  excludeNames: string[] = []
): string[] {
  const excludeNorm = excludeNames.map(n => n.toLowerCase().trim())
  const cacheKey = `${(exerciseName || '').toLowerCase().trim()}|${max}|${muscleHeadOverride || ''}|${excludeNorm.sort().join(',')}`
  if (_substitutesCache.has(cacheKey)) return _substitutesCache.get(cacheKey)!

  const targetMuscle = muscleHeadOverride || detectMuscle(exerciseName)
  if (!targetMuscle) { _substitutesCache.set(cacheKey, []); return [] }

  // Wykluczenia (bieżące ćwiczenie + reszta sesji) po tożsamości — działa niezależnie
  // od tego, czy sesja używa nazwy polskiej, angielskiej czy aliasu.
  const excludeSet = new Set<string>([exerciseName, ...excludeNames].map(identityKey))

  const seen = new Set<string>()
  const dbNames: string[] = []
  const legacyNames: string[] = []
  for (const [key, muscle] of Object.entries(EXERCISE_TO_MUSCLE)) {
    if (muscle !== targetMuscle) continue
    const ik = identityKey(key)
    if (excludeSet.has(ik) || seen.has(ik)) continue
    seen.add(ik)
    if (ik.startsWith('id:')) dbNames.push(displayName(key))
    else legacyNames.push(displayName(key))
  }

  // Nazwy spoza bazy: odrzuć generyczne, które są fragmentem innej kandydatki
  // (np. „Wyciskanie hantli" przy obecnym „Wyciskanie hantli na ławce poziomej").
  // Nazw z bazy nie filtrujemy — baza jest kuratorowana i nie zawiera generyków.
  const allLower = [...dbNames, ...legacyNames].map(n => n.toLowerCase())
  const legacyFiltered = legacyNames.filter(n => {
    const low = n.toLowerCase()
    return !allLower.some(o => o !== low && o.includes(low))
  })

  // Kandydaci z bazy przodem — mają arkusz techniczny, poprawne metadane i aliasy.
  const display = [...dbNames, ...legacyFiltered]

  if (display.length <= max) {
    _substitutesCache.set(cacheKey, display)
    return display
  }

  const seed = exerciseName.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const shuffled = [...display].sort((a, b) => {
    const ha = (a.length + a.charCodeAt(0) + seed) % 100
    const hb = (b.length + b.charCodeAt(0) + seed) % 100
    return ha - hb
  })
  const result = shuffled.slice(0, max)
  _substitutesCache.set(cacheKey, result)
  return result
}

export function youtubeSearchUrl(exerciseName: string): string {
  const query = encodeURIComponent(exerciseName + ' technika ćwiczenia')
  return `https://www.youtube.com/results?search_query=${query}`
}

const EN_TO_PL: Record<string, string> = {
  'bench press': 'Wyciskanie sztangi na ławce poziomej',
  'flat bench press': 'Wyciskanie sztangi na ławce poziomej',
  'barbell bench press': 'Wyciskanie sztangi na ławce poziomej',
  'incline bench press': 'Wyciskanie sztangi na ławce skośnej',
  'incline barbell press': 'Wyciskanie sztangi na ławce skośnej',
  'incline dumbbell press': 'Wyciskanie hantli na ławce skośnej',
  'dumbbell bench press': 'Wyciskanie hantli na ławce poziomej',
  'dumbbell press': 'Wyciskanie hantli',
  'decline bench press': 'Wyciskanie na ławce ujemnej',
  'cable crossover': 'Krzyżowanie linek',
  'cable crossover górny': 'Krzyżowanie linek górne',
  'cable crossover dolny': 'Krzyżowanie linek dolne',
  'cable fly': 'Krzyżowanie linek',
  'cable flyes': 'Krzyżowanie linek',
  'chest fly': 'Rozpiętki',
  'chest flyes': 'Rozpiętki',
  'dumbbell fly': 'Rozpiętki',
  'dumbbell flyes': 'Rozpiętki',
  'flyes': 'Rozpiętki',
  'pec deck': 'Rozpiętki na maszynie',
  'peck deck': 'Rozpiętki na maszynie',
  'butterfly': 'Rozpiętki na maszynie',
  'chest press': 'Wyciskanie na maszynie',
  'chest press na maszynie': 'Wyciskanie na maszynie',
  'machine chest press': 'Wyciskanie na maszynie',
  'smith machine bench press': 'Wyciskanie na suwnicy',
  'push up': 'Pompki klasyczne',
  'push-up': 'Pompki klasyczne',
  'push ups': 'Pompki klasyczne',
  'push-ups': 'Pompki klasyczne',
  'dips': 'Pompki na poręczach',
  'overhead press': 'Wyciskanie sztangi nad głowę',
  'ohp': 'Wyciskanie sztangi nad głowę',
  'military press': 'Wyciskanie żołnierskie',
  'shoulder press': 'Wyciskanie hantli nad głowę',
  'dumbbell shoulder press': 'Wyciskanie hantli nad głowę',
  'seated dumbbell press': 'Wyciskanie hantli nad głowę',
  'arnold press': 'Wyciskanie arnolda',
  'front raise': 'Wznosy hantli przodem',
  'dumbbell front raise': 'Wznosy hantli przodem',
  'lateral raise': 'Wznosy hantli bokiem',
  'dumbbell lateral raise': 'Wznosy hantli bokiem',
  'cable lateral raise': 'Wznosy bokiem na wyciągu',
  'lateral raise na maszynie': 'Wznosy bokiem na maszynie',
  'side lateral raise': 'Wznosy hantli bokiem',
  'upright row': 'Wiosłowanie sztangi pod brodę',
  'face pull': 'Face pull',
  'face pulls': 'Face pull',
  'cable face pull': 'Face pull',
  'rear delt fly': 'Wznosy hantli w opadzie',
  'reverse fly': 'Odwrotne rozpiętki',
  'reverse pec deck': 'Odwrotne rozpiętki na maszynie',
  'rear delt machine': 'Odwrotne rozpiętki na maszynie',
  'pull up': 'Podciąganie',
  'pull-up': 'Podciąganie',
  'pull ups': 'Podciąganie',
  'pull-ups': 'Podciąganie',
  'chin up': 'Podciąganie podchwytem',
  'chin-up': 'Podciąganie podchwytem',
  'chin ups': 'Podciąganie podchwytem',
  'lat pulldown': 'Ściąganie drążka wyciągu górnego',
  'wide grip lat pulldown': 'Ściąganie drążka wyciągu górnego',
  'close grip lat pulldown': 'Ściąganie drążka podchwytem',
  'pullover': 'Pullover',
  'straight arm pulldown': 'Ściąganie drążka na prostych ramionach',
  'barbell row': 'Wiosłowanie sztangą w opadzie',
  'bent over row': 'Wiosłowanie sztangą w opadzie',
  'bent over barbell row': 'Wiosłowanie sztangą w opadzie',
  'pendlay row': 'Wiosłowanie pendlay',
  'dumbbell row': 'Wiosłowanie hantlą',
  'one arm dumbbell row': 'Wiosłowanie hantlą',
  'single arm dumbbell row': 'Wiosłowanie hantlą',
  't-bar row': 'Wiosłowanie t-bar',
  'seated row': 'Wiosłowanie na wyciągu siedząc',
  'seated cable row': 'Wiosłowanie na wyciągu siedząc',
  'cable row': 'Wiosłowanie na wyciągu',
  'chest supported row': 'Wiosłowanie z podparciem klatki',
  'seal row': 'Wiosłowanie z podparciem klatki',
  'machine row': 'Wiosłowanie na maszynie',
  'shrugs': 'Wzruszenia barków',
  'barbell shrugs': 'Wzruszenia sztangi',
  'dumbbell shrugs': 'Wzruszenia hantli',
  'deadlift': 'Martwy ciąg klasyczny',
  'conventional deadlift': 'Martwy ciąg klasyczny',
  'romanian deadlift': 'Martwy ciąg rumuński',
  'rdl': 'Martwy ciąg rumuński',
  'stiff leg deadlift': 'Martwy ciąg na prostych nogach',
  'sumo deadlift': 'Martwy ciąg sumo',
  'hyperextension': 'Wyprosty pleców',
  'back extension': 'Wyprosty na ławce rzymskiej',
  'barbell curl': 'Uginanie ramion ze sztangą',
  'bicep curl': 'Uginanie ramion z hantlami',
  'biceps curl': 'Uginanie ramion z hantlami',
  'dumbbell curl': 'Uginanie ramion z hantlami',
  'dumbbell bicep curl': 'Uginanie ramion z hantlami',
  'hammer curl': 'Uginanie hantli młotkowo',
  'hammer curls': 'Uginanie hantli młotkowo',
  'preacher curl': 'Uginanie na modlitewniku',
  'ez bar curl': 'Uginanie ze sztangą ez',
  'cable curl': 'Uginanie ramion na wyciągu',
  'concentration curl': 'Uginanie koncentryczne',
  'spider curl': 'Spider curl',
  'incline dumbbell curl': 'Uginanie hantli na ławce skośnej',
  'zottman curl': 'Uginanie zottmana',
  'wrist curl': 'Uginanie nadgarstków',
  'skull crusher': 'Francuskie wyciskanie sztangi',
  'skullcrusher': 'Francuskie wyciskanie sztangi',
  'skull crushers': 'Francuskie wyciskanie sztangi',
  'french press': 'Francuskie wyciskanie',
  'overhead triceps extension': 'Wyprosty triceps nad głowę',
  'overhead tricep extension': 'Wyprosty triceps nad głowę',
  'cable overhead triceps extension': 'Wyprosty triceps nad głowę',
  'triceps pushdown': 'Wyprosty triceps na wyciągu',
  'tricep pushdown': 'Wyprosty triceps na wyciągu',
  'cable pushdown': 'Wyprosty triceps na wyciągu',
  'pushdown': 'Wyprosty triceps na wyciągu',
  'rope pushdown': 'Pushdown z liną',
  'triceps rope pushdown': 'Pushdown z liną',
  'close grip bench press': 'Wyciskanie wąskim chwytem',
  'diamond push up': 'Pompki diamentowe',
  'diamond push-up': 'Pompki diamentowe',
  'tricep kickback': 'Wyprosty hantla w opadzie',
  'kickback': 'Wyprosty hantla w opadzie',
  'squat': 'Przysiad ze sztangą',
  'back squat': 'Przysiad ze sztangą',
  'barbell squat': 'Przysiad ze sztangą',
  'front squat': 'Przysiad przedni',
  'goblet squat': 'Przysiad z hantlem',
  'hack squat': 'Hack squat',
  'leg press': 'Wyciskanie nogami',
  'leg extension': 'Wyprosty nóg',
  'leg curl': 'Uginanie nóg',
  'lying leg curl': 'Uginanie nóg leżąc',
  'seated leg curl': 'Uginanie nóg',
  'standing leg curl': 'Uginanie nóg stojąc',
  'bulgarian split squat': 'Przysiad bułgarski',
  'split squat': 'Przysiad bułgarski',
  'lunge': 'Wykroki',
  'lunges': 'Wykroki',
  'walking lunge': 'Wykroki chodzące',
  'walking lunges': 'Wykroki chodzące',
  'reverse lunge': 'Wykroki',
  'reverse lunges': 'Wykroki',
  'dumbbell lunge': 'Wykroki z hantlami',
  'barbell lunge': 'Wykroki ze sztangą',
  'step up': 'Wchodzenie na skrzynię',
  'step-up': 'Wchodzenie na skrzynię',
  'hip thrust': 'Hip thrust',
  'barbell hip thrust': 'Hip thrust',
  'hip thrusty': 'Hip thrust',
  'wypychanie bioder': 'Hip thrust',
  'single leg hip thrust': 'Hip thrust jednonóż',
  'clamshell': 'Muszelka',
  'glute bridge': 'Most biodrowy',
  'hip abduction': 'Odwodzenie nóg na maszynie',
  'cable kickback': 'Odwodzenia nóg',
  'nordic curl': 'Nordic curl',
  'glute ham raise': 'Glute ham raise',
  'single leg rdl': 'Martwy ciąg jednonóż',
  'single leg romanian deadlift': 'Martwy ciąg jednonóż',
  'calf raise': 'Wspięcia na palce',
  'standing calf raise': 'Wspięcia na palce stojąc',
  'seated calf raise': 'Wspięcia na palce siedząc',
  'plank': 'Deska',
  'crunch': 'Brzuszki',
  'crunches': 'Brzuszki',
  'leg raise': 'Unoszenie nóg',
  'hanging leg raise': 'Unoszenie nóg',
  'hanging knee raise': 'Unoszenie nóg',
  'russian twist': 'Russian twist',
  'ab wheel': 'Ab wheel',
  'ab rollout': 'Rollout',
  'cable crunch': 'Brzuszki na wyciągu',
}

const _enToPl = new Map<string, string>(
  Object.entries(EN_TO_PL).map(([k, v]) => [k.toLowerCase(), v])
)

export function translateExerciseName(name: string): string {
  if (!name) return name
  const lower = name.toLowerCase().trim()
  return _enToPl.get(lower) || name
}
