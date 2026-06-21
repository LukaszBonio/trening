<script setup>
import { ref, computed } from 'vue'
import { useSessionStore } from '../stores/session.js'
import { useWorkoutsStore } from '../stores/workouts.js'
import { useSettingsStore } from '../stores/settings.js'
import { PLANS } from '../lib/db.js'
import PlanPicker from '../components/PlanPicker.vue'
import ExerciseCard from '../components/ExerciseCard.vue'
import RestTimer from '../components/RestTimer.vue'

const session = useSessionStore()
const workouts = useWorkoutsStore()
const settings = useSettingsStore()

const selectedType = ref(null)
const restTimerRef = ref(null)

const types = [
  { key: 'push',    label: 'Push',    color: 'var(--push)' },
  { key: 'pull',    label: 'Pull',    color: 'var(--pull)' },
  { key: 'legs',    label: 'Legs',    color: 'var(--legs)' },
  { key: 'upper_a', label: 'Upper A', color: 'var(--accent)' },
  { key: 'upper_b', label: 'Upper B', color: 'var(--accent)' },
  { key: 'lower_a', label: 'Lower A', color: 'var(--accent)' },
  { key: 'lower_b', label: 'Lower B', color: 'var(--accent)' },
  { key: 'fbw_a',   label: 'FBW A',   color: 'var(--text-muted)' },
  { key: 'fbw_b',   label: 'FBW B',   color: 'var(--text-muted)' },
  { key: 'fbw_c',   label: 'FBW C',   color: 'var(--text-muted)' }
]

const progress = computed(() => {
  if (!session.totalSets) return 0
  return Math.round((session.totalSetsDone / session.totalSets) * 100)
})

function onPickPlan(plan) {
  session.startSession(plan, selectedType.value)
  selectedType.value = null
}

function onSetDone() {
  if (!settings.settings.autoStartTimer) return
  if (restTimerRef.value) restTimerRef.value.start(settings.settings.restTimerDefault)
}

function repeatLastWorkout() {
  const last = workouts.lastWorkout
  if (!last) return
  const list = PLANS[last.type] || []
  const plan = list.find(p => p.name === last.planName) || list[0]
  if (!plan) return
  session.startSession(plan, last.type)
  // Prefill weights from last workout (matching by exercise name)
  const lastByName = new Map(last.exercises.map(ex => [ex.name.toLowerCase().trim(), ex]))
  for (const ex of session.active.exercises) {
    const prev = lastByName.get(ex.name.toLowerCase().trim())
    if (!prev) continue
    for (let i = 0; i < ex.sets.length && i < prev.sets.length; i++) {
      ex.sets[i].weight = prev.sets[i].weight
      // Don't prefill reps — user should still log actual
    }
  }
}

function finishWorkout() {
  const payload = session.finishToPayload()
  if (!payload || !payload.exercises.length) {
    if (!confirm('Brak zapisanych serii. Zakończyć bez zapisu?')) return
    session.discard()
    return
  }
  workouts.addWorkout(payload)
  session.discard()
  alert('Trening zapisany ✓')
}

function discardWorkout() {
  if (confirm('Anulować ten trening? Postęp zostanie utracony.')) {
    session.discard()
  }
}
</script>

<template>
  <!-- Active session -->
  <div v-if="session.isActive" class="active-session">
    <div class="session-header card">
      <div>
        <div class="session-type">{{ session.active.type.toUpperCase() }}</div>
        <h2 class="card-title" style="margin: 0">{{ session.active.planName }}</h2>
      </div>
      <div class="session-progress">
        <div class="progress-text">{{ session.totalSetsDone }} / {{ session.totalSets }}</div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
      </div>
    </div>

    <RestTimer ref="restTimerRef" />

    <ExerciseCard
      v-for="(ex, i) in session.active.exercises"
      :key="i"
      :ex-idx="i"
      @set-done="onSetDone"
    />

    <div class="session-actions">
      <button class="btn" @click="discardWorkout">Anuluj</button>
      <button class="btn btn-primary" @click="finishWorkout">Zakończ trening</button>
    </div>
  </div>

  <!-- Plan selection -->
  <div v-else-if="selectedType" class="plan-select">
    <button class="back-btn" @click="selectedType = null">
      <i class="ti ti-arrow-left"></i> Wybierz inny typ
    </button>
    <div class="card">
      <h2 class="card-title">{{ selectedType.replace('_', ' ').toUpperCase() }} — wybierz plan</h2>
      <PlanPicker :type="selectedType" @select="onPickPlan" />
    </div>
  </div>

  <!-- Type selection -->
  <div v-else class="type-select">
    <div class="card">
      <h2 class="card-title">Wybierz typ treningu</h2>
      <p class="muted" style="margin-bottom: var(--space-4)">
        Wybierz typ, potem konkretny plan, by rozpocząć sesję.
      </p>
      <div v-if="workouts.lastWorkout" class="last-info-row">
        <p class="last-info">
          <i class="ti ti-clock"></i>
          Ostatni: <strong>{{ workouts.lastWorkout.planName }}</strong>
          ({{ workouts.lastWorkout.type.toUpperCase() }})
        </p>
        <button class="btn-tiny" @click="repeatLastWorkout">
          <i class="ti ti-repeat"></i> Powtórz
        </button>
      </div>
      <div class="type-grid">
        <button
          v-for="t in types"
          :key="t.key"
          class="type-btn"
          :style="{ '--c': t.color }"
          @click="selectedType = t.key"
        >
          <span class="type-dot" :style="{ background: t.color }"></span>
          {{ t.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.active-session {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
}
.session-type {
  font-size: 11px;
  color: var(--accent);
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 4px;
}
.session-progress {
  text-align: right;
  min-width: 140px;
}
.progress-text {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 6px;
}
.progress-bar {
  height: 6px;
  background: var(--bg-elev-2);
  border-radius: 100px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--accent);
  transition: width var(--dur) var(--ease);
}
.session-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-3);
  position: sticky;
  bottom: 16px;
}
.session-actions .btn { flex: 1; padding: 14px; font-size: 15px; }

.type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}
.type-btn {
  padding: 18px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-size: 14px;
  font-weight: 600;
  transition: all var(--dur) var(--ease);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.type-btn:hover {
  border-color: var(--c);
  background: color-mix(in srgb, var(--c) 10%, var(--bg-elev-2));
}
.type-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.back-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 8px 0;
  margin-bottom: var(--space-3);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}
.back-btn:hover { color: var(--text); }
.last-info {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: var(--space-3);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.last-info strong { color: var(--text); font-weight: 600; }
.last-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-3);
  gap: var(--space-3);
}
.btn-tiny {
  background: transparent;
  border: 1px dashed var(--border);
  color: var(--text-muted);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}
.btn-tiny:hover { color: var(--text); border-color: var(--border-strong); }
</style>
