<script setup>
import { ref, computed, onUnmounted } from 'vue'

const remaining = ref(0)
const running = ref(false)
const target = ref(90)
let intervalId = null

const display = computed(() => {
  const s = Math.max(0, remaining.value)
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${mm}:${ss}`
})

function start(sec = target.value) {
  target.value = sec
  remaining.value = sec
  running.value = true
  if (intervalId) clearInterval(intervalId)
  intervalId = setInterval(() => {
    remaining.value--
    if (remaining.value <= 0) {
      stop()
      try {
        if (navigator.vibrate) navigator.vibrate([200, 100, 200])
      } catch {}
    }
  }, 1000)
}

function stop() {
  running.value = false
  if (intervalId) { clearInterval(intervalId); intervalId = null }
}

function add(sec) {
  if (running.value) remaining.value += sec
  else target.value = Math.max(15, target.value + sec)
}

defineExpose({ start, stop })

onUnmounted(() => { if (intervalId) clearInterval(intervalId) })
</script>

<template>
  <div class="rest-timer" :class="{ running, finished: running === false && remaining === 0 && target > 0 }">
    <div class="timer-display">{{ display }}</div>
    <div class="timer-controls">
      <button class="btn" @click="add(-15)" :disabled="!running && target <= 15">-15s</button>
      <button v-if="!running" class="btn btn-primary" @click="start()">Start</button>
      <button v-else class="btn" @click="stop()">Stop</button>
      <button class="btn" @click="add(15)">+15s</button>
    </div>
    <div class="timer-presets" v-if="!running">
      <button v-for="t in [60, 90, 120, 180]" :key="t" class="preset"
              :class="{ active: target === t }" @click="target = t; remaining = t">
        {{ t }}s
      </button>
    </div>
  </div>
</template>

<style scoped>
.rest-timer {
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--space-4);
  text-align: center;
}
.rest-timer.running {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.timer-display {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 42px;
  font-weight: 700;
  letter-spacing: -1px;
  margin-bottom: var(--space-3);
}
.rest-timer.running .timer-display { color: var(--accent); }
.timer-controls {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: var(--space-3);
}
.timer-presets {
  display: flex;
  gap: 6px;
  justify-content: center;
}
.preset {
  padding: 6px 12px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
}
.preset.active {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-soft);
}
</style>
