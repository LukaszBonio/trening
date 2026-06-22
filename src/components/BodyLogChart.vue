<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler } from 'chart.js'

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler)

const props = defineProps({
  entries: { type: Array, required: true }
})

const canvas = ref(null)
let chart = null

function build() {
  if (!canvas.value || props.entries.length < 2) return
  if (chart) chart.destroy()

  const styles = getComputedStyle(document.documentElement)
  const accent = styles.getPropertyValue('--accent').trim() || '#d4ff3a'
  const textDim = styles.getPropertyValue('--text-dim').trim() || '#5e616b'
  const border = 'rgba(255,255,255,0.07)'

  chart = new Chart(canvas.value, {
    type: 'line',
    data: {
      labels: props.entries.map(e => e.date.slice(5)),
      datasets: [{
        label: 'Waga (kg)',
        data: props.entries.map(e => e.weight),
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
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: textDim, font: { size: 11 } }, grid: { color: border } },
        y: { ticks: { color: textDim, font: { size: 11 } }, grid: { color: border } }
      }
    }
  })
}

onMounted(build)
watch(() => props.entries, build, { deep: true })
onBeforeUnmount(() => { if (chart) chart.destroy() })
</script>

<template>
  <div class="chart-wrap" v-if="entries.length >= 2">
    <canvas ref="canvas"></canvas>
  </div>
  <p v-else class="muted">Dodaj co najmniej 2 pomiary by zobaczyć wykres.</p>
</template>

<style scoped>
.chart-wrap { position: relative; height: 220px; }
</style>
