<script setup>
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { computed, ref, onMounted } from 'vue'
import OnboardingTour from './components/OnboardingTour.vue'
import GoalModal from './components/GoalModal.vue'
import ToastContainer from './components/ToastContainer.vue'
import DialogContainer from './components/DialogContainer.vue'
import { useSettingsStore, GOALS } from './stores/settings.js'
import { useToast } from './composables/useToast.js'

const toast = useToast()

const settings = useSettingsStore()
const showGoalModal = ref(false)
const currentGoal = computed(() => GOALS.find(g => g.key === settings.settings.goal) || GOALS[0])

const showOnboarding = ref(false)
onMounted(() => {
  // Hide splash screen
  const splash = document.getElementById('splash')
  if (splash) {
    splash.classList.add('fade')
    setTimeout(() => splash.remove(), 320)
  }
  // Show onboarding if first visit
  try {
    if (!localStorage.getItem('tp_onboarding_done_v1')) {
      showOnboarding.value = true
    }
  } catch {}

  window.addEventListener('storage-error', () => {
    toast.error('Nie udało się zapisać danych lokalnie. Sprawdź wolne miejsce w przeglądarce.', { duration: 8000 })
  })
  window.addEventListener('sync-failed', (e) => {
    console.warn('Sync operation permanently failed:', e.detail)
  })
  // Pozwala uruchomić samouczek od nowa z YouView (lub innego miejsca).
  window.addEventListener('show-onboarding', () => { showOnboarding.value = true })
})

const route = useRoute()
const currentTab = computed(() => route.name || 'workout')
const isAuthScreen = computed(() => route.name === 'login')

const tabs = [
  { name: 'workout', label: 'Trening', icon: 'ti-barbell' },
  { name: 'stats',   label: 'Statystyki', icon: 'ti-chart-line' },
  { name: 'history', label: 'Historia', icon: 'ti-history' },
  { name: 'you',     label: 'Ty', icon: 'ti-user' }
]
</script>

<template>
  <OnboardingTour v-if="showOnboarding && !isAuthScreen" @done="showOnboarding = false" />

  <RouterView v-if="isAuthScreen" />

  <div v-else class="app">
    <header class="header">
      <div class="brand">
        <div class="brand-logo"><i class="ti ti-barbell"></i></div>
        <div class="brand-text">Trening <span>Pro</span></div>
      </div>
      <div class="header-right">
        <button class="goal-badge" @click="showGoalModal = true" :title="'Cel: ' + currentGoal.label + ' (kliknij aby zmienić)'">
          <i class="ti" :class="currentGoal.icon"></i>
          <span>{{ currentGoal.label }}</span>
        </button>
      </div>
    </header>

    <GoalModal v-if="showGoalModal" @close="showGoalModal = false" />

    <ToastContainer />
    <DialogContainer />

    <nav class="tabs tabs-desktop">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.name"
        :to="{ name: tab.name }"
        class="tab"
        :class="{ active: currentTab === tab.name }"
      >
        <i class="ti" :class="tab.icon"></i>
        <span>{{ tab.label }}</span>
      </RouterLink>
    </nav>

    <main class="main">
      <RouterView />
    </main>

    <nav class="tabs-mobile">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.name"
        :to="{ name: tab.name }"
        class="tab-mobile"
        :class="{ active: currentTab === tab.name }"
      >
        <i class="ti" :class="tab.icon"></i>
        <span>{{ tab.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.app {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border);
}
.brand { display: flex; align-items: center; gap: 12px; }
.brand-logo {
  width: 38px; height: 38px; border-radius: 10px;
  background: var(--accent); color: #000;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
}
.brand-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 19px; font-weight: 700; letter-spacing: -0.5px;
}
.brand-text span { color: var(--accent); }
.goal-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  padding: 6px 12px;
  background: var(--accent-soft);
  color: var(--accent);
  border-radius: 100px;
  font-weight: 600;
  border: 1px solid var(--accent-soft-2);
  cursor: pointer;
  transition: all var(--dur) var(--ease);
}
.goal-badge:hover {
  background: var(--accent-soft-2);
  border-color: var(--accent);
}
.goal-badge i { font-size: 14px; }
.tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 1.5rem;
  background: var(--bg-elev);
  padding: 6px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
}
.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all var(--dur) var(--ease);
}
.tab:hover { color: var(--text); background: var(--bg-hover); }
.tab.active {
  background: var(--accent);
  color: #000;
  font-weight: 600;
}
.tab i { font-size: 18px; }
.main { min-height: 60vh; }

/* Mobile bottom nav */
.tabs-mobile { display: none; }

@media (max-width: 640px) {
  .app { padding: 1rem 1rem 84px; }
  .tabs-desktop { display: none; }

  .tabs-mobile {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    position: fixed;
    bottom: 0; left: 0; right: 0;
    background: rgba(15, 16, 20, 0.92);
    backdrop-filter: saturate(180%) blur(14px);
    border-top: 1px solid var(--border);
    padding: 8px 8px calc(8px + env(safe-area-inset-bottom));
    z-index: 50;
  }
  .tab-mobile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 8px 4px;
    border-radius: var(--radius-sm);
    color: var(--text-dim);
    text-decoration: none;
    font-size: 10px;
    font-weight: 500;
    transition: color var(--dur);
  }
  .tab-mobile i { font-size: 22px; }
  .tab-mobile.active { color: var(--accent); }
}
</style>
