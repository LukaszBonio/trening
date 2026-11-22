<script setup>
import { ref, computed } from 'vue'
import { useWorkoutsStore } from '../stores/workouts'
import { generateWeeklyReport, loadCachedReport, saveCachedReport, clearCachedReport } from '../lib/weeklyReport'
import { useCoach } from '../composables/useCoach'
import { COACH_MIN_WORKOUTS } from '../lib/coach'
import { useToast } from '../composables/useToast'
import BaseCard from '../components/BaseCard.vue'
import AICoach from '../components/AICoach.vue'

const workouts = useWorkoutsStore()
const toast = useToast()
const { analysis, analyzedAt, analyzing, analyzeError, analyze } = useCoach()

// Jedna karta „Twoje postępy": raport z 14 dni (cache w localStorage)
// + analiza trendów ćwiczeń (stan sesji) — uruchamiane jednym przyciskiem.
const weeklyReport = ref(loadCachedReport())
const reportLoading = ref(false)
const reportError = ref('')

const recentSessionsCount = computed(() => {
  const cutoff = Date.now() - 14 * 86400000
  return workouts.history.filter(w => new Date(w.date).getTime() >= cutoff).length
})
const canReport = computed(() => recentSessionsCount.value >= 2)
const canAnalyze = computed(() => workouts.history.length >= COACH_MIN_WORKOUTS)
const canRun = computed(() => canReport.value || canAnalyze.value)
const busy = computed(() => reportLoading.value || analyzing.value)
const hasResult = computed(() => !!weeklyReport.value || !!analysis.value)

const INSIGHT_META = {
  progress: { tag: 'progres',   icon: 'ti-trending-up' },
  success:  { tag: 'sukces',    icon: 'ti-trophy' },
  warning:  { tag: 'uwaga',     icon: 'ti-alert-triangle' },
  tip:      { tag: 'wskazówka', icon: 'ti-bulb' }
}
function insightIcon(t) { return INSIGHT_META[t]?.icon || 'ti-info-circle' }
function insightTag(t) { return INSIGHT_META[t]?.tag || t }

async function generateReport() {
  reportLoading.value = true
  reportError.value = ''
  try {
    const r = await generateWeeklyReport(workouts.history)
    weeklyReport.value = r
    saveCachedReport(r)
  } catch (e) {
    reportError.value = e.message || String(e)
  } finally {
    reportLoading.value = false
  }
}

async function runAll() {
  if (busy.value) return
  const jobs = []
  if (canReport.value) {
    clearCachedReport()
    jobs.push(generateReport())
  }
  if (canAnalyze.value) jobs.push(analyze(workouts.history))
  await Promise.all(jobs)
  if (!reportError.value && !analyzeError.value && hasResult.value) toast.success('Analiza gotowa.')
}

function ageLabel(ts) {
  if (!ts) return ''
  const days = Math.floor((Date.now() - new Date(ts).getTime()) / 86400000)
  if (days === 0) return 'dziś'
  if (days === 1) return 'wczoraj'
  return `${days} dni temu`
}
const resultAge = computed(() => ageLabel(weeklyReport.value?.generatedAt || analyzedAt.value))
</script>

<template>
  <div class="coach-view">
    <BaseCard class="progress-card">
      <template #header>
        <div class="weekly-header">
          <div class="weekly-title-block">
            <h3 class="card-title weekly-title">
              <i class="ti ti-chart-line"></i> Twoje postępy
            </h3>
            <div v-if="hasResult && resultAge" class="dim weekly-age">analiza: {{ resultAge }}</div>
          </div>
          <button
            v-if="hasResult"
            class="refresh-btn"
            @click="runAll"
            :disabled="busy"
            aria-label="Przeanalizuj ponownie"
            title="Przeanalizuj ponownie"
          >
            <i class="ti ti-refresh" aria-hidden="true"></i>
          </button>
        </div>
      </template>

      <!-- Za mało danych -->
      <p v-if="!canRun" class="weekly-empty">
        <i class="ti ti-lock"></i>
        Zapisz min. {{ COACH_MIN_WORKOUTS }} treningi, a Coach pokaże, co idzie w górę, co stoi i co zmienić.
        Masz {{ workouts.history.length }}.
      </p>

      <!-- Jeszcze nic nie wygenerowano -->
      <div v-else-if="!hasResult && !busy && !reportError && !analyzeError">
        <p class="muted weekly-cta">
          Coach przejrzy ostatnie 14 dni i trend każdego ćwiczenia: co poszło dobrze, co stoi w miejscu i co zmienić w kolejnym tygodniu.
        </p>
        <button class="btn btn-primary" @click="runAll">
          <i class="ti ti-chart-line"></i> Przeanalizuj treningi
        </button>
      </div>

      <!-- Loading -->
      <div v-if="busy" class="weekly-loading">
        <i class="ti ti-loader spin"></i>
        <span>Analizuję {{ workouts.history.length }} treningów…</span>
      </div>

      <!-- Błędy -->
      <p v-if="reportError" class="weekly-error">
        <i class="ti ti-alert-triangle"></i> {{ reportError }}
      </p>
      <p v-if="analyzeError" class="weekly-error">
        <i class="ti ti-alert-triangle"></i> {{ analyzeError }}
      </p>
      <button v-if="(reportError || analyzeError) && !busy" class="btn weekly-retry" @click="runAll">
        <i class="ti ti-refresh"></i> Spróbuj ponownie
      </button>

      <!-- Raport z 14 dni -->
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
            <i class="ti ti-target"></i> Na kolejny tydzień
          </div>
          <ul class="weekly-list">
            <li v-for="(s, i) in weeklyReport.suggestions" :key="'s'+i">{{ s }}</li>
          </ul>
        </div>
      </template>

      <!-- Trendy ćwiczeń -->
      <div v-if="analysis && !analyzing" class="weekly-section">
        <div class="weekly-section-title">
          <i class="ti ti-chart-arcs"></i> Trendy ćwiczeń
        </div>
        <ul v-if="analysis.insights.length" class="coach-insights">
          <li
            v-for="(ins, i) in analysis.insights"
            :key="i"
            class="coach-insight"
            :class="ins.type"
          >
            <span class="coach-insight-tag" :class="ins.type">
              <i class="ti" :class="insightIcon(ins.type)"></i> {{ insightTag(ins.type) }}
            </span>
            <div class="coach-insight-title">{{ ins.title }}</div>
            <div class="coach-insight-msg">{{ ins.message }}</div>
          </li>
        </ul>
        <p v-else class="weekly-empty">Brak wyraźnych trendów — trenuj dalej i wróć za kilka sesji.</p>
        <p v-if="analysis.summary" class="coach-summary">{{ analysis.summary }}</p>
      </div>
    </BaseCard>

    <AICoach />
  </div>
</template>

<style scoped>
.coach-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
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
.weekly-title i { color: var(--accent-text); }
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
.weekly-loading i { color: var(--accent-text); font-size: 18px; }
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
.weekly-section-title i { color: var(--accent-text); font-size: 14px; }
.weekly-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.weekly-list li {
  position: relative;
  padding-left: 16px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text);
}
.weekly-list li::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 0.62em;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-dim);
}
.weekly-empty { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; line-height: 1.5; color: var(--text-muted); margin: 0; }
.weekly-empty i { color: var(--text-dim); font-size: 16px; flex-shrink: 0; margin-top: 1px; }
.weekly-retry { margin-top: var(--space-3); }
.refresh-btn {
  position: relative;
  width: 36px; height: 36px; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 50%; border: 1px solid var(--border);
  background: transparent; color: var(--text-muted); font-size: 16px;
  transition: color var(--dur), border-color var(--dur), background var(--dur);
}
.refresh-btn::after { content: ''; position: absolute; inset: -4px; }
.refresh-btn:hover:not(:disabled) { color: var(--text); border-color: var(--border-strong); background: var(--bg-hover); }
.refresh-btn:disabled { opacity: 0.5; cursor: default; }
.weekly-error + .weekly-error { margin-top: 8px; }

.coach-insights { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.coach-insight {
  background: var(--bg-elev-2);
  border-left: 2px solid var(--border-strong);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  padding: 10px 14px;
}
.coach-insight.progress { border-left-color: var(--accent); }
.coach-insight.success  { border-left-color: var(--success); }
.coach-insight.warning  { border-left-color: var(--warning); }
.coach-insight.tip      { border-left-color: var(--pull); }
.coach-insight-tag {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
  padding: 2px 8px; border-radius: 100px; margin-bottom: 6px;
}
.coach-insight-tag.progress { background: var(--accent-soft); color: var(--accent-text); }
.coach-insight-tag.success  { background: rgba(74, 222, 128, 0.15); color: var(--success); }
.coach-insight-tag.warning  { background: rgba(251, 146, 60, 0.15); color: var(--warning); }
.coach-insight-tag.tip      { background: rgba(74, 142, 255, 0.15); color: var(--pull); }
.coach-insight-title { font-weight: 600; font-size: 13px; margin-bottom: 2px; }
.coach-insight-msg { font-size: 13px; line-height: 1.5; color: var(--text-muted); }
.coach-summary {
  font-size: 13px; line-height: 1.5; color: var(--text);
  margin: 12px 0 0; padding: 10px 12px;
  background: var(--bg-elev-2); border-radius: var(--radius-sm);
}
</style>
