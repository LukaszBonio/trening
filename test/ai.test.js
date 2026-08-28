import { describe, it, expect } from 'vitest'
import {
  parseClaudeJSON,
  formatSessionCompact,
  normalizePlan,
  buildExerciseCatalog,
  buildAniaPrompt,
  buildPrompt,
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
    expect(out.exercises[2].name).toBe('Cable crossover')
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
    // Format wpisu: nazwa (sprzęt, typ, movementPattern) — wzorzec surową wartością enum,
    // dokładnie w formie, jakiej model ma użyć w polu "movementPattern".
    expect(cat.text).toContain('Wyciskanie sztangi na ławce poziomej (sztanga, compound, horizontal_push)')
    expect(cat.text).toContain('[triceps_long]')
  })
  it('każdy wpis katalogu podaje movementPattern (domknięcie slotów struktury)', () => {
    const cat = buildExerciseCatalog('push', 'siłownia')
    const entries = cat.text.split('\n').filter(l => l.startsWith('- '))
    expect(entries.length).toBeGreaterThan(10)
    for (const line of entries) {
      // "- Nazwa (sprzęt, typ, wzorzec)" → trzy pola w nawiasie
      expect(line, line).toMatch(/\((?:[^(),]+, ){2}[a-z_]+\)$/)
    }
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
  it('kontuzja lumbar_disc: OHP (przeciwwskazany) usunięty z katalogu', () => {
    const zdrowy = buildExerciseCatalog('push', 'siłownia', 'mass', 'intermediate', [])
    const kontuzja = buildExerciseCatalog('push', 'siłownia', 'mass', 'intermediate', ['lumbar_disc'])
    expect(zdrowy.text).toContain('Wyciskanie sztangi nad głowę')
    expect(kontuzja.text).not.toContain('Wyciskanie sztangi nad głowę')
    expect(kontuzja.text).toContain('pominięte')
  })
  it('kontuzja knee_pain w Legs: przysiad ze sztangą usunięty, most biodrowy zostaje', () => {
    const cat = buildExerciseCatalog('legs', 'siłownia', 'mass', 'intermediate', ['knee_pain'])
    expect(cat.text).not.toContain('Przysiad ze sztangą')
    expect(cat.text).toContain('Most biodrowy')
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
  it('ćwiczenie korekcyjne spoza bazy (Ptak-pies) zachowuje dozwoloną głowę core', () => {
    const plan = aniaPlan()
    plan.exercises[0].name = 'Ptak-pies'
    plan.exercises[0].muscleHead = 'core'
    const out = normalizePlan(plan, { type: 'ania', goal: 'mass' })
    expect(out.exercises[0].name).toBe('Ptak-pies')
    expect(out.exercises[0].muscleHead).toBe('core')
  })
})

describe('buildAniaPrompt — dwudniowy podział', () => {
  const ALL = ['masa_ciala', 'guma', 'hantle', 'maszyna']
  const baseA = { type: 'ania_a', goal: 'mass', equipment: '', avoid: '', recentSessions: [] }
  const baseB = { type: 'ania_b', goal: 'mass', equipment: '', avoid: '', recentSessions: [] }

  it('profil, przeciwwskazania i 5 slotów per dzień', () => {
    const p = buildAniaPrompt({ ...baseB, equipmentTags: ALL })
    expect(p).toContain('dyskopatia')
    expect(p).toContain('PRZECIWWSKAZANIA')
    expect(p).toContain('SLOT 1')
    expect(p).toContain('SLOT 5')
    expect(p).not.toContain('SLOT 6')
    expect(p).toContain('DOKŁADNIE 5')
  })
  it('Dzień 1 = kręgosłup / górne plecy / postawa', () => {
    const p = buildAniaPrompt({ ...baseA, equipmentTags: ALL })
    expect(p).toContain('Dzień 1')
    expect(p).toContain('Wiosłowanie australijskie') // masa ciała — górne plecy
    expect(p).toContain('Band pull-apart')           // guma — łopatki
    expect(p).toContain('Face pull')                 // maszyna
    expect(p).not.toContain('Hip thrust')            // to Dzień 2
  })
  it('Dzień 2 = core / pośladki / tylna taśma', () => {
    const p = buildAniaPrompt({ ...baseB, equipmentTags: ALL })
    expect(p).toContain('Dzień 2')
    expect(p).toContain('Hip thrust')                // hantle
    expect(p).toContain('Lying leg curl')            // maszyna (nazwa kanoniczna EN)
    expect(p).toContain('Hip abduction machine')
    expect(p).not.toContain('Band pull-apart')       // to Dzień 1
  })
  it('tylko masa ciała → bez gum, hantli, maszyn', () => {
    const p = buildAniaPrompt({ ...baseB, equipmentTags: ['masa_ciala'] })
    expect(p).toContain('Martwy robak')
    expect(p).toContain('Most biodrowy')
    expect(p).not.toContain('Uginanie nóg leżąc')
    expect(p).not.toContain('Hip thrust')
  })
  it('każdy slot ma opcję nawet przy samej masie ciała (oba dni)', () => {
    for (const b of [baseA, baseB]) {
      const p = buildAniaPrompt({ ...b, equipmentTags: ['masa_ciala'] })
      expect(p).not.toMatch(/Wybierz 1 z:\s*(\n|$)/)
    }
  })
  it('progresja obciążonych wariantów idzie CIĘŻAREM (nie tylko trudnością)', () => {
    const p = buildAniaPrompt({ ...baseB, equipmentTags: ALL, recentSessions: [
      { date: '2026-07-01', exercises: [{ name: 'Hip thrust', sets: [{ weight: 20, reps: 12 }] }] }
    ] })
    expect(p).toContain('ANALIZA POSTĘPÓW')
    expect(p).toContain('CIĘŻAREM')
  })
  it('notatki użytkownika trafiają do promptu (pętla progresji)', () => {
    const p = buildAniaPrompt({ ...baseA, equipmentTags: ALL, recentSessions: [
      { date: '2026-07-01', note: 'bolało kolano przy wall sit', exercises: [] }
    ] })
    expect(p).toContain('UWAGI UŻYTKOWNIKA')
    expect(p).toContain('bolało kolano przy wall sit')
  })
  it('bez historii → instrukcja startowa', () => {
    const p = buildAniaPrompt({ ...baseB, equipmentTags: ALL })
    expect(p).toContain('BRAK HISTORII')
    expect(p).not.toContain('ANALIZA POSTĘPÓW')
  })
})

describe('buildPrompt — split system/user (prompt caching)', () => {
  const base = { type: 'push', goal: 'mass', equipment: 'siłownia', avoid: '', recentSessions: [], level: 'intermediate', injuries: [] }

  it('system zawiera stabilny prefiks (katalog + struktura + reguły JSON)', () => {
    const { system } = buildPrompt(base)
    expect(system).toContain('BAZA ĆWICZEŃ')
    expect(system).toContain('Struktura:')
    expect(system).toContain('Zwróć WYŁĄCZNIE poprawny JSON')
    expect(system).toContain('"movementPattern" musi być jedną z')
  })
  it('system NIE zależy od historii ani avoid (stały prefiks = cache hit)', () => {
    const a = buildPrompt(base).system
    const b = buildPrompt({ ...base, avoid: 'przysiady', recentSessions: [
      { id: 's1', date: '2026-07-01', exercises: [{ name: 'Wyciskanie sztangi na ławce poziomej', sets: [{ weight: 80, reps: 8 }] }] }
    ] }).system
    expect(a).toBe(b)
  })
  it('user zawiera dynamikę: trigger, avoid, historię i analizę', () => {
    const { system, user } = buildPrompt({ ...base, avoid: 'przysiady', recentSessions: [
      { id: 's1', date: '2026-07-01', exercises: [{ name: 'Wyciskanie sztangi na ławce poziomej', sets: [{ weight: 80, reps: 8 }] }] }
    ] })
    expect(user).toContain('Wygeneruj teraz')
    expect(user).toContain('UNIKAJ: przysiady')
    expect(user).toContain('OSTATNIE SESJE')
    expect(user).toContain('ANALIZA HISTORII')
    expect(user).toContain('"analysis"')
    // avoid/historia nie mogą wyciec do cache'owanego systemu
    expect(system).not.toContain('przysiady')
    expect(system).not.toContain('OSTATNIE SESJE')
  })
  it('bez historii: user nie ma sekcji analizy, system nadal pełny', () => {
    const { system, user } = buildPrompt(base)
    expect(user).not.toContain('ANALIZA HISTORII')
    expect(user).not.toContain('"analysis"')
    expect(system).toContain('BAZA ĆWICZEŃ')
  })
  it('reguła podobieństwa jest precyzyjna (muscleHead + movementPattern)', () => {
    const { system } = buildPrompt(base)
    expect(system).toContain('muscleHead + movementPattern')
    // stara, nieprecyzyjna formuła nie może wrócić
    expect(system).not.toContain('bardzo podobnych ćwiczeń')
  })
  it('fallback zachowuje wzorzec ruchowy zamiast podmieniać go na inny', () => {
    const { system } = buildPrompt(base)
    expect(system).toContain('zachowujący ten sam movementPattern')
    expect(system).toContain('NIE zastępuj go innym wzorcem ruchowym')
  })
  it('kalistenika: reguły wymagające sztangi/hantli są jawnie unieważnione', () => {
    const { system } = buildPrompt({ ...base, equipment: 'dom bez sprzętu (calisthenics)' })
    expect(system).toContain('WYŁĄCZNIE masa ciała')
    expect(system).toContain('NIE OBOWIĄZUJĄ')
  })
  it('siłownia/hantle: brak klauzuli o samej masie ciała (bez zbędnych tokenów)', () => {
    expect(buildPrompt(base).system).not.toContain('NIE OBOWIĄZUJĄ')
    expect(buildPrompt({ ...base, equipment: 'dom z hantlami' }).system).not.toContain('NIE OBOWIĄZUJĄ')
  })
  it('wymusza różnicowanie powtórzeń wg charakteru ćwiczenia (nie 3x12 wszędzie)', () => {
    const { system } = buildPrompt(base)
    expect(system).toContain('RÓŻNICUJ')
    expect(system).toContain('DOLNA część zakresu')
    expect(system).toContain('GÓRNA część zakresu')
    expect(system).toContain('izometryczne')
  })
  it('redukcja: różnicowanie NIE dotyczy serii (kolizja z regułą „dokładnie 3 serie")', () => {
    const { system } = buildPrompt({ ...base, goal: 'cut' })
    expect(system).toContain('DOKŁADNIE 3')
    expect(system).toContain('RÓŻNICUJ "reps" wg charakteru')
    expect(system).not.toContain('więcej serii')
    expect(system).not.toContain('mniej serii')
  })
  it('typ "ania" → system pusty, całość w user (bez cache)', () => {
    const { system, user } = buildPrompt({ type: 'ania', goal: 'mass', equipment: '', avoid: '', recentSessions: [], equipmentTags: ['masa_ciala'] })
    expect(system).toBe('')
    expect(user).toContain('SLOT 1')
  })
})
