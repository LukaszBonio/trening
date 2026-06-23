<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useSessionStore } from '../stores/session.js'
import { useWorkoutsStore } from '../stores/workouts.js'
import { useSettingsStore } from '../stores/settings.js'
import { PLANS } from '../lib/db.js'
import PlanPicker from '../components/PlanPicker.vue'
import PlanEditor from '../components/PlanEditor.vue'
import ExerciseCard from '../components/ExerciseCard.vue'
import RestTimer from '../components/RestTimer.vue'
import AIGenerator from '../components/AIGenerator.vue'
import CompletionSummary from '../components/CompletionSummary.vue'
import PlateCalculator from '../components/PlateCalculator.vue'
import WorkoutCards from '../components/WorkoutCards.vue'
import { useCustomPlansStore } from '../stores/customPlans.js'

const session = useSessionStore()
const workouts = useWorkoutsStore()
const settings = useSettingsStore()
const customPlans = useCustomPlansStore()

const editingPlan = ref(null)  // null | 'new' | <plan object>
const completionWorkout = ref(null)  // last finished workout for summary modal

const selectedType = ref(null)
const planSource = ref('library')  // 'library' | 'ai' | 'custom'
const restTimerRef = ref(null)

const expandedSystem = ref(localStorage.getItem('tp_last_system') || null)

// Trzy systemy treningowe — każdy ma swoje dni
const trainingSystems = [
  {
    id: 'ppl',
    name: 'Push / Pull / Legs',
    desc: '3-dniowy split — klasyczny układ pchanie / ciągnięcie / nogi',
    badge: '3×/tydz',
    icon: 'ti-layers-subtract',
    days: [
      { key: 'push', label: 'Push',  desc: 'Klatka + barki + triceps', color: 'var(--push)', icon: 'ti-arrow-up' },
      { key: 'pull', label: 'Pull',  desc: 'Plecy + biceps + tylne barki', color: 'var(--pull)', icon: 'ti-arrow-down' },
      { key: 'legs', label: 'Legs',  desc: 'Czworogłowy + hamstring + łydki', color: 'var(--legs)', icon: 'ti-run' }
    ]
  },
  {
    id: 'upperLower',
    name: 'Upper / Lower',
    desc: '4-dniowy split — góra / dół ciała w 2 wariantach',
    badge: '4×/tydz',
    icon: 'ti-layers-difference',
    days: [
      { key: 'upper_a', label: 'Upper A', desc: 'Klatka + plecy (bazowe)', color: 'var(--accent)', icon: 'ti-square-letter-a' },
      { key: 'upper_b', label: 'Upper B', desc: 'Klatka + plecy (objętość)', color: 'var(--accent)', icon: 'ti-square-letter-b' },
      { key: 'lower_a', label: 'Lower A', desc: 'Czworogłowy priorytet',     color: 'var(--legs)',   icon: 'ti-square-letter-a' },
      { key: 'lower_b', label: 'Lower B', desc: 'Hip hinge priorytet',       color: 'var(--legs)',   icon: 'ti-square-letter-b' }
    ]
  },
  {
    id: 'fbw',
    name: 'Full Body Workout',
    desc: '3-dniowy plan całego ciała w jednej sesji',
    badge: '3×/tydz',
    icon: 'ti-body-scan',
    days: [
      { key: 'fbw_a', label: 'FBW A', desc: 'Przysiad + bench + wiosło',   color: 'var(--text)', icon: 'ti-square-letter-a' },
      { key: 'fbw_b', label: 'FBW B', desc: 'Martwy + skos + podciąganie', color: 'var(--text)', icon: 'ti-square-letter-b' },
      { key: 'fbw_c', label: 'FBW C', desc: 'Front squat + hip thrust',    color: 'var(--text)', icon: 'ti-square-letter-c' }
    ]
  }
]

// Helper: znajdź dzień po kluczu (do np. repeatLastWorkout)
function findDay(key) {
  for (const sys of trainingSystems) {
    const d = sys.days.find(d => d.key === key)
    if (d) return d
  }
  return null
}

const progress = computed(() => {
  if (!session.totalSets) return 0
  return Math.round((session.totalSetsDone / session.totalSets) * 100)
})

const now = ref(Date.now())
let _tick = null

function startTick() {
  if (_tick) return
  _tick = setInterval(() => { now.value = Date.now() }, 1000)
}
function stopTick() {
  if (_tick) { clearInterval(_tick); _tick = null }
}

watch(() => session.isActive, (active) => {
  if (active) { now.value = Date.now(); startTick() }
  else stopTick()
}, { immediate: true })

onBeforeUnmount(() => stopTick())

const duration = computed(() => {
  if (!session.active) return '00:00'
  const s = Math.floor((now.value - session.active.startedAt) / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
})

function onPickPlan(plan) {
  // planSource: 'library' | 'ai' | 'custom'
  // plan._custom = true → custom; else if planSource === 'ai' → ai; else library
  const source = plan._custom ? 'custom' : (planSource.value === 'ai' ? 'ai' : 'library')
  session.startSession(plan, selectedType.value, source)
  selectedType.value = null
}

function onEditCustom(plan) {
  editingPlan.value = plan
}

function onDeleteCustom(plan) {
  if (confirm(`Usunąć plan "${plan.name}"?`)) {
    customPlans.remove(plan.id)
  }
}

function onSavePlan(plan) {
  if (editingPlan.value && editingPlan.value !== 'new') {
    customPlans.update(editingPlan.value.id, plan)
  } else {
    customPlans.add(plan)
  }
  editingPlan.value = null
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
  completionWorkout.value = payload
}

function toggleSystem(sysId) {
  expandedSystem.value = expandedSystem.value === sysId ? null : sysId
  if (expandedSystem.value) localStorage.setItem('tp_last_system', sysId)
}

function selectDay(dayKey) {
  selectedType.value = dayKey
  localStorage.setItem('tp_last_type', dayKey)
}

function discardWorkout() {
  if (confirm('Anulować ten trening? Postęp zostanie utracony.')) {
    session.discard()
  }
}
</script>

<template>
  <div class="workout-view">
    <CompletionSummary
      v-if="completionWorkout"
      :workout="completionWorkout"
      @close="completionWorkout = null"
    />

  <!-- Active session -->
  <div v-if="session.isActive" class="active-session">
    <div class="session-header card">
      <div>
        <div class="session-type">{{ session.active.type.toUpperCase() }} · <span class="duration">{{ duration }}</span></div>
        <h2 class="card-title" style="margin: 0">{{ session.active.planName }}</h2>
      </div>
      <div class="session-progress">
        <div class="progress-text">{{ session.totalSetsDone }} / {{ session.totalSets }}</div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
      </div>
    </div>

    <RestTimer v-if="settings.settings.workoutMode !== 'cards'" ref="restTimerRef" />

    <!-- Cards mode (default) lub flat list -->
    <WorkoutCards
      v-if="settings.settings.workoutMode === 'cards'"
      @set-done="onSetDone"
    />
    <template v-else>
      <ExerciseCard
        v-for="(ex, i) in session.active.exercises"
        :key="i"
        :ex-idx="i"
        @set-done="onSetDone"
      />
    </template>

    <PlateCalculator />

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
      <template v-if="editingPlan">
        <h2 class="card-title">{{ editingPlan === 'new' ? 'Nowy plan' : 'Edytuj plan' }}</h2>
        <PlanEditor
          :type="selectedType"
          :initial="editingPlan !== 'new' ? editingPlan : null"
          @save="onSavePlan"
          @cancel="editingPlan = null"
        />
      </template>

      <template v-else>
        <div class="source-tabs">
          <button
            class="source-tab"
            :class="{ active: planSource === 'library' }"
            @click="planSource = 'library'"
          >
            <i class="ti ti-book"></i> Plany
          </button>
          <button
            class="source-tab"
            :class="{ active: planSource === 'ai' }"
            @click="planSource = 'ai'"
          >
            <i class="ti ti-sparkles"></i> AI
          </button>
          <button
            class="source-tab"
            :class="{ active: planSource === 'custom' }"
            @click="planSource = 'custom'"
          >
            <i class="ti ti-plus"></i> Nowy
          </button>
        </div>

        <h2 class="card-title" style="margin-top: var(--space-3)">
          {{ selectedType.replace('_', ' ').toUpperCase() }} —
          {{ planSource === 'ai' ? 'plan AI' : planSource === 'custom' ? 'utwórz plan' : 'wybierz plan' }}
        </h2>

        <PlanPicker
          v-if="planSource === 'library'"
          :type="selectedType"
          @select="onPickPlan"
          @edit-custom="onEditCustom"
          @delete-custom="onDeleteCustom"
        />
        <AIGenerator v-else-if="planSource === 'ai'" :type="selectedType" @select="onPickPlan" />
        <PlanEditor
          v-else-if="planSource === 'custom'"
          :type="selectedType"
          @save="(p) => { onSavePlan(p); planSource = 'library' }"
          @cancel="planSource = 'library'"
        />
      </template>
    </div>
  </div>

  <!-- Type selection — pogrupowane wg systemu treningowego -->
  <div v-else class="type-select">
    <!-- Powtórz ostatni (jeśli jest) -->
    <div v-if="workouts.lastWorkout" class="repeat-banner card">
      <div class="repeat-info">
        <i class="ti ti-clock-play"></i>
        <div>
          <div class="dim repeat-label">Ostatni trening</div>
          <div class="repeat-name">
            {{ workouts.lastWorkout.planName }}
            <span class="repeat-tag">{{ workouts.lastWorkout.type.toUpperCase().replace('_', ' ') }}</span>
          </div>
        </div>
      </div>
      <button class="btn btn-primary repeat-btn" @click="repeatLastWorkout">
        <i class="ti ti-repeat"></i> Powtórz
      </button>
    </div>

    <!-- 3 systemy treningowe — accordion -->
    <div v-for="sys in trainingSystems" :key="sys.id" class="card system-card">
      <button class="system-header" @click="toggleSystem(sys.id)">
        <div class="system-icon">
          <i class="ti" :class="sys.icon"></i>
        </div>
        <div class="system-info">
          <div class="system-title-row">
            <h2 class="system-name">{{ sys.name }}</h2>
            <span class="system-badge">{{ sys.badge }}</span>
          </div>
          <p class="system-desc">{{ sys.desc }}</p>
        </div>
        <i class="ti system-chevron" :class="expandedSystem === sys.id ? 'ti-chevron-up' : 'ti-chevron-down'"></i>
      </button>

      <div v-if="expandedSystem === sys.id" class="days-grid">
        <button
          v-for="day in sys.days"
          :key="day.key"
          class="day-btn"
          :style="{ '--c': day.color }"
          @click="selectDay(day.key)"
        >
          <div class="day-icon">
            <i class="ti" :class="day.icon"></i>
          </div>
          <div class="day-text">
            <div class="day-label">{{ day.label }}</div>
            <div class="day-desc">{{ day.desc }}</div>
          </div>
          <i class="ti ti-chevron-right day-arrow"></i>
        </button>
      </div>
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
.duration {
  font-family: 'Space Grotesk', sans-serif;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0;
  color: var(--text);
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

.type-select {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.repeat-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--accent-soft);
  border-color: var(--accent-soft-2);
}
.repeat-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}
.repeat-info > i {
  font-size: 24px;
  color: var(--accent);
  flex-shrink: 0;
}
.repeat-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.repeat-name {
  font-weight: 600;
  font-size: 15px;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.repeat-tag {
  font-size: 10px;
  background: var(--accent);
  color: #000;
  padding: 2px 6px;
  border-radius: 100px;
  font-weight: 700;
  margin-left: 6px;
  vertical-align: 1px;
}
.repeat-btn {
  padding: 10px 18px;
  flex-shrink: 0;
}

.system-card { padding: 0; overflow: hidden; }
.system-header {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: var(--space-4);
  width: 100%;
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  text-align: left;
  transition: background var(--dur);
}
.system-header:hover { background: var(--bg-hover); }
.system-chevron {
  font-size: 18px;
  color: var(--text-muted);
  flex-shrink: 0;
  transition: transform var(--dur);
}
.days-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
  padding: 0 var(--space-4) var(--space-4);
  border-top: 1px solid var(--border);
  padding-top: var(--space-3);
}
.system-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--accent-soft);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.system-info { flex: 1; min-width: 0; }
.system-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.system-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}
.system-badge {
  font-size: 10px;
  font-weight: 700;
  background: var(--bg-elev-2);
  color: var(--text-muted);
  padding: 3px 8px;
  border-radius: 100px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border: 1px solid var(--border);
}
.system-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin: 4px 0 0;
}

.day-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  text-align: left;
  cursor: pointer;
  transition: all var(--dur) var(--ease);
}
.day-btn:hover {
  border-color: var(--c);
  background: color-mix(in srgb, var(--c) 8%, var(--bg-elev-2));
  transform: translateY(-1px);
}
.day-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--bg-elev);
  color: var(--c);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  border: 1px solid var(--border);
}
.day-text { flex: 1; min-width: 0; }
.day-label {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
}
.day-desc {
  font-size: 12px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.day-arrow {
  color: var(--text-dim);
  font-size: 16px;
  flex-shrink: 0;
  transition: transform var(--dur), color var(--dur);
}
.day-btn:hover .day-arrow {
  color: var(--c);
  transform: translateX(2px);
}

/* Stary type-btn (na wszelki wypadek) */
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

.source-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-2);
}
.source-tab {
  flex: 1;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all var(--dur) var(--ease);
}
.source-tab.active {
  background: var(--accent);
  color: #000;
  font-weight: 600;
}
</style>
