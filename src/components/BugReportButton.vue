<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useSessionStore } from '../stores/session'
import { useCloudStore } from '../stores/cloud'
import { useToast } from '../composables/useToast'

// Pływający przycisk „Zgłoś błąd" — globalny, widoczny na każdym ekranie aplikacji.
// Klik → mały modal z opisem; do zgłoszenia dołączany jest automatyczny kontekst
// (widok, sesja, wersja, urządzenie), żeby zgłoszenia były użyteczne bez dopytywania.
const route = useRoute()
const session = useSessionStore()
const cloud = useCloudStore()
const toast = useToast()

const open = ref(false)
const text = ref('')
const sending = ref(false)

const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'
const appCommit = typeof __APP_COMMIT__ !== 'undefined' ? __APP_COMMIT__ : 'dev'

function captureContext() {
  return {
    view: route.name || 'unknown',
    sessionActive: session.isActive,
    sessionType: session.active?.type || null,
    planName: session.active?.planName || null,
    version: appVersion,
    commit: appCommit,
    url: typeof location !== 'undefined' ? location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    screen: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    ts: new Date().toISOString()
  }
}

// Krótki, czytelny opis kontekstu pokazywany userowi (bez userAgenta itp.).
function contextSummary() {
  const c = captureContext()
  const parts = [`widok: ${c.view}`]
  if (c.sessionActive) parts.push(`sesja: ${c.sessionType}`)
  parts.push(`v${c.version}·${c.commit}`)
  return parts.join(' · ')
}

function openModal() {
  text.value = ''
  open.value = true
}
function close() {
  open.value = false
}

async function send() {
  if (!text.value.trim()) { toast.error('Opisz krótko, co się stało.'); return }
  sending.value = true
  const res = await cloud.reportBug(text.value, captureContext())
  sending.value = false
  if (res.ok) {
    toast.success('Dzięki! Zgłoszenie wysłane.')
    close()
  } else {
    toast.error(res.error || 'Nie udało się wysłać zgłoszenia.')
  }
}
</script>

<template>
  <button
    class="bug-fab"
    type="button"
    @click="openModal"
    aria-label="Zgłoś błąd"
    title="Zgłoś błąd"
  >
    <i class="ti ti-bug"></i>
  </button>

  <div v-if="open" class="bug-backdrop" @click.self="close" @keydown.esc="close">
    <div class="bug-modal" role="dialog" aria-modal="true" aria-labelledby="bug-title">
      <div class="bug-head">
        <i class="ti ti-bug"></i>
        <h3 id="bug-title">Zgłoś błąd</h3>
        <button class="bug-x" @click="close" aria-label="Zamknij"><i class="ti ti-x"></i></button>
      </div>

      <textarea
        v-model="text"
        class="bug-input"
        rows="4"
        maxlength="2000"
        placeholder="Co poszło nie tak? Opisz krótko, co robiłeś i co się stało."
        autofocus
      ></textarea>

      <div class="bug-context">
        <i class="ti ti-info-circle"></i>
        <span>Dołączymy automatycznie: <strong>{{ contextSummary() }}</strong> + urządzenie.</span>
      </div>

      <div class="bug-actions">
        <button class="btn" @click="close" :disabled="sending">Anuluj</button>
        <button class="btn btn-primary" @click="send" :disabled="sending" style="flex:1;">
          <i class="ti" :class="sending ? 'ti-loader-2 spin' : 'ti-send'"></i>
          {{ sending ? 'Wysyłanie…' : 'Wyślij zgłoszenie' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bug-fab {
  position: fixed;
  right: 14px;
  /* nad dolną nawigacją mobilną (żeby jej nie zasłaniać) + safe-area */
  bottom: calc(72px + env(safe-area-inset-bottom, 0px));
  z-index: 90;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--bg-elev-2);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.55;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
  transition: opacity var(--dur), color var(--dur), border-color var(--dur), transform var(--dur);
}
.bug-fab:hover {
  opacity: 1;
  color: var(--accent);
  border-color: var(--accent);
  transform: translateY(-1px);
}
/* Na desktopie nie ma dolnej nawigacji — przycisk może siedzieć niżej */
@media (min-width: 768px) {
  .bug-fab { bottom: 18px; }
}

.bug-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: var(--space-4);
  animation: bug-fade 0.15s var(--ease);
}
@keyframes bug-fade { from { opacity: 0; } to { opacity: 1; } }
.bug-modal {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  max-width: 440px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.bug-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.bug-head i { color: var(--accent); font-size: 20px; }
.bug-head h3 { flex: 1; margin: 0; font-size: 16px; font-weight: 700; }
.bug-x {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
}
.bug-x:hover { color: var(--text); }
.bug-input {
  width: 100%;
  padding: 10px 12px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  line-height: 1.4;
}
.bug-input:focus { outline: none; border-color: var(--accent); }
.bug-context {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}
.bug-context i { margin-top: 1px; flex-shrink: 0; }
.bug-actions { display: flex; gap: 8px; }
.spin { animation: bug-spin 1s linear infinite; }
@keyframes bug-spin { to { transform: rotate(360deg); } }
</style>
