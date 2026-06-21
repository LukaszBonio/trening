<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useSessionStore } from '../stores/session.js'
import { groupExercisesByMuscle } from '../lib/workoutSchema.js'
import ExerciseCard from './ExerciseCard.vue'

const props = defineProps({
  onSetDone: { type: Function, default: () => {} }
})

const session = useSessionStore()

const groups = computed(() => {
  if (!session.active) return []
  return groupExercisesByMuscle(
    session.active.exercises,
    session.active.type,
    session.active.source || 'library'
  )
})

const currentIdx = ref(0)

function go(delta) {
  const next = currentIdx.value + delta
  if (next < 0 || next >= groups.value.length) return
  currentIdx.value = next
  // Scroll to top of card content
  const el = document.querySelector('.cards-content')
  if (el) el.scrollTo({ top: 0, behavior: 'smooth' })
}

const current = computed(() => groups.value[currentIdx.value])

// Progress per group: ile serii zaznaczone / wszystkich w danej grupie
function groupProgress(group) {
  if (!session.active) return { done: 0, total: 0 }
  let done = 0, total = 0
  for (const exIdx of group.exerciseIndices) {
    const ex = session.active.exercises[exIdx]
    for (const s of ex.sets) {
      total++
      if (s.done) done++
    }
  }
  return { done, total }
}

// Touch swipe handling
const touchStart = ref(null)
function onTouchStart(e) {
  touchStart.value = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() }
}
function onTouchEnd(e) {
  if (!touchStart.value) return
  const dx = e.changedTouches[0].clientX - touchStart.value.x
  const dy = Math.abs(e.changedTouches[0].clientY - touchStart.value.y)
  const dt = Date.now() - touchStart.value.t
  touchStart.value = null
  // Pozioma swipe min 60px, max 30px pionowo, max 500ms
  if (Math.abs(dx) < 60 || dy > 30 || dt > 500) return
  if (dx < 0) go(1)
  else go(-1)
}

// Keyboard nav (desktop)
function onKey(e) {
  if (e.target.tagName === 'INPUT') return
  if (e.key === 'ArrowRight') go(1)
  else if (e.key === 'ArrowLeft') go(-1)
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div v-if="current" class="cards-wrap">
    <!-- Group nav: stepper dots + counter -->
    <div class="cards-nav">
      <button
        class="nav-arrow"
        :disabled="currentIdx === 0"
        @click="go(-1)"
        aria-label="Poprzednia partia"
      >
        <i class="ti ti-chevron-left"></i>
      </button>

      <div class="nav-center">
        <div class="nav-counter">{{ currentIdx + 1 }} / {{ groups.length }}</div>
        <div class="nav-dots">
          <button
            v-for="(g, i) in groups"
            :key="g.groupId"
            class="nav-dot"
            :class="{
              active: i === currentIdx,
              complete: groupProgress(g).done === groupProgress(g).total && groupProgress(g).total > 0
            }"
            @click="currentIdx = i"
            :aria-label="g.label"
          ></button>
        </div>
      </div>

      <button
        class="nav-arrow"
        :disabled="currentIdx === groups.length - 1"
        @click="go(1)"
        aria-label="Następna partia"
      >
        <i class="ti ti-chevron-right"></i>
      </button>
    </div>

    <!-- Current group card -->
    <div
      class="cards-content"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <div class="group-header">
        <div class="group-icon">
          <i class="ti" :class="current.icon"></i>
        </div>
        <div class="group-meta">
          <div class="group-name">{{ current.label }}</div>
          <div class="group-stats">
            {{ current.exerciseIndices.length }} ćwiczeń ·
            {{ groupProgress(current).done }} / {{ groupProgress(current).total }} serii
          </div>
        </div>
      </div>

      <ExerciseCard
        v-for="exIdx in current.exerciseIndices"
        :key="exIdx"
        :ex-idx="exIdx"
        @set-done="onSetDone"
      />

      <!-- CTA: next group / finish hint -->
      <div v-if="currentIdx < groups.length - 1" class="next-hint">
        <button class="next-group-btn" @click="go(1)">
          Następna partia: {{ groups[currentIdx + 1].label }}
          <i class="ti ti-arrow-right"></i>
        </button>
      </div>
      <div v-else class="next-hint">
        <div class="finish-hint">
          <i class="ti ti-flag"></i>
          Ostatnia partia — pamiętaj kliknąć "Zakończ trening" na dole.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cards-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

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
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all var(--dur) var(--ease);
}
.nav-arrow:hover:not(:disabled) {
  background: var(--accent);
  color: #000;
  border-color: var(--accent);
}
.nav-arrow:disabled { opacity: 0.3; cursor: not-allowed; }
.nav-center { text-align: center; }
.nav-counter {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 6px;
}
.nav-dots {
  display: flex;
  gap: 6px;
  justify-content: center;
}
.nav-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  cursor: pointer;
  padding: 0;
  transition: all var(--dur) var(--ease);
}
.nav-dot.complete { background: var(--accent-soft-2); }
.nav-dot.active {
  background: var(--accent);
  width: 24px;
  border-radius: 100px;
  border-color: var(--accent);
}

.cards-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  animation: card-in 0.25s var(--ease-spring);
}
@keyframes card-in {
  from { opacity: 0; transform: translateX(8px); }
  to { opacity: 1; transform: translateX(0); }
}

.group-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--accent-soft);
  border: 1px solid var(--accent-soft-2);
  border-radius: var(--radius);
}
.group-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--accent);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}
.group-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 20px;
  font-weight: 700;
}
.group-stats {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.next-hint { padding: var(--space-3) 0; }
.next-group-btn {
  width: 100%;
  padding: 14px var(--space-4);
  background: var(--bg-elev);
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  color: var(--text-muted);
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all var(--dur) var(--ease);
}
.next-group-btn:hover {
  color: var(--text);
  border-color: var(--accent);
  background: var(--accent-soft);
}
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

@media (prefers-reduced-motion: reduce) {
  .cards-content { animation: none; }
}
</style>
