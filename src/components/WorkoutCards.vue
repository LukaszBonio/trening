<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useSessionStore } from '../stores/session'
import { useSettingsStore } from '../stores/settings'
import { useWorkoutsStore } from '../stores/workouts'
import { detectMuscle, getMuscleName, detectEquipment } from '../lib/muscles'
import { findSubstitutes, youtubeSearchUrl } from '../lib/substitutions'
import { lastSetFor } from '../lib/analytics'
import { suggestNextWeight } from '../lib/progression'
import { useDialog } from '../composables/useDialog'
import { useRestTimer } from '../composables/useRestTimer'
import { useSetNavigation } from '../composables/useSetNavigation'

const dialog = useDialog()

const emit = defineEmits(['set-done'])

const weightInputRef = ref(null)

const session = useSessionStore()
const settings = useSettingsStore()
const workouts = useWorkoutsStore()

const mode = ref('setup')

const exercises = computed(() => session.active?.exercises || [])

const {
  exIdx, setIdx, currentEx, currentSet,
  nextExIdx, nextSetIdx, nextEx, globalProgress,
  advance, goBackPosition, jumpToFirstUnchecked, reset: resetNav
} = useSetNavigation(exercises)

const {
  restRemaining, restTotal, restDisplay, restProgress, timerEndFlash,
  startRest, stopRest, adjustRest, onTimerEnd
} = useRestTimer(90)

onTimerEnd(() => {
  advance()
  mode.value = 'setup'
  nextTick(() => { weightInputRef.value?.focus() })
})

const showSubstitutes = ref(false)
const showRpeHelp = ref(false)

const muscleName = computed(() => {
  if (!currentEx.value) return ''
  const m = detectMuscle(currentEx.value.name)
  return m ? getMuscleName(m) : ''
})

const lastSetHint = computed(() => {
  if (!currentEx.value) return null
  return lastSetFor(workouts.history, currentEx.value.name)
})

const progressionHint = computed(() => {
  if (!currentEx.value) return null
  return suggestNextWeight(workouts.history, currentEx.value.name, currentEx.value.reps)
})

const lastSetDateLabel = computed(() => {
  if (!lastSetHint.value) return ''
  const d = new Date(lastSetHint.value.date)
  const days = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (days <= 0) return 'dziś'
  if (days === 1) return 'wczoraj'
  if (days < 7) return `${days} dni temu`
  return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
})

const equipment = computed(() => currentEx.value ? detectEquipment(currentEx.value.name) : null)
const ytUrl = computed(() => currentEx.value ? youtubeSearchUrl(currentEx.value.name) : '#')

const isExerciseChange = computed(() => nextEx.value && nextEx.value.name !== currentEx.value?.name)
const nextYtUrl = computed(() => nextEx.value ? youtubeSearchUrl(nextEx.value.name) : '#')
const substitutes = computed(() =>
  currentEx.value
    ? findSubstitutes(currentEx.value.name, 3, currentEx.value.muscleHead || null)
    : []
)

function goBack() {
  if (mode.value === 'rest') {
    stopRest()
    mode.value = 'setup'
    return
  }
  goBackPosition()
}

async function completeSet() {
  if (!currentSet.value) return
  if (currentSet.value.weight === '' && currentSet.value.reps === '') {
    const ok = await dialog.confirm('Nie wpisałeś ciężaru ani powtórzeń. Zaznaczyć serię mimo to?', {
      title: 'Pusta seria',
      okLabel: 'Zaznacz',
      cancelLabel: 'Wróć'
    })
    if (!ok) return
  }
  session.toggleSet(exIdx.value, setIdx.value)
  emit('set-done')

  const hasMore = (setIdx.value < currentEx.value.sets.length - 1) || (exIdx.value < exercises.value.length - 1)
  if (!hasMore) {
    mode.value = 'done'
    return
  }
  mode.value = 'rest'
  startRest(settings.settings.restTimerDefault || 90)
}

function skipRest() {
  stopRest()
  advance()
  mode.value = 'setup'
  nextTick(() => { weightInputRef.value?.focus() })
}

async function swap(name) {
  const ok = await dialog.confirm(`Zamienić "${currentEx.value.name}" na "${name}"?`, {
    title: 'Zamiana ćwiczenia',
    okLabel: 'Zamień'
  })
  if (ok) {
    session.swapExercise(exIdx.value, name)
    showSubstitutes.value = false
  }
}

onMounted(() => {
  jumpToFirstUnchecked()
  nextTick(() => { weightInputRef.value?.focus() })
})
onBeforeUnmount(() => stopRest())

watch(() => session.active?.id, () => {
  resetNav()
  mode.value = 'setup'
  stopRest()
  jumpToFirstUnchecked()
})

defineExpose({
  jumpToFirstUnchecked,
  resumeFromDone() {
    mode.value = 'setup'
    jumpToFirstUnchecked()
    nextTick(() => weightInputRef.value?.focus())
  }
})

function suggestWeightIfEmpty() {
  if (!currentSet.value || currentSet.value.weight !== '' && currentSet.value.weight !== null && currentSet.value.weight !== undefined) return
  if (setIdx.value > 0) {
    const prev = currentEx.value?.sets[setIdx.value - 1]
    if (prev && prev.weight !== '' && prev.weight != null) {
      session.updateSet(exIdx.value, setIdx.value, { weight: prev.weight })
      return
    }
  }
  if (progressionHint.value && progressionHint.value.weight > 0) {
    session.updateSet(exIdx.value, setIdx.value, { weight: progressionHint.value.weight })
  }
}
watch([exIdx, setIdx, () => session.active?.id], suggestWeightIfEmpty, { immediate: true, flush: 'post' })
</script>

<template>
  <!-- Pulsujący flash po końcu odpoczynku — wizualne wzmocnienie dźwięku i głosu. -->
  <div v-if="timerEndFlash" class="timer-flash" aria-hidden="true">
    <div class="timer-flash-msg">
      <i class="ti ti-arrow-right"></i>
      Wracaj do ćwiczeń
    </div>
  </div>

  <div v-if="currentEx" class="focus-wrap">
    <!-- Top bar: progress + nav -->
    <div class="top-bar">
      <button class="back-btn" :disabled="exIdx === 0 && setIdx === 0 && mode === 'setup'" @click="goBack" aria-label="Cofnij do poprzedniej serii">
        <i class="ti ti-arrow-left"></i>
      </button>
      <div class="progress-info">
        <div class="progress-text">
          Seria {{ globalProgress.currentGlobalIdx + (mode === 'rest' ? 0 : 1) }} / {{ globalProgress.total }}
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: (globalProgress.done / globalProgress.total * 100) + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- REST MODE: timer countdown -->
    <div v-if="mode === 'rest'" class="rest-card">
      <div class="rest-label">Odpoczynek</div>
      <div class="rest-circle">
        <svg viewBox="0 0 200 200" class="rest-ring">
          <circle cx="100" cy="100" r="92" fill="none" stroke="var(--bg-elev-2)" stroke-width="12" />
          <circle
            cx="100" cy="100" r="92" fill="none"
            stroke="var(--accent)" stroke-width="12"
            stroke-linecap="round"
            stroke-dasharray="578"
            :stroke-dashoffset="578 - (578 * restProgress / 100)"
            transform="rotate(-90 100 100)"
            class="rest-ring-fill"
          />
        </svg>
        <div class="rest-time">{{ restDisplay }}</div>
      </div>

      <div class="rest-adjust">
        <button class="rest-adj-btn" @click="adjustRest(-15)">−15s</button>
        <button class="rest-adj-btn" @click="adjustRest(15)">+15s</button>
      </div>

      <!-- Co dalej? -->
      <div class="rest-next">
        <div class="dim">Następnie:</div>
        <div class="rest-next-ex">{{ nextEx?.name || '—' }}</div>
        <div class="rest-next-meta" v-if="nextEx">
          Seria {{ nextSetIdx + 1 }} / {{ nextEx.sets.length }} ·
          target <strong>{{ nextEx.reps }}</strong>
        </div>
        <a
          v-if="isExerciseChange"
          :href="nextYtUrl"
          target="_blank"
          rel="noopener"
          class="rest-yt-btn"
        >
          <i class="ti ti-brand-youtube"></i> Obejrzyj technikę
        </a>
      </div>

      <button class="skip-btn btn btn-primary" @click="skipRest">
        <i class="ti ti-player-skip-forward"></i> Pomiń odpoczynek
      </button>
    </div>

    <!-- DONE MODE -->
    <div v-else-if="mode === 'done'" class="done-card">
      <div class="done-icon">
        <i class="ti ti-flag-check"></i>
      </div>
      <h2 class="done-title">Wszystkie serie ukończone!</h2>
      <p class="muted">Kliknij "Zakończ trening" na dole by zapisać sesję.</p>
    </div>

    <!-- SETUP MODE: aktywna seria -->
    <div v-else class="setup-card">
      <!-- Exercise info -->
      <div class="ex-info-card card">
        <div class="ex-tags">
          <div class="ex-muscle" v-if="muscleName">
            <i class="ti ti-target"></i>
            {{ muscleName }}
          </div>
          <div class="ex-equip" v-if="equipment">
            <i class="ti" :class="equipment.icon"></i>
            {{ equipment.label }}
          </div>
        </div>
        <h2 class="ex-name">{{ currentEx.name }}</h2>
        <div v-if="currentEx._swappedFrom" class="swapped-note">
          <i class="ti ti-arrows-exchange"></i>
          Zamiennik <strong>{{ currentEx._swappedFrom }}</strong>
        </div>
        <div class="ex-target">
          <span class="set-pill-big">Seria {{ setIdx + 1 }} / {{ currentEx.sets.length }}</span>
          <span>Cel: <strong>{{ currentEx.reps }}</strong> powt.</span>
        </div>
        <div class="ex-tip" v-if="currentEx.tip">{{ currentEx.tip }}</div>

        <div class="ex-actions">
          <a :href="ytUrl" target="_blank" rel="noopener" class="ex-action-btn yt-btn">
            <i class="ti ti-brand-youtube"></i>
            <span>YT</span>
          </a>
          <button
            v-if="setIdx === 0"
            class="ex-action-btn"
            :class="{ active: showSubstitutes }"
            @click="showSubstitutes = !showSubstitutes"
            :disabled="!substitutes.length"
            title="Zamiana dostępna tylko przed pierwszą serią"
          >
            <i class="ti ti-arrows-exchange"></i>
            <span>Zamień</span>
          </button>
        </div>

        <!-- Substitutes -->
        <div v-if="showSubstitutes && substitutes.length" class="sub-panel">
          <div class="sub-panel-title">Wybierz zamiennik ({{ muscleName }}):</div>
          <ul class="sub-list">
            <li v-for="s in substitutes" :key="s" class="sub-item" @click="swap(s)">
              <span>{{ s }}</span>
              <button class="sub-swap-btn">Zamień</button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Big inputs for current set -->
      <div class="input-card card">
        <div class="big-inputs">
          <div class="big-input-block">
            <label>{{ settings.settings.units }}</label>
            <input
              ref="weightInputRef"
              type="number"
              inputmode="decimal"
              step="0.5"
              v-model="currentSet.weight"
              placeholder="—"
              class="set-input-focus"
            />
          </div>
          <div class="big-input-block">
            <label>powt.</label>
            <input
              type="number"
              inputmode="numeric"
              v-model="currentSet.reps"
              placeholder="—"
            />
          </div>
          <div v-if="settings.settings.showRpe" class="big-input-block rpe">
            <label class="rpe-label">
              RPE
              <button
                type="button"
                class="rpe-help-btn"
                @click="showRpeHelp = !showRpeHelp"
                :aria-label="'Wyjaśnij RPE'"
              >?</button>
            </label>
            <input
              type="number"
              inputmode="decimal"
              step="0.5"
              min="1"
              max="10"
              v-model="currentSet.rpe"
              placeholder="—"
            />
          </div>
        </div>

        <!-- Ostatnia seria z historii — szybka podpowiedź -->
        <div v-if="lastSetHint && lastSetHint.weight > 0" class="last-hint">
          <i class="ti ti-history"></i>
          Ostatnio: <strong>{{ lastSetHint.weight }}{{ settings.settings.units }} × {{ lastSetHint.reps }}</strong>
          <span v-if="lastSetHint.rpe" class="dim">@ RPE {{ lastSetHint.rpe }}</span>
          <span class="dim">· {{ lastSetDateLabel }}</span>
        </div>

        <!-- Sugestia progresji (gdy różni się od ostatniej wagi) -->
        <div
          v-if="progressionHint && progressionHint.weight > 0 && progressionHint.weight !== lastSetHint?.weight"
          class="progression-hint"
        >
          <i class="ti ti-trending-up"></i>
          Sugerowane: <strong>{{ progressionHint.weight }}{{ settings.settings.units }}</strong>
          <span class="dim">— {{ progressionHint.reason }}</span>
        </div>

        <!-- RPE explainer -->
        <div v-if="showRpeHelp && settings.settings.showRpe" class="rpe-help-panel">
          <div class="rpe-help-title">
            RPE — Rate of Perceived Exertion
            <button class="rpe-help-close" @click="showRpeHelp = false">
              <i class="ti ti-x"></i>
            </button>
          </div>
          <p class="rpe-help-desc">
            Subiektywna skala trudności serii (1–10). Określa ile powtórzeń zostało Ci jeszcze w zapasie.
          </p>
          <ul class="rpe-scale">
            <li><strong>10</strong> — maksimum, ani jednego powtórzenia więcej</li>
            <li><strong>9</strong> — zostało Ci 1 powtórzenie w zapasie</li>
            <li><strong>8</strong> — zostały Ci 2 powtórzenia</li>
            <li><strong>7</strong> — zostały Ci 3 powtórzenia</li>
            <li><strong>≤6</strong> — lekko, dużo zapasu</li>
          </ul>
          <p class="rpe-help-tip">Możesz to pole zignorować jeśli nie używasz tej metody.</p>
        </div>

        <button class="complete-btn" @click="completeSet">
          <i class="ti ti-check"></i>
          Zakończ serię
        </button>
      </div>

      <!-- Lista wszystkich serii (mini overview) -->
      <div class="sets-overview">
        <div class="overview-title">Wszystkie serie:</div>
        <div class="sets-grid">
          <button
            v-for="(s, i) in currentEx.sets"
            :key="i"
            class="set-chip"
            :class="{
              done: s.done,
              current: i === setIdx,
              pending: !s.done && i !== setIdx
            }"
            @click="setIdx = i"
          >
            <span class="chip-num">{{ i + 1 }}</span>
            <span v-if="s.done" class="chip-data">{{ s.weight }}kg × {{ s.reps }}</span>
            <span v-else class="chip-meta">{{ i === setIdx ? 'teraz' : '—' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.focus-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* Top bar */
.top-bar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  position: sticky;
  top: 0;
  z-index: 5;
}
.back-btn {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.back-btn:hover:not(:disabled) { background: var(--bg-hover); }
.back-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.progress-info { flex: 1; min-width: 0; }
.progress-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  font-weight: 600;
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
  transition: width 0.3s var(--ease);
}

/* REST mode */
.rest-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6) var(--space-4);
  background: var(--bg-elev);
  border: 1px solid var(--accent-soft-2);
  border-radius: var(--radius-lg);
  animation: rest-pop 0.3s var(--ease-spring);
}
@keyframes rest-pop {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.rest-label {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 2px;
  text-transform: uppercase;
}
.rest-circle {
  position: relative;
  width: 240px;
  height: 240px;
  max-width: 80vw;
  max-height: 80vw;
}
.rest-ring {
  width: 100%;
  height: 100%;
}
.rest-ring-fill { transition: stroke-dashoffset 1s linear; }
.rest-time {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 56px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--accent);
}

.rest-adjust { display: flex; gap: var(--space-3); }
.rest-adj-btn {
  padding: 10px 20px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: 100px;
  color: var(--text);
  font-size: 15px;
  font-weight: 600;
  font-family: 'Space Grotesk', sans-serif;
  cursor: pointer;
  transition: all var(--dur);
}
.rest-adj-btn:hover { background: var(--bg-hover); border-color: var(--accent); }

.rest-next {
  text-align: center;
  background: var(--bg-elev-2);
  border-radius: var(--radius);
  padding: var(--space-3) var(--space-4);
  width: 100%;
  max-width: 380px;
}
.rest-next .dim {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}
.rest-next-ex {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 4px;
}
.rest-next-meta {
  font-size: 12px;
  color: var(--text-muted);
}
.rest-next-meta strong { color: var(--text); }
.rest-yt-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 8px 16px;
  border-radius: var(--radius);
  background: #ff000018;
  color: #ff4444;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: background var(--dur);
}
.rest-yt-btn:hover { background: #ff000028; }
.rest-yt-btn .ti { font-size: 18px; }

.skip-btn {
  padding: 14px var(--space-5);
  font-size: 15px;
  width: 100%;
  max-width: 380px;
}

/* DONE mode */
.done-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-6);
  background: var(--accent-soft);
  border: 1px solid var(--accent-soft-2);
  border-radius: var(--radius-lg);
  text-align: center;
}
.done-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--accent);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
}
.done-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}

/* SETUP mode */
.setup-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  animation: setup-in 0.2s var(--ease);
}
@keyframes setup-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.ex-info-card { padding: var(--space-4); }
.ex-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: var(--space-2); }
.ex-muscle, .ex-equip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 100px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.ex-muscle { color: var(--accent); background: var(--accent-soft); }
.ex-equip { color: var(--text-muted); background: var(--bg-elev-2); border: 1px solid var(--border); }
.ex-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 var(--space-2);
  letter-spacing: -0.3px;
  line-height: 1.2;
}
.swapped-note {
  font-size: 12px;
  color: var(--warning);
  background: rgba(251, 146, 60, 0.1);
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-2);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.swapped-note strong { color: var(--text); }

.ex-target {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: var(--space-2);
  flex-wrap: wrap;
}
.ex-target strong { color: var(--text); }
.set-pill-big {
  background: var(--accent);
  color: #000;
  padding: 4px 12px;
  border-radius: 100px;
  font-weight: 700;
  font-family: 'Space Grotesk', sans-serif;
}
.ex-tip {
  font-size: 13px;
  color: var(--text-muted);
  font-style: italic;
  margin-bottom: var(--space-3);
}

.ex-actions { display: flex; gap: 8px; }
.ex-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}
.ex-action-btn:hover:not(:disabled) {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.ex-action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.ex-action-btn.active { background: var(--accent); color: #000; border-color: var(--accent); }
.yt-btn i { color: #ff0000; }
.ex-action-btn.active i { color: #000; }

.sub-panel {
  margin-top: var(--space-3);
  padding: var(--space-3);
  background: var(--bg-elev-2);
  border-radius: var(--radius);
  border: 1px solid var(--border);
}
.sub-panel-title { font-size: 12px; color: var(--text-muted); margin-bottom: var(--space-2); }
.sub-list { list-style: none; display: flex; flex-direction: column; gap: 6px; }
.sub-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: 10px 12px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--dur);
}
.sub-item:hover { border-color: var(--accent); background: var(--accent-soft); }
.sub-item > span { font-size: 13px; flex: 1; }
.sub-swap-btn {
  padding: 4px 10px;
  background: var(--accent);
  color: #000;
  border: none;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

/* Big inputs */
.input-card { padding: var(--space-4); }
.big-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}
.big-inputs:has(.rpe) { grid-template-columns: 1fr 1fr 80px; }
.big-input-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.big-input-block label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
}
.big-input-block input {
  padding: 20px 12px;
  background: var(--bg-elev-2);
  border: 2px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  width: 100%;
  font-variant-numeric: tabular-nums;
  transition: all var(--dur);
}
.big-input-block input:focus {
  outline: none;
  border-color: var(--accent);
  background: var(--bg-elev);
}
.big-input-block.rpe input { font-size: 22px; padding: 22px 8px; }
.rpe-label {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.rpe-help-btn {
  width: 16px;
  height: 16px;
  padding: 0;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: 50%;
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.rpe-help-btn:hover { border-color: var(--accent); color: var(--accent); }

.timer-flash {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: var(--accent-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  animation: timer-flash-anim 2s ease-out forwards;
}
.timer-flash-msg {
  background: var(--accent);
  color: #000;
  padding: 22px 36px;
  border-radius: 100px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.5px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-lg);
  animation: timer-flash-pulse 0.6s ease-out infinite alternate;
}
.timer-flash-msg i { font-size: 28px; }
@keyframes timer-flash-anim {
  0%   { opacity: 0; }
  10%  { opacity: 1; }
  85%  { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes timer-flash-pulse {
  from { transform: scale(1); }
  to   { transform: scale(1.05); }
}
@media (prefers-reduced-motion: reduce) {
  .timer-flash-msg { animation: none; }
}

.last-hint {
  margin-top: var(--space-3);
  padding: 8px 12px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--text-muted);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.last-hint i { color: var(--accent); font-size: 15px; }
.last-hint strong { color: var(--text); font-weight: 600; }
.last-hint .dim { color: var(--text-dim); font-size: 12px; }

.progression-hint {
  margin-top: 6px;
  padding: 8px 12px;
  background: var(--accent-soft);
  border: 1px solid var(--accent-soft-2);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--accent);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.progression-hint i { font-size: 15px; }
.progression-hint strong { font-weight: 700; }
.progression-hint .dim { color: var(--text-muted); font-size: 12px; font-weight: 400; }

.rpe-help-panel {
  margin-top: var(--space-3);
  padding: var(--space-3);
  background: var(--bg-elev-2);
  border: 1px solid var(--accent-soft-2);
  border-radius: var(--radius);
  font-size: 13px;
  animation: rpe-help-in 0.18s var(--ease);
}
@keyframes rpe-help-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
.rpe-help-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 13px;
  color: var(--accent);
  margin-bottom: 6px;
}
.rpe-help-close {
  width: 22px;
  height: 22px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.rpe-help-close:hover { color: var(--text); }
.rpe-help-desc { margin: 0 0 8px; color: var(--text-muted); line-height: 1.4; }
.rpe-scale {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0 0 8px;
  padding: 0;
  font-size: 12px;
  color: var(--text-muted);
}
.rpe-scale strong {
  display: inline-block;
  min-width: 32px;
  color: var(--accent);
  font-family: 'Space Grotesk', sans-serif;
}
.rpe-help-tip { margin: 0; font-size: 11px; color: var(--text-dim); font-style: italic; }

.complete-btn {
  width: 100%;
  padding: 18px;
  background: var(--accent);
  color: #000;
  border: none;
  border-radius: var(--radius);
  font-size: 18px;
  font-weight: 700;
  font-family: 'Space Grotesk', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all var(--dur) var(--ease-spring);
  box-shadow: var(--accent-glow);
}
.complete-btn:hover {
  background: var(--accent-strong);
  transform: translateY(-1px);
}
.complete-btn:active { transform: translateY(0); }
.complete-btn i { font-size: 22px; }

/* Sets overview */
.sets-overview {
  padding: var(--space-3);
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.overview-title {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--space-2);
}
.sets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 6px;
}
.set-chip {
  padding: 8px 10px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all var(--dur);
}
.set-chip.done { background: var(--accent-soft); color: var(--accent); border-color: var(--accent-soft-2); }
.set-chip.current { background: var(--accent); color: #000; border-color: var(--accent); font-weight: 700; }
.set-chip.pending:hover { border-color: var(--accent); }
.chip-num {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 13px;
}
.chip-data { font-weight: 600; }
.chip-meta { opacity: 0.7; }

@media (max-width: 540px) {
  .ex-name { font-size: 18px; }
  .big-input-block input { font-size: 28px; padding: 16px 10px; }
  .rest-time { font-size: 44px; }
  .complete-btn { font-size: 16px; padding: 16px; }
}

@media (prefers-reduced-motion: reduce) {
  .rest-card, .setup-card { animation: none; }
  .rest-ring-fill { transition: none; }
}
</style>
