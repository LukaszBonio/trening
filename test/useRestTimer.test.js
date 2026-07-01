import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useRestTimer } from '../src/composables/useRestTimer.js'

vi.mock('../src/lib/notifications.js', () => ({
  notifyTimerEnd: vi.fn()
}))

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

describe('useRestTimer', () => {
  it('initializes with zero remaining', () => {
    const timer = useRestTimer(90)
    expect(timer.restRemaining.value).toBe(0)
    expect(timer.restTotal.value).toBe(90)
  })

  it('startRest sets remaining and total', () => {
    const timer = useRestTimer(90)
    timer.startRest(60)
    expect(timer.restRemaining.value).toBe(60)
    expect(timer.restTotal.value).toBe(60)
  })

  it('counts down each second', () => {
    const timer = useRestTimer(90)
    timer.startRest(10)
    vi.advanceTimersByTime(3000)
    expect(timer.restRemaining.value).toBe(7)
  })

  it('calls onTimerEnd callback when reaching zero', () => {
    const timer = useRestTimer(90)
    const cb = vi.fn()
    timer.onTimerEnd(cb)
    timer.startRest(3)
    vi.advanceTimersByTime(3000)
    expect(cb).toHaveBeenCalledOnce()
    expect(timer.restRemaining.value).toBe(0)
  })

  it('sets timerEndFlash on completion', () => {
    const timer = useRestTimer(90)
    timer.startRest(1)
    vi.advanceTimersByTime(1000)
    expect(timer.timerEndFlash.value).toBe(true)
    vi.advanceTimersByTime(2000)
    expect(timer.timerEndFlash.value).toBe(false)
  })

  it('stopRest halts the countdown', () => {
    const timer = useRestTimer(90)
    timer.startRest(10)
    vi.advanceTimersByTime(3000)
    timer.stopRest()
    vi.advanceTimersByTime(5000)
    expect(timer.restRemaining.value).toBe(7)
  })

  it('adjustRest modifies remaining', () => {
    const timer = useRestTimer(90)
    timer.startRest(30)
    timer.adjustRest(15)
    expect(timer.restRemaining.value).toBe(45)
    expect(timer.restTotal.value).toBe(45)
  })

  it('adjustRest does not go below zero', () => {
    const timer = useRestTimer(90)
    timer.startRest(5)
    timer.adjustRest(-10)
    expect(timer.restRemaining.value).toBe(0)
  })

  it('restProgress reflects countdown', () => {
    const timer = useRestTimer(90)
    timer.startRest(10)
    vi.advanceTimersByTime(5000)
    expect(timer.restProgress.value).toBe(50)
  })
})
