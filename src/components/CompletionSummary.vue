<script setup>
import { computed } from 'vue'
import { personalRecords } from '../lib/analytics.js'
import { useWorkoutsStore } from '../stores/workouts.js'

const props = defineProps({
  workout: { type: Object, required: true }
})
const emit = defineEmits(['close'])

const workouts = useWorkoutsStore()

const totalVolume = computed(() => {
  let v = 0
  for (const ex of props.workout.exercises) {
    for (const s of ex.sets) v += (s.weight || 0) * (s.reps || 0)
  }
  return Math.round(v)
})

const totalSets = computed(() =>
  props.workout.exercises.reduce((s, ex) => s + ex.sets.length, 0)
)

const duration = computed(() => {
  const s = props.workout.duration || 0
  return `${Math.floor(s / 60)}m ${s % 60}s`
})

// Did this workout produce any new PRs?
const newPRs = computed(() => {
  // Compare PRs from full history (incl. this workout) vs without this workout
  const without = workouts.history.filter(w => w.id !== props.workout.id)
  const prsAll = personalRecords(workouts.history)
  const prsBefore = personalRecords(without)
  const beforeMap = new Map(prsBefore.map(p => [p.name.toLowerCase().trim(), p.best1RM]))
  return prsAll.filter(p =>
    !beforeMap.has(p.name.toLowerCase().trim()) ||
    p.best1RM > beforeMap.get(p.name.toLowerCase().trim())
  ).filter(p =>
    props.workout.exercises.some(ex => ex.name.toLowerCase().trim() === p.name.toLowerCase().trim())
  )
})

const avgRpe = computed(() => {
  const rpes = []
  for (const ex of props.workout.exercises) {
    for (const s of ex.sets) if (s.rpe) rpes.push(s.rpe)
  }
  if (!rpes.length) return null
  return (rpes.reduce((a, b) => a + b, 0) / rpes.length).toFixed(1)
})
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal">
      <div class="success-icon">
        <i class="ti ti-trophy"></i>
      </div>
      <h2 class="modal-title">Trening zapisany!</h2>
      <p class="dim modal-sub">{{ workout.planName }}</p>

      <div class="summary-grid">
        <div class="sum-item">
          <div class="sum-label">Serie</div>
          <div class="sum-val">{{ totalSets }}</div>
        </div>
        <div class="sum-item">
          <div class="sum-label">Wolumen</div>
          <div class="sum-val">{{ totalVolume }}<small>kg</small></div>
        </div>
        <div class="sum-item">
          <div class="sum-label">Czas</div>
          <div class="sum-val">{{ duration }}</div>
        </div>
        <div v-if="avgRpe" class="sum-item">
          <div class="sum-label">Średnie RPE</div>
          <div class="sum-val">{{ avgRpe }}</div>
        </div>
      </div>

      <div v-if="newPRs.length" class="pr-section">
        <div class="pr-header">
          <i class="ti ti-flame"></i> Nowe rekordy ({{ newPRs.length }})
        </div>
        <ul class="pr-list">
          <li v-for="pr in newPRs" :key="pr.name" class="pr-item">
            <span class="pr-name">{{ pr.name }}</span>
            <span class="pr-val">{{ pr.weight }}kg × {{ pr.reps }}</span>
          </li>
        </ul>
      </div>

      <button class="btn btn-primary modal-cta" @click="emit('close')">
        OK, świetnie!
      </button>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: var(--space-4);
  animation: fadeIn 0.18s var(--ease);
}
.modal {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  max-width: 440px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  text-align: center;
  animation: pop 0.25s var(--ease-spring);
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes pop {
  from { opacity: 0; transform: scale(0.92) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.success-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto var(--space-3);
  border-radius: 50%;
  background: var(--accent);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  box-shadow: var(--accent-glow);
}
.modal-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}
.modal-sub { font-size: 13px; margin-bottom: var(--space-5); }

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: var(--space-4);
}
.sum-item {
  padding: var(--space-3);
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.sum-label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}
.sum-val {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--accent);
}
.sum-val small { font-size: 12px; opacity: 0.7; margin-left: 2px; }

.pr-section {
  background: var(--accent-soft);
  border: 1px solid var(--accent-soft-2);
  border-radius: var(--radius);
  padding: var(--space-3);
  margin-bottom: var(--space-4);
  text-align: left;
}
.pr-header {
  font-weight: 700;
  color: var(--accent);
  margin-bottom: var(--space-2);
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}
.pr-list { list-style: none; display: flex; flex-direction: column; gap: 4px; }
.pr-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 4px 0;
}
.pr-name { color: var(--text); }
.pr-val { color: var(--accent); font-weight: 600; }

.modal-cta { width: 100%; padding: 14px; font-size: 15px; }
</style>
