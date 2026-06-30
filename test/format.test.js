import { describe, it, expect } from 'vitest'
import { formatDuration, formatClock, formatDateTime } from '../src/lib/format.js'

describe('formatDuration', () => {
  it('zwraca "—" dla 0/null/undefined', () => {
    expect(formatDuration(0)).toBe('—')
    expect(formatDuration(null)).toBe('—')
    expect(formatDuration(undefined)).toBe('—')
  })
  it('formatuje sekundy jako "Xm Ys"', () => {
    expect(formatDuration(75)).toBe('1m 15s')
    expect(formatDuration(3600)).toBe('60m 0s')
    expect(formatDuration(125)).toBe('2m 5s')
  })
  it('wartości <60s → "0m Ys"', () => {
    expect(formatDuration(45)).toBe('0m 45s')
    expect(formatDuration(1)).toBe('0m 1s')
  })
})

describe('formatClock', () => {
  it('zawsze pokazuje MM:SS, padding zerami', () => {
    expect(formatClock(0)).toBe('00:00')
    expect(formatClock(75)).toBe('01:15')
    expect(formatClock(3599)).toBe('59:59')
  })
  it('obcina ujemne wartości do 00:00', () => {
    expect(formatClock(-10)).toBe('00:00')
  })
  it('obcina ułamki sekund (bitowy OR)', () => {
    expect(formatClock(75.9)).toBe('01:15')
  })
  it('formatuje wartości > godziny bez zawijania minut', () => {
    expect(formatClock(3661)).toBe('61:01')
  })
})

describe('formatDateTime', () => {
  it('zwraca string dla poprawnego ISO date', () => {
    const out = formatDateTime('2026-06-23T14:30:00.000Z')
    expect(out).toContain('·')
  })
  it('zwraca oryginalny string przy błędzie', () => {
    expect(formatDateTime('')).toBe('')
  })
  it('zwraca oryginalny string dla niepoprawnej daty (nie "Invalid Date")', () => {
    expect(formatDateTime('not-a-date')).toBe('not-a-date')
  })
  it('zwraca pusty string dla null/undefined', () => {
    expect(formatDateTime(null)).toBe('')
    expect(formatDateTime(undefined)).toBe('')
  })
})
