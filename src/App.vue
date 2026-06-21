<script setup>
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const currentTab = computed(() => route.name || 'workout')

const tabs = [
  { name: 'workout', label: 'Trening', icon: 'ti-barbell' },
  { name: 'stats',   label: 'Statystyki', icon: 'ti-chart-line' },
  { name: 'history', label: 'Historia', icon: 'ti-history' },
  { name: 'you',     label: 'Ty', icon: 'ti-user' }
]
</script>

<template>
  <div class="app">
    <header class="header">
      <div class="brand">
        <div class="brand-logo"><i class="ti ti-barbell"></i></div>
        <div class="brand-text">Trening <span>Pro</span></div>
      </div>
      <div class="header-right">
        <span class="badge-vue">Vue migration</span>
      </div>
    </header>

    <nav class="tabs">
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
.badge-vue {
  font-size: 11px;
  padding: 4px 10px;
  background: var(--accent-soft);
  color: var(--accent);
  border-radius: 100px;
  font-weight: 600;
  border: 1px solid var(--accent-soft-2);
}
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

@media (max-width: 640px) {
  .app { padding: 1rem; }
  .tab span { display: none; }
  .tab { padding: 12px; }
}
</style>
