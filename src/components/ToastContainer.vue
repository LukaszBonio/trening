<script setup>
import { useToast } from '../composables/useToast'

const { toasts, dismiss, runAction } = useToast()
</script>

<template>
  <div class="toast-container" role="region" aria-live="polite" aria-label="Powiadomienia">
    <transition-group name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="toast"
        :class="`toast-${t.type}`"
        role="status"
      >
        <span class="toast-msg">{{ t.message }}</span>
        <button
          v-if="t.actionLabel && t.action"
          class="toast-action"
          @click="runAction(t)"
        >{{ t.actionLabel }}</button>
        <button
          class="toast-close"
          @click="dismiss(t.id)"
          aria-label="Zamknij powiadomienie"
        >
          <i class="ti ti-x"></i>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: max(24px, env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
  max-width: 92vw;
  width: 380px;
}

@media (max-width: 640px) {
  .toast-container {
    bottom: calc(72px + env(safe-area-inset-bottom));
    width: calc(100vw - 24px);
  }
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--bg-elev);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  color: var(--text);
  font-size: 14px;
}
.toast-success {
  border-color: var(--success);
  background: color-mix(in srgb, var(--success) 12%, var(--bg-elev));
}
.toast-error {
  border-color: var(--danger);
  background: color-mix(in srgb, var(--danger) 12%, var(--bg-elev));
}
.toast-msg { flex: 1; line-height: 1.4; }
.toast-action {
  background: transparent;
  border: 1px solid var(--accent);
  color: var(--accent);
  font-weight: 600;
  font-size: 13px;
  padding: 5px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--dur) var(--ease);
}
.toast-action:hover {
  background: var(--accent);
  color: #000;
}
.toast-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  flex-shrink: 0;
}
.toast-close:hover { color: var(--text); background: var(--bg-hover); }

.toast-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.toast-enter-active, .toast-leave-active {
  transition: opacity var(--dur) var(--ease), transform var(--dur) var(--ease);
}
</style>
