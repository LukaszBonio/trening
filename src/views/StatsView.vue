<script setup>
import { computed } from 'vue'
import { useWorkoutsStore } from '../stores/workouts.js'
import { detectMuscle, getMuscleName } from '../lib/db.js'
import VolumeChart from '../components/VolumeChart.vue'
import WeeklyChart from '../components/WeeklyChart.vue'

const workouts = useWorkoutsStore()

const totalWorkouts = computed(() => workouts.history.length)

const totalVolume = computed(() => {
  let v = 0
  for (const w of workouts.history) {
    for (const ex of w.exercises) {
      for (const s of ex.sets) v += (s.weight || 0) * (s.reps || 0)
    }
  }
  return Math.round(v)
})

const totalSets = computed(() => {
  let n = 0
  for (const w of workouts.history) {
    for (const ex of w.exercises) n += ex.sets.length
  }
  return n
})

const last7Days = computed(() => {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
  return workouts.history.filter(w => new Date(w.date).getTime() >= cutoff).length
})

const volumeByMuscle = computed(() => {
  const map = {}
  for (const w of workouts.history) {
    for (const ex of w.exercises) {
      const muscle = detectMuscle(ex.name) || 'inne'
      if (!map[muscle]) map[muscle] = 0
      for (const s of ex.sets) map[muscle] += (s.weight || 0) * (s.reps || 0)
    }
  }
  return Object.entries(map)
    .map(([key, vol]) => ({ key, name: getMuscleName(key), vol: Math.round(vol) }))
    .sort((a, b) => b.vol - a.vol)
})

const maxVol = computed(() => Math.max(...volumeByMuscle.value.map(m => m.vol), 1))

const typeCounts = computed(() => {
  const c = {}
  for (const w of workouts.history) {
    c[w.type] = (c[w.type] || 0) + 1
  }
  return Object.entries(c).sort((a, b) => b[1] - a[1])
})
</script>

<template>
  <div class="stats-view">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Treningi</div>
        <div class="stat-value">{{ totalWorkouts }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Ostatnie 7 dni</div>
        <div class="stat-value">{{ last7Days }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Łączne serie</div>
        <div class="stat-value">{{ totalSets }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Wolumen (kg)</div>
        <div class="stat-value">{{ totalVolume.toLocaleString('pl-PL') }}</div>
      </div>
    </div>

    <div class="card" v-if="totalWorkouts">
      <h3 class="card-title">Wolumen w czasie</h3>
      <VolumeChart :workouts="workouts.history" />
    </div>

    <div class="card" v-if="totalWorkouts">
      <h3 class="card-title">Treningi w tygodniach</h3>
      <WeeklyChart :workouts="workouts.history" />
    </div>

    <div class="card" v-if="volumeByMuscle.length">
      <h3 class="card-title">Wolumen wg partii mięśniowej</h3>
      <div class="muscle-bars">
        <div v-for="m in volumeByMuscle" :key="m.key" class="muscle-row">
          <div class="muscle-name">{{ m.name }}</div>
          <div class="muscle-bar">
            <div class="muscle-fill" :style="{ width: (m.vol / maxVol * 100) + '%' }"></div>
          </div>
          <div class="muscle-val">{{ m.vol.toLocaleString('pl-PL') }}</div>
        </div>
      </div>
    </div>

    <div class="card" v-if="typeCounts.length">
      <h3 class="card-title">Treningi wg typu</h3>
      <div class="type-counts">
        <div v-for="[type, count] in typeCounts" :key="type" class="type-count">
          <span class="type-label">{{ type.toUpperCase() }}</span>
          <span class="type-num">{{ count }}</span>
        </div>
      </div>
    </div>

    <div class="card" v-if="!totalWorkouts">
      <p class="muted">Brak danych. Wykonaj pierwszy trening żeby zobaczyć statystyki.</p>
    </div>
  </div>
</template>

<style scoped>
.stats-view { display: flex; flex-direction: column; gap: var(--space-3); }
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--space-3);
}
.stat-card {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--space-4);
}
.stat-label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}
.stat-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: var(--accent);
}
.muscle-bars { display: flex; flex-direction: column; gap: 10px; }
.muscle-row {
  display: grid;
  grid-template-columns: 180px 1fr 80px;
  gap: var(--space-3);
  align-items: center;
}
.muscle-name { font-size: 13px; color: var(--text-muted); }
.muscle-bar {
  height: 10px;
  background: var(--bg-elev-2);
  border-radius: 100px;
  overflow: hidden;
}
.muscle-fill {
  height: 100%;
  background: var(--accent-grad);
  transition: width var(--dur);
}
.muscle-val { font-size: 12px; text-align: right; color: var(--text); font-weight: 600; }
.type-counts { display: flex; gap: 10px; flex-wrap: wrap; }
.type-count {
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: 100px;
  padding: 6px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.type-label { font-size: 11px; color: var(--text-muted); font-weight: 600; }
.type-num { font-size: 14px; font-weight: 700; color: var(--accent); }

@media (max-width: 640px) {
  .muscle-row { grid-template-columns: 1fr 60px; }
  .muscle-bar { grid-column: 1 / -1; order: 2; }
  .muscle-name { grid-column: 1; }
  .muscle-val { grid-column: 2; }
}
</style>
