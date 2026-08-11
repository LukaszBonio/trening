import { describe, it, expect } from 'vitest'
import { startOfTrainingWeek, isSameTrainingWeek } from '../src/lib/weekTracking.ts'

const DAY = 86400000

describe('startOfTrainingWeek', () => {
  it('zwraca poniedziałek 00:00, nie w przyszłości, w obrębie 7 dni', () => {
    const ts = new Date('2026-08-11T15:30:00').getTime()
    const s = startOfTrainingWeek(ts)
    const d = new Date(s)
    expect(d.getDay()).toBe(1)        // poniedziałek
    expect(d.getHours()).toBe(0)
    expect(d.getMinutes()).toBe(0)
    expect(s).toBeLessThanOrEqual(ts)
    expect(ts - s).toBeLessThan(7 * DAY)
  })
  it('jest idempotentna (początek tygodnia = początek swojego tygodnia)', () => {
    const s = startOfTrainingWeek(new Date('2026-08-11T15:30:00').getTime())
    expect(startOfTrainingWeek(s)).toBe(s)
  })
})

describe('isSameTrainingWeek', () => {
  it('poniedziałek i niedziela tego samego tygodnia → ten sam tydzień', () => {
    const mon = startOfTrainingWeek(new Date('2026-08-11T12:00:00').getTime())
    const sundayEvening = mon + 6 * DAY + 23 * 3600000
    expect(isSameTrainingWeek(mon, sundayEvening)).toBe(true)
  })
  it('niedziela i następny poniedziałek → różne tygodnie', () => {
    const mon = startOfTrainingWeek(new Date('2026-08-11T12:00:00').getTime())
    expect(isSameTrainingWeek(mon, mon + 7 * DAY)).toBe(false)
  })
})
