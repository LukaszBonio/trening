<script setup>
import { ref, onMounted } from 'vue'
import { useCloudStore } from '../stores/cloud.js'
import { useProfileStore } from '../stores/profile.js'
import { useWorkoutsStore } from '../stores/workouts.js'
import { useBodyStore } from '../stores/body.js'
import { useSettingsStore } from '../stores/settings.js'
import BodyLogChart from '../components/BodyLogChart.vue'
import { permission as notifPermission, requestPermission as requestNotifPermission, isSupported as notifSupported } from '../lib/notifications.js'

const cloud = useCloudStore()
const profile = useProfileStore()
const workouts = useWorkoutsStore()
const body = useBodyStore()
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

const newWeight = ref('')
const newDate = ref(new Date().toISOString().slice(0, 10))

function addBodyEntry() {
  const w = Number(newWeight.value)
  if (!w || w < 20 || w > 300) {
    alert('Wpisz wagę między 20 a 300 kg')
    return
  }
  body.addEntry(w, newDate.value)
  newWeight.value = ''
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

async function logout() {
  if (confirm('Wylogować się? Dane lokalne zostaną zachowane.')) {
    await cloud.signOut()
    message.value = 'Wylogowano'
  }
}

function exportBackup() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    profiles: profile.profiles,
    activeProfileId: profile.activeId,
    history: workouts.history,
    body: body.entries
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

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result)
      if (!confirm(`Import: ${data.history?.length || 0} treningów, ${data.body?.length || 0} pomiarów wagi. Zastąpić obecne dane?`)) return
      if (Array.isArray(data.history)) workouts.setHistory(data.history)
      if (Array.isArray(data.body)) body.entries = data.body
      message.value = 'Import zakończony ✓'
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
    <div class="card">
      <h2 class="card-title">Konto chmurowe</h2>

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
    </div>

    <!-- Settings -->
    <details class="card collapsible">
      <summary>
        <span class="card-title" style="margin: 0">Ustawienia</span>
        <i class="ti ti-chevron-down collapsible-chevron"></i>
      </summary>
      <div class="collapsible-body settings-grid">
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
      </div>
    </details>

    <!-- Body log -->
    <div class="card">
      <h2 class="card-title">Waga ciała</h2>
      <div v-if="body.latest" class="body-current">
        <div>
          <div class="dim">Aktualna</div>
          <div class="body-weight">{{ body.latest.weight }}<small>kg</small></div>
        </div>
        <div v-if="body.trend !== null" class="body-trend" :class="{ down: body.trend < 0, up: body.trend > 0 }">
          {{ body.trend > 0 ? '+' : '' }}{{ body.trend }}<small>kg</small>
          <div class="dim" style="font-size: 11px; font-weight: 400;">od początku</div>
        </div>
      </div>

      <form @submit.prevent="addBodyEntry" class="body-form">
        <input
          type="number"
          step="0.1"
          inputmode="decimal"
          v-model="newWeight"
          placeholder="Waga (kg)"
          required
        />
        <input type="date" v-model="newDate" required />
        <button type="submit" class="btn btn-primary">
          <i class="ti ti-plus"></i> Dodaj
        </button>
      </form>

      <BodyLogChart :entries="body.sortedAsc" style="margin-top: var(--space-4)" />

      <details v-if="body.entries.length" style="margin-top: var(--space-4)">
        <summary style="cursor: pointer; color: var(--text-muted); font-size: 13px;">
          Historia pomiarów ({{ body.entries.length }})
        </summary>
        <ul class="body-history">
          <li v-for="e in body.sortedDesc" :key="e.id" class="body-entry">
            <span class="body-date">{{ e.date }}</span>
            <span class="body-w">{{ e.weight }}kg</span>
            <button class="btn-tiny-icon" @click="body.removeEntry(e.id)">
              <i class="ti ti-x"></i>
            </button>
          </li>
        </ul>
      </details>
    </div>

    <!-- Backup -->
    <details class="card collapsible">
      <summary>
        <span class="card-title" style="margin: 0">Kopia zapasowa (JSON)</span>
        <i class="ti ti-chevron-down collapsible-chevron"></i>
      </summary>
      <div class="collapsible-body">
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
      </div>
    </details>

    <!-- Profiles -->
    <details class="card collapsible">
      <summary>
        <span class="card-title" style="margin: 0">Profile lokalne</span>
        <i class="ti ti-chevron-down collapsible-chevron"></i>
      </summary>
      <div class="collapsible-body">
        <p class="muted" style="margin-bottom: var(--space-3)">
          Aktywny: <strong>{{ profile.activeProfile?.name }}</strong>
        </p>
        <ul class="profile-list">
          <li v-for="p in profile.profiles" :key="p.id" class="profile-row">
            <button
              class="profile-name"
              :class="{ active: p.id === profile.activeId }"
              @click="profile.setActive(p.id)"
            >
              {{ p.name }}
            </button>
            <button
              v-if="profile.profiles.length > 1"
              class="btn-tiny"
              @click="profile.removeProfile(p.id)"
            >
              <i class="ti ti-trash"></i>
            </button>
          </li>
        </ul>
        <button
          class="btn-tiny"
          @click="(() => { const n = prompt('Nazwa profilu:'); if (n) profile.addProfile(n) })()"
        >
          <i class="ti ti-plus"></i> Dodaj profil
        </button>
      </div>
    </details>
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

.collapsible > summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  list-style: none;
}
.collapsible > summary::-webkit-details-marker { display: none; }
.collapsible[open] .collapsible-chevron { transform: rotate(180deg); }
.collapsible-chevron { transition: transform var(--dur); color: var(--text-dim); }
.collapsible-body { margin-top: var(--space-4); }

.backup-actions { display: flex; gap: 8px; }

.profile-list { list-style: none; display: flex; flex-direction: column; gap: 6px; margin-bottom: var(--space-3); }
.profile-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}
.profile-name {
  flex: 1;
  text-align: left;
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 14px;
}
.profile-name.active { color: var(--accent); font-weight: 600; }
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

.body-current {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border);
}
.body-current .dim { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
.body-weight {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 38px;
  font-weight: 700;
  color: var(--accent);
}
.body-weight small { font-size: 14px; opacity: 0.6; margin-left: 2px; }
.body-trend {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 22px;
  font-weight: 700;
  text-align: right;
}
.body-trend.down { color: var(--success); }
.body-trend.up { color: var(--warning); }
.body-trend small { font-size: 12px; opacity: 0.7; margin-left: 2px; }

.body-form {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 8px;
}
.body-form input {
  padding: 10px 14px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 14px;
  font-family: inherit;
}
.body-form input:focus { outline: none; border-color: var(--accent); }

.body-history { list-style: none; display: flex; flex-direction: column; gap: 4px; margin-top: var(--space-3); }
.body-entry {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: var(--space-3);
  padding: 8px 12px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  align-items: center;
}
.body-date { font-size: 12px; color: var(--text-muted); }
.body-w { font-size: 14px; font-weight: 600; }
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

@media (max-width: 540px) {
  .body-form { grid-template-columns: 1fr 1fr; }
  .body-form button { grid-column: 1 / -1; }
}
</style>
