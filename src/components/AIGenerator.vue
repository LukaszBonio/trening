<script setup>
import { ref } from 'vue'
import { generateAIPlan } from '../lib/ai.js'

const props = defineProps({
  type: { type: String, required: true }
})
const emit = defineEmits(['select'])

const goal = ref('mass')
const equipment = ref('siłownia')
const avoid = ref('')
const generating = ref(false)
const error = ref('')
const plan = ref(null)
let abortCtrl = null

const GOALS = [
  { key: 'mass',          label: 'Masa mięśniowa' },
  { key: 'strength',      label: 'Siła' },
  { key: 'endurance',     label: 'Wytrzymałość' },
  { key: 'cut',           label: 'Redukcja/rzeźba' },
  { key: 'recomposition', label: 'Rekompozycja' }
]
const EQUIPMENT = ['siłownia', 'dom z hantlami', 'dom bez sprzętu (calisthenics)']

async function generate() {
  generating.value = true
  error.value = ''
  plan.value = null
  abortCtrl = new AbortController()
  try {
    plan.value = await generateAIPlan({
      type: props.type,
      goal: goal.value,
      equipment: equipment.value,
      avoid: avoid.value,
      signal: abortCtrl.signal
    })
  } catch (e) {
    if (e.name !== 'AbortError') error.value = e.message || String(e)
  } finally {
    generating.value = false
    abortCtrl = null
  }
}

function cancel() {
  if (abortCtrl) abortCtrl.abort()
}

function start() {
  if (plan.value) emit('select', plan.value)
}
</script>

<template>
  <div class="ai-gen">
    <div v-if="!plan" class="ai-form">
      <p class="muted" style="margin-bottom: var(--space-3)">
        AI wygeneruje spersonalizowany plan na bazie twojego celu i sprzętu.
      </p>

      <div class="field">
        <label>Cel treningowy</label>
        <select v-model="goal">
          <option v-for="g in GOALS" :key="g.key" :value="g.key">{{ g.label }}</option>
        </select>
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
        :disabled="generating"
        style="width: 100%; padding: 14px;"
      >
        <i class="ti" :class="generating ? 'ti-loader-2 spin' : 'ti-sparkles'"></i>
        {{ generating ? 'Generuję plan…' : 'Wygeneruj plan AI' }}
      </button>

      <button v-if="generating" class="btn" @click="cancel" style="width: 100%; margin-top: 8px;">
        Anuluj
      </button>

      <p v-if="error" class="error-msg">
        <i class="ti ti-alert-triangle"></i> {{ error }}
      </p>
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

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.error-msg {
  margin-top: var(--space-3);
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
</style>
