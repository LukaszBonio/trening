import { describe, it, expect } from 'vitest'
import {
  parseClaudeJSON,
  formatSessionCompact,
  normalizePlan,
  buildExerciseCatalog,
  buildAniaPrompt,
  PRIMARY_MUSCLES,
  MUSCLE_HEADS_BY_TYPE
} from '../src/lib/ai'

describe('parseClaudeJSON', () => {
  it('parsuje poprawny obiekt JSON', () => {
    expect(parseClaudeJSON('{"name":"X","exercises":[]}')).toEqual({ name: 'X', exercises: [] })
  })
  it('rzuca błąd dla niepoprawnego JSON', () => {
    expect(() => parseClaudeJSON('to nie json')).toThrow(/poprawnego JSON/)
    expect(() => parseClaudeJSON('{niepełny')).toThrow(/poprawnego JSON/)
  })
  it('rzuca błąd gdy JSON to tablica (nie obiekt)', () => {
    expect(() => parseClaudeJSON('[1,2,3]')).toThrow(/Nieprawidłowy format/)
  })
  it('rzuca błąd gdy JSON to prymityw lub null', () => {
    expect(() => parseClaudeJSON('42')).toThrow(/Nieprawidłowy format/)
    expect(() => parseClaudeJSON('"tekst"')).toThrow(/Nieprawidłowy format/)
    expect(() => parseClaudeJSON('null')).toThrow(/Nieprawidłowy format/)
  })
})

describe('formatSessionCompact', () => {
  it('formatuje sesję jako linie "- nazwa: WxR, WxR"', () => {
    const session = {
      date: '2026-06-23T10:00:00.000Z',
      exercises: [
        { name: 'Bench', sets: [{ weight: 60, reps: 10 }, { weight: 60, reps: 8 }] },
        { name: 'OHP', sets: [{ weight: 40, reps: 12 }] }
      ]
    }
    const out = formatSessionCompact(session)
    expect(out).toContain('Sesja 2026-06-23:')
    expect(out).toContain('- Bench: 60x10, 60x8')
    expect(out).toContain('- OHP: 40x12')
  })
  it('podstawia 0 dla brakującej wagi/powtórzeń', () => {
    const session = {
      date: '2026-06-23T10:00:00.000Z',
      exercises: [{ name: 'X', sets: [{}] }]
    }
    expect(formatSessionCompact(session)).toContain('- X: 0x0')
  })
})

// Minimalny poprawny plan push (expectedCount = 7).
function pushPlan(overrides = {}) {
  const exercises = Array.from({ length: 7 }, (_, i) => ({
    name: `Ćwiczenie ${i + 1}`,
    primaryMuscle: 'chest',
    muscleHead: 'chest_middle',
    exerciseType: 'compound',
    movementPattern: 'horizontal_push',
    sets: 4,
    reps: '8-12',
    suggestedWeight: 60
  }))
  return { name: 'Plan push', exercises, ...overrides }
}

// Minimalny poprawny plan Ani (expectedCount = 8).
function aniaPlan(overrides = {}) {
  const exercises = Array.from({ length: 8 }, (_, i) => ({
    name: `Ćwiczenie ${i + 1}`,
    primaryMuscle: 'core',
    muscleHead: 'core',
    exerciseType: 'isolation',
    movementPattern: 'core',
    sets: 3,
    reps: '10-15',
    suggestedWeight: null
  }))
  return { name: 'Ćwiczenia wzmacniające dla Ani', exercises, ...overrides }
}

describe('normalizePlan — walidacja twarda', () => {
  it('rzuca gdy brak nazwy', () => {
    expect(() => normalizePlan({ exercises: [] }, { type: 'push', goal: 'mass' })).toThrow(/niepoprawny plan/)
  })
  it('rzuca gdy brak ćwiczeń', () => {
    expect(() => normalizePlan({ name: 'X', exercises: [] }, { type: 'push', goal: 'mass' })).toThrow(/niepoprawny plan/)
  })
  it('rzuca gdy plan jest null/undefined', () => {
    expect(() => normalizePlan(null, { type: 'push', goal: 'mass' })).toThrow(/niepoprawny plan/)
  })
  it('rzuca gdy liczba ćwiczeń != expectedCount', () => {
    const plan = pushPlan()
    plan.exercises = plan.exercises.slice(0, 5) // 5 zamiast 7
    expect(() => normalizePlan(plan, { type: 'push', goal: 'mass' })).toThrow(/5 ćwiczeń zamiast 7/)
  })
  it('rzuca gdy ćwiczenie ma brakujące pola', () => {
    const plan = pushPlan()
    plan.exercises[0].sets = 'cztery' // nie number
    expect(() => normalizePlan(plan, { type: 'push', goal: 'mass' })).toThrow(/brakującymi polami/)
  })
})

describe('normalizePlan — walidacja miękka', () => {
  it('nieznana partia/głowa/typ/wzorzec → null', () => {
    const plan = pushPlan()
    plan.exercises[0].primaryMuscle = 'wymyslone'
    plan.exercises[0].muscleHead = 'wymyslone'
    plan.exercises[0].exerciseType = 'wymyslone'
    plan.exercises[0].movementPattern = 'wymyslone'
    const out = normalizePlan(plan, { type: 'push', goal: 'mass' })
    expect(out.exercises[0].primaryMuscle).toBeNull()
    expect(out.exercises[0].muscleHead).toBeNull()
    expect(out.exercises[0].exerciseType).toBeNull()
    expect(out.exercises[0].movementPattern).toBeNull()
  })
  it('zachowuje poprawne wartości', () => {
    const validHead = MUSCLE_HEADS_BY_TYPE.push[0]
    const plan = pushPlan()
    plan.exercises[0].muscleHead = validHead
    const out = normalizePlan(plan, { type: 'push', goal: 'mass' })
    expect(out.exercises[0].muscleHead).toBe(validHead)
    expect(PRIMARY_MUSCLES).toContain('chest')
  })
})

describe('normalizePlan — redukcja wymusza 3 serie', () => {
  it('cut → wszystkie ćwiczenia mają 3 serie', () => {
    const plan = pushPlan() // sets: 4
    const out = normalizePlan(plan, { type: 'push', goal: 'cut' })
    expect(out.exercises.every(ex => ex.sets === 3)).toBe(true)
  })
  it('mass → nie zmienia liczby serii', () => {
    const plan = pushPlan() // sets: 4
    const out = normalizePlan(plan, { type: 'push', goal: 'mass' })
    expect(out.exercises[0].sets).toBe(4)
  })
})

describe('normalizePlan — suggestedWeight', () => {
  it('string liczbowy → number', () => {
    const plan = pushPlan()
    plan.exercises[0].suggestedWeight = '62.5'
    expect(normalizePlan(plan, { type: 'push', goal: 'mass' }).exercises[0].suggestedWeight).toBe(62.5)
  })
  it('niepoprawne / <=0 / null → null', () => {
    const plan = pushPlan()
    plan.exercises[0].suggestedWeight = 'abc'
    plan.exercises[1].suggestedWeight = 0
    plan.exercises[2].suggestedWeight = -5
    plan.exercises[3].suggestedWeight = null
    const out = normalizePlan(plan, { type: 'push', goal: 'mass' })
    expect(out.exercises[0].suggestedWeight).toBeNull()
    expect(out.exercises[1].suggestedWeight).toBeNull()
    expect(out.exercises[2].suggestedWeight).toBeNull()
    expect(out.exercises[3].suggestedWeight).toBeNull()
  })
})

describe('normalizePlan — tłumaczenie EN→PL', () => {
  it('tłumaczy angielskie nazwy ćwiczeń na polskie', () => {
    const plan = pushPlan()
    plan.exercises[0].name = 'Bench Press'
    plan.exercises[1].name = 'Incline Dumbbell Press'
    plan.exercises[2].name = 'Cable Crossover'
    const out = normalizePlan(plan, { type: 'push', goal: 'mass' })
    expect(out.exercises[0].name).toBe('Wyciskanie sztangi na ławce poziomej')
    expect(out.exercises[1].name).toBe('Wyciskanie hantli na ławce skośnej')
    expect(out.exercises[2].name).toBe('Krzyżowanie linek')
  })
  it('nie zmienia polskich nazw', () => {
    const plan = pushPlan()
    plan.exercises[0].name = 'Wyciskanie sztangi na ławce poziomej'
    const out = normalizePlan(plan, { type: 'push', goal: 'mass' })
    expect(out.exercises[0].name).toBe('Wyciskanie sztangi na ławce poziomej')
  })
  it('nie zmienia nieznanych nazw', () => {
    const plan = pushPlan()
    plan.exercises[0].name = 'Jakieś nieznane ćwiczenie'
    const out = normalizePlan(plan, { type: 'push', goal: 'mass' })
    expect(out.exercises[0].name).toBe('Jakieś nieznane ćwiczenie')
  })
})

describe('normalizePlan — analysis', () => {
  it('filtruje wpisy z nieprawidłowym statusem, przycina pola', () => {
    const plan = pushPlan({
      analysis: [
        { muscle: 'klatka', status: 'stagnation', note: 'stoi 2 sesje' },
        { muscle: 'barki', status: 'zly_status', note: 'x' }, // odrzucony
        { muscle: 123, status: 'progress', note: 'x' },        // odrzucony (muscle nie string)
        { muscle: 'a'.repeat(60), status: 'progress', note: 'b'.repeat(200) } // przycięty
      ]
    })
    const out = normalizePlan(plan, { type: 'push', goal: 'mass' })
    expect(out.analysis).toHaveLength(2)
    expect(out.analysis[0]).toEqual({ muscle: 'klatka', status: 'stagnation', note: 'stoi 2 sesje' })
    expect(out.analysis[1].muscle.length).toBe(40)
    expect(out.analysis[1].note.length).toBe(120)
  })
  it('brak analysis → pusta tablica', () => {
    const out = normalizePlan(pushPlan(), { type: 'push', goal: 'mass' })
    expect(out.analysis).toEqual([])
  })
})

describe('buildExerciseCatalog', () => {
  it('siłownia + push → strict, zawiera ćwiczenia z bazy pogrupowane po muscleHead', () => {
    const cat = buildExerciseCatalog('push', 'siłownia')
    expect(cat).not.toBeNull()
    expect(cat.strict).toBe(true)
    expect(cat.text).toContain('WYŁĄCZNIE')
    expect(cat.text).toContain('[chest_middle]')
    expect(cat.text).toContain('Wyciskanie sztangi na ławce poziomej (sztanga, compound)')
    expect(cat.text).toContain('[triceps_long]')
  })
  it('dom bez sprzętu → tylko własna waga, tryb miękki (za mało ćwiczeń na strict)', () => {
    const cat = buildExerciseCatalog('push', 'dom bez sprzętu (calisthenics)')
    expect(cat).not.toBeNull()
    expect(cat.strict).toBe(false)
    expect(cat.text).toContain('Pompki klasyczne')
    expect(cat.text).not.toContain('sztanga,')
    expect(cat.text).not.toContain('maszyna,')
  })
  it('dom z hantlami → bez maszyn, wyciągów i sztangi', () => {
    const cat = buildExerciseCatalog('pull', 'dom z hantlami')
    expect(cat).not.toBeNull()
    expect(cat.text).toContain('Wiosłowanie hantla jedną ręką')
    expect(cat.text).not.toContain('(sztanga')
    expect(cat.text).not.toContain('(wyciąg')
    expect(cat.text).not.toContain('(maszyna')
  })
  it('nieznany sprzęt → pełny dostęp jak siłownia', () => {
    const cat = buildExerciseCatalog('legs', 'cokolwiek')
    expect(cat).not.toBeNull()
    expect(cat.strict).toBe(true)
    expect(cat.text).toContain('Przysiad ze sztangą')
  })
  it('cel siła: w grupie klatki wielostawowa sztanga przed izolacją (rozpiętki)', () => {
    const cat = buildExerciseCatalog('push', 'siłownia', 'strength')
    const iPress = cat.text.indexOf('Wyciskanie sztangi na ławce poziomej')
    const iFly = cat.text.indexOf('Rozpiętki hantlami na ławce poziomej')
    expect(iPress).toBeGreaterThan(-1)
    expect(iFly).toBeGreaterThan(-1)
    expect(iPress).toBeLessThan(iFly) // uszeregowane od najlepiej dopasowanego do celu
  })
  it('nagłówek informuje o uszeregowaniu wg celu', () => {
    expect(buildExerciseCatalog('push', 'siłownia').text).toContain('uszeregowane od najlepiej dopasowanego')
  })
})

describe('normalizePlan — metadata z bazy ćwiczeń', () => {
  it('ćwiczenie z bazy → metadata nadpisane wartościami z bazy', () => {
    const plan = pushPlan()
    plan.exercises[0].name = 'Wyciskanie sztangi na ławce poziomej'
    plan.exercises[0].primaryMuscle = 'back'          // AI się pomyliło
    plan.exercises[0].muscleHead = 'triceps_long'      // AI się pomyliło
    plan.exercises[0].exerciseType = 'isolation'       // AI się pomyliło
    const out = normalizePlan(plan, { type: 'push', goal: 'mass' })
    expect(out.exercises[0].primaryMuscle).toBe('chest')
    expect(out.exercises[0].muscleHead).toBe('chest_middle')
    expect(out.exercises[0].exerciseType).toBe('compound')
    expect(out.exercises[0].movementPattern).toBe('horizontal_push')
  })
  it('alias EN z bazy → kanoniczna polska nazwa + metadata', () => {
    const plan = pushPlan()
    plan.exercises[0].name = 'Arnold Press'
    const out = normalizePlan(plan, { type: 'push', goal: 'mass' })
    expect(out.exercises[0].name).toBe('Wyciskanie Arnolda')
    expect(out.exercises[0].muscleHead).toBe('shoulder_front')
  })
  it('ćwiczenie spoza bazy → dotychczasowa miękka walidacja', () => {
    const plan = pushPlan()
    plan.exercises[0].name = 'Jakieś nieznane ćwiczenie'
    plan.exercises[0].primaryMuscle = 'wymyslone'
    const out = normalizePlan(plan, { type: 'push', goal: 'mass' })
    expect(out.exercises[0].name).toBe('Jakieś nieznane ćwiczenie')
    expect(out.exercises[0].primaryMuscle).toBeNull()
  })
})

describe('plan Ani (typ ania)', () => {
  it('MUSCLE_HEADS_BY_TYPE.ania zawiera core, glutes, hamstrings — bez klatki/bicepsa', () => {
    const heads = MUSCLE_HEADS_BY_TYPE.ania
    expect(heads).toContain('core')
    expect(heads).toContain('glutes')
    expect(heads).toContain('hamstrings')
    expect(heads).toContain('shoulder_rear')
    expect(heads).not.toContain('chest_middle')
    expect(heads).not.toContain('biceps_short')
  })
  it('normalizePlan akceptuje dokładnie 8 ćwiczeń', () => {
    const out = normalizePlan(aniaPlan(), { type: 'ania', goal: 'mass' })
    expect(out.exercises).toHaveLength(8)
  })
  it('7 ćwiczeń → błąd (oczekiwane 8)', () => {
    const plan = aniaPlan()
    plan.exercises.pop()
    expect(() => normalizePlan(plan, { type: 'ania', goal: 'mass' })).toThrow(/7 ćwiczeń zamiast 8/)
  })
  it('cel redukcja NIE wymusza 3 serii (progresja przez trudność, nie ciężar)', () => {
    const plan = aniaPlan()
    plan.exercises[0].sets = 2
    const out = normalizePlan(plan, { type: 'ania', goal: 'cut' })
    expect(out.exercises[0].sets).toBe(2)
  })
  it('ćwiczenie z bazy (Most biodrowy) → metadata z bazy', () => {
    const plan = aniaPlan()
    plan.exercises[2].name = 'Most biodrowy'
    const out = normalizePlan(plan, { type: 'ania', goal: 'mass' })
    expect(out.exercises[2].muscleHead).toBe('glutes')
    expect(out.exercises[2].primaryMuscle).toBe('glutes')
  })
  it('ćwiczenie korekcyjne spoza bazy (Martwy robak) zachowuje dozwoloną głowę core', () => {
    const plan = aniaPlan()
    plan.exercises[0].name = 'Martwy robak'
    plan.exercises[0].muscleHead = 'core'
    const out = normalizePlan(plan, { type: 'ania', goal: 'mass' })
    expect(out.exercises[0].name).toBe('Martwy robak')
    expect(out.exercises[0].muscleHead).toBe('core')
  })
})

describe('buildAniaPrompt', () => {
  const base = { type: 'ania', goal: 'mass', equipment: '', avoid: '', recentSessions: [] }
  const ALL = ['masa_ciala', 'guma', 'hantle', 'maszyna']

  it('zawiera profil, przeciwwskazania i 8 slotów menu', () => {
    const p = buildAniaPrompt({ ...base, equipmentTags: ALL })
    expect(p).toContain('dyskopatia')
    expect(p).toContain('PRZECIWWSKAZANIA')
    expect(p).toContain('SLOT 1')
    expect(p).toContain('SLOT 8')
    expect(p).toContain('Ćwiczenia wzmacniające dla Ani')
    expect(p).toContain('DOKŁADNIE 8')
  })
  it('wszystkie kategorie → udostępnia warianty maszynowe, hantlowe i gumowe', () => {
    const p = buildAniaPrompt({ ...base, equipmentTags: ALL })
    expect(p).toContain('Uginanie nóg leżąc')   // maszyna
    expect(p).toContain('Face pull')            // maszyna (wyciąg)
    expect(p).toContain('Hip thrust')           // hantle
    expect(p).toContain('Band pull-apart')      // guma
  })
  it('tylko masa ciała → bez gum, hantli, maszyn', () => {
    const p = buildAniaPrompt({ ...base, equipmentTags: ['masa_ciala'] })
    expect(p).toContain('Martwy robak')
    expect(p).toContain('Wall sit')
    expect(p).toContain('Wznosy T-Y-W leżąc')   // bodyweight fallback dla pleców
    expect(p).not.toContain('Uginanie nóg leżąc')
    expect(p).not.toContain('Odwodzenie nóg na maszynie')
    expect(p).not.toContain('Face pull')
    expect(p).not.toContain('Hip thrust')
    expect(p).not.toContain('Band pull-apart')
  })
  it('brak equipmentTags → domyślnie masa ciała', () => {
    const p = buildAniaPrompt({ ...base })
    expect(p).toContain('masa ciała')
    expect(p).not.toContain('Face pull')
  })
  it('masa ciała + gumy → dochodzą warianty z gumą, nadal bez maszyn', () => {
    const p = buildAniaPrompt({ ...base, equipmentTags: ['masa_ciala', 'guma'] })
    expect(p).toContain('Band pull-apart')
    expect(p).toContain('Uginanie nóg z gumą')
    expect(p).not.toContain('Uginanie nóg leżąc')
    expect(p).not.toContain('Face pull')
  })
  it('każdy z 8 slotów ma opcję nawet przy samej masie ciała', () => {
    const p = buildAniaPrompt({ ...base, equipmentTags: ['masa_ciala'] })
    // Żaden slot nie może mieć pustej listy "Wybierz 1 z:"
    expect(p).not.toMatch(/Wybierz 1 z:\s*(\n|$)/)
  })
  it('bez historii → instrukcja startowa; z historią → analiza postępów', () => {
    const noHist = buildAniaPrompt({ ...base, equipmentTags: ALL })
    expect(noHist).toContain('BRAK HISTORII')
    expect(noHist).not.toContain('ANALIZA POSTĘPÓW')

    const withHist = buildAniaPrompt({
      ...base,
      equipmentTags: ALL,
      recentSessions: [{ date: '2026-07-01', exercises: [{ name: 'Most biodrowy', sets: [{ weight: 0, reps: 15 }] }] }]
    })
    expect(withHist).toContain('ANALIZA POSTĘPÓW')
    expect(withHist).toContain('progresja')
  })
})
