<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useSessionStore } from '../stores/session.js'
import { useSettingsStore } from '../stores/settings.js'
import { findSubstitutes, youtubeSearchUrl, detectMuscle, getMuscleName } from '../lib/db.js'
import { groupExercisesByMuscle } from '../lib/workoutSchema.js'

const props = defineProps({
  onSetDone: { type: Function, default: () => {} }
})

const session = useSessionStore()
const settings = useSettingsStore()

const currentIdx = ref(0)
const showSubstitutes = ref(false)

const exercises = computed(() => session.active?.exercises || [])
const current = computed(() => exercises.value[currentIdx.value])

// Pogrupowanie po partii — żeby pokazać "Partia X z Y" w nagłówku
const groups = computed(() => {
  if (!session.active) return []
  return groupExercisesByMuscle(
    session.active.exercises,
    session.active.type,
    session.active.source || 'library'
  )
})

const currentGroup = computed(() => {
  const idx = currentIdx.value
  return groups.value.find(g => g.exerciseIndices.includes(idx)) || null
})

const muscleName = computed(() => {
  if (!current.value) return ''
  const m = detectMuscle(current.value.name)
  return m ? getMuscleName(m) : (currentGroup.value?.label || '')
})

const ytUrl = computed(() => current.value ? youtubeSearchUrl(current.value.name) : '#')

const substitutes = computed(() =>
  current.value ? findSubstitutes(current.value.name, 5) : []
)

const setProgress = computed(() => {
  if (!current.value) return { done: 0, total: 0 }
  return {
    done: current.value.sets.filter(s => s.done).length,
    total: current.value.sets.length
  }
})

// Indeks następnej nieukończonej serii (do auto-fokus)
const nextSetIdx = computed(() => {
  if (!current.value) return -1
  return current.value.sets.findIndex(s => !s.done)
})

function go(delta) {
  const next = currentIdx.value + delta
  if (next < 0 || next >= exercises.value.length) return
  currentIdx.value = next
  showSubstitutes.value = false
  nextTick(() => {
    const el = document.querySelector('.card-content')
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

function toggleSet(setIdx) {
  const wasDone = current.value.sets[setIdx].done
  session.toggleSet(currentIdx.value, setIdx)
  if (!wasDone) {
    props.onSetDone()
    // Auto-advance fokus do następnej serii (po krótkim opóźnieniu)
    setTimeout(() => {
      const nextSet = nextSetIdx.value
      if (nextSet >= 0) {
        const input = document.querySelector(`.set-row-${nextSet} input[type=number]`)
        if (input) input.focus()
      } else if (currentIdx.value < exercises.value.length - 1) {
        // Wszystkie serie ukończone — propose next exercise
        // (nie advanceuj automatycznie, daj user kliknąć)
      }
    }, 100)
  }
}

function swap(name) {
  if (confirm(`Zamienić "${current.value.name}" na "${name}"?\nNiezapisane serie zostaną wyczyszczone.`)) {
    session.swapExercise(currentIdx.value, name)
    showSubstitutes.value = false
  }
}

// Touch swipe
const touchStart = ref(null)
function onTouchStart(e) {
  // Nie aktywuj swipe na inputach
  if (['INPUT', 'BUTTON', 'A'].includes(e.target.tagName)) return
  touchStart.value = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() }
}
function onTouchEnd(e) {
  if (!touchStart.value) return
  const dx = e.changedTouches[0].clientX - touchStart.value.x
  const dy = Math.abs(e.changedTouches[0].clientY - touchStart.value.y)
  const dt = Date.now() - touchStart.value.t
  touchStart.value = null
  if (Math.abs(dx) < 60 || dy > 30 || dt > 500) return
  if (dx < 0) go(1)
  else go(-1)
}

function onKey(e) {
  if (e.target.tagName === 'INPUT') return
  if (e.key === 'ArrowRight') go(1)
  else if (e.key === 'ArrowLeft') go(-1)
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

// Reset gdy zmieni się sesja
watch(() => session.active?.id, () => { currentIdx.value = 0 })
</script>

<template>
  <div v-if="current" class="cards-wrap">
    <!-- Nav: prev | counter | next -->
    <div class="cards-nav">
      <button
        class="nav-arrow"
        :disabled="currentIdx === 0"
        @click="go(-1)"
        aria-label="Poprzednie ćwiczenie"
      >
        <i class="ti ti-chevron-left"></i>
      </button>

      <div class="nav-center">
        <div class="nav-counter">
          Ćwiczenie {{ currentIdx + 1 }} / {{ exercises.length }}
        </div>
        <div class="nav-dots">
          <button
            v-for="(ex, i) in exercises"
            :key="i"
            class="nav-dot"
            :class="{
              active: i === currentIdx,
              complete: ex.sets.every(s => s.done) && ex.sets.length > 0
            }"
            @click="currentIdx = i"
            :aria-label="ex.name"
          ></button>
        </div>
      </div>

      <button
        class="nav-arrow"
        :disabled="currentIdx === exercises.length - 1"
        @click="go(1)"
        aria-label="Następne ćwiczenie"
      >
        <i class="ti ti-chevron-right"></i>
      </button>
    </div>

    <!-- Single exercise card -->
    <div
      class="card-content"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <!-- Exercise header -->
      <div class="ex-header card">
        <div class="ex-muscle" v-if="muscleName">
          <i class="ti" :class="currentGroup?.icon || 'ti-circle-dot'"></i>
          {{ muscleName }}
        </div>
        <h2 class="ex-name">{{ current.name }}</h2>
        <div v-if="current._swappedFrom" class="swapped-note">
          <i class="ti ti-arrows-exchange"></i>
          Zamiennik <strong>{{ current._swappedFrom }}</strong>
        </div>
        <div class="ex-target">
          {{ current.sets.length }} × <strong>{{ current.reps }}</strong>
          <span v-if="current.tip" class="ex-tip">· {{ current.tip }}</span>
        </div>

        <div class="ex-actions">
          <a :href="ytUrl" target="_blank" rel="noopener" class="ex-action-btn yt-btn">
            <i class="ti ti-brand-youtube"></i>
            <span>Technika YT</span>
          </a>
          <button
            class="ex-action-btn"
            :class="{ active: showSubstitutes }"
            @click="showSubstitutes = !showSubstitutes"
            :disabled="!substitutes.length"
          >
            <i class="ti ti-arrows-exchange"></i>
            <span>Zamień</span>
          </button>
        </div>

        <!-- Substitutes panel -->
        <div v-if="showSubstitutes && substitutes.length" class="sub-panel">
          <div class="sub-panel-title">
            Wybierz zamiennik dla tej samej partii ({{ muscleName }}):
          </div>
          <ul class="sub-list">
            <li v-for="s in substitutes" :key="s" class="sub-item" @click="swap(s)">
              <span>{{ s }}</span>
              <button class="sub-swap-btn">Zamień</button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Sets -->
      <div class="sets-card card">
        <div class="sets-header">
          <h3 class="sets-title">Serie</h3>
          <div class="sets-progress">{{ setProgress.done }} / {{ setProgress.total }}</div>
        </div>

        <div class="sets-list">
          <div
            v-for="(set, i) in current.sets"
            :key="i"
            class="set-row"
            :class="['set-row-' + i, { done: set.done, focused: i === nextSetIdx && !set.done }]"
          >
            <span class="set-num">{{ i + 1 }}</span>
            <div class="set-input-group">
              <label>{{ settings.settings.units }}</label>
              <input
                type="number"
                inputmode="decimal"
                step="0.5"
                v-model="set.weight"
                placeholder="—"
                :disabled="set.done"
              />
            </div>
            <div class="set-input-group">
              <label>powt</label>
              <input
                type="number"
                inputmode="numeric"
                v-model="set.reps"
                placeholder="—"
                :disabled="set.done"
              />
            </div>
            <div v-if="settings.settings.showRpe" class="set-input-group">
              <label>RPE</label>
              <input
                type="number"
                inputmode="decimal"
                step="0.5"
                min="1"
                max="10"
                v-model="set.rpe"
                placeholder="—"
                :disabled="set.done"
              />
            </div>
            <button class="check-btn" :class="{ done: set.done }" @click="toggleSet(i)">
              <i class="ti" :class="set.done ? 'ti-check' : 'ti-circle'"></i>
            </button>
          </div>
        </div>

        <div class="sets-actions">
          <button class="btn-tiny" @click="session.addSet(currentIdx)">
            <i class="ti ti-plus"></i> Dodaj serię
          </button>
          <button
            v-if="current.sets.length > 1"
            class="btn-tiny"
            @click="session.removeSet(currentIdx, current.sets.length - 1)"
          >
            <i class="ti ti-minus"></i> Usuń serię
          </button>
        </div>
      </div>

      <!-- Next exercise hint -->
      <button
        v-if="currentIdx < exercises.length - 1"
        class="next-ex-btn"
        @click="go(1)"
      >
        <span>
          <span class="dim">Następne:</span>
          {{ exercises[currentIdx + 1].name }}
        </span>
        <i class="ti ti-arrow-right"></i>
      </button>
      <div v-else class="finish-hint">
        <i class="ti ti-flag-check"></i>
        Ostatnie ćwiczenie. Kliknij "Zakończ trening" na dole.
      </div>
    </div>
  </div>
</template>

<style scoped>
.cards-wrap { display: flex; flex-direction: column; gap: var(--space-3); }

.cards-nav {
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-3);
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  position: sticky;
  top: 0;
  z-index: 5;
}
.nav-arrow {
  width: 44px; height: 44px;
  border-radius: 50%;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all var(--dur);
}
.nav-arrow:hover:not(:disabled) {
  background: var(--accent);
  color: #000;
  border-color: var(--accent);
}
.nav-arrow:disabled { opacity: 0.3; cursor: not-allowed; }
.nav-center { text-align: center; min-width: 0; }
.nav-counter {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 6px;
}
.nav-dots {
  display: flex;
  gap: 4px;
  justify-content: center;
  flex-wrap: wrap;
}
.nav-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  cursor: pointer;
  padding: 0;
  transition: all var(--dur);
}
.nav-dot.complete { background: var(--accent-soft-2); }
.nav-dot.active {
  background: var(--accent);
  width: 20px;
  border-radius: 100px;
  border-color: var(--accent);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  animation: card-in 0.25s var(--ease-spring);
}
@keyframes card-in {
  from { opacity: 0; transform: translateX(8px); }
  to { opacity: 1; transform: translateX(0); }
}

/* Exercise header card */
.ex-header { padding: var(--space-5); }
.ex-muscle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--accent);
  background: var(--accent-soft);
  padding: 4px 10px;
  border-radius: 100px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: var(--space-3);
}
.ex-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 var(--space-2);
  letter-spacing: -0.3px;
}
.swapped-note {
  font-size: 12px;
  color: var(--warning);
  background: rgba(251, 146, 60, 0.1);
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-3);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.swapped-note strong { color: var(--text); }
.ex-target {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: var(--space-4);
}
.ex-target strong { color: var(--text); }
.ex-tip { font-style: italic; opacity: 0.8; }

.ex-actions {
  display: flex;
  gap: 8px;
}
.ex-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all var(--dur);
}
.ex-action-btn:hover:not(:disabled) {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.ex-action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.ex-action-btn.active {
  background: var(--accent);
  color: #000;
  border-color: var(--accent);
}
.yt-btn:hover { border-color: #ff0000; background: rgba(255,0,0,0.1); }
.yt-btn i { color: #ff0000; }
.ex-action-btn.active i { color: #000; }

/* Substitutes panel */
.sub-panel {
  margin-top: var(--space-3);
  padding: var(--space-3);
  background: var(--bg-elev-2);
  border-radius: var(--radius);
  border: 1px solid var(--border);
}
.sub-panel-title {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: var(--space-2);
}
.sub-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
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
.sub-item:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
}
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

/* Sets card */
.sets-card { padding: var(--space-4); }
.sets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}
.sets-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}
.sets-progress {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: var(--accent);
}

.sets-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.set-row {
  display: grid;
  grid-template-columns: 30px repeat(var(--cols, 2), 1fr) 44px;
  gap: 8px;
  align-items: center;
  padding: 10px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  transition: all var(--dur);
}
.set-row.focused {
  border-color: var(--accent);
  background: var(--accent-soft);
  box-shadow: 0 0 0 3px rgba(212, 255, 58, 0.1);
}
.set-row.done { opacity: 0.55; }
.set-num {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  color: var(--text-muted);
  text-align: center;
}
.set-input-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.set-input-group label {
  font-size: 9px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.set-input-group input {
  padding: 8px 10px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 16px;
  font-family: inherit;
  text-align: center;
  font-weight: 600;
  width: 100%;
  min-width: 0;
}
.set-input-group input:focus {
  outline: none;
  border-color: var(--accent);
  background: var(--bg-elev-2);
}
.set-input-group input:disabled { color: var(--text-muted); }
.check-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: var(--bg-elev);
  color: var(--text-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all var(--dur) var(--ease-spring);
  cursor: pointer;
}
.check-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: scale(1.05);
}
.check-btn.done {
  background: var(--accent);
  color: #000;
  border-color: var(--accent);
}

.sets-actions {
  display: flex;
  gap: 8px;
  margin-top: var(--space-3);
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
  cursor: pointer;
}
.btn-tiny:hover { color: var(--text); border-color: var(--border-strong); }

/* Next exercise hint */
.next-ex-btn {
  width: 100%;
  padding: 14px var(--space-4);
  background: var(--bg-elev);
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  transition: all var(--dur);
}
.next-ex-btn:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.next-ex-btn .dim { color: var(--text-dim); margin-right: 4px; }
.finish-hint {
  padding: 14px var(--space-4);
  background: var(--accent-soft);
  border: 1px solid var(--accent-soft-2);
  border-radius: var(--radius);
  font-size: 13px;
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Dynamic cols for set-row based on RPE setting */
.sets-list { --cols: 2; }
.sets-list:has(.set-input-group:nth-child(4)) { --cols: 3; }

@media (max-width: 540px) {
  .ex-name { font-size: 18px; }
  .set-row { grid-template-columns: 24px 1fr 1fr 60px 38px; gap: 6px; padding: 8px; }
  .set-input-group input { padding: 6px 8px; font-size: 15px; }
  .check-btn { width: 36px; height: 36px; }
}

@media (prefers-reduced-motion: reduce) {
  .card-content { animation: none; }
  .check-btn { transition: none; }
}
</style>
