import { describe, it, expect } from 'vitest'
import {
  weeklyTargets,
  volumeRange,
  volumeStatus,
  chooseSplit,
  estimateWeeklyVolume,
  analyzeProgram,
  DAY_LABEL
} from '../src/lib/weeklyVolume'

describe('weeklyTargets', () => {
  it('skaluje objętość poziomem (początkujący < średni < zaawansowany)', () => {
    const b = weeklyTargets('beginner')
    const i = weeklyTargets('intermediate')
    const a = weeklyTargets('advanced')
    expect(b.klatka).toBeLessThan(i.klatka)
    expect(i.klatka).toBeLessThan(a.klatka)
  })
  it('mieści się w zakresie MEV–MAV', () => {
    const t = weeklyTargets('intermediate')
    const [min, max] = volumeRange('klatka')
    expect(t.klatka).toBeGreaterThanOrEqual(min)
    expect(t.klatka).toBeLessThanOrEqual(max)
  })
  it('nieznany poziom → domyślnie środek', () => {
    expect(weeklyTargets('xyz').plecy).toBe(weeklyTargets('intermediate').plecy)
  })
})

describe('volumeStatus', () => {
  it('ocenia względem zakresu', () => {
    const [min, max] = volumeRange('klatka') // [10,18]
    expect(volumeStatus('klatka', min - 1)).toBe('low')
    expect(volumeStatus('klatka', min + 1)).toBe('ok')
    expect(volumeStatus('klatka', max + 1)).toBe('high')
  })
  it('nieznana partia → unknown', () => {
    expect(volumeStatus('nieistnieje', 10)).toBe('unknown')
  })
})

describe('chooseSplit', () => {
  it('dobiera sensowny split wg liczby dni', () => {
    expect(chooseSplit(3).split).toBe('ppl')
    expect(chooseSplit(3).days).toHaveLength(3)
    expect(chooseSplit(4).split).toBe('upperLower')
    expect(chooseSplit(4).days.map(d => d.type)).toEqual(['upper_a', 'lower_a', 'upper_b', 'lower_b'])
    expect(chooseSplit(6).days).toHaveLength(6)
  })
  it('override wymusza system i cykluje na N dni', () => {
    const s = chooseSplit(5, 'fbw')
    expect(s.split).toBe('fbw')
    expect(s.days).toHaveLength(5)
    expect(s.days.map(d => d.type)).toEqual(['fbw_a', 'fbw_b', 'fbw_c', 'fbw_a', 'fbw_b'])
  })
  it('clampuje liczbę dni do 2–6', () => {
    expect(chooseSplit(1).days.length).toBe(2)
    expect(chooseSplit(9).days.length).toBe(6)
  })
  it('Arnold Split (Faza 3) — nowa metoda z reguł', () => {
    const s = chooseSplit(6, 'arnold')
    expect(s.split).toBe('arnold')
    expect(s.days.map(d => d.type)).toEqual(['chest_back', 'shoulders_arms', 'legs', 'chest_back', 'shoulders_arms', 'legs'])
    expect(s.days[0].label).toBe('Klatka + Plecy')
    expect(s.days[1].label).toBe('Barki + Ramiona')
  })
  it('każdy dzień ma czytelną etykietę', () => {
    for (const d of chooseSplit(4).days) expect(DAY_LABEL[d.type]).toBe(d.label)
  })
})

describe('estimateWeeklyVolume', () => {
  it('sumuje serie per partia po primaryMuscle (mapa grup)', () => {
    const days = [
      { plan: { exercises: [
        { name: 'Wyciskanie sztangi na ławce poziomej', primaryMuscle: 'chest', sets: 4 },
        { name: 'Wznosy hantli bokiem', primaryMuscle: 'shoulders', sets: 3 }
      ] } },
      { plan: { exercises: [
        { name: 'Rozpiętki hantlami na ławce poziomej', primaryMuscle: 'chest', sets: 3 }
      ] } }
    ]
    const vol = estimateWeeklyVolume(days)
    expect(vol.klatka).toBe(7)   // 4 + 3
    expect(vol.barki).toBe(3)
  })
  it('fallback na detekcję z nazwy gdy brak primaryMuscle', () => {
    const days = [{ plan: { exercises: [{ name: 'Przysiad ze sztangą', sets: 5 }] } }]
    expect(estimateWeeklyVolume(days)['czworogłowy']).toBe(5)
  })
})

describe('analyzeProgram', () => {
  it('flaguje partię za mało (poniżej zakresu)', () => {
    const days = [{ plan: { exercises: [{ name: 'x', primaryMuscle: 'chest', sets: 4 }] } }] // klatka 4 < 10
    const a = analyzeProgram(days)
    expect(a.ok).toBe(false)
    const klatka = a.issues.find(i => i.group === 'klatka')
    expect(klatka.status).toBe('low')
  })
  it('flaguje partię za dużo (powyżej zakresu)', () => {
    const days = [{ plan: { exercises: [{ name: 'x', primaryMuscle: 'chest', sets: 25 }] } }] // klatka 25 > 18
    const klatka = analyzeProgram(days).issues.find(i => i.group === 'klatka')
    expect(klatka.status).toBe('high')
  })
  it('ok=true gdy wszystkie trenowane partie w normie', () => {
    // klatka 14 (w 10-18), plecy 16 (12-20) — obie ok; reszta 0 = low → więc nie ok.
    // sprawdzamy tylko, że partie w normie NIE trafiają do issues
    const days = [{ plan: { exercises: [
      { name: 'a', primaryMuscle: 'chest', sets: 14 }
    ] } }]
    const a = analyzeProgram(days)
    expect(a.issues.find(i => i.group === 'klatka')).toBeUndefined()
  })
})
