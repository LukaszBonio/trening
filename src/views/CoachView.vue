<script setup>
import { ref, computed } from 'vue'
import { useWorkoutsStore } from '../stores/workouts'
import { generateWeeklyReport, loadCachedReport, saveCachedReport, clearCachedReport } from '../lib/weeklyReport'
import { useToast } from '../composables/useToast'
import BaseCard from '../components/BaseCard.vue'
import AICoach from '../components/AICoach.vue'

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
</script>

<template>
  <div class="coach-view">
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

    <AICoach />
  </div>
</template>

<style scoped>
.coach-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

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
</style>
