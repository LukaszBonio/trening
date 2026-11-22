<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from 'vue'
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import ChartSkeleton from './ChartSkeleton.vue'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const props = defineProps({
  workouts: { type: Array, required: true }
})

const canvas = ref(null)
const ready = ref(false)
let chart = null

// Kolor słupka = typ treningu (Push/Pull/Legs); pozostałe systemy w kolorze akcentu.
// Słupki zamiast wygładzonej linii: sesje różnych typów to nie trend, tylko kolejne dni.
const TYPE_VAR = { push: '--push', pull: '--pull', legs: '--legs' }
const TYPE_LABEL = { push: 'Push', pull: 'Pull', legs: 'Legs' }

function localKey(d) {
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

const buckets = computed(() => {
  // Jeden słupek na dzień treningowy (data lokalna)
  const map = new Map()
  for (const w of props.workouts) {
    const d = new Date(w.date)
    const key = localKey(d)
    let vol = 0
    for (const ex of w.exercises) {
      for (const s of ex.sets) vol += (s.weight || 0) * (s.reps || 0)
    }
    const prev = map.get(key)
    map.set(key, { date: d, vol: (prev?.vol || 0) + vol, type: w.type || prev?.type || '' })
  }
  const sorted = [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v)
  return {
    labels: sorted.map(v => v.date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })),
    data: sorted.map(v => Math.round(v.vol)),
    types: sorted.map(v => v.type)
  }
})

function build() {
  if (!canvas.value) return
  if (chart) chart.destroy()

  const styles = getComputedStyle(document.documentElement)
  const cssVar = (name, fb) => styles.getPropertyValue(name).trim() || fb
  const accent = cssVar('--accent', '#d4ff3a')
  const textMuted = cssVar('--text-muted', '#989aa4')
  const text = cssVar('--text', '#f4f5f7')
  const border = cssVar('--border', 'rgba(255,255,255,0.07)')
  const surface = cssVar('--bg-elev', '#0f1014')
  const colors = buckets.value.types.map(t => (TYPE_VAR[t] ? cssVar(TYPE_VAR[t], accent) : accent))

  chart = new Chart(canvas.value, {
    type: 'bar',
    data: {
      labels: buckets.value.labels,
      datasets: [{
        label: 'Wolumen (kg)',
        data: buckets.value.data,
        backgroundColor: colors,
        borderRadius: 4,
        maxBarThickness: 28
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: surface,
          borderColor: border,
          borderWidth: 1,
          titleColor: text,
          bodyColor: textMuted,
          callbacks: {
            label: (ctx) => {
              const t = buckets.value.types[ctx.dataIndex]
              const kg = ctx.parsed.y.toLocaleString('pl-PL') + ' kg'
              return TYPE_LABEL[t] ? `${TYPE_LABEL[t]} · ${kg}` : kg
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: textMuted, font: { size: 11 }, maxRotation: 0, autoSkip: true },
          grid: { display: false }
        },
        y: {
          ticks: { color: textMuted, font: { size: 11 }, callback: v => Number(v).toLocaleString('pl-PL') },
          grid: { color: border },
          beginAtZero: true
        }
      }
    }
  })
}

onMounted(async () => {
  // Krótki delay aby pokazać skeleton, potem renderuj
  await new Promise(r => setTimeout(r, 80))
  ready.value = true
  await nextTick()
  build()
})
watch(buckets, () => { if (ready.value) build() }, { deep: true })
onBeforeUnmount(() => { if (chart) chart.destroy() })
</script>

<template>
  <ChartSkeleton v-if="!ready" :height="240" variant="bar" />
  <div v-else class="chart-wrap">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<style scoped>
.chart-wrap {
  position: relative;
  height: 240px;
}
</style>
