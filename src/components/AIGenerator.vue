<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { generateAIPlan } from '../lib/ai'
import { useWorkoutsStore } from '../stores/workouts'
import { useSettingsStore, GOALS, goalLabel } from '../stores/settings'
import { recentSessionsOfType } from '../lib/analytics'

const workouts = useWorkoutsStore()
const settings = useSettingsStore()
const currentGoal = computed(() => GOALS.find(g => g.key === settings.settings.goal) || GOALS[0])

const LOADING_MESSAGES = [
  'Analizuję twój cel…',
  'Dobieram ćwiczenia…',
  'Optymalizuję strukturę…',
  'Sprawdzam balans partii…',
  'Dopinam wskazówki techniczne…'
]
const loadingMsg = ref(LOADING_MESSAGES[0])
let _msgInterval = null

function startLoadingRotation() {
  // Guard przed podwójnym intervalem (double-click "Wygeneruj" przed cleanupem).
  if (_msgInterval) { clearInterval(_msgInterval); _msgInterval = null }
  let i = 0
  loadingMsg.value = LOADING_MESSAGES[0]
  _msgInterval = setInterval(() => {
    i = (i + 1) % LOADING_MESSAGES.length
    loadingMsg.value = LOADING_MESSAGES[i]
  }, 2200)
}
function stopLoadingRotation() {
  if (_msgInterval) { clearInterval(_msgInterval); _msgInterval = null }
}
onBeforeUnmount(stopLoadingRotation)

const props = defineProps({
  type: { type: String, required: true }
})
const emit = defineEmits(['select', 'use-library'])

const equipment = ref('siłownia')
const avoid = ref('')
const generating = ref(false)
const error = ref('')
const plan = ref(null)
let abortCtrl = null

const EQUIPMENT = ['siłownia', 'dom z hantlami', 'dom bez sprzętu (calisthenics)']

async function generate() {
  // Jeśli poprzednia generacja jeszcze trwa (np. double-click), anuluj ją.
  if (abortCtrl) {
    try { abortCtrl.abort() } catch {}
  }
  generating.value = true
  error.value = ''
  plan.value = null
  startLoadingRotation()
  abortCtrl = new AbortController()
  try {
    plan.value = await generateAIPlan({
      type: props.type,
      goal: settings.settings.goal,
      equipment: equipment.value,
      avoid: avoid.value,
      recentSessions: recentSessionsOfType(workouts.history, props.type, 3),
      signal: abortCtrl.signal
    })
  } catch (e) {
    if (e.name !== 'AbortError') error.value = e.message || String(e)
  } finally {
    generating.value = false
    stopLoadingRotation()
    abortCtrl = null
  }
}

function cancel() {
  if (abortCtrl) abortCtrl.abort()
}

function start() {
  if (plan.value) emit('select', plan.value)
}

const STATUS_META = {
  progress:        { label: 'progres',         icon: 'ti-trending-up' },
  stagnation:      { label: 'stagnacja',       icon: 'ti-arrow-bar-to-right' },
  overreaching:    { label: 'przeciążenie',    icon: 'ti-alert-triangle' },
  weakly_covered:  { label: 'słabo pokryta',   icon: 'ti-circle-minus' }
}
function statusLabel(s) { return STATUS_META[s]?.label || s }
function statusIcon(s)  { return STATUS_META[s]?.icon || 'ti-info-circle' }
</script>

<template>
  <div class="ai-gen">
    <!-- Loading state: full panel placeholder -->
    <div v-if="generating" class="ai-loading">
      <div class="ai-loading-header">
        <div class="ai-loading-icon">
          <i class="ti ti-sparkles"></i>
        </div>
        <div>
          <div class="ai-loading-title">AI tworzy twój plan…</div>
          <div class="ai-loading-sub">{{ loadingMsg }}</div>
        </div>
      </div>

      <ol class="ai-loading-list">
        <li v-for="i in 7" :key="i" class="ai-loading-row" :style="{ animationDelay: (i * 80) + 'ms' }">
          <div class="skel-bar skel-name"></div>
          <div class="skel-bar skel-vol"></div>
        </li>
      </ol>

      <button class="btn" @click="cancel" style="width: 100%;">
        <i class="ti ti-x"></i> Anuluj generowanie
      </button>
    </div>

    <div v-else-if="!plan" class="ai-form">
      <p class="muted" style="margin-bottom: var(--space-3)">
        AI wygeneruje spersonalizowany plan na bazie twojego celu i sprzętu.
      </p>

      <div class="goal-info">
        <i class="ti" :class="currentGoal.icon"></i>
        <div class="goal-info-text">
          <div class="goal-info-label">Cel</div>
          <div class="goal-info-value">{{ currentGoal.label }}</div>
        </div>
        <span class="goal-info-hint">Zmień u góry strony</span>
      </div>

      <div class="field">
        <label>Sprzęt</label>
        <select v-model="equipment">
          <option v-for="e in EQUIPMENT" :key="e" :value="e">{{ e }}</option>
        </select>
      </div>

      <div class="field">
        <label>Czego unikać (opcjonalnie)</label>
        <input
          type="text"
          v-model="avoid"
          placeholder="np. martwy ciąg, przysiady ze sztangą, drążek"
        />
      </div>

      <button
        class="btn btn-primary"
        @click="generate"
        style="width: 100%; padding: 14px;"
      >
        <i class="ti ti-sparkles"></i>
        Wygeneruj plan AI
      </button>

      <div v-if="error" class="error-block">
        <p class="error-msg">
          <i class="ti ti-alert-triangle"></i> {{ error }}
        </p>
        <button class="btn btn-fallback" @click="emit('use-library')">
          <i class="ti ti-book"></i> Użyj planu z biblioteki
        </button>
      </div>
    </div>

    <!-- Plan preview -->
    <div v-else class="ai-result">
      <div class="ai-result-header">
        <i class="ti ti-sparkles" style="color: var(--accent);"></i>
        <div>
          <div class="ai-plan-name">{{ plan.name }}</div>
          <div class="dim" style="font-size: 12px;">{{ plan.exercises.length }} ćwiczeń · plan wygenerowany przez AI</div>
        </div>
      </div>

      <!-- Analiza per partia (gdy była historia) — AI wyjaśnia czemu dobrał takie ćwiczenia -->
      <div v-if="plan.analysis && plan.analysis.length" class="ai-analysis">
        <div class="ai-analysis-title">
          <i class="ti ti-brain"></i> Analiza ostatnich sesji
        </div>
        <ul class="ai-analysis-list">
          <li
            v-for="(a, i) in plan.analysis"
            :key="i"
            class="ai-analysis-item"
            :class="`status-${a.status}`"
          >
            <i class="ti" :class="statusIcon(a.status)"></i>
            <div class="ai-analysis-text">
              <span class="ai-analysis-muscle">{{ a.muscle }}</span>
              <span class="ai-analysis-status">{{ statusLabel(a.status) }}</span>
              <span v-if="a.note" class="ai-analysis-note">{{ a.note }}</span>
            </div>
          </li>
        </ul>
      </div>

      <ol class="ai-ex-list">
        <li v-for="(ex, i) in plan.exercises" :key="i" class="ai-ex">
          <div class="ai-ex-name">{{ ex.name }}</div>
          <div class="ai-ex-meta">
            <span class="ai-ex-vol">{{ ex.sets }} × {{ ex.reps }}</span>
            <span v-if="ex.tip" class="dim">{{ ex.tip }}</span>
          </div>
        </li>
      </ol>

      <div class="ai-actions">
        <button class="btn" @click="plan = null">
          <i class="ti ti-refresh"></i> Generuj ponownie
        </button>
        <button class="btn btn-primary" @click="start" style="flex: 1;">
          <i class="ti ti-play"></i> Rozpocznij ten trening
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-form { display: flex; flex-direction: column; gap: var(--space-3); }
.field { display: flex; flex-direction: column; gap: 4px; }
.field label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.field input, .field select {
  padding: 10px 14px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 14px;
  font-family: inherit;
}
.field input:focus, .field select:focus { outline: none; border-color: var(--accent); }

.goal-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--accent-soft);
  border: 1px solid var(--accent-soft-2);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-3);
}
.goal-info > i {
  font-size: 22px;
  color: var(--accent);
}
.goal-info-text { flex: 1; line-height: 1.2; }
.goal-info-label {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.goal-info-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
}
.goal-info-hint {
  font-size: 11px;
  color: var(--text-dim);
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.error-block {
  margin-top: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.error-msg {
  margin: 0;
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
.btn-fallback {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.ai-result-header {
  display: flex;
  gap: 12px;
  padding: var(--space-3);
  background: var(--accent-soft);
  border-radius: var(--radius);
  margin-bottom: var(--space-3);
  align-items: center;
}
.ai-result-header i { font-size: 28px; }
.ai-plan-name { font-weight: 700; font-size: 16px; }

.ai-analysis {
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 14px;
  margin-bottom: var(--space-3);
}
.ai-analysis-title {
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
.ai-analysis-title i { color: var(--accent); font-size: 14px; }
.ai-analysis-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ai-analysis-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 10px;
  background: var(--bg);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--border);
  font-size: 13px;
  line-height: 1.4;
}
.ai-analysis-item.status-progress       { border-left-color: var(--success); }
.ai-analysis-item.status-stagnation     { border-left-color: var(--warning); }
.ai-analysis-item.status-overreaching   { border-left-color: var(--danger); }
.ai-analysis-item.status-weakly_covered { border-left-color: var(--accent); }
.ai-analysis-item > i {
  font-size: 16px;
  margin-top: 1px;
  flex-shrink: 0;
}
.status-progress > i       { color: var(--success); }
.status-stagnation > i     { color: var(--warning); }
.status-overreaching > i   { color: var(--danger); }
.status-weakly_covered > i { color: var(--accent); }
.ai-analysis-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.ai-analysis-muscle { font-weight: 600; text-transform: capitalize; }
.ai-analysis-status {
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.ai-analysis-note {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.ai-ex-list {
  list-style: none;
  counter-reset: ex;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  margin-bottom: var(--space-4);
}
.ai-ex {
  counter-increment: ex;
  padding: 12px 14px 12px 42px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  position: relative;
}
.ai-ex::before {
  content: counter(ex);
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  color: var(--accent);
  font-size: 16px;
}
.ai-ex-name { font-weight: 600; font-size: 14px; margin-bottom: 2px; }
.ai-ex-meta { display: flex; gap: 10px; align-items: baseline; font-size: 12px; }
.ai-ex-vol {
  color: var(--accent);
  background: var(--accent-soft);
  padding: 2px 8px;
  border-radius: 100px;
  font-weight: 600;
}

.ai-actions { display: flex; gap: 8px; }

/* Loading state */
.ai-loading { display: flex; flex-direction: column; gap: var(--space-4); }
.ai-loading-header {
  display: flex;
  gap: 12px;
  padding: var(--space-4);
  background: var(--accent-soft);
  border: 1px solid var(--accent-soft-2);
  border-radius: var(--radius);
  align-items: center;
}
.ai-loading-icon {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: var(--accent);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  animation: ai-pulse 1.5s ease-in-out infinite;
}
@keyframes ai-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 var(--accent-soft-2); }
  50% { transform: scale(1.08); box-shadow: 0 0 0 12px transparent; }
}
.ai-loading-title { font-weight: 700; font-size: 16px; }
.ai-loading-sub {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 2px;
  transition: opacity var(--dur);
}
.ai-loading-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
}
.ai-loading-row {
  padding: 14px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  opacity: 0;
  animation: row-in 0.4s ease forwards, row-shimmer 1.6s ease-in-out infinite;
}
@keyframes row-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 0.7; transform: translateY(0); }
}
@keyframes row-shimmer {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}
.skel-bar {
  background: linear-gradient(
    90deg,
    var(--border) 0%,
    var(--border-strong) 50%,
    var(--border) 100%
  );
  background-size: 200% 100%;
  border-radius: 4px;
  height: 10px;
  animation: bar-shimmer 1.4s linear infinite;
}
.skel-name { width: 55%; }
.skel-vol { width: 60px; flex-shrink: 0; }
@keyframes bar-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .ai-loading-icon, .ai-loading-row, .skel-bar { animation: none; }
  .ai-loading-row { opacity: 0.6; }
}
</style>
