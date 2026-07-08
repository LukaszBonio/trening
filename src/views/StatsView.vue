<script setup>
import { ref, computed } from 'vue'
import { useWorkoutsStore } from '../stores/workouts'
import { detectMuscle } from '../lib/muscles'
import { MUSCLE_TO_GROUP, GROUP_LABELS, PRIMARY_TO_GROUP } from '../lib/workoutSchema'
import { workoutVolume, totalSets as totalSetsOf } from '../lib/workoutMath'
import {
  uniqueExercises,
  exerciseProgress,
  personalRecords,
  currentStreak,
  compoundIsolationRatio,
  movementPatternBalance,
  pushPullRatio
} from '../lib/analytics'
import VolumeChart from '../components/VolumeChart.vue'
import WeeklyChart from '../components/WeeklyChart.vue'
import ExerciseProgressChart from '../components/ExerciseProgressChart.vue'
import AchievementsGrid from '../components/AchievementsGrid.vue'
import CalendarHeatmap from '../components/CalendarHeatmap.vue'
import { generateWeeklyReport, loadCachedReport, saveCachedReport, clearCachedReport } from '../lib/weeklyReport'
import { useToast } from '../composables/useToast'
import BaseCard from '../components/BaseCard.vue'

const workouts = useWorkoutsStore()
const toast = useToast()

// Tygodniowy raport AI — cache w localStorage, generowanie na żądanie.
const weeklyReport = ref(loadCachedReport())
const reportLoading = ref(false)
const reportError = ref('')

const recentSessionsCount = computed(() => {
  const cutoff = Date.now() - 14 * 86400000
  return workouts.history.filter(w => new Date(w.date).getTime() >= cutoff).length
})

async function generateReport() {
  reportLoading.value = true
  reportError.value = ''
  try {
    const r = await generateWeeklyReport(workouts.history)
    weeklyReport.value = r
    saveCachedReport(r)
    toast.success('Raport tygodniowy gotowy.')
  } catch (e) {
    reportError.value = e.message || String(e)
  } finally {
    reportLoading.value = false
  }
}

function refreshReport() {
  clearCachedReport()
  weeklyReport.value = null
  generateReport()
}

function reportAgeLabel() {
  if (!weeklyReport.value?.generatedAt) return ''
  const days = Math.floor((Date.now() - new Date(weeklyReport.value.generatedAt).getTime()) / 86400000)
  if (days === 0) return 'dziś'
  if (days === 1) return 'wczoraj'
  return `${days} dni temu`
}

const totalWorkouts = computed(() => workouts.history.length)
const streak = computed(() => currentStreak(workouts.history))

const totalVolume = computed(() => workouts.history.reduce((sum, w) => sum + workoutVolume(w), 0))
const totalSets = computed(() => workouts.history.reduce((sum, w) => sum + totalSetsOf(w), 0))

const last7Days = computed(() => {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
  return workouts.history.filter(w => new Date(w.date).getTime() >= cutoff).length
})

// Priorytet partii: AI plan (ex.primaryMuscle) → detectMuscle z nazwy → 'inne'
function groupForExercise(ex) {
  if (ex.primaryMuscle && PRIMARY_TO_GROUP[ex.primaryMuscle]) {
    return PRIMARY_TO_GROUP[ex.primaryMuscle]
  }
  const m = detectMuscle(ex.name)
  return m ? (MUSCLE_TO_GROUP[m] || 'inne') : 'inne'
}

const volumeByMuscle = computed(() => {
  const map = {}
  for (const w of workouts.history) {
    for (const ex of w.exercises) {
      const group = groupForExercise(ex)
      if (!map[group]) map[group] = { vol: 0, exercises: new Map() }
      let exVol = 0
      for (const s of ex.sets) exVol += (s.weight || 0) * (s.reps || 0)
      map[group].vol += exVol
      map[group].exercises.set(ex.name, (map[group].exercises.get(ex.name) || 0) + exVol)
    }
  }
  return Object.entries(map)
    .map(([key, data]) => ({
      key,
      name: GROUP_LABELS[key]?.name || key,
      vol: Math.round(data.vol),
      exercises: Array.from(data.exercises.entries())
        .map(([name, vol]) => ({ name, vol: Math.round(vol) }))
        .sort((a, b) => b.vol - a.vol)
    }))
    .sort((a, b) => b.vol - a.vol)
})

const expandedMuscle = ref(null)
function toggleMuscle(key) {
  expandedMuscle.value = expandedMuscle.value === key ? null : key
}

const maxVol = computed(() => Math.max(...volumeByMuscle.value.map(m => m.vol), 1))

const exercises = computed(() => uniqueExercises(workouts.history))
const records = computed(() => personalRecords(workouts.history))

const selectedExercise = ref(null)
const metric = ref('best1RM')

const progressPoints = computed(() =>
  selectedExercise.value ? exerciseProgress(workouts.history, selectedExercise.value) : []
)

// --- Analiza wzorców ruchowych ---
const ciStats = computed(() => compoundIsolationRatio(workouts.history))
const hasTypeData = computed(() => ciStats.value.compound + ciStats.value.isolation > 0)

const patterns = computed(() => movementPatternBalance(workouts.history))
const maxPatternSets = computed(() => Math.max(...patterns.value.map(p => p.sets), 1))
const hasPatternData = computed(() => patterns.value.length > 0)

const ppStats = computed(() => pushPullRatio(workouts.history))
const hasPushPullData = computed(() => ppStats.value.ratio !== null)
</script>

<template>
  <div class="stats-view">
    <!-- Tygodniowy raport AI -->
    <BaseCard v-if="recentSessionsCount >= 2" class="weekly-report">
      <template #header>
        <div class="weekly-header">
          <div class="weekly-title-block">
            <h3 class="card-title weekly-title">
              <i class="ti ti-sparkles"></i> Twój tydzień
            </h3>
            <div v-if="weeklyReport" class="dim weekly-age">
              wygenerowano {{ reportAgeLabel() }}
            </div>
          </div>
          <button
            v-if="weeklyReport"
            class="btn-tiny"
            @click="refreshReport"
            :disabled="reportLoading"
            aria-label="Wygeneruj raport ponownie"
          >
            <i class="ti ti-refresh" aria-hidden="true"></i>
          </button>
        </div>
      </template>

      <!-- Brak raportu — przycisk generowania -->
      <div v-if="!weeklyReport && !reportLoading && !reportError">
        <p class="muted weekly-cta">
          AI przeanalizuje Twoje ostatnie 14 dni i wskaże co poszło dobrze + co zmienić.
        </p>
        <button class="btn btn-primary" @click="generateReport">
          <i class="ti ti-brain"></i> Generuj raport
        </button>
      </div>

      <!-- Loading -->
      <div v-if="reportLoading" class="weekly-loading">
        <i class="ti ti-loader spin"></i>
        <span>Analizuję {{ recentSessionsCount }} sesji…</span>
      </div>

      <!-- Error -->
      <p v-if="reportError" class="weekly-error">
        <i class="ti ti-alert-triangle"></i> {{ reportError }}
      </p>

      <!-- Raport gotowy -->
      <template v-if="weeklyReport && !reportLoading">
        <p class="weekly-summary">{{ weeklyReport.summary }}</p>

        <div v-if="weeklyReport.highlights.length" class="weekly-section">
          <div class="weekly-section-title">
            <i class="ti ti-trending-up"></i> Co poszło dobrze
          </div>
          <ul class="weekly-list">
            <li v-for="(h, i) in weeklyReport.highlights" :key="'h'+i">{{ h }}</li>
          </ul>
        </div>

        <div v-if="weeklyReport.suggestions.length" class="weekly-section">
          <div class="weekly-section-title">
            <i class="ti ti-target"></i> Sugestie na kolejny tydzień
          </div>
          <ul class="weekly-list">
            <li v-for="(s, i) in weeklyReport.suggestions" :key="'s'+i">{{ s }}</li>
          </ul>
        </div>
      </template>
    </BaseCard>

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

    <BaseCard v-if="totalWorkouts" title="Kalendarz treningowy">
      <CalendarHeatmap :workouts="workouts.history" />
    </BaseCard>

    <!-- Analiza wzorców ruchowych -->
    <BaseCard v-if="hasTypeData || hasPatternData" title="Analiza wzorców">
      <!-- Compound vs Isolation -->
      <div v-if="hasTypeData" class="pattern-section">
        <div class="pattern-section-title">
          <i class="ti ti-barbell"></i> Compound vs Isolation
        </div>
        <div class="ci-bar-container">
          <div class="ci-bar">
            <div class="ci-fill ci-compound" :style="{ width: ciStats.compoundRatio + '%' }"></div>
          </div>
          <div class="ci-labels">
            <span class="ci-label">
              <span class="ci-dot ci-dot-compound"></span>
              Compound {{ ciStats.compoundRatio }}%
              <span class="dim">({{ ciStats.compound }})</span>
            </span>
            <span class="ci-label">
              <span class="ci-dot ci-dot-isolation"></span>
              Isolation {{ 100 - ciStats.compoundRatio }}%
              <span class="dim">({{ ciStats.isolation }})</span>
            </span>
          </div>
        </div>
        <p v-if="ciStats.compoundRatio < 50" class="pattern-hint pattern-hint-warn">
          <i class="ti ti-alert-triangle"></i>
          Mało compound — zalecane ~60-70% ćwiczeń wielostawowych.
        </p>
        <p v-else-if="ciStats.compoundRatio >= 60 && ciStats.compoundRatio <= 80" class="pattern-hint pattern-hint-ok">
          <i class="ti ti-check"></i>
          Dobry balans compound/isolation.
        </p>
      </div>

      <!-- Push/Pull ratio -->
      <div v-if="hasPushPullData" class="pattern-section">
        <div class="pattern-section-title">
          <i class="ti ti-arrows-exchange"></i> Push / Pull
        </div>
        <div class="pp-row">
          <div class="pp-stat">
            <span class="pp-value">{{ ppStats.pushSets }}</span>
            <span class="pp-label">Push serii</span>
          </div>
          <div class="pp-ratio" :class="{
            'pp-ok': ppStats.ratio >= 0.7 && ppStats.ratio <= 1.3,
            'pp-warn': ppStats.ratio < 0.7 || ppStats.ratio > 1.3
          }">
            {{ ppStats.ratio }}
          </div>
          <div class="pp-stat">
            <span class="pp-value">{{ ppStats.pullSets }}</span>
            <span class="pp-label">Pull serii</span>
          </div>
        </div>
        <p v-if="ppStats.ratio < 0.7 || ppStats.ratio > 1.3" class="pattern-hint pattern-hint-warn">
          <i class="ti ti-alert-triangle"></i>
          Nierównowaga push/pull — zalecany stosunek 0.7–1.3.
        </p>
        <p v-else class="pattern-hint pattern-hint-ok">
          <i class="ti ti-check"></i>
          Zbalansowany stosunek push/pull.
        </p>
      </div>

      <!-- Movement patterns -->
      <div v-if="hasPatternData" class="pattern-section">
        <div class="pattern-section-title">
          <i class="ti ti-activity"></i> Wzorce ruchowe
        </div>
        <div class="pattern-bars">
          <div v-for="p in patterns" :key="p.key" class="pattern-row">
            <div class="pattern-name">{{ p.label }}</div>
            <div class="pattern-bar">
              <div class="pattern-fill" :style="{ width: (p.sets / maxPatternSets * 100) + '%' }"></div>
            </div>
            <div class="pattern-val">{{ p.sets }}</div>
          </div>
        </div>
      </div>

      <p v-if="ciStats.unknown > 0" class="dim" style="font-size: 11px; margin-top: var(--space-3)">
        {{ ciStats.unknown }} ćwiczeń bez metadanych AI (plany lokalne/custom).
      </p>
    </BaseCard>

    <BaseCard v-if="totalWorkouts" title="Wolumen w czasie">
      <VolumeChart :workouts="workouts.history" />
    </BaseCard>

    <BaseCard v-if="totalWorkouts" title="Treningi w tygodniach">
      <WeeklyChart :workouts="workouts.history" />
    </BaseCard>

    <!-- Per-exercise progress -->
    <BaseCard v-if="exercises.length" title="Progres ćwiczenia">
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
    </BaseCard>

    <!-- Achievements -->
    <BaseCard>
      <AchievementsGrid />
    </BaseCard>

    <!-- Personal records -->
    <BaseCard v-if="records.length" title="Rekordy osobiste (top 10)">
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
    </BaseCard>

    <BaseCard v-if="volumeByMuscle.length" title="Wolumen wg partii mięśniowej">
      <p class="muted" style="font-size: 12px; margin-bottom: var(--space-2)">
        Kliknij w partię, aby zobaczyć listę ćwiczeń.
      </p>
      <div class="muscle-bars">
        <div v-for="m in volumeByMuscle" :key="m.key" class="muscle-block">
          <button class="muscle-row" :class="{ open: expandedMuscle === m.key }" @click="toggleMuscle(m.key)">
            <div class="muscle-name">
              <i class="ti ti-chevron-right chev" :class="{ rot: expandedMuscle === m.key }"></i>
              {{ m.name }}
            </div>
            <div class="muscle-bar">
              <div class="muscle-fill" :style="{ width: (m.vol / maxVol * 100) + '%' }"></div>
            </div>
            <div class="muscle-val">{{ m.vol.toLocaleString('pl-PL') }}</div>
          </button>
          <ul v-if="expandedMuscle === m.key" class="muscle-ex-list">
            <li v-for="ex in m.exercises" :key="ex.name">
              <span class="muscle-ex-name">{{ ex.name }}</span>
              <span class="muscle-ex-vol">{{ ex.vol.toLocaleString('pl-PL') }} kg</span>
            </li>
          </ul>
        </div>
      </div>
    </BaseCard>

    <BaseCard v-if="!totalWorkouts">
      <p class="muted">Brak danych. Wykonaj pierwszy trening żeby zobaczyć statystyki.</p>
    </BaseCard>
  </div>
</template>

<style scoped>
.stats-view { display: flex; flex-direction: column; gap: var(--space-3); }

.weekly-report {
  background: linear-gradient(135deg, var(--bg-elev) 0%, var(--accent-soft) 200%);
  border-color: var(--accent-soft-2);
}
.weekly-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: var(--space-3);
}
.weekly-title-block { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.weekly-title {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.weekly-title i { color: var(--accent); }
.weekly-age {
  font-size: 11px;
  letter-spacing: 0.04em;
}
.weekly-cta { margin-bottom: var(--space-3); }
.weekly-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  color: var(--text-muted);
  font-size: 14px;
}
.weekly-loading i { color: var(--accent); font-size: 18px; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.weekly-error {
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-sm);
  color: var(--danger);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.weekly-summary {
  font-size: 15px;
  line-height: 1.55;
  margin: 0 0 var(--space-3);
  color: var(--text);
}
.weekly-section { margin-top: var(--space-3); }
.weekly-section-title {
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
  margin-bottom: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.weekly-section-title i { color: var(--accent); font-size: 14px; }
.weekly-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.weekly-list li {
  padding: 9px 12px;
  background: var(--bg-elev-2);
  border-left: 3px solid var(--accent);
  border-radius: var(--radius-sm);
  font-size: 13.5px;
  line-height: 1.5;
}
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
.muscle-block { display: flex; flex-direction: column; gap: 6px; }
.muscle-row {
  display: grid;
  grid-template-columns: 180px 1fr 80px;
  gap: var(--space-3);
  align-items: center;
  background: transparent;
  border: none;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  text-align: left;
  cursor: pointer;
  transition: background var(--dur);
  width: 100%;
}
.muscle-row:hover { background: var(--bg-hover); }
.muscle-row.open { background: var(--bg-elev-2); }
.muscle-name {
  font-size: 13px;
  color: var(--text-muted);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.chev {
  font-size: 14px;
  color: var(--text-dim);
  transition: transform var(--dur);
}
.chev.rot { transform: rotate(90deg); }
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

.muscle-ex-list {
  list-style: none;
  margin: 0 0 4px 24px;
  padding: 8px 12px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.muscle-ex-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  font-size: 12px;
}
.muscle-ex-name { color: var(--text); }
.muscle-ex-vol { color: var(--text-muted); font-variant-numeric: tabular-nums; }

/* Analiza wzorców */
.pattern-section { margin-bottom: var(--space-4); }
.pattern-section:last-child { margin-bottom: 0; }
.pattern-section + .pattern-section { padding-top: var(--space-4); border-top: 1px solid var(--border); }
.pattern-section-title {
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
  margin-bottom: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.pattern-section-title i { color: var(--accent); font-size: 14px; }

.ci-bar-container { display: flex; flex-direction: column; gap: 8px; }
.ci-bar {
  height: 12px;
  background: var(--pull);
  border-radius: 100px;
  overflow: hidden;
}
.ci-fill { height: 100%; border-radius: 100px; transition: width var(--dur); }
.ci-compound { background: var(--accent-grad); }
.ci-labels { display: flex; justify-content: space-between; gap: 8px; }
.ci-label { font-size: 12px; color: var(--text-muted); display: inline-flex; align-items: center; gap: 6px; }
.ci-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.ci-dot-compound { background: var(--accent); }
.ci-dot-isolation { background: var(--pull); }

.pp-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-5);
}
.pp-stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.pp-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
}
.pp-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.pp-ratio {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 28px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: var(--radius-sm);
}
.pp-ok { color: var(--success); background: rgba(74, 222, 128, 0.1); }
.pp-warn { color: var(--warning); background: rgba(251, 146, 60, 0.1); }

.pattern-hint {
  font-size: 12px;
  margin-top: 8px;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.pattern-hint-ok { color: var(--success); background: rgba(74, 222, 128, 0.08); }
.pattern-hint-warn { color: var(--warning); background: rgba(251, 146, 60, 0.08); }

.pattern-bars { display: flex; flex-direction: column; gap: 8px; }
.pattern-row {
  display: grid;
  grid-template-columns: 160px 1fr 40px;
  gap: var(--space-3);
  align-items: center;
}
.pattern-name { font-size: 12px; color: var(--text-muted); }
.pattern-bar {
  height: 10px;
  background: var(--bg-elev-2);
  border-radius: 100px;
  overflow: hidden;
}
.pattern-fill {
  height: 100%;
  background: var(--accent-grad);
  transition: width var(--dur);
}
.pattern-val { font-size: 12px; text-align: right; font-weight: 600; }

@media (max-width: 640px) {
  .muscle-row { grid-template-columns: 1fr 60px; }
  .muscle-bar { grid-column: 1 / -1; order: 2; }
  .muscle-name { grid-column: 1; }
  .muscle-val { grid-column: 2; }
  .muscle-ex-list { margin-left: 8px; }
  .pattern-row { grid-template-columns: 1fr 40px; }
  .pattern-bar { grid-column: 1 / -1; order: 2; }
  .pattern-name { grid-column: 1; }
  .pattern-val { grid-column: 2; }
}
</style>
