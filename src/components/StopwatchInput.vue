<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'

// Stoper (count-up) dla ćwiczeń czasowych. Start → czas leci; Stop → zapisuje sekundy
// do modelValue (v-model). Wartość przechowywana i emitowana jest w SEKUNDACH (number).
const props = defineProps({
  modelValue: { type: [Number, String], default: '' },
  disabled: { type: Boolean, default: false },
  size: { type: String, default: 'compact' } // 'big' | 'compact'
})
const emit = defineEmits(['update:modelValue'])

const running = ref(false)
let startTs = 0
let baseSec = 0
const liveSec = ref(0)
let timer = null

const currentSec = computed(() =>
  running.value ? baseSec + liveSec.value : (Number(props.modelValue) || 0)
)
const display = computed(() => {
  const s = currentSec.value
  if (!running.value && !s) return '—'
  return `${s}s`
})

function tick() {
  liveSec.value = Math.floor((Date.now() - startTs) / 1000)
}
function start() {
  baseSec = Number(props.modelValue) || 0
  startTs = Date.now()
  liveSec.value = 0
  running.value = true
  timer = setInterval(tick, 250)
}
function stop() {
  if (timer) { clearInterval(timer); timer = null }
  running.value = false
  emit('update:modelValue', baseSec + Math.round((Date.now() - startTs) / 1000))
}
function toggle() {
  if (props.disabled) return
  running.value ? stop() : start()
}
function reset() {
  if (running.value || props.disabled) return
  emit('update:modelValue', '')
}

onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>

<template>
  <div class="sw" :class="[size, { running, disabled }]">
    <span class="sw-time" :class="{ live: running }">{{ display }}</span>
    <button
      type="button"
      class="sw-btn"
      :class="{ running }"
      :disabled="disabled"
      @click="toggle"
      :aria-label="running ? 'Zatrzymaj stoper' : 'Uruchom stoper'"
    >
      <i class="ti" :class="running ? 'ti-player-stop-filled' : 'ti-player-play-filled'"></i>
      <span v-if="size === 'big'">{{ running ? 'Stop' : 'Start' }}</span>
    </button>
    <button
      v-if="size === 'big' && !running && currentSec > 0 && !disabled"
      type="button"
      class="sw-reset"
      @click="reset"
      aria-label="Wyzeruj czas"
    >
      <i class="ti ti-rotate-2"></i>
    </button>
  </div>
</template>

<style scoped>
.sw {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sw.big { flex-direction: column; gap: 10px; }
.sw.compact { gap: 6px; }

.sw-time {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}
.sw.big .sw-time { font-size: 32px; }
.sw.compact .sw-time { font-size: 16px; flex: 1; text-align: center; }
.sw-time.live { color: var(--accent); }

.sw-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid var(--border);
  background: var(--bg-elev-2);
  color: var(--text);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  transition: background var(--dur), border-color var(--dur), color var(--dur);
}
.sw-btn:hover:not(:disabled) { border-color: var(--accent); }
.sw-btn:disabled { opacity: 0.5; cursor: default; }
.sw-btn.running { background: var(--accent); color: #000; border-color: var(--accent); }

.sw.big .sw-btn { width: 100%; padding: 12px; font-size: 15px; }
.sw.compact .sw-btn { width: 34px; height: 34px; padding: 0; }
.sw.compact .sw-btn .ti { font-size: 16px; }

.sw-reset {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  padding: 6px 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}
.sw-reset:hover { color: var(--text); border-color: var(--border-strong); }
</style>
