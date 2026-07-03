import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTimerStore = defineStore('timer', () => {
  const seconds = ref(0)
  const running = ref(false)
  const target = ref(90)

  let intervalId: ReturnType<typeof setInterval> | null = null

  const display = computed(() => {
    const s = Math.max(0, target.value - seconds.value)
    const mm = String(Math.floor(s / 60)).padStart(2, '0')
    const ss = String(s % 60).padStart(2, '0')
    return `${mm}:${ss}`
  })

  function start(targetSec = 90): void {
    target.value = targetSec
    seconds.value = 0
    running.value = true
    if (intervalId) clearInterval(intervalId)
    intervalId = setInterval(() => {
      seconds.value++
      if (seconds.value >= target.value) {
        stop()
      }
    }, 1000)
  }

  function stop(): void {
    running.value = false
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function reset(): void {
    stop()
    seconds.value = 0
  }

  return { seconds, running, target, display, start, stop, reset }
})
