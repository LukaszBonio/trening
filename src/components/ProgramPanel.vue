<script setup>
import { ref, computed, onMounted } from 'vue'
import { generateProgram } from '../lib/ai'
import { useProgramsStore } from '../stores/programs'
import { useSessionStore } from '../stores/session'
import { useSettingsStore } from '../stores/settings'
import { SPLIT_OPTIONS, weeklyTargets, volumeStatus } from '../lib/weeklyVolume'
import { GROUP_LABELS } from '../lib/workoutSchema'
import BaseCard from './BaseCard.vue'

const programs = useProgramsStore()
const session = useSessionStore()
const settings = useSettingsStore()

const open = ref(false)          // rozwinięcie generatora, gdy brak programu
const days = ref(4)
const equipment = ref('siłownia')
const splitOverride = ref(null)
const generating = ref(false)
const progress = ref({ done: 0, total: 0, label: '' })
const error = ref('')
let abortCtrl = null

const EQUIPMENT = ['siłownia', 'dom z hantlami', 'dom bez sprzętu (calisthenics)']

onMounted(() => { programs.pull() })

const program = computed(() => programs.current)

// Cele objętości wg poziomu + status realnej objętości programu (feedback).
const targets = computed(() => weeklyTargets(settings.settings.trainingLevel))
const volumeRows = computed(() => {
  if (!program.value) return []
  const vol = program.value.volumeByGroup || {}
  return Object.keys(targets.value)
    .map(g => ({
      group: g,
      label: GROUP_LABELS[g]?.name || g,
      sets: vol[g] || 0,
      target: targets.value[g],
      status: volumeStatus(g, vol[g] || 0)
    }))
    .filter(r => r.sets > 0 || r.target > 0)
})

async function generate() {
  if (abortCtrl) { try { abortCtrl.abort() } catch {} }
  generating.value = true
  error.value = ''
  progress.value = { done: 0, total: days.value, label: '' }
  abortCtrl = new AbortController()
  try {
    const gen = await generateProgram({
      daysPerWeek: days.value,
      goal: settings.settings.goal,
      equipment: equipment.value,
      level: settings.settings.trainingLevel,
      injuries: settings.settings.injuries,
      splitOverride: splitOverride.value,
      onProgress: (done, total, label) => { progress.value = { done, total, label } },
      signal: abortCtrl.signal
    })
    programs.save(gen)
    open.value = false
  } catch (e) {
    if (e.name !== 'AbortError') error.value = e.message || String(e)
  } finally {
    generating.value = false
    abortCtrl = null
  }
}

function cancel() { if (abortCtrl) abortCtrl.abort() }

function startDay(day) {
  session.startSession(day.plan, day.type, 'ai')
}

async function removeProgram() {
  await programs.clear()
  open.value = true
}

const STATUS_META = {
  low:  { label: 'za mało', cls: 'vol-low' },
  ok:   { label: 'w normie', cls: 'vol-ok' },
  high: { label: 'za dużo', cls: 'vol-high' },
  unknown: { label: '', cls: '' }
}
</script>

<template>
  <BaseCard class="program-card">
    <!-- Nagłówek -->
    <div class="prog-head">
      <div class="prog-icon"><i class="ti ti-calendar-week"></i></div>
      <div class="prog-head-text">
        <div class="prog-title-row">
          <h2 class="prog-name">Program tygodniowy</h2>
          <span class="prog-badge"><i class="ti ti-sparkles"></i> AI</span>
        </div>
        <p class="prog-desc">Cały tydzień z jednego silnika — split, rotacja ćwiczeń i objętość dobrane automatycznie.</p>
      </div>
    </div>

    <!-- Generowanie w toku -->
    <div v-if="generating" class="prog-loading">
      <div class="prog-progress-text">
        <i class="ti ti-loader-2 spin"></i>
        {{ progress.label ? `Dzień ${progress.done + 1}/${progress.total}: ${progress.label}…` : 'Przygotowuję program…' }}
      </div>
      <div class="prog-progress-bar">
        <div class="prog-progress-fill" :style="{ width: (progress.total ? (progress.done / progress.total * 100) : 0) + '%' }"></div>
      </div>
      <button class="btn" @click="cancel" style="width:100%;"><i class="ti ti-x"></i> Anuluj</button>
    </div>

    <!-- Istniejący program -->
    <template v-else-if="program">
      <div class="prog-meta">
        <span class="prog-chip">{{ program.splitLabel }}</span>
        <span class="prog-chip">{{ program.daysPerWeek }}× / tydz</span>
      </div>

      <div class="prog-days">
        <div v-for="(day, i) in program.days" :key="i" class="prog-day">
          <div class="prog-day-info">
            <span class="prog-day-num">{{ i + 1 }}</span>
            <div>
              <div class="prog-day-label">{{ day.label }}</div>
              <div class="prog-day-sub">{{ day.plan.exercises.length }} ćwiczeń</div>
            </div>
          </div>
          <button class="btn btn-primary prog-day-btn" @click="startDay(day)">
            <i class="ti ti-player-play"></i> Trenuj
          </button>
        </div>
      </div>

      <!-- Feedback objętości tygodniowej -->
      <details class="prog-volume">
        <summary>Objętość tygodniowa (serie / partia)</summary>
        <div class="vol-grid">
          <div v-for="r in volumeRows" :key="r.group" class="vol-row" :class="STATUS_META[r.status].cls">
            <span class="vol-label">{{ r.label }}</span>
            <span class="vol-val">{{ r.sets }}<span class="vol-target"> / cel {{ r.target }}</span></span>
            <span class="vol-status">{{ STATUS_META[r.status].label }}</span>
          </div>
        </div>
      </details>

      <div class="prog-actions">
        <button class="btn" @click="removeProgram"><i class="ti ti-trash"></i> Usuń</button>
        <button class="btn" @click="open = true; generate()" style="flex:1;"><i class="ti ti-refresh"></i> Generuj nowy</button>
      </div>
    </template>

    <!-- Brak programu → formularz -->
    <template v-else>
      <button v-if="!open" class="btn btn-primary prog-cta" @click="open = true">
        <i class="ti ti-wand"></i> Ułóż mój tydzień
      </button>

      <div v-else class="prog-form">
        <div class="prog-field">
          <label>Dni w tygodniu</label>
          <div class="prog-days-picker">
            <button
              v-for="d in [2,3,4,5,6]"
              :key="d"
              class="prog-day-opt"
              :class="{ active: days === d }"
              @click="days = d"
            >{{ d }}</button>
          </div>
        </div>
        <div class="prog-field">
          <label>Split</label>
          <select v-model="splitOverride">
            <option v-for="o in SPLIT_OPTIONS" :key="o.key || 'auto'" :value="o.key">{{ o.label }}</option>
          </select>
        </div>
        <div class="prog-field">
          <label>Sprzęt</label>
          <select v-model="equipment">
            <option v-for="e in EQUIPMENT" :key="e" :value="e">{{ e }}</option>
          </select>
        </div>
        <div class="prog-form-actions">
          <button class="btn" @click="open = false">Anuluj</button>
          <button class="btn btn-primary" @click="generate" style="flex:1;">
            <i class="ti ti-sparkles"></i> Wygeneruj program
          </button>
        </div>
      </div>
    </template>

    <p v-if="error" class="prog-error"><i class="ti ti-alert-triangle"></i> {{ error }}</p>
  </BaseCard>
</template>

<style scoped>
.program-card {
  border-color: var(--accent-soft-2);
  background: linear-gradient(135deg, var(--accent-soft), transparent 70%);
}
.prog-head { display: flex; gap: 12px; align-items: center; margin-bottom: var(--space-3); }
.prog-icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: var(--accent); color: #000;
  display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;
}
.prog-head-text { flex: 1; min-width: 0; }
.prog-title-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.prog-name { font-family: 'Space Grotesk', sans-serif; font-size: 17px; font-weight: 700; margin: 0; }
.prog-badge {
  font-size: 10px; font-weight: 700; background: var(--accent); color: #000;
  padding: 3px 8px; border-radius: 100px; letter-spacing: 0.5px;
  display: inline-flex; align-items: center; gap: 3px;
}
.prog-desc { font-size: 13px; color: var(--text-muted); margin: 4px 0 0; }

.prog-cta { width: 100%; padding: 12px; }

.prog-form { display: flex; flex-direction: column; gap: var(--space-3); }
.prog-field { display: flex; flex-direction: column; gap: 6px; }
.prog-field label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.prog-field select {
  padding: 10px 14px; background: var(--bg-elev-2); border: 1px solid var(--border);
  border-radius: var(--radius-sm); color: var(--text); font-size: 14px; font-family: inherit;
}
.prog-days-picker { display: flex; gap: 6px; }
.prog-day-opt {
  flex: 1; padding: 10px 0; background: var(--bg-elev-2); border: 1px solid var(--border);
  border-radius: var(--radius-sm); color: var(--text); font-weight: 700; font-size: 15px; cursor: pointer;
}
.prog-day-opt.active { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
.prog-form-actions, .prog-actions { display: flex; gap: 8px; margin-top: var(--space-2); }

.prog-loading { display: flex; flex-direction: column; gap: 10px; }
.prog-progress-text { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; }
.prog-progress-bar { height: 6px; background: var(--bg-elev-2); border-radius: 100px; overflow: hidden; }
.prog-progress-fill { height: 100%; background: var(--accent); border-radius: 100px; transition: width var(--dur); }
.spin { animation: prog-spin 1s linear infinite; }
@keyframes prog-spin { to { transform: rotate(360deg); } }

.prog-meta { display: flex; gap: 6px; margin-bottom: var(--space-3); }
.prog-chip {
  font-size: 11px; color: var(--accent); background: var(--accent-soft);
  padding: 3px 10px; border-radius: 100px; font-weight: 600;
}
.prog-days { display: flex; flex-direction: column; gap: 6px; margin-bottom: var(--space-3); }
.prog-day {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 10px 12px; background: var(--bg-elev-2); border: 1px solid var(--border); border-radius: var(--radius-sm);
}
.prog-day-info { display: flex; align-items: center; gap: 10px; min-width: 0; }
.prog-day-num {
  flex-shrink: 0; width: 26px; height: 26px; border-radius: 50%;
  background: var(--accent-soft); color: var(--accent);
  display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;
}
.prog-day-label { font-weight: 600; font-size: 14px; }
.prog-day-sub { font-size: 12px; color: var(--text-muted); }
.prog-day-btn { padding: 8px 14px; }

.prog-volume { margin-bottom: var(--space-3); }
.prog-volume summary {
  cursor: pointer; font-size: 12px; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 0;
}
.vol-grid { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
.vol-row {
  display: grid; grid-template-columns: 1fr auto auto; gap: 10px; align-items: center;
  padding: 6px 10px; background: var(--bg); border-radius: var(--radius-sm);
  border-left: 3px solid var(--border); font-size: 13px;
}
.vol-row.vol-low { border-left-color: var(--warning); }
.vol-row.vol-ok { border-left-color: var(--success); }
.vol-row.vol-high { border-left-color: var(--danger); }
.vol-label { color: var(--text); }
.vol-val { color: var(--text); font-weight: 600; font-variant-numeric: tabular-nums; }
.vol-target { color: var(--text-dim); font-weight: 400; font-size: 11px; }
.vol-status { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.3px; }
.vol-row.vol-low .vol-status { color: var(--warning); }
.vol-row.vol-ok .vol-status { color: var(--success); }
.vol-row.vol-high .vol-status { color: var(--danger); }

.prog-error {
  margin: var(--space-2) 0 0; padding: 8px 12px; font-size: 13px;
  background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
  border-radius: var(--radius-sm); color: var(--danger);
  display: flex; align-items: center; gap: 8px;
}
</style>
