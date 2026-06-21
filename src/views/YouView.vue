<script setup>
import { ref, onMounted } from 'vue'
import { useCloudStore } from '../stores/cloud.js'
import { useProfileStore } from '../stores/profile.js'
import { useWorkoutsStore } from '../stores/workouts.js'

const cloud = useCloudStore()
const profile = useProfileStore()
const workouts = useWorkoutsStore()

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

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result)
      if (!confirm(`Import: ${data.history?.length || 0} treningów, ${data.profiles?.length || 0} profili. Zastąpić obecne dane?`)) return
      if (Array.isArray(data.history)) workouts.setHistory(data.history)
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
              'ti-cloud-check': cloud.syncStatus === 'ok',
              'ti-cloud-upload': cloud.syncStatus === 'syncing',
              'ti-cloud-x': cloud.syncStatus === 'error',
              'ti-cloud': cloud.syncStatus === 'idle'
            }"></i>
            <span v-if="cloud.syncStatus === 'syncing'">Synchronizacja…</span>
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
</style>
