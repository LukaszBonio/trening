<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCloudStore } from '../stores/cloud.js'

const cloud = useCloudStore()
const router = useRouter()
const route = useRoute()

const mode = ref('signin')   // 'signin' | 'signup'
const email = ref('')
const password = ref('')
const busy = ref(false)
const error = ref('')
const info = ref('')

onMounted(() => {
  cloud.init()
})

function setMode(m) {
  if (busy.value) return
  mode.value = m
  error.value = ''
  info.value = ''
}

async function submit() {
  if (busy.value) return
  error.value = ''
  info.value = ''

  if (!email.value.trim() || !password.value) {
    error.value = 'Podaj e-mail i hasło.'
    return
  }
  if (mode.value === 'signup' && password.value.length < 6) {
    error.value = 'Hasło musi mieć co najmniej 6 znaków.'
    return
  }

  busy.value = true
  try {
    if (mode.value === 'signup') {
      await cloud.signUp(email.value.trim(), password.value)
      // Supabase z włączoną weryfikacją e-mail nie loguje od razu.
      if (cloud.isLoggedIn) {
        goAfterLogin()
      } else {
        info.value = 'Konto utworzone ✓ Sprawdź e-mail i potwierdź adres, a następnie zaloguj się.'
        mode.value = 'signin'
        password.value = ''
      }
    } else {
      await cloud.signIn(email.value.trim(), password.value)
      goAfterLogin()
    }
  } catch (e) {
    error.value = translateError(e?.message || String(e))
  } finally {
    busy.value = false
  }
}

function goAfterLogin() {
  const r = route.query.redirect
  if (typeof r === 'string' && r.startsWith('/')) {
    router.push(r)
  } else {
    router.push({ name: 'workout' })
  }
}

function translateError(msg) {
  const m = msg.toLowerCase()
  if (m.includes('invalid login credentials')) return 'Nieprawidłowy e-mail lub hasło.'
  if (m.includes('email not confirmed')) return 'Potwierdź adres e-mail (sprawdź skrzynkę), zanim się zalogujesz.'
  if (m.includes('user already registered')) return 'Konto z tym adresem już istnieje — zaloguj się.'
  if (m.includes('failed to fetch') || m.includes('network')) return 'Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.'
  return 'Błąd: ' + msg
}
</script>

<template>
  <div class="auth-screen">
    <div class="auth-card">
      <div class="auth-brand">
        <div class="auth-logo"><i class="ti ti-barbell"></i></div>
        <div class="auth-title">Trening <span>Pro</span></div>
      </div>
      <p class="auth-sub">
        {{ mode === 'signin' ? 'Zaloguj się, aby kontynuować.' : 'Załóż konto, aby zacząć.' }}
      </p>

      <div class="auth-toggle" role="tablist">
        <button
          type="button"
          class="toggle-btn"
          :class="{ active: mode === 'signin' }"
          @click="setMode('signin')"
        >Logowanie</button>
        <button
          type="button"
          class="toggle-btn"
          :class="{ active: mode === 'signup' }"
          @click="setMode('signup')"
        >Rejestracja</button>
      </div>

      <form class="auth-form" @submit.prevent="submit">
        <label class="auth-label">
          E-mail
          <input
            type="email"
            v-model="email"
            placeholder="email@przykład.pl"
            autocomplete="email"
            :disabled="busy"
            required
          />
        </label>
        <label class="auth-label">
          Hasło
          <input
            type="password"
            v-model="password"
            placeholder="••••••••"
            :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'"
            :disabled="busy"
            required
          />
        </label>

        <p v-if="error" class="auth-msg error">{{ error }}</p>
        <p v-if="info" class="auth-msg info">{{ info }}</p>

        <button type="submit" class="btn btn-primary auth-submit" :disabled="busy">
          <i v-if="busy" class="ti ti-loader-2 spin"></i>
          <span>{{ busy ? 'Chwila…' : (mode === 'signin' ? 'Zaloguj się' : 'Utwórz konto') }}</span>
        </button>
      </form>

      <p v-if="!cloud.isOnline" class="auth-offline">
        <i class="ti ti-cloud-off"></i> Brak połączenia — logowanie wymaga internetu.
      </p>
    </div>
    <p class="auth-foot">Twoje treningi synchronizują się między urządzeniami.</p>
  </div>
</template>

<style scoped>
.auth-screen {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 24px;
}
.auth-card {
  width: 100%;
  max-width: 400px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 32px 28px;
  box-shadow: var(--shadow-lg);
  animation: rise 380ms var(--ease-spring) both;
}
@keyframes rise {
  from { opacity: 0; transform: translateY(14px) scale(0.98); }
  to   { opacity: 1; transform: none; }
}
.auth-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}
.auth-logo {
  width: 44px; height: 44px; border-radius: 12px;
  background: var(--accent); color: #000;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
  box-shadow: var(--accent-glow);
}
.auth-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 23px; font-weight: 700; letter-spacing: -0.5px;
}
.auth-title span { color: var(--accent); }
.auth-sub {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0 0 22px;
}
.auth-toggle {
  display: flex;
  gap: 4px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 4px;
  margin-bottom: 20px;
}
.toggle-btn {
  flex: 1;
  padding: 9px 12px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  border-radius: 7px;
  transition: all var(--dur) var(--ease);
}
.toggle-btn:hover { color: var(--text); }
.toggle-btn.active {
  background: var(--accent);
  color: #000;
  font-weight: 600;
}
.auth-form { display: flex; flex-direction: column; gap: 14px; }
.auth-label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
}
.auth-label input {
  width: 100%;
  padding: 12px 14px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 15px;
  font-family: inherit;
  transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
}
.auth-label input::placeholder { color: var(--text-dim); }
.auth-label input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.auth-label input:disabled { opacity: 0.6; }
.auth-msg {
  font-size: 13px;
  margin: -2px 0 2px;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  line-height: 1.4;
}
.auth-msg.error {
  color: var(--danger);
  background: rgba(239, 68, 68, 0.10);
  border: 1px solid rgba(239, 68, 68, 0.22);
}
.auth-msg.info {
  color: var(--success);
  background: rgba(74, 222, 128, 0.10);
  border: 1px solid rgba(74, 222, 128, 0.22);
}
.auth-submit {
  width: 100%;
  padding: 13px;
  font-size: 15px;
  margin-top: 4px;
}
.auth-submit:disabled { opacity: 0.7; cursor: default; }
.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.auth-offline {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 18px;
  font-size: 13px;
  color: var(--warning);
}
.auth-foot {
  font-size: 12px;
  color: var(--text-dim);
  text-align: center;
}
</style>
