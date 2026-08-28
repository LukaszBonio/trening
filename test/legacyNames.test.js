// Ochrona historii po przemianowaniu maszyn/wyciągów na nazwy angielskie (2026-08).
// Dopasowanie historii i progresji idzie po ID z bazy (analytics.exerciseIdentityKey),
// a ID rozwiązuje się z nazwy LUB aliasu. Dlatego stare polskie nazwy MUSZĄ zostać
// aliasami na zawsze — inaczej „ostatni ciężar" i wykresy zgubią treningi sprzed zmiany.
import { describe, it, expect } from 'vitest'
import { findExerciseByName, ALL_EXERCISES } from '../src/lib/exerciseDb.ts'
import { translateExerciseName } from '../src/lib/substitutions.ts'

// Stara nazwa (sprzed przemianowania) → oczekiwana nazwa kanoniczna (po).
const RENAMED = {
  'Ściąganie drążka wyciągu górnego': 'Lat pulldown',
  'Ściąganie drążka podchwytem': 'Underhand lat pulldown',
  'Ściąganie drążka na prostych ramionach': 'Straight-arm pulldown',
  'Wiosłowanie na wyciągu siedząc': 'Seated cable row',
  'Wiosłowanie na maszynie': 'Machine row',
  'Wyciskanie na maszynie': 'Chest press',
  'Wyciskanie na maszynie na skosie': 'Incline chest press',
  'Rozpiętki na maszynie': 'Pec deck',
  'Odwrotne rozpiętki na maszynie': 'Reverse pec deck',
  'Wyprosty nóg': 'Leg extension',
  'Uginanie nóg leżąc': 'Lying leg curl',
  'Uginanie nóg siedząc': 'Seated leg curl',
  'Odwodzenie nóg na maszynie': 'Hip abduction machine',
  'Przywodzenie nóg na maszynie': 'Hip adduction machine',
  'Wspięcia na palce stojąc': 'Standing calf raise',
  'Wspięcia na palce siedząc': 'Seated calf raise',
  'Brzuszki na wyciągu': 'Cable crunch',
  'Brzuszki na maszynie': 'Ab crunch machine',
  'Drwal na wyciągu': 'Cable woodchopper',
  'Wyprosty triceps na wyciągu': 'Triceps pushdown',
  'Pushdown z liną': 'Rope pushdown',
  'Uginanie ramion na wyciągu': 'Cable curl',
  'Uginanie ramion na maszynie': 'Machine biceps curl',
  'Przysiad na suwnicy': 'Smith machine squat',
  'Hip thrust na maszynie': 'Machine hip thrust',
  'Podciąganie na maszynie (grawitron)': 'Assisted pull-up',
  'Prostowniki grzbietu na maszynie': 'Back extension machine',
  'Wzruszenia na suwnicy': 'Smith machine shrug',
}

describe('nazwy historyczne po przemianowaniu maszyn/wyciągów', () => {
  it('każda stara polska nazwa nadal rozwiązuje się do właściwego ćwiczenia', () => {
    for (const [oldName, newName] of Object.entries(RENAMED)) {
      const ex = findExerciseByName(oldName)
      expect(ex, `stara nazwa nie rozwiązuje się: ${oldName}`).toBeTruthy()
      expect(ex.name, `zła kanoniczna dla: ${oldName}`).toBe(newName)
    }
  })

  it('translateExerciseName sprowadza starą nazwę do kanonicznej (spójny wyświetlacz)', () => {
    for (const [oldName, newName] of Object.entries(RENAMED)) {
      expect(translateExerciseName(oldName)).toBe(newName)
    }
    // aliasy EN też trafiają w kanoniczną
    expect(translateExerciseName('lat pulldown')).toBe('Lat pulldown')
    expect(translateExerciseName('leg extension')).toBe('Leg extension')
  })

  it('ćwiczenie spoza bazy zostaje nietknięte (własne plany użytkownika)', () => {
    expect(translateExerciseName('Moje autorskie ćwiczenie')).toBe('Moje autorskie ćwiczenie')
    expect(translateExerciseName('')).toBe('')
  })

  it('brak duplikatów nazw kanonicznych w całej bazie', () => {
    const names = ALL_EXERCISES.map(e => e.name.toLowerCase())
    expect(new Set(names).size).toBe(names.length)
  })
})
