<script setup>
import { ref, computed } from 'vue'
import { useWorkoutsStore } from '../stores/workouts.js'
import { detectMuscle, getMuscleName } from '../lib/db.js'
import {
  uniqueExercises,
  exerciseProgress,
  personalRecords,
  currentStreak
} from '../lib/analytics.js'
import VolumeChart from '../components/VolumeChart.vue'
import WeeklyChart from '../components/WeeklyChart.vue'
import ExerciseProgressChart from '../components/ExerciseProgressChart.vue'
import AchievementsGrid from '../components/AchievementsGrid.vue'

const workouts = useWorkoutsStore()

const totalWorkouts = computed(() => workouts.history.length)
const streak = computed(() => currentStreak(workouts.history))

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

const exercises = computed(() => uniqueExercises(workouts.history))
const records = computed(() => personalRecords(workouts.history))

const selectedExercise = ref(null)
const metric = ref('best1RM')

const progressPoints = computed(() =>
  selectedExercise.value ? exerciseProgress(workouts.history, selectedExercise.value) : []
)
</script>

<template>
  <div class="stats-view">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Treningi</div>
        <div class="stat-value">{{ totalWorkouts }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Streak (tyg.)</div>
        <div class="stat-value">{{ streak }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">7 dni</div>
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

    <!-- Per-exercise progress -->
    <div class="card" v-if="exercises.length">
      <h3 class="card-title">Progres ćwiczenia</h3>
      <div class="ex-picker">
        <select v-model="selectedExercise" class="select">
          <option :value="null">— wybierz ćwiczenie —</option>
          <option v-for="ex in exercises" :key="ex.name" :value="ex.name">
            {{ ex.name }} ({{ ex.count }}×)
          </option>
        </select>
        <div class="metric-tabs" v-if="selectedExercise">
          <button :class="{ active: metric === 'best1RM' }" @click="metric = 'best1RM'">1RM</button>
          <button :class="{ active: metric === 'bestWeight' }" @click="metric = 'bestWeight'">Top ciężar</button>
          <button :class="{ active: metric === 'totalVolume' }" @click="metric = 'totalVolume'">Wolumen</button>
        </div>
      </div>
      <div v-if="selectedExercise && progressPoints.length >= 2">
        <ExerciseProgressChart :points="progressPoints" :metric="metric" />
      </div>
      <p v-else-if="selectedExercise" class="muted" style="margin-top: var(--space-3)">
        Potrzeba co najmniej 2 treningów z tym ćwiczeniem.
      </p>
    </div>

    <!-- Achievements -->
    <div class="card">
      <AchievementsGrid />
    </div>

    <!-- Personal records -->
    <div class="card" v-if="records.length">
      <h3 class="card-title">Rekordy osobiste (top 10)</h3>
      <ul class="pr-list">
        <li v-for="(pr, i) in records.slice(0, 10)" :key="i" class="pr-row">
          <span class="pr-rank">#{{ i + 1 }}</span>
          <div class="pr-main">
            <div class="pr-name">{{ pr.name }}</div>
            <div class="pr-meta">{{ pr.weight }}kg × {{ pr.reps }} ·
              <span class="dim">{{ new Date(pr.date).toLocaleDateString('pl-PL') }}</span>
            </div>
          </div>
          <span class="pr-1rm">{{ pr.best1RM }}<small>kg</small></span>
        </li>
      </ul>
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

    <div class="card" v-if="!totalWorkouts">
      <p class="muted">Brak danych. Wykonaj pierwszy trening żeby zobaczyć statystyki.</p>
    </div>
  </div>
</template>

<style scoped>
.stats-view { display: flex; flex-direction: column; gap: var(--space-3); }
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
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

.ex-picker { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: var(--space-4); }
.select {
  flex: 1;
  min-width: 200px;
  padding: 10px 14px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-family: inherit;
  font-size: 14px;
}
.select:focus { outline: none; border-color: var(--accent); }
.metric-tabs { display: flex; gap: 4px; }
.metric-tabs button {
  padding: 8px 14px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
}
.metric-tabs button.active {
  background: var(--accent);
  color: #000;
  border-color: var(--accent);
}

.pr-list { list-style: none; display: flex; flex-direction: column; gap: 6px; }
.pr-row {
  display: grid;
  grid-template-columns: 36px 1fr auto;
  gap: var(--space-3);
  align-items: center;
  padding: 10px 12px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}
.pr-rank {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  color: var(--accent);
  font-size: 14px;
}
.pr-name { font-weight: 600; font-size: 14px; }
.pr-meta { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.pr-meta .dim { color: var(--text-dim); }
.pr-1rm {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--accent);
}
.pr-1rm small { font-size: 11px; opacity: 0.7; margin-left: 2px; }

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
.muscle-val { font-size: 12px; text-align: right; font-weight: 600; }

@media (max-width: 640px) {
  .muscle-row { grid-template-columns: 1fr 60px; }
  .muscle-bar { grid-column: 1 / -1; order: 2; }
  .muscle-name { grid-column: 1; }
  .muscle-val { grid-column: 2; }
}
</style>
