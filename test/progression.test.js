import { describe, it, expect } from 'vitest'
import { suggestNextWeight, parseRepsRange, roundToPlateStep } from '../src/lib/progression'

function hist(weight, reps, rpe = null) {
  return [{
    date: '2026-06-23T10:00:00.000Z',
    exercises: [{
      name: 'Bench',
      sets: [{ weight, reps, ...(rpe != null ? { rpe } : {}) }]
    }]
  }]
}

describe('parseRepsRange', () => {
  it('parsuje zakres "10-12"', () => {
    expect(parseRepsRange('10-12')).toEqual([10, 12])
  })
  it('parsuje pojedynczą wartość "8"', () => {
    expect(parseRepsRange('8')).toEqual([8, 8])
  })
  it('toleruje spacje', () => {
    expect(parseRepsRange('6 - 8')).toEqual([6, 8])
  })
  it('fallback dla pustego/null', () => {
    expect(parseRepsRange(null)).toEqual([8, 12])
    expect(parseRepsRange('')).toEqual([8, 12])
  })
})

describe('roundToPlateStep', () => {
  it('zaokrągla do 2.5kg dla cieżkich', () => {
    expect(roundToPlateStep(63.1)).toBe(62.5)
    expect(roundToPlateStep(64)).toBe(65)
  })
  it('zaokrągla do 1kg dla średnich', () => {
    expect(roundToPlateStep(25.3)).toBe(25)
    expect(roundToPlateStep(27.8)).toBe(28)
  })
  it('zaokrągla do 0.5kg dla lekkich', () => {
    expect(roundToPlateStep(8.2)).toBe(8)
    expect(roundToPlateStep(7.8)).toBe(8)
    expect(roundToPlateStep(7.6)).toBe(7.5)
  })
  it('zero zostaje zerem', () => {
    expect(roundToPlateStep(0)).toBe(0)
  })
})

describe('suggestNextWeight', () => {
  it('zwraca null gdy brak historii', () => {
    expect(suggestNextWeight([], 'Bench', '10-12')).toBeNull()
  })

  // === Z RPE ===
  it('RPE 10 i poniżej zakresu → -5%', () => {
    const r = suggestNextWeight(hist(80, 7, 10), 'Bench', '10-12')
    expect(r.weight).toBe(75) // 80 * 0.95 = 76 → 2.5kg step → 75
    expect(r.reason).toContain('−5%')
  })
  it('RPE 9 i w zakresie → utrzymaj', () => {
    const r = suggestNextWeight(hist(80, 10, 9), 'Bench', '10-12')
    expect(r.weight).toBe(80)
    expect(r.reason).toContain('utrzymaj')
  })
  it('RPE 6 i max powt. → +5%', () => {
    const r = suggestNextWeight(hist(60, 12, 6), 'Bench', '10-12')
    // 60 * 1.05 = 63 → 2.5 step → 62.5
    expect(r.weight).toBe(62.5)
    expect(r.reason).toContain('+5%')
  })
  it('RPE 7 i max powt. → +2.5kg', () => {
    const r = suggestNextWeight(hist(60, 12, 7), 'Bench', '10-12')
    expect(r.weight).toBe(62.5)
    expect(r.reason).toContain('+2.5kg')
  })
  it('RPE 8 i max powt. → +2.5kg', () => {
    const r = suggestNextWeight(hist(60, 12, 8), 'Bench', '10-12')
    expect(r.weight).toBe(62.5)
  })
  it('RPE 8 ale w środku zakresu → utrzymaj', () => {
    const r = suggestNextWeight(hist(60, 10, 8), 'Bench', '10-12')
    expect(r.weight).toBe(60)
    expect(r.reason).toContain('utrzymaj')
  })

  // === Bez RPE (fallback) ===
  it('bez RPE + max powt. → +2.5kg', () => {
    const r = suggestNextWeight(hist(60, 12), 'Bench', '10-12')
    expect(r.weight).toBe(62.5)
    expect(r.reason).toContain('+2.5kg')
  })
  it('bez RPE + poniżej zakresu → -5%', () => {
    const r = suggestNextWeight(hist(80, 8), 'Bench', '10-12')
    expect(r.weight).toBe(75)
    expect(r.reason).toContain('−5%')
  })
  it('bez RPE + w środku zakresu → utrzymaj', () => {
    const r = suggestNextWeight(hist(60, 11), 'Bench', '10-12')
    expect(r.weight).toBe(60)
    expect(r.reason).toContain('utrzymaj')
  })

  // === Edge cases ===
  it('lekki ciężar (10kg) używa kroku 0.5kg', () => {
    const r = suggestNextWeight(hist(10, 12, 7), 'Bench', '10-12')
    // 10 + 0.5 = 10.5
    expect(r.weight).toBe(10.5)
  })
  it('średni ciężar (30kg) używa kroku 1kg', () => {
    const r = suggestNextWeight(hist(30, 12, 7), 'Bench', '10-12')
    // 30 + 1 = 31
    expect(r.weight).toBe(31)
  })
  it('ciężar 45kg progresuje (nie zeruje się przez zaokrąglenie 2.5kg)', () => {
    // Regresja: dawniej +1kg na 45kg → round(46/2.5) → z powrotem 45kg (zero progresji).
    // Teraz przyrost dla ≥40kg = 2.5kg, zgodny z krokiem zaokrąglenia.
    const r = suggestNextWeight(hist(45, 12, 7), 'Bench', '10-12')
    expect(r.weight).toBe(47.5)
    expect(r.weight).toBeGreaterThan(45)
  })
  it('basedOn zawiera oryginalne dane ostatniej serii', () => {
    const r = suggestNextWeight(hist(60, 12, 7), 'Bench', '10-12')
    expect(r.basedOn).toMatchObject({ weight: 60, reps: 12, rpe: 7 })
  })
})
