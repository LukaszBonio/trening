<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  workouts: { type: Array, required: true }
})

const canvas = ref(null)
let chart = null

const buckets = computed(() => {
  // Group by ISO week (YYYY-Www)
  const map = new Map()
  for (const w of props.workouts) {
    const d = new Date(w.date)
    const key = d.toISOString().slice(0, 10)
    let vol = 0
    for (const ex of w.exercises) {
      for (const s of ex.sets) vol += (s.weight || 0) * (s.reps || 0)
    }
    map.set(key, (map.get(key) || 0) + vol)
  }
  const sorted = [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  return {
    labels: sorted.map(([k]) => k.slice(5)),
    data: sorted.map(([, v]) => Math.round(v))
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
    type: 'line',
    data: {
      labels: buckets.value.labels,
      datasets: [{
        label: 'Wolumen (kg)',
        data: buckets.value.data,
        borderColor: accent,
        backgroundColor: accent + '22',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: accent,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f1014',
          borderColor: border,
          borderWidth: 1,
          titleColor: '#f4f5f7',
          bodyColor: '#989aa4'
        }
      },
      scales: {
        x: {
          ticks: { color: textDim, font: { size: 11 } },
          grid: { color: border }
        },
        y: {
          ticks: { color: textDim, font: { size: 11 } },
          grid: { color: border },
          beginAtZero: true
        }
      }
    }
  })
}

onMounted(build)
watch(buckets, build, { deep: true })
onBeforeUnmount(() => { if (chart) chart.destroy() })
</script>

<template>
  <div class="chart-wrap">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<style scoped>
.chart-wrap {
  position: relative;
  height: 240px;
}
</style>
