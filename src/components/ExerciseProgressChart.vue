<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  points: { type: Array, required: true },
  metric: { type: String, default: 'best1RM' }  // 'best1RM' | 'bestWeight' | 'totalVolume'
})

const canvas = ref(null)
let chart = null

const labels = {
  best1RM: '1RM (kg)',
  bestWeight: 'Top ciężar (kg)',
  totalVolume: 'Wolumen (kg)'
}

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
      labels: props.points.map(p => new Date(p.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })),
      datasets: [{
        label: labels[props.metric],
        data: props.points.map(p => p[props.metric]),
        borderColor: accent,
        backgroundColor: accent + '22',
        fill: false,
        tension: 0.25,
        pointBackgroundColor: accent,
        pointRadius: 5,
        pointHoverRadius: 7
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
          callbacks: {
            label: (ctx) => {
              const p = props.points[ctx.dataIndex]
              return [
                `${labels[props.metric]}: ${ctx.parsed.y}`,
                `Top set: ${p.bestWeight}kg × ${p.bestReps}`
              ]
            }
          }
        }
      },
      scales: {
        x: { ticks: { color: textDim, font: { size: 11 } }, grid: { color: border } },
        y: { ticks: { color: textDim, font: { size: 11 } }, grid: { color: border } }
      }
    }
  })
}

onMounted(build)
watch(() => [props.points, props.metric], build, { deep: true })
onBeforeUnmount(() => { if (chart) chart.destroy() })
</script>

<template>
  <div class="chart-wrap">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<style scoped>
.chart-wrap { position: relative; height: 260px; }
</style>
