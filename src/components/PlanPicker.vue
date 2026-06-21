<script setup>
import { ref, computed } from 'vue'
import { PLANS } from '../lib/db.js'

const props = defineProps({
  type: { type: String, required: true }
})

const emit = defineEmits(['select'])

const plans = computed(() => PLANS[props.type] || [])
</script>

<template>
  <div class="plan-picker">
    <div
      v-for="(plan, i) in plans"
      :key="i"
      class="plan-card"
      @click="emit('select', plan)"
    >
      <div class="plan-name">{{ plan.name }}</div>
      <div class="plan-meta">
        {{ plan.exercises.length }} ćwiczeń ·
        {{ plan.exercises.reduce((s, e) => s + e.sets, 0) }} serii
      </div>
    </div>
  </div>
</template>

<style scoped>
.plan-picker {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}
.plan-card {
  padding: 14px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--dur) var(--ease);
}
.plan-card:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.plan-name { font-weight: 600; margin-bottom: 4px; }
.plan-meta { font-size: 12px; color: var(--text-muted); }
</style>
