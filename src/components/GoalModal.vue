<script setup>
import { useSettingsStore, GOALS } from '../stores/settings.js'

const settings = useSettingsStore()
const emit = defineEmits(['close'])

function pick(key) {
  settings.set('goal', key)
  emit('close')
}
</script>

<template>
  <div class="goal-modal-bg" @click.self="emit('close')" @keydown.esc="emit('close')">
    <div class="goal-modal" role="dialog" aria-modal="true" aria-labelledby="goal-modal-title">
      <div class="goal-modal-head">
        <h3 id="goal-modal-title">Cel treningowy</h3>
        <button class="close-btn" @click="emit('close')" aria-label="Zamknij">
          <i class="ti ti-x"></i>
        </button>
      </div>
      <p class="goal-modal-desc">
        Wpływa na sugestie powtórzeń, serii i intensywności przy generowaniu planów AI.
      </p>
      <ul class="goal-list">
        <li v-for="g in GOALS" :key="g.key">
          <button
            class="goal-item"
            :class="{ active: settings.settings.goal === g.key }"
            @click="pick(g.key)"
          >
            <i class="ti" :class="g.icon"></i>
            <span class="goal-item-label">{{ g.label }}</span>
            <i v-if="settings.settings.goal === g.key" class="ti ti-check goal-check"></i>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.goal-modal-bg {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fade-in 0.15s var(--ease);
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.goal-modal {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 380px;
  padding: var(--space-4);
  box-shadow: var(--shadow-lg);
  animation: rise 0.22s var(--ease-spring);
}
@keyframes rise {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to   { opacity: 1; transform: none; }
}
.goal-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}
.goal-modal-head h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
}
.close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
.close-btn:hover { background: var(--bg-hover); color: var(--text); }
.goal-modal-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0 0 var(--space-3);
}
.goal-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.goal-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all var(--dur);
}
.goal-item:hover {
  border-color: var(--accent-soft-2);
  background: var(--bg-hover);
}
.goal-item.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 600;
}
.goal-item i:not(.goal-check) { font-size: 18px; }
.goal-item-label { flex: 1; }
.goal-check {
  color: var(--accent);
  font-size: 18px;
}
</style>
