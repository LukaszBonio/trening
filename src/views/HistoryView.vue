<script setup>
import { ref, computed } from 'vue'
import { useWorkoutsStore } from '../stores/workouts.js'
import { exportWorkoutToPDF } from '../lib/pdf.js'
import { useCustomPlansStore } from '../stores/customPlans.js'
import { formatDuration, formatDateTime } from '../lib/format.js'
import { workoutVolume, totalSets } from '../lib/workoutMath.js'
import { useToast } from '../composables/useToast.js'
import { useDialog } from '../composables/useDialog.js'

const toast = useToast()
const dialog = useDialog()

const customPlans = useCustomPlansStore()

async function saveAsTemplate(workout) {
  const defaultName = `${workout.planName} (z ${new Date(workout.date).toLocaleDateString('pl-PL')})`
  const name = await dialog.prompt('Nazwa planu:', defaultName, {
    title: 'Zapisz jako plan',
    okLabel: 'Zapisz'
  })
  if (!name) return
  customPlans.add({
    name: name.trim(),
    type: workout.type,
    exercises: workout.exercises.map(ex => ({
      name: ex.name,
      sets: ex.sets.length,
      reps: ex.sets[0] ? `${ex.sets[0].reps}` : '8-12',
      tip: ''
    }))
  })
  toast.success(`Plan "${name}" zapisany — znajdziesz go w Trening → ${workout.type.toUpperCase()} → Plany.`)
}

const workouts = useWorkoutsStore()
const expandedId = ref(null)
const editingId = ref(null)
const editDraft = ref(null)

const sortedHistory = computed(() =>
  [...workouts.history].sort((a, b) => new Date(b.date) - new Date(a.date))
)

function toggle(id) {
  expandedId.value = expandedId.value === id ? null : id
}

async function remove(id) {
  const ok = await dialog.confirm('Usunąć ten trening z historii?', {
    title: 'Usuń trening',
    okLabel: 'Usuń',
    danger: true
  })
  if (!ok) return
  const removed = workouts.history.find(w => w.id === id)
  if (!removed) return
  workouts.removeWorkout(id)
  if (expandedId.value === id) expandedId.value = null
  // 5-sekundowe okienko na cofnięcie — restore wkleja workout z powrotem do tablicy.
  toast.show('Trening usunięty', {
    actionLabel: 'Cofnij',
    action: () => workouts.addWorkout(removed)
  })
}

function startEdit(workout) {
  editingId.value = workout.id
  const draft = JSON.parse(JSON.stringify(workout))
  // Add unique IDs for stable v-for keys during editing
  draft.exercises = draft.exercises.map(ex => ({
    ...ex,
    _uid: Math.random().toString(36).slice(2),
    sets: ex.sets.map(s => ({ ...s, _uid: Math.random().toString(36).slice(2) }))
  }))
  editDraft.value = draft
}

function cancelEdit() {
  editingId.value = null
  editDraft.value = null
}

function saveEdit() {
  if (!editDraft.value) return
  // Strip empty sets
  editDraft.value.exercises = editDraft.value.exercises.map(ex => ({
    ...ex,
    sets: ex.sets
      .map(s => ({ weight: Number(s.weight) || 0, reps: Number(s.reps) || 0 }))
      .filter(s => s.weight > 0 || s.reps > 0)
  })).filter(ex => ex.sets.length > 0)
  workouts.updateWorkout(editingId.value, editDraft.value)
  cancelEdit()
}

function addSetTo(exIdx) {
  editDraft.value.exercises[exIdx].sets.push({ weight: 0, reps: 0, _uid: Math.random().toString(36).slice(2) })
}
function removeSetFrom(exIdx, setIdx) {
  editDraft.value.exercises[exIdx].sets.splice(setIdx, 1)
}

const typeColor = (type) => ({
  push: 'var(--push)', pull: 'var(--pull)', legs: 'var(--legs)'
}[type] || 'var(--accent)')
</script>

<template>
  <div class="card">
    <h2 class="card-title">Historia treningów</h2>
    <p class="muted" v-if="!sortedHistory.length">
      Brak treningów. Rozpocznij sesję w zakładce „Trening".
    </p>
    <ul v-else class="history-list">
      <li v-for="w in sortedHistory" :key="w.id" class="history-item" :class="{ open: expandedId === w.id }">
        <button class="history-row" @click="toggle(w.id)">
          <span class="type-pill" :style="{ background: typeColor(w.type) + '22', color: typeColor(w.type) }">
            {{ w.type.toUpperCase() }}
          </span>
          <div class="row-main">
            <div class="row-title">{{ w.planName }}</div>
            <div class="row-meta">{{ formatDateTime(w.date) }}</div>
          </div>
          <div class="row-stats">
            <div><strong>{{ totalSets(w) }}</strong> serii</div>
            <div class="dim">{{ workoutVolume(w) }} kg · {{ formatDuration(w.duration) }}</div>
          </div>
          <i class="ti ti-chevron-down chevron"></i>
        </button>

        <div v-if="expandedId === w.id" class="history-details">
          <!-- View mode -->
          <template v-if="editingId !== w.id">
            <div v-for="(ex, i) in w.exercises" :key="i" class="ex-detail">
              <div class="ex-detail-name">{{ ex.name }}</div>
              <div class="set-pills">
                <span v-for="(s, j) in ex.sets" :key="j" class="set-pill" :class="{ 'with-rpe': s.rpe }">
                  <span>{{ s.weight }}kg × {{ s.reps }}</span>
                  <span v-if="s.rpe" class="rpe-badge">RPE {{ s.rpe }}</span>
                  <span v-if="s.note" class="note-icon" :title="s.note">
                    <i class="ti ti-note"></i>
                  </span>
                </span>
              </div>
              <div v-if="ex.sets.some(s => s.note)" class="notes-block">
                <div v-for="(s, j) in ex.sets" :key="j" v-show="s.note" class="note-line">
                  <span class="dim">#{{ j + 1 }}:</span> {{ s.note }}
                </div>
              </div>
            </div>
            <div class="detail-actions">
              <button class="btn" @click="startEdit(w)">
                <i class="ti ti-pencil"></i> Edytuj
              </button>
              <button class="btn" @click="exportWorkoutToPDF(w)">
                <i class="ti ti-file-download"></i> PDF
              </button>
              <button class="btn" @click="saveAsTemplate(w)">
                <i class="ti ti-template"></i> Zapisz jako plan
              </button>
              <button class="btn btn-danger" @click="remove(w.id)">
                <i class="ti ti-trash"></i> Usuń
              </button>
            </div>
          </template>

          <!-- Edit mode -->
          <template v-else>
            <div v-for="(ex, i) in editDraft.exercises" :key="ex._uid" class="ex-edit">
              <div class="ex-detail-name">{{ ex.name }}</div>
              <div class="set-edit-rows">
                <div v-for="(s, j) in ex.sets" :key="s._uid" class="set-edit-row">
                  <span class="set-num">{{ j + 1 }}</span>
                  <input type="number" step="0.5" v-model="s.weight" placeholder="kg" />
                  <input type="number" v-model="s.reps" placeholder="powt" />
                  <button class="btn-tiny-icon" @click="removeSetFrom(i, j)" v-if="ex.sets.length > 1" aria-label="Usuń serię">
                    <i class="ti ti-x" aria-hidden="true"></i>
                  </button>
                </div>
                <button class="btn-tiny" @click="addSetTo(i)">
                  <i class="ti ti-plus"></i> Seria
                </button>
              </div>
            </div>
            <div class="detail-actions">
              <button class="btn" @click="cancelEdit">Anuluj</button>
              <button class="btn btn-primary" @click="saveEdit">Zapisz zmiany</button>
            </div>
          </template>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.history-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
.history-item {
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: border-color var(--dur);
}
.history-item.open { border-color: var(--border-strong); }
.history-row {
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  color: var(--text);
  text-align: left;
}
.history-row:hover { background: var(--bg-hover); }
.type-pill {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 4px 8px;
  border-radius: 100px;
}
.row-title { font-weight: 600; font-size: 14px; }
.row-meta { font-size: 12px; color: var(--text-muted); }
.row-stats { font-size: 12px; text-align: right; }
.row-stats .dim { color: var(--text-dim); }
.chevron { transition: transform var(--dur); color: var(--text-dim); }
.history-item.open .chevron { transform: rotate(180deg); }
.history-details {
  padding: var(--space-3) var(--space-4) var(--space-4);
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.ex-detail-name { font-weight: 600; font-size: 13px; margin-bottom: 6px; }
.set-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.set-pill {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  padding: 3px 8px;
  border-radius: 100px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.set-pill.with-rpe { border-color: var(--accent-soft-2); }
.rpe-badge {
  font-size: 10px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.3px;
}
.note-icon {
  font-size: 11px;
  color: var(--text-dim);
  cursor: help;
}
.notes-block {
  margin-top: 6px;
  padding-left: 4px;
  font-size: 12px;
  color: var(--text-muted);
  font-style: italic;
}
.note-line { margin-top: 2px; }
.note-line .dim { color: var(--text-dim); font-style: normal; margin-right: 4px; }
.btn-danger {
  background: transparent;
  border: 1px solid var(--danger);
  color: var(--danger);
}
.btn-danger:hover { background: var(--danger); color: #fff; }

.detail-actions { display: flex; gap: 8px; }
.ex-edit { padding: 10px 0; border-bottom: 1px solid var(--border); }
.ex-edit:last-of-type { border-bottom: none; }
.set-edit-rows { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
.set-edit-row {
  display: grid;
  grid-template-columns: 24px 1fr 1fr 32px;
  gap: 8px;
  align-items: center;
}
.set-edit-row .set-num { font-size: 11px; color: var(--text-dim); text-align: center; }
.set-edit-row input {
  padding: 6px 10px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 13px;
  font-family: inherit;
  text-align: center;
  width: 100%;
}
.set-edit-row input:focus { outline: none; border-color: var(--accent); }
.btn-tiny-icon {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-dim);
  width: 28px; height: 28px;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn-tiny-icon:hover { color: var(--danger); border-color: var(--danger); }
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
  align-self: flex-start;
}
.btn-tiny:hover { color: var(--text); border-color: var(--border-strong); }

@media (max-width: 640px) {
  .history-row { grid-template-columns: auto 1fr auto; }
  .chevron { display: none; }
}
</style>
