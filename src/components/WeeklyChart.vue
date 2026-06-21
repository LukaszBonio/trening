<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import ChartSkeleton from './ChartSkeleton.vue'

Chart.register(...registerables)

const props = defineProps({
  workouts: { type: Array, required: true }
})

const canvas = ref(null)
const ready = ref(false)
let chart = null

function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

const buckets = computed(() => {
  const map = new Map()
  for (const w of props.workouts) {
    const key = isoWeek(new Date(w.date))
    map.set(key, (map.get(key) || 0) + 1)
  }
  const sorted = [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  return {
    labels: sorted.map(([k]) => k),
    data: sorted.map(([, v]) => v)
  }
})

function build() {
  if (!canvas.value) return
  if (chart) chart.destroy()

  const styles = getComputedStyle(document.documentElement)
  const accent = styles.getPropertyValue('--accent').trim() || '#d4ff3a'
  const textDim = styles.getPropertyValue('--text-dim').trim() || '#5e616b'
  const border = 'rgba(255,255,255,0.07)'

  chart = new Chart(canvas.value, {
    type: 'bar',
    data: {
      labels: buckets.value.labels,
      datasets: [{
        label: 'Treningi',
        data: buckets.value.data,
        backgroundColor: accent,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: textDim, font: { size: 10 } }, grid: { display: false } },
        y: {
          ticks: { color: textDim, font: { size: 11 }, stepSize: 1 },
          grid: { color: border },
          beginAtZero: true
        }
      }
    }
  })
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 80))
  ready.value = true
  await nextTick()
  build()
})
watch(buckets, () => { if (ready.value) build() }, { deep: true })
onBeforeUnmount(() => { if (chart) chart.destroy() })
</script>

<template>
  <ChartSkeleton v-if="!ready" :height="200" variant="bar" />
  <div v-else class="chart-wrap">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<style scoped>
.chart-wrap {
  position: relative;
  height: 200px;
}
</style>
