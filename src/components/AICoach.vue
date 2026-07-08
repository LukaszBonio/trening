<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useWorkoutsStore } from '../stores/workouts'
import { useSettingsStore, GOALS } from '../stores/settings'
import { useCoach } from '../composables/useCoach'
import { COACH_MIN_WORKOUTS, COACH_CHAT_SUGGESTIONS } from '../lib/coach'
import BaseCard from './BaseCard.vue'

const workouts = useWorkoutsStore()
const settings = useSettingsStore()
const {
  analysis, analyzedAt, analyzing, analyzeError,
  messages, chatBusy, analyze, ask
} = useCoach()

const currentGoal = computed(() => GOALS.find(g => g.key === settings.settings.goal) || GOALS[0])
const canAnalyze = computed(() => workouts.history.length >= COACH_MIN_WORKOUTS)

const chatInput = ref('')
const chatScroll = ref(null)

const INSIGHT_META = {
  progress: { tag: 'progres',   icon: 'ti-trending-up' },
  success:  { tag: 'sukces',    icon: 'ti-trophy' },
  warning:  { tag: 'uwaga',     icon: 'ti-alert-triangle' },
  tip:      { tag: 'wskazówka', icon: 'ti-bulb' }
}
function insightIcon(t) { return INSIGHT_META[t]?.icon || 'ti-info-circle' }
function insightTag(t) { return INSIGHT_META[t]?.tag || t }

function doAnalyze() {
  analyze(workouts.history)
}

async function scrollChatDown() {
  await nextTick()
  const el = chatScroll.value
  if (el) el.scrollTop = el.scrollHeight
}

async function send(preset) {
  const text = String(preset || chatInput.value || '').trim()
  if (!text || chatBusy.value) return
  chatInput.value = ''
  await scrollChatDown()
  await ask(text, { goalLabel: currentGoal.value.label, history: workouts.history })
  await scrollChatDown()
}

function onEnter(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

function ageLabel() {
  if (!analyzedAt.value) return ''
  const days = Math.floor((Date.now() - analyzedAt.value) / 86400000)
  if (days === 0) return 'dziś'
  if (days === 1) return 'wczoraj'
  return `${days} dni temu`
}

watch(() => messages.value.length, scrollChatDown)
</script>

<template>
  <BaseCard class="coach">
    <template #header>
      <div class="coach-head">
        <h3 class="card-title coach-title">
          <i class="ti ti-message-chatbot"></i> AI Coach
        </h3>
        <div v-if="analysis && analyzedAt" class="dim coach-age">analiza: {{ ageLabel() }}</div>
      </div>
    </template>

    <!-- ===== Analiza postępów ===== -->
    <section class="coach-section">
      <div class="coach-section-title">
        <i class="ti ti-chart-arcs"></i> Analiza postępów
      </div>

      <!-- za mało treningów -->
      <p v-if="!canAnalyze" class="coach-empty">
        <i class="ti ti-lock"></i>
        Potrzeba min. {{ COACH_MIN_WORKOUTS }} treningów, żeby AI mógł wykryć trendy.
        Masz {{ workouts.history.length }}.
      </p>

      <!-- brak analizy — CTA -->
      <template v-else-if="!analysis && !analyzing && !analyzeError">
        <p class="muted coach-cta">AI przeanalizuje trendy każdego ćwiczenia — stagnacja, progres, regres — na bazie liczb z historii.</p>
        <button class="btn btn-primary" @click="doAnalyze">
          <i class="ti ti-brain"></i> Analizuj postępy
        </button>
      </template>

      <!-- loading -->
      <div v-if="analyzing" class="coach-loading">
        <i class="ti ti-loader-2 spin"></i>
        <span>Claude analizuje Twoje postępy…</span>
      </div>

      <!-- error -->
      <p v-if="analyzeError" class="coach-error">
        <i class="ti ti-alert-triangle"></i> {{ analyzeError }}
      </p>

      <!-- wynik -->
      <template v-if="analysis && !analyzing">
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
        <p v-else class="coach-empty">Brak wyraźnych trendów w danych — trenuj dalej i wróć za kilka sesji.</p>

        <p v-if="analysis.summary" class="coach-summary">{{ analysis.summary }}</p>

        <button class="btn-tiny coach-refresh" @click="doAnalyze" :disabled="analyzing">
          <i class="ti ti-refresh"></i> Odśwież analizę
        </button>
      </template>
    </section>

    <!-- ===== Czat ===== -->
    <section class="coach-section">
      <div class="coach-section-title">
        <i class="ti ti-messages"></i> Zapytaj coacha
      </div>

      <div v-if="messages.length" ref="chatScroll" class="coach-chat">
        <div
          v-for="(m, i) in messages"
          :key="i"
          class="coach-msg"
          :class="m.role"
        >{{ m.text }}</div>
        <div v-if="chatBusy" class="coach-msg assistant thinking">
          <i class="ti ti-loader-2 spin"></i> Coach pisze…
        </div>
      </div>

      <div v-if="!messages.length" class="coach-chips">
        <button
          v-for="(s, i) in COACH_CHAT_SUGGESTIONS"
          :key="i"
          class="coach-chip"
          :disabled="chatBusy"
          @click="send(s)"
        >{{ s }}</button>
      </div>

      <div class="coach-input-row">
        <input
          v-model="chatInput"
          class="coach-input"
          type="text"
          maxlength="300"
          placeholder="Zapytaj o trening, technikę, progresję…"
          :disabled="chatBusy"
          @keydown="onEnter"
        />
        <button class="btn btn-primary coach-send" :disabled="chatBusy || !chatInput.trim()" @click="send()" aria-label="Wyślij">
          <i class="ti" :class="chatBusy ? 'ti-loader-2 spin' : 'ti-send'"></i>
        </button>
      </div>
      <p class="coach-disclaimer">AI Coach opiera się na Twojej historii. To nie porada medyczna.</p>
    </section>
  </BaseCard>
</template>

<style scoped>
.coach-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.coach-title { display: inline-flex; align-items: center; gap: 8px; margin: 0; }
.coach-title i { color: var(--accent); }
.coach-age { font-size: 11px; }

.coach-section { padding-top: var(--space-3); }
.coach-section + .coach-section {
  margin-top: var(--space-3);
  border-top: 1px solid var(--border);
}
.coach-section-title {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 12px;
}
.coach-section-title i { color: var(--accent); font-size: 14px; }

.coach-cta, .coach-empty { font-size: 13px; line-height: 1.5; color: var(--text-muted); margin: 0 0 12px; }
.coach-empty { display: flex; align-items: center; gap: 8px; }
.coach-empty i { color: var(--text-dim); font-size: 16px; flex-shrink: 0; }

.coach-loading {
  display: flex; align-items: center; gap: 8px;
  color: var(--accent); font-size: 13px; padding: 8px 0;
}
.coach-error {
  display: flex; align-items: center; gap: 8px;
  color: var(--danger); font-size: 13px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.22);
  border-radius: var(--radius-sm);
  padding: 9px 12px; margin: 0;
}

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
.coach-insight.tip      { border-left-color: var(--pull, #4a8eff); }
.coach-insight-tag {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
  padding: 2px 8px; border-radius: 100px; margin-bottom: 6px;
}
.coach-insight-tag.progress { background: var(--accent-soft); color: var(--accent); }
.coach-insight-tag.success  { background: rgba(74, 222, 128, 0.15); color: var(--success); }
.coach-insight-tag.warning  { background: rgba(251, 146, 60, 0.15); color: var(--warning); }
.coach-insight-tag.tip      { background: rgba(74, 142, 255, 0.15); color: var(--pull, #4a8eff); }
.coach-insight-title { font-weight: 600; font-size: 13px; margin-bottom: 2px; }
.coach-insight-msg { font-size: 13px; line-height: 1.5; color: var(--text-soft, var(--text-muted)); }

.coach-summary {
  font-size: 13px; line-height: 1.5; color: var(--text);
  margin: 12px 0 0; padding: 10px 12px;
  background: var(--accent-soft); border-radius: var(--radius-sm);
}
.coach-refresh { margin-top: 12px; display: inline-flex; align-items: center; gap: 5px; }

.coach-chat {
  display: flex; flex-direction: column; gap: 8px;
  max-height: 320px; overflow-y: auto;
  margin-bottom: 12px; padding-right: 2px;
}
.coach-msg {
  max-width: 88%; padding: 9px 13px; border-radius: 14px;
  font-size: 13px; line-height: 1.5; white-space: pre-wrap; word-break: break-word;
}
.coach-msg.user {
  align-self: flex-end; background: var(--accent); color: #0a0a0b;
  border-bottom-right-radius: 4px; font-weight: 500;
}
.coach-msg.assistant {
  align-self: flex-start; background: var(--bg-elev-2);
  border: 1px solid var(--border); color: var(--text);
  border-bottom-left-radius: 4px;
}
.coach-msg.thinking { color: var(--text-muted); display: flex; align-items: center; gap: 8px; }

.coach-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
.coach-chip {
  padding: 7px 12px; border-radius: 100px;
  border: 1px solid var(--border-strong); background: var(--bg-elev-2);
  color: var(--text-muted); font-family: inherit; font-size: 12px; cursor: pointer;
  transition: all var(--dur) var(--ease);
}
.coach-chip:hover:not(:disabled) { border-color: var(--accent); color: var(--text); }
.coach-chip:disabled { opacity: 0.5; cursor: default; }

.coach-input-row { display: flex; gap: 8px; }
.coach-input {
  flex: 1; padding: 11px 14px; border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong); background: var(--bg-elev-2);
  color: var(--text); font-family: inherit; font-size: 13px; outline: none;
  transition: border-color var(--dur) var(--ease);
}
.coach-input:focus { border-color: var(--accent); }
.coach-send { flex-shrink: 0; padding: 11px 16px; }
.coach-disclaimer { font-size: 11px; color: var(--text-dim); margin: 8px 0 0; }

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
