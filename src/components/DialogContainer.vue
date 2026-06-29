<script setup>
import { ref, watch, nextTick } from 'vue'
import { useDialog } from '../composables/useDialog.js'

const { current } = useDialog()
const inputRef = ref(null)
const promptValue = ref('')

watch(current, async (d) => {
  if (d?.type === 'prompt') {
    promptValue.value = d.defaultValue || ''
  }
  await nextTick()
  if (d?.type === 'prompt') inputRef.value?.focus()
  else if (d) {
    // Focus na primary action button
    document.querySelector('.dialog-actions .btn-primary')?.focus()
  }
})

function ok() {
  if (!current.value) return
  if (current.value.type === 'prompt') {
    current.value.resolve(promptValue.value.trim() || null)
  } else if (current.value.type === 'confirm') {
    current.value.resolve(true)
  } else {
    current.value.resolve(undefined)
  }
}

function cancel() {
  if (!current.value) return
  if (current.value.type === 'prompt') current.value.resolve(null)
  else if (current.value.type === 'confirm') current.value.resolve(false)
  else current.value.resolve(undefined)
}

function onSubmit(e) {
  e.preventDefault()
  ok()
}
</script>

<template>
  <transition name="dialog-fade">
    <div
      v-if="current"
      class="dialog-bg"
      @click.self="cancel"
      @keydown.esc="cancel"
    >
      <div
        class="dialog"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="current.type === 'prompt' ? null : 'dialog-msg'"
        tabindex="-1"
      >
        <form @submit="onSubmit" v-if="current.type === 'prompt'">
          <h3 class="dialog-title">{{ current.title || 'Wpisz wartość' }}</h3>
          <label class="dialog-label" for="dialog-input">{{ current.message }}</label>
          <input
            id="dialog-input"
            ref="inputRef"
            v-model="promptValue"
            class="dialog-input"
            type="text"
            :placeholder="current.placeholder || ''"
          />
          <div class="dialog-actions">
            <button type="button" class="btn" @click="cancel">{{ current.cancelLabel || 'Anuluj' }}</button>
            <button type="submit" class="btn btn-primary">{{ current.okLabel || 'OK' }}</button>
          </div>
        </form>

        <template v-else>
          <h3 v-if="current.title" class="dialog-title">{{ current.title }}</h3>
          <p id="dialog-msg" class="dialog-msg">{{ current.message }}</p>
          <div class="dialog-actions">
            <button v-if="current.type === 'confirm'" type="button" class="btn" @click="cancel">
              {{ current.cancelLabel || 'Anuluj' }}
            </button>
            <button
              type="button"
              class="btn btn-primary"
              :class="{ 'btn-danger': current.danger }"
              @click="ok"
            >{{ current.okLabel || (current.type === 'confirm' ? 'OK' : 'Rozumiem') }}</button>
          </div>
        </template>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.dialog-bg {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 250;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.dialog {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 400px;
  padding: 22px 24px 18px;
  box-shadow: var(--shadow-lg);
  animation: dialog-rise 0.22s var(--ease-spring) both;
}
@keyframes dialog-rise {
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to { opacity: 1; transform: none; }
}
.dialog-title {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
}
.dialog-msg {
  margin: 0 0 18px;
  font-size: 14px;
  color: var(--text-soft, var(--text));
  line-height: 1.5;
  white-space: pre-wrap;
}
.dialog-label {
  display: block;
  margin: 4px 0 6px;
  font-size: 13px;
  color: var(--text-muted);
}
.dialog-input {
  width: 100%;
  padding: 10px 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 14px;
  margin-bottom: 18px;
  font-family: inherit;
}
.dialog-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.dialog-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.dialog-actions .btn { padding: 9px 16px; }

.dialog-fade-enter-active, .dialog-fade-leave-active {
  transition: opacity 0.15s ease;
}
.dialog-fade-enter-from, .dialog-fade-leave-to { opacity: 0; }
</style>
