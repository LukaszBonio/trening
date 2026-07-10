<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { generateAIPlan } from '../lib/ai'
import { getExercisesForMuscle } from '../lib/exerciseDb'
import { youtubeSearchUrl } from '../lib/substitutions'
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

// Plan korekcyjny Ani — cel jest stały (nie z ustawień), więc chowamy sekcję celu.
const isAnia = computed(() => props.type === 'ania')

// Wybór sprzętu dla planu Ani (checkboxy). Masa ciała zawsze dostępna (baza).
const aniaEquipOpen = ref(false)
const aniaEquip = ref({ guma: false, hantle: false, maszyna: false })
const ANIA_EQUIP_OPTS = [
  { key: 'guma', label: 'Gumy oporowe' },
  { key: 'hantle', label: 'Hantle / kettle' },
  { key: 'maszyna', label: 'Maszyny / wyciągi' }
]
const aniaEquipTags = computed(() => {
  const t = ['masa_ciala']
  for (const o of ANIA_EQUIP_OPTS) if (aniaEquip.value[o.key]) t.push(o.key)
  return t
})
const aniaEquipSummary = computed(() => {
  const picked = ANIA_EQUIP_OPTS.filter(o => aniaEquip.value[o.key]).map(o => o.label.toLowerCase())
  return ['masa ciała', ...picked].join(', ')
})

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
      equipmentTags: isAnia.value ? aniaEquipTags.value : undefined,
      // Profil użytkownika (poziom + kontuzje) — plan Ani ma własne przeciwwskazania.
      level: isAnia.value ? undefined : settings.settings.trainingLevel,
      injuries: isAnia.value ? undefined : settings.settings.injuries,
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

// Podmiana ćwiczenia na inne z tej samej partii (muscleHead).
const swapOpenIdx = ref(-1)

// Alternatywy z bazy dla tej samej głowy mięśniowej, bez ćwiczeń już użytych w planie
// (bieżące jest „użyte", więc naturalnie wypada z listy). Computed — liczone raz na
// zmianę planu, a nie przy każdym renderze osobno dla v-if i v-for każdego ćwiczenia.
const alternativesByIndex = computed(() => {
  if (!plan.value) return []
  const used = new Set(plan.value.exercises.map(e => e.name.toLowerCase()))
  return plan.value.exercises.map(ex =>
    ex.muscleHead
      ? getExercisesForMuscle(ex.muscleHead).filter(alt => !used.has(alt.name.toLowerCase()))
      : []
  )
})

function toggleSwap(i) {
  swapOpenIdx.value = swapOpenIdx.value === i ? -1 : i
}

function chooseAlternative(i, dbEx) {
  const ex = plan.value.exercises[i]
  // Zachowujemy serie/powtórzenia/ciężar z planu — zmieniamy tylko ćwiczenie + metadane.
  ex.name = dbEx.name
  ex.primaryMuscle = dbEx.primaryMuscle
  ex.muscleHead = dbEx.muscleHead
  ex.exerciseType = dbEx.exerciseType
  ex.movementPattern = dbEx.movementPattern
  ex.tip = dbEx.tip
  swapOpenIdx.value = -1
}

const EQUIP_LABEL = {
  sztanga: 'sztanga',
  hantle: 'hantle',
  maszyna: 'maszyna',
  wyciąg: 'wyciąg',
  własna_waga: 'masa ciała'
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
      <!-- Plan Ani: profil korekcyjny zamiast celu z ustawień -->
      <template v-if="isAnia">
        <p class="muted" style="margin-bottom: var(--space-3)">
          Bezpieczny plan korekcyjno-wzmacniający dla początkującej. AI dobiera ćwiczenia
          pod stabilizację kręgosłupa, pośladki, postawę i kolano — i analizuje postępy
          przy kolejnych treningach.
        </p>
        <div class="goal-info">
          <i class="ti ti-heart-handshake"></i>
          <div class="goal-info-text">
            <div class="goal-info-label">Program</div>
            <div class="goal-info-value">Korekcyjny · początkujący</div>
          </div>
          <span class="goal-info-hint">masa ciała</span>
        </div>
      </template>

      <template v-else>
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
      </template>

      <!-- Ania: rozwijane menu z checkboxami sprzętu (masa ciała zawsze) -->
      <div v-if="isAnia" class="field">
        <label>Dostępny sprzęt</label>
        <button type="button" class="equip-toggle" @click="aniaEquipOpen = !aniaEquipOpen">
          <span class="equip-summary">{{ aniaEquipSummary }}</span>
          <i class="ti" :class="aniaEquipOpen ? 'ti-chevron-up' : 'ti-chevron-down'"></i>
        </button>
        <div v-if="aniaEquipOpen" class="equip-menu">
          <label class="equip-item is-locked">
            <input type="checkbox" checked disabled />
            <span>Masa ciała</span>
            <span class="equip-tag">zawsze</span>
          </label>
          <label v-for="o in ANIA_EQUIP_OPTS" :key="o.key" class="equip-item">
            <input type="checkbox" v-model="aniaEquip[o.key]" />
            <span>{{ o.label }}</span>
          </label>
          <p class="equip-hint">Bez sztangi — osiowe obciążanie kręgosłupa jest wykluczone.</p>
        </div>
      </div>

      <div v-else class="field">
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
        <button v-if="!isAnia" class="btn btn-fallback" @click="emit('use-library')">
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
        <li v-for="(ex, i) in plan.exercises" :key="i" class="ai-ex" :class="{ 'is-swapping': swapOpenIdx === i }">
          <div class="ai-ex-head">
            <span class="ai-ex-num">{{ i + 1 }}</span>
            <span class="ai-ex-vol">{{ ex.sets }} × {{ ex.reps }}</span>
            <span class="ai-ex-name">{{ ex.name }}</span>
            <a
              class="ai-ex-yt"
              :href="youtubeSearchUrl(ex.name)"
              target="_blank"
              rel="noopener"
              aria-label="Zobacz technikę na YouTube"
              @click.stop
            >
              <i class="ti ti-brand-youtube"></i>
            </a>
            <button
              v-if="alternativesByIndex[i] && alternativesByIndex[i].length"
              class="ai-ex-action ai-ex-action--swap"
              :class="{ 'is-active': swapOpenIdx === i }"
              @click="toggleSwap(i)"
              aria-label="Zmień ćwiczenie na inne z tej samej partii"
            >
              <i class="ti ti-arrows-exchange"></i>
            </button>
          </div>

          <!-- Lista alternatyw z tej samej partii mięśniowej -->
          <div v-if="swapOpenIdx === i" class="ai-ex-alts">
            <div class="ai-ex-alts-label">Zamień na inne — ta sama partia</div>
            <button
              v-for="alt in alternativesByIndex[i]"
              :key="alt.id"
              class="ai-ex-alt"
              @click="chooseAlternative(i, alt)"
            >
              <span class="ai-ex-alt-name">{{ alt.name }}</span>
              <span class="ai-ex-alt-equip">{{ EQUIP_LABEL[alt.equipment] || alt.equipment }}</span>
            </button>
          </div>

          <div v-if="ex.tip && swapOpenIdx !== i" class="ai-ex-tip dim">{{ ex.tip }}</div>
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

/* Menu wyboru sprzętu (plan Ani) */
.equip-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 14px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 14px;
  cursor: pointer;
  text-align: left;
}
.equip-toggle:hover { border-color: var(--border-strong); }
.equip-summary {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-transform: capitalize;
}
.equip-menu {
  margin-top: 6px;
  padding: 6px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.equip-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  cursor: pointer;
  transition: background var(--dur);
}
.equip-item:hover { background: var(--bg-hover); }
.equip-item input { width: 16px; height: 16px; accent-color: var(--accent); cursor: pointer; }
.equip-item.is-locked { cursor: default; color: var(--text-muted); }
.equip-item.is-locked:hover { background: none; }
.equip-item > span:nth-of-type(1) { flex: 1; }
.equip-tag {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--accent);
  background: var(--accent-soft);
  padding: 2px 7px;
  border-radius: 100px;
}
.equip-hint {
  margin: 4px 6px 2px;
  font-size: 11px;
  color: var(--text-dim);
  line-height: 1.4;
}

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
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  margin-bottom: var(--space-4);
}
.ai-ex {
  padding: 12px 14px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}
.ai-ex-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ai-ex-num {
  flex-shrink: 0;
  min-width: 16px;
  text-align: center;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  color: var(--accent);
  font-size: 15px;
}
.ai-ex-vol {
  flex-shrink: 0;
  width: 86px;
  box-sizing: border-box;
  text-align: center;
  color: var(--accent);
  background: var(--accent-soft);
  padding: 3px 6px;
  border-radius: 100px;
  font-weight: 600;
  font-size: 12px;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.ai-ex-name {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  font-size: 14px;
  line-height: 1.3;
}
.ai-ex-yt {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: #ff3b30;
  background: rgba(255, 0, 0, 0.10);
  transition: background var(--dur);
}
.ai-ex-yt:hover { background: rgba(255, 0, 0, 0.20); }
.ai-ex-yt .ti { font-size: 19px; }
.ai-ex-action {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background var(--dur), color var(--dur);
  padding: 0;
}
.ai-ex-action .ti { font-size: 18px; }
.ai-ex-action--swap {
  color: var(--text-muted);
  background: transparent;
}
.ai-ex-action--swap:hover,
.ai-ex-action--swap.is-active {
  color: var(--accent);
  background: var(--accent-soft);
}

/* Lista alternatyw ćwiczeń (ta sama partia) */
.ai-ex.is-swapping {
  border-color: var(--accent-soft-2);
  background: var(--bg-elev-2);
}
.ai-ex-alts {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ai-ex-alts-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  font-weight: 700;
  padding: 2px 2px 4px;
}
.ai-ex-alt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-family: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: border-color var(--dur), background var(--dur);
}
.ai-ex-alt:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.ai-ex-alt-name { font-weight: 600; }
.ai-ex-alt-equip {
  flex-shrink: 0;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--text-muted);
  background: var(--bg-elev-2);
  padding: 2px 8px;
  border-radius: 100px;
}
.ai-ex-tip {
  margin-top: 6px;
  padding-left: 26px;
  font-size: 12px;
  line-height: 1.4;
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
