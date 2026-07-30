<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['done'])

const STORAGE_KEY = 'tp_onboarding_done_v2'

const steps = [
  {
    icon: 'ti-barbell',
    title: 'Witaj w Trening Pro',
    body: 'Twój trener siłowy w kieszeni. W zakładce Trening masz trzy tryby: Program (cały tydzień), Pojedynczy (jeden trening) i Ania (plan korekcyjny).'
  },
  {
    icon: 'ti-calendar-week',
    title: 'Ułóż cały tydzień',
    body: 'W trybie Program podaj, ile dni trenujesz — AI dobierze split (PPL, Upper/Lower, FBW, Arnold…), rozłoży objętość i ćwiczenia. Wolisz doraźnie? Wybierz Pojedynczy trening.'
  },
  {
    icon: 'ti-list-check',
    title: 'Loguj serie szybko',
    body: 'Wpisz ciężar i powtórzenia, kliknij ⭕ — startuje timer odpoczynku. RPE i notatka opcjonalnie. Przy ćwiczeniach czasowych (np. plank) stoper liczy sekundy.'
  },
  {
    icon: 'ti-chart-line',
    title: 'Śledź postęp',
    body: 'Statystyki: rekordy, wolumen, streak i mapa cieplna. AI Coach analizuje trendy i odpowiada na pytania. Wszystko synchronizuje się między urządzeniami (działa też offline).'
  },
  {
    icon: 'ti-bug',
    title: 'Coś nie działa? Zgłoś to',
    body: 'Kliknij ikonę 🐞 w prawym dolnym rogu — jest na każdym ekranie. Opisz problem i wyślij; zgłoszenie z kontekstem (widok, wersja) trafia prosto do nas i pomaga ulepszać aplikację.'
  }
]

const idx = ref(0)
const isLast = computed(() => idx.value === steps.length - 1)
const current = computed(() => steps[idx.value])

function next() {
  if (isLast.value) finish()
  else idx.value++
}
function prev() { if (idx.value > 0) idx.value-- }
function skip() { finish() }

function finish() {
  try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
  emit('done')
}
</script>

<template>
  <div class="onb-backdrop" @click.self="skip">
    <div class="onb-modal">
      <button class="onb-skip" @click="skip" aria-label="Pomiń">
        <i class="ti ti-x"></i>
      </button>

      <div class="onb-icon-wrap">
        <i class="ti onb-icon" :class="current.icon"></i>
      </div>

      <h2 class="onb-title">{{ current.title }}</h2>
      <p class="onb-body">{{ current.body }}</p>

      <div class="onb-dots">
        <span
          v-for="(_, i) in steps"
          :key="i"
          class="onb-dot"
          :class="{ active: i === idx, done: i < idx }"
          @click="idx = i"
        ></span>
      </div>

      <div class="onb-actions">
        <button v-if="idx > 0" class="btn" @click="prev">
          <i class="ti ti-arrow-left"></i> Wstecz
        </button>
        <button v-else class="btn btn-link" @click="skip">Pomiń</button>
        <button class="btn btn-primary" @click="next">
          {{ isLast ? 'Zaczynamy!' : 'Dalej' }}
          <i v-if="!isLast" class="ti ti-arrow-right"></i>
          <i v-else class="ti ti-check"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.onb-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: var(--space-4);
  animation: onb-fade 0.2s ease;
}
.onb-modal {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  max-width: 420px;
  width: 100%;
  text-align: center;
  position: relative;
  animation: onb-pop 0.3s var(--ease-spring);
}
@keyframes onb-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes onb-pop {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}
.onb-skip {
  position: absolute;
  top: 14px;
  right: 14px;
  background: transparent;
  border: none;
  color: var(--text-dim);
  font-size: 18px;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  display: flex;
}
.onb-skip:hover { color: var(--text); background: var(--bg-hover); }

.onb-icon-wrap {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--space-4);
  border-radius: 50%;
  background: var(--accent-soft);
  display: flex;
  align-items: center;
  justify-content: center;
}
.onb-icon {
  font-size: 40px;
  color: var(--accent);
}

.onb-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
}
.onb-body {
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: var(--space-5);
}

.onb-dots {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin-bottom: var(--space-4);
}
.onb-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--bg-elev-2);
  cursor: pointer;
  transition: all var(--dur);
}
.onb-dot.done { background: var(--accent-soft-2); }
.onb-dot.active {
  background: var(--accent);
  width: 24px;
  border-radius: 100px;
}

.onb-actions {
  display: flex;
  gap: 8px;
  justify-content: space-between;
}
.onb-actions .btn { flex: 1; padding: 12px; }
.btn-link {
  background: transparent;
  border: none;
  color: var(--text-muted);
  text-decoration: underline;
}
</style>
