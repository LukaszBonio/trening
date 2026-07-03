<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCloudStore } from '../stores/cloud'
import { REQUIRE_AUTH } from '../lib/authConfig'
import { useWorkoutsStore } from '../stores/workouts'
import { useSettingsStore } from '../stores/settings'
import { permission as notifPermission, requestPermission as requestNotifPermission, isSupported as notifSupported } from '../lib/notifications'
import { transformLegacyEntry } from '../lib/migration'
import { useDialog } from '../composables/useDialog'
import { useToast } from '../composables/useToast'
import BaseCard from '../components/BaseCard.vue'

const dialog = useDialog()
const toast = useToast()

const cloud = useCloudStore()
const router = useRouter()
const workouts = useWorkoutsStore()
const settingsStore = useSettingsStore()

const COLORS = [
  '#d4ff3a', '#ff5f4a', '#4a8eff', '#b566ff',
  '#4ade80', '#fb923c', '#f472b6', '#22d3ee'
]

const notifState = ref(notifSupported() ? notifPermission() : 'unsupported')

async function enableNotifications() {
  const result = await requestNotifPermission()
  notifState.value = result
}

const email = ref('')
const password = ref('')
const mode = ref('signin')  // 'signin' | 'signup'
const busy = ref(false)
const message = ref('')

onMounted(() => {
  cloud.init()
})

async function submit() {
  busy.value = true
  message.value = ''
  try {
    if (mode.value === 'signup') {
      await cloud.signUp(email.value, password.value)
      message.value = 'Konto utworzone ✓'
    } else {
      await cloud.signIn(email.value, password.value)
      message.value = 'Zalogowano ✓'
    }
    email.value = ''
    password.value = ''
  } catch (e) {
    message.value = 'Błąd: ' + (e.message || e)
  } finally {
    busy.value = false
  }
}

function showOnboardingTour() {
  try { localStorage.removeItem('tp_onboarding_done_v1') } catch {}
  window.dispatchEvent(new CustomEvent('show-onboarding'))
}

async function logout() {
  const ok = await dialog.confirm('Wylogować się? Dane lokalne zostaną zachowane.', {
    title: 'Wyloguj się',
    okLabel: 'Wyloguj'
  })
  if (!ok) return
  await cloud.signOut()
  message.value = 'Wylogowano'
  if (REQUIRE_AUTH) router.push({ name: 'login' })
}

function exportBackup() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    history: workouts.history
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `trening-pro-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const fileInput = ref(null)

function importBackup() {
  fileInput.value?.click()
}

// Limit rozmiaru pliku backup'u — backup średniego usera to ~50KB, 10MB to z dużym zapasem.
// Bez limitu, JSON.parse na 1GB pliku zawiesi przeglądarkę.
const MAX_BACKUP_SIZE = 10 * 1024 * 1024 // 10 MB

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > MAX_BACKUP_SIZE) {
    toast.error(`Plik za duży (${(file.size / 1024 / 1024).toFixed(1)} MB). Maksymalnie 10 MB.`)
    e.target.value = ''
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result)

      // Detekcja formatu: legacy (profiles.history) vs nowy (history flat)
      let importHistory = []
      let importBody = []
      let detectedFormat = 'unknown'

      if (Array.isArray(data.history) && data.history.length && data.history[0].exercises?.[0]?.sets && Array.isArray(data.history[0].exercises[0].sets)) {
        // Nowy format Vue: exercises[i].sets to tablica
        importHistory = data.history
        importBody = Array.isArray(data.body) ? data.body : []
        detectedFormat = 'vue'
      } else if (Array.isArray(data.profiles) || data.activeId) {
        // Legacy format: profiles.history
        detectedFormat = 'legacy-profiles'
        const profiles = Array.isArray(data.profiles) ? data.profiles : []
        const seenIds = new Set()
        for (const p of profiles) {
          for (const entry of (p.history || [])) {
            if (entry?.id && !seenIds.has(entry.id)) {
              seenIds.add(entry.id)
              const transformed = transformLegacyEntry(entry)
              if (transformed) importHistory.push(transformed)
            }
          }
          // Body log w profilu
          for (const e of (p.bodyLog || p.weightLog || [])) {
            if (e?.weight || e?.kg) {
              importBody.push({
                id: e.id || `b_imp_${e.date || Date.now()}`,
                date: e.date || new Date().toISOString().slice(0, 10),
                weight: Number(e.weight || e.kg)
              })
            }
          }
        }
      } else if (Array.isArray(data.history) && data.history.length && (data.history[0].kg !== undefined || typeof data.history[0].exercises?.[0]?.sets === 'number')) {
        // Legacy format płaski: history bezpośrednio (bez profili wrappera)
        detectedFormat = 'legacy-flat'
        importHistory = data.history.map(transformLegacyEntry).filter(Boolean)
        importBody = Array.isArray(data.body) ? data.body : []
      } else if (Array.isArray(data.history)) {
        // Nieznany kształt — spróbuj jako Vue
        importHistory = data.history
        importBody = Array.isArray(data.body) ? data.body : []
        detectedFormat = 'fallback-vue'
      }

      if (!importHistory.length && !importBody.length) {
        message.value = 'Plik nie zawiera danych treningowych'
        return
      }

      const msg = `Wykryto format: ${detectedFormat}\n${importHistory.length} treningów, ${importBody.length} pomiarów wagi.\n\nZastąpić obecne dane?`
      dialog.confirm(msg, { title: 'Import danych', okLabel: 'Zastąp', danger: true }).then(ok => {
        if (!ok) return
        if (importHistory.length) workouts.setHistory(importHistory)
        message.value = `Import zakończony ✓ (${importHistory.length} treningów)`
        toast.success(`Zaimportowano ${importHistory.length} treningów`)
      })
      return
    } catch (err) {
      message.value = 'Błąd importu: ' + err.message
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}
</script>

<template>
  <div class="you-view">
    <!-- Cloud account -->
    <BaseCard title="Konto chmurowe" tag="h2">

      <div v-if="cloud.user" class="logged-in">
        <div class="user-info">
          <div class="dim">Zalogowano jako</div>
          <div class="user-email">{{ cloud.user.email }}</div>
          <div class="sync-status" :class="cloud.syncStatus">
            <i class="ti" :class="{
              'ti-cloud-check': cloud.syncStatus === 'ok' && cloud.queueSize === 0,
              'ti-cloud-upload': cloud.syncStatus === 'syncing',
              'ti-cloud-x': cloud.syncStatus === 'error',
              'ti-cloud-off': !cloud.isOnline,
              'ti-cloud': cloud.syncStatus === 'idle'
            }"></i>
            <span v-if="!cloud.isOnline">Offline · {{ cloud.queueSize }} operacji w kolejce</span>
            <span v-else-if="cloud.queueSize > 0">Synchronizuję {{ cloud.queueSize }} operacji…</span>
            <span v-else-if="cloud.syncStatus === 'syncing'">Synchronizacja…</span>
            <span v-else-if="cloud.syncStatus === 'ok'">Zsynchronizowano</span>
            <span v-else-if="cloud.syncStatus === 'error'">Błąd: {{ cloud.lastError }}</span>
            <span v-else>Oczekiwanie</span>
          </div>
        </div>
        <div class="account-actions">
          <button class="btn-tiny" @click="cloud.forceSync()" :disabled="cloud.syncStatus === 'syncing'">
            <i class="ti ti-refresh"></i> Synchronizuj
          </button>
          <button class="btn" @click="logout">Wyloguj</button>
        </div>
      </div>

      <div v-else>
        <p class="muted" style="margin-bottom: var(--space-3)">
          Załóż konto, by synchronizować treningi między urządzeniami.
        </p>
        <form @submit.prevent="submit" class="auth-form">
          <input
            type="email"
            v-model="email"
            placeholder="email@przykład.pl"
            required
            autocomplete="email"
          />
          <input
            type="password"
            v-model="password"
            placeholder="hasło (min. 6 znaków)"
            required
            minlength="6"
            :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'"
          />
          <button type="submit" class="btn btn-primary" :disabled="busy">
            {{ mode === 'signup' ? 'Zarejestruj' : 'Zaloguj' }}
          </button>
          <button
            type="button"
            class="btn-link"
            @click="mode = mode === 'signup' ? 'signin' : 'signup'"
          >
            {{ mode === 'signup' ? 'Mam już konto' : 'Stwórz konto' }}
          </button>
        </form>
        <p v-if="message" class="auth-msg">{{ message }}</p>
      </div>
    </BaseCard>

    <!-- Settings -->
    <BaseCard collapsible title="Ustawienia">
      <div class="settings-grid">
        <label class="setting">
          <span>Domyślny czas odpoczynku</span>
          <select v-model.number="settingsStore.settings.restTimerDefault">
            <option :value="60">60s</option>
            <option :value="90">90s</option>
            <option :value="120">120s</option>
            <option :value="150">150s</option>
            <option :value="180">180s</option>
            <option :value="240">240s</option>
          </select>
        </label>

        <label class="setting">
          <span>Jednostki ciężaru</span>
          <select v-model="settingsStore.settings.units">
            <option value="kg">Kilogramy (kg)</option>
            <option value="lb">Funty (lb)</option>
          </select>
        </label>

        <label class="setting">
          <span>Motyw</span>
          <select v-model="settingsStore.settings.theme">
            <option value="dark">Ciemny</option>
            <option value="light">Jasny</option>
          </select>
        </label>

        <label class="setting">
          <span>Tryb sesji treningowej</span>
          <select v-model="settingsStore.settings.workoutMode">
            <option value="cards">Karty (po partiach)</option>
            <option value="list">Pełna lista</option>
          </select>
        </label>

        <label class="setting setting-toggle">
          <span>Auto-start timera po serii</span>
          <input type="checkbox" v-model="settingsStore.settings.autoStartTimer" />
        </label>

        <label class="setting setting-toggle">
          <span>Pokazuj RPE w sesji</span>
          <input type="checkbox" v-model="settingsStore.settings.showRpe" />
        </label>

        <div class="setting">
          <span>Powiadomienia o końcu przerwy</span>
          <button
            v-if="notifState === 'default'"
            class="btn-tiny"
            @click="enableNotifications"
          >
            Włącz
          </button>
          <span v-else-if="notifState === 'granted'" class="setting-status ok">
            <i class="ti ti-check"></i> Aktywne
          </span>
          <span v-else-if="notifState === 'denied'" class="setting-status denied">
            Zablokowane w przeglądarce
          </span>
          <span v-else class="setting-status denied">Niedostępne</span>
        </div>

        <div class="setting">
          <span>Kolor akcentu</span>
          <div class="color-picker">
            <button
              v-for="c in COLORS"
              :key="c"
              class="color-swatch"
              :class="{ active: settingsStore.settings.accentColor === c }"
              :style="{ background: c }"
              :title="c"
              @click="settingsStore.settings.accentColor = c"
            ></button>
          </div>
        </div>

        <div class="setting">
          <span>Samouczek</span>
          <button class="btn-tiny" @click="showOnboardingTour">
            <i class="ti ti-help"></i> Pokaż od nowa
          </button>
        </div>
      </div>
    </BaseCard>

    <!-- Backup -->
    <BaseCard collapsible title="Kopia zapasowa (JSON)">
        <p class="muted" style="margin-bottom: var(--space-3)">
          Lokalna kopia zapasowa danych. Możesz później zaimportować z innego urządzenia.
        </p>
        <div class="backup-actions">
          <button class="btn" @click="exportBackup">
            <i class="ti ti-download"></i> Eksportuj
          </button>
          <button class="btn" @click="importBackup">
            <i class="ti ti-upload"></i> Importuj
          </button>
          <input ref="fileInput" type="file" accept="application/json" style="display:none" @change="onFileChange" />
        </div>
    </BaseCard>

  </div>
</template>

<style scoped>
.you-view { display: flex; flex-direction: column; gap: var(--space-3); }

.logged-in {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
}
.user-info .dim { font-size: 12px; }
.user-email { font-size: 15px; font-weight: 600; margin-top: 2px; }
.sync-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-muted);
}
.sync-status.ok { color: var(--success); }
.sync-status.syncing { color: var(--accent); }
.sync-status.error { color: var(--danger); }
.account-actions { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; }

.auth-form { display: flex; flex-direction: column; gap: 10px; }
.auth-form input {
  padding: 12px 14px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 14px;
  font-family: inherit;
}
.auth-form input:focus { outline: none; border-color: var(--accent); }
.btn-link {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 13px;
  text-decoration: underline;
  padding: 8px;
  align-self: center;
}
.btn-link:hover { color: var(--text); }
.auth-msg {
  margin-top: var(--space-3);
  padding: 10px 14px;
  background: var(--bg-elev-2);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--text-muted);
}


.backup-actions { display: flex; gap: 8px; }

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

.settings-grid { display: flex; flex-direction: column; gap: 14px; }
.setting {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  font-size: 14px;
}
.setting > span { color: var(--text-muted); }
.setting select {
  padding: 8px 12px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 13px;
  font-family: inherit;
  min-width: 160px;
}
.setting select:focus { outline: none; border-color: var(--accent); }
.setting-toggle input[type=checkbox] {
  width: 44px;
  height: 24px;
  appearance: none;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: 100px;
  position: relative;
  cursor: pointer;
  transition: all var(--dur);
}
.setting-toggle input[type=checkbox]::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  background: var(--text-muted);
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: all var(--dur);
}
.setting-toggle input[type=checkbox]:checked {
  background: var(--accent);
  border-color: var(--accent);
}
.setting-toggle input[type=checkbox]:checked::after {
  background: #000;
  transform: translateX(20px);
}
.color-picker { display: flex; gap: 6px; flex-wrap: wrap; }
.color-swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform var(--dur);
}
.color-swatch.active {
  border-color: #fff;
  transform: scale(1.15);
}
.color-swatch:hover { transform: scale(1.1); }

.setting-status {
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.setting-status.ok { color: var(--success); }
.setting-status.denied { color: var(--text-dim); }

</style>
