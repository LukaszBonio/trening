<script setup>
import { computed, watch, onBeforeUnmount } from 'vue'
import { getExerciseDetailsByName } from '../lib/exerciseDetails'

const props = defineProps({
  // Nazwa ćwiczenia (kanoniczna lub alias) — null/'' zamyka modal.
  name: { type: String, default: null }
})
const emit = defineEmits(['close'])

const details = computed(() => props.name ? getExerciseDetailsByName(props.name) : null)
const open = computed(() => !!props.name && !!details.value)

function close() { emit('close') }

function onKey(e) {
  if (e.key === 'Escape') close()
}

// Blokada scrolla tła + Escape tylko gdy modal otwarty.
watch(open, (v) => {
  if (typeof document === 'undefined') return
  if (v) {
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', onKey)
    document.body.style.overflow = ''
  }
})
onBeforeUnmount(() => {
  if (typeof document === 'undefined') return
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="exi-backdrop" @click.self="close">
      <div class="exi-sheet" role="dialog" aria-modal="true" :aria-label="'Technika: ' + name">
        <div class="exi-head">
          <div class="exi-title-block">
            <div class="exi-kicker">Technika ćwiczenia</div>
            <h3 class="exi-title">{{ name }}</h3>
          </div>
          <button class="exi-close" @click="close" aria-label="Zamknij">
            <i class="ti ti-x"></i>
          </button>
        </div>

        <div class="exi-body">
          <!-- Sprzęt + uchwyt -->
          <div class="exi-equip-row">
            <span class="exi-chip exi-chip-equip">
              <i class="ti ti-barbell"></i> {{ details.equipmentDetail }}
            </span>
            <span v-if="details.attachment" class="exi-chip exi-chip-attach">
              <i class="ti ti-link"></i> {{ details.attachment }}
            </span>
          </div>

          <!-- Pozycja startowa -->
          <section class="exi-section">
            <div class="exi-section-title"><i class="ti ti-yoga"></i> Pozycja startowa</div>
            <p class="exi-text">{{ details.startPosition }}</p>
          </section>

          <!-- Wykonanie -->
          <section class="exi-section">
            <div class="exi-section-title"><i class="ti ti-list-numbers"></i> Wykonanie</div>
            <ol class="exi-steps">
              <li v-for="(step, i) in details.execution" :key="i">{{ step }}</li>
            </ol>
          </section>

          <!-- Zakres ruchu -->
          <section class="exi-section">
            <div class="exi-section-title"><i class="ti ti-arrows-vertical"></i> Zakres ruchu</div>
            <p class="exi-text">{{ details.rangeOfMotion }}</p>
          </section>

          <!-- Mięśnie -->
          <section class="exi-section">
            <div class="exi-section-title"><i class="ti ti-target"></i> Zaangażowane mięśnie</div>
            <div class="exi-muscles">
              <span v-for="m in details.musclesPrimary" :key="'p-' + m" class="exi-chip exi-chip-primary">{{ m }}</span>
              <span v-for="m in details.musclesSecondary" :key="'s-' + m" class="exi-chip exi-chip-secondary">{{ m }}</span>
            </div>
            <div class="exi-muscles-legend dim">wyróżnione = główne</div>
          </section>

          <!-- Najczęstsze błędy -->
          <section class="exi-section">
            <div class="exi-section-title exi-warn"><i class="ti ti-alert-triangle"></i> Najczęstsze błędy</div>
            <ul class="exi-list exi-list-warn">
              <li v-for="(m, i) in details.commonMistakes" :key="i">{{ m }}</li>
            </ul>
          </section>

          <!-- Wskazówki -->
          <section class="exi-section">
            <div class="exi-section-title"><i class="ti ti-bulb"></i> Wskazówki</div>
            <ul class="exi-list exi-list-tips">
              <li v-for="(t, i) in details.tips" :key="i">{{ t }}</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.exi-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.exi-sheet {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius) var(--radius) 0 0;
  width: 100%;
  max-width: 640px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  animation: exi-up 0.22s var(--ease, ease-out);
}
@keyframes exi-up {
  from { transform: translateY(24px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@media (min-width: 700px) {
  .exi-backdrop { align-items: center; padding: 24px; }
  .exi-sheet { border-radius: var(--radius); max-height: 82vh; }
}
@media (prefers-reduced-motion: reduce) {
  .exi-sheet { animation: none; }
}

.exi-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: var(--space-4) var(--space-4) var(--space-3);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.exi-kicker {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent);
  margin-bottom: 2px;
}
.exi-title { margin: 0; font-size: 17px; line-height: 1.3; }
.exi-close {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-elev-2);
  color: var(--text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  cursor: pointer;
  transition: color var(--dur), border-color var(--dur);
}
.exi-close:hover { color: var(--text); border-color: var(--border-strong); }

.exi-body {
  overflow-y: auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.exi-equip-row { display: flex; flex-wrap: wrap; gap: 6px; }
.exi-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 11px;
  border-radius: 100px;
}
.exi-chip .ti { font-size: 13px; }
.exi-chip-equip { background: var(--accent-soft); color: var(--accent); }
.exi-chip-attach {
  background: var(--bg-elev-2);
  color: var(--text);
  border: 1px solid var(--border-strong);
}

.exi-section { display: flex; flex-direction: column; gap: 8px; }
.exi-section-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.exi-section-title i { color: var(--accent); font-size: 14px; }
.exi-section-title.exi-warn i { color: var(--warning); }

.exi-text { margin: 0; font-size: 13.5px; line-height: 1.55; color: var(--text); }

.exi-steps {
  margin: 0;
  padding-left: 22px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13.5px;
  line-height: 1.5;
}
.exi-steps li::marker { color: var(--accent); font-weight: 700; }

.exi-muscles { display: flex; flex-wrap: wrap; gap: 6px; }
.exi-chip-primary { background: var(--accent-soft); color: var(--accent); }
.exi-chip-secondary {
  background: var(--bg-elev-2);
  color: var(--text-muted);
  border: 1px solid var(--border);
  font-weight: 500;
}
.exi-muscles-legend { font-size: 11px; }

.exi-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.exi-list li {
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  background: var(--bg-elev-2);
  font-size: 13px;
  line-height: 1.5;
  border-left: 3px solid var(--border);
}
.exi-list-warn li { border-left-color: var(--warning); }
.exi-list-tips li { border-left-color: var(--accent); }
</style>
