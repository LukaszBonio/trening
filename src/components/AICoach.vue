<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useWorkoutsStore } from '../stores/workouts'
import { useBodyStore } from '../stores/body'
import { useSettingsStore, GOALS } from '../stores/settings'
import { useCoach } from '../composables/useCoach'
import { COACH_CHAT_SUGGESTIONS } from '../lib/coach'
import BaseCard from './BaseCard.vue'

const workouts = useWorkoutsStore()
const body = useBodyStore()
const settings = useSettingsStore()
const { messages, chatBusy, ask } = useCoach()

const currentGoal = computed(() => GOALS.find(g => g.key === settings.settings.goal) || GOALS[0])
const chatInput = ref('')
const chatScroll = ref(null)

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
  await ask(text, {
    goalLabel: currentGoal.value.label,
    history: workouts.history,
    body: body.entries,
    style: settings.settings.coachStyle
  })
  await scrollChatDown()
}

function onEnter(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

watch(() => messages.value.length, scrollChatDown)
</script>

<template>
  <BaseCard class="coach">
    <template #header>
      <div class="coach-head">
        <h3 class="card-title coach-title">
          <i class="ti ti-message-chatbot"></i> Zapytaj coacha
        </h3>
      </div>
    </template>

    <!-- ===== Czat ===== -->
    <section class="coach-section">
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
.coach-title i { color: var(--accent-text); }

.coach-section { padding-top: var(--space-3); }
.coach-section + .coach-section {
  margin-top: var(--space-3);
  border-top: 1px solid var(--border);
}
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
