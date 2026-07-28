import { describe, it, expect } from 'vitest'
import {
  weeklyTargets,
  volumeRange,
  volumeStatus,
  chooseSplit,
  estimateWeeklyVolume,
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
