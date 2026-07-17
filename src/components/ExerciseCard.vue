<script setup>
import { ref, computed } from 'vue'
import { useSessionStore } from '../stores/session'
import { useSettingsStore } from '../stores/settings'
import { getExerciseDetailsByName } from '../lib/exerciseDetails'
import { isTimedExercise } from '../lib/workoutMath'
import ExerciseInfoModal from './ExerciseInfoModal.vue'
import StopwatchInput from './StopwatchInput.vue'

const props = defineProps({
  exIdx: { type: Number, required: true }
})
const emit = defineEmits(['set-done'])

const session = useSessionStore()
const settings = useSettingsStore()

const noteEditIdx = ref(null)

const exercise = computed(() => session.active?.exercises[props.exIdx])

// Modal "?" ze szczegółami techniki — tylko gdy ćwiczenie jest w bazie.
const infoName = ref(null)
const hasInfo = computed(() => !!exercise.value && !!getExerciseDetailsByName(exercise.value.name))

// Ćwiczenie czasowe (plank itp.) → kolumna „Sek." zamiast ciężaru.
const timed = computed(() => !!exercise.value && isTimedExercise(exercise.value.name, exercise.value.reps))

function toggle(setIdx) {
  const wasDone = exercise.value.sets[setIdx].done
  session.toggleSet(props.exIdx, setIdx)
  if (!wasDone) emit('set-done')
}
</script>

<template>
  <div class="ex-card" v-if="exercise">
    <ExerciseInfoModal :name="infoName" @close="infoName = null" />
    <div class="ex-header">
      <div>
        <div class="ex-name">
          {{ exercise.name }}
          <button
            v-if="hasInfo"
            class="ex-info-btn"
            @click="infoName = exercise.name"
            aria-label="Pokaż technikę ćwiczenia"
          >?</button>
        </div>
        <div class="ex-tip" v-if="exercise.tip">{{ exercise.tip }}</div>
      </div>
      <div class="ex-target">{{ exercise.sets.length }} × {{ exercise.reps }}</div>
    </div>

    <div class="sets">
      <div class="set-header" :class="{ 'with-rpe': settings.settings.showRpe, timed }">
        <span>#</span>
        <span v-if="!timed">{{ settings.settings.units === 'lb' ? 'lb' : 'kg' }}</span>
        <span>{{ timed ? 'Sek.' : 'Powt.' }}</span>
        <span v-if="settings.settings.showRpe">RPE</span>
        <span></span>
      </div>
      <template v-for="(set, i) in exercise.sets" :key="'set-' + i">
        <div class="set-row" :class="{ done: set.done, 'with-rpe': settings.settings.showRpe, timed }">
          <span class="set-num">{{ i + 1 }}</span>
          <input
            v-if="!timed"
            type="number"
            inputmode="decimal"
            step="0.5"
            v-model="set.weight"
            placeholder="—"
            :disabled="set.done"
          />
          <StopwatchInput
            v-if="timed"
            v-model="set.reps"
            :disabled="set.done"
          />
          <input
            v-else
            type="number"
            inputmode="numeric"
            v-model="set.reps"
            placeholder="—"
            :disabled="set.done"
          />
          <input
            v-if="settings.settings.showRpe"
            type="number"
            inputmode="decimal"
            step="0.5"
            min="1"
            max="10"
            v-model="set.rpe"
            placeholder="—"
            :disabled="set.done"
            class="rpe-input"
          />
          <button class="check" :class="{ done: set.done }" @click="toggle(i)">
            <i class="ti" :class="set.done ? 'ti-check' : 'ti-circle'"></i>
          </button>
        </div>
        <div v-if="noteEditIdx === i" class="note-row">
          <input
            v-model="set.note"
            placeholder="Notatka: technika, samopoczucie, modyfikacje…"
            class="note-input"
            @blur="noteEditIdx = null"
            @keyup.enter="noteEditIdx = null"
          />
        </div>
        <div v-else-if="set.note" class="note-display" @click="noteEditIdx = i">
          <i class="ti ti-note"></i> {{ set.note }}
        </div>
      </template>
    </div>

    <div class="ex-actions">
      <button class="btn-tiny" @click="session.addSet(exIdx)">
        <i class="ti ti-plus"></i> Dodaj serię
      </button>
      <button
        class="btn-tiny"
        v-if="exercise.sets.length > 1"
        @click="session.removeSet(exIdx, exercise.sets.length - 1)"
      >
        <i class="ti ti-minus"></i> Usuń serię
      </button>
      <button
        class="btn-tiny"
        @click="noteEditIdx = noteEditIdx === null ? exercise.sets.length - 1 : null"
      >
        <i class="ti ti-note"></i> Notatka
      </button>
    </div>
  </div>
</template>

<style scoped>
.ex-card {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--space-4);
}
.ex-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}
.ex-name { font-weight: 600; font-size: 15px; }
.ex-info-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-left: 4px;
  border-radius: 50%;
  border: 1px solid var(--border-strong);
  background: var(--bg-elev-2);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  vertical-align: middle;
  transition: color var(--dur), border-color var(--dur);
}
.ex-info-btn:hover { color: var(--accent); border-color: var(--accent); }
.ex-tip { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.ex-target {
  font-size: 12px;
  color: var(--accent);
  background: var(--accent-soft);
  padding: 4px 8px;
  border-radius: 100px;
  white-space: nowrap;
}
.sets {
  display: grid;
  gap: 6px;
  margin-bottom: var(--space-3);
}
.set-header, .set-row {
  display: grid;
  grid-template-columns: 32px 1fr 1fr 44px;
  gap: 8px;
  align-items: center;
}
.set-header.with-rpe, .set-row.with-rpe {
  grid-template-columns: 28px 1fr 1fr 60px 40px;
  gap: 6px;
}
/* Ćwiczenie czasowe: brak kolumny ciężaru (# · sek. · [rpe] · check) */
.set-header.timed, .set-row.timed { grid-template-columns: 32px 1fr 44px; }
.set-header.timed.with-rpe, .set-row.timed.with-rpe { grid-template-columns: 28px 1fr 60px 40px; }
.set-header {
  font-size: 11px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 4px;
}
.set-row.done { opacity: 0.6; }
.set-num {
  text-align: center;
  font-weight: 600;
  font-size: 13px;
  color: var(--text-muted);
}
.set-row input {
  padding: 8px 10px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 14px;
  font-family: inherit;
  text-align: center;
  width: 100%;
}
.set-row input:focus { outline: none; border-color: var(--accent); }
.set-row input:disabled { color: var(--text-muted); }
.rpe-input { font-size: 13px !important; }
.check {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--bg-elev-2);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all var(--dur) var(--ease);
}
.check.done {
  background: var(--accent);
  color: #000;
  border-color: var(--accent);
}
.note-row {
  padding: 4px 0;
}
.note-input {
  width: 100%;
  padding: 8px 10px;
  background: var(--bg-elev-2);
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 13px;
  font-family: inherit;
}
.note-input:focus { outline: none; }
.note-display {
  padding: 4px 12px;
  font-size: 12px;
  color: var(--text-muted);
  font-style: italic;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}
.note-display:hover { color: var(--text); }
.ex-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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
}
.btn-tiny:hover { color: var(--text); border-color: var(--border-strong); }
</style>
