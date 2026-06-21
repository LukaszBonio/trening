<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  initial: { type: Object, default: null },
  type: { type: String, required: true }
})
const emit = defineEmits(['save', 'cancel'])

const draft = ref(
  props.initial
    ? JSON.parse(JSON.stringify(props.initial))
    : {
        name: '',
        type: props.type,
        exercises: [
          { name: '', sets: 3, reps: '8-12', tip: '' }
        ]
      }
)

const canSave = computed(() =>
  draft.value.name.trim() &&
  draft.value.exercises.length > 0 &&
  draft.value.exercises.every(e => e.name.trim() && e.sets > 0 && e.reps)
)

function addExercise() {
  draft.value.exercises.push({ name: '', sets: 3, reps: '8-12', tip: '' })
}

function removeExercise(i) {
  draft.value.exercises.splice(i, 1)
}

function moveUp(i) {
  if (i === 0) return
  const arr = draft.value.exercises
  ;[arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]
}

function moveDown(i) {
  const arr = draft.value.exercises
  if (i === arr.length - 1) return
  ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
}

function save() {
  draft.value.name = draft.value.name.trim()
  draft.value.exercises = draft.value.exercises.map(e => ({
    name: e.name.trim(),
    sets: Number(e.sets) || 3,
    reps: e.reps.trim() || '8-12',
    tip: (e.tip || '').trim()
  }))
  emit('save', draft.value)
}
</script>

<template>
  <div class="plan-editor">
    <div class="field">
      <label>Nazwa planu</label>
      <input v-model="draft.name" placeholder="np. Mój push siłowy" maxlength="50" />
    </div>

    <div class="exercises">
      <div v-for="(ex, i) in draft.exercises" :key="i" class="ex-edit">
        <div class="ex-edit-header">
          <span class="ex-num">{{ i + 1 }}</span>
          <div class="ex-controls">
            <button class="btn-tiny" @click="moveUp(i)" :disabled="i === 0">
              <i class="ti ti-chevron-up"></i>
            </button>
            <button class="btn-tiny" @click="moveDown(i)" :disabled="i === draft.exercises.length - 1">
              <i class="ti ti-chevron-down"></i>
            </button>
            <button
              v-if="draft.exercises.length > 1"
              class="btn-tiny btn-tiny-danger"
              @click="removeExercise(i)"
            >
              <i class="ti ti-x"></i>
            </button>
          </div>
        </div>
        <input v-model="ex.name" placeholder="Nazwa ćwiczenia" class="ex-name-input" />
        <div class="ex-fields">
          <div class="field-inline">
            <label>Serie</label>
            <input type="number" min="1" max="10" v-model.number="ex.sets" />
          </div>
          <div class="field-inline">
            <label>Powt.</label>
            <input v-model="ex.reps" placeholder="8-12" />
          </div>
        </div>
        <input v-model="ex.tip" placeholder="Wskazówka (opcjonalnie)" class="ex-tip-input" />
      </div>
    </div>

    <button class="btn-add" @click="addExercise">
      <i class="ti ti-plus"></i> Dodaj ćwiczenie
    </button>

    <div class="editor-actions">
      <button class="btn" @click="emit('cancel')">Anuluj</button>
      <button class="btn btn-primary" :disabled="!canSave" @click="save">
        <i class="ti ti-device-floppy"></i> Zapisz plan
      </button>
    </div>
  </div>
</template>

<style scoped>
.plan-editor { display: flex; flex-direction: column; gap: var(--space-3); }
.field { display: flex; flex-direction: column; gap: 4px; }
.field label, .field-inline label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.field input, .field-inline input, .ex-name-input, .ex-tip-input {
  padding: 10px 14px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 14px;
  font-family: inherit;
  width: 100%;
}
.field input:focus, .field-inline input:focus, .ex-name-input:focus, .ex-tip-input:focus {
  outline: none;
  border-color: var(--accent);
}

.exercises { display: flex; flex-direction: column; gap: 10px; }
.ex-edit {
  padding: 12px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ex-edit-header { display: flex; justify-content: space-between; align-items: center; }
.ex-num {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  color: var(--accent);
  font-size: 14px;
}
.ex-controls { display: flex; gap: 4px; }
.btn-tiny {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  width: 28px; height: 28px;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
}
.btn-tiny:disabled { opacity: 0.3; cursor: not-allowed; }
.btn-tiny:hover:not(:disabled) { color: var(--text); border-color: var(--border-strong); }
.btn-tiny-danger:hover:not(:disabled) { color: var(--danger); border-color: var(--danger); }

.ex-fields { display: grid; grid-template-columns: 100px 1fr; gap: 8px; }
.field-inline { display: flex; flex-direction: column; gap: 4px; }
.field-inline input { padding: 8px 10px; font-size: 13px; }
.ex-name-input { font-weight: 600; }
.ex-tip-input { font-size: 13px; font-style: italic; }

.btn-add {
  padding: 10px;
  background: transparent;
  border: 1px dashed var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
}
.btn-add:hover { color: var(--accent); border-color: var(--accent); }

.editor-actions { display: flex; gap: 8px; justify-content: flex-end; }
</style>
