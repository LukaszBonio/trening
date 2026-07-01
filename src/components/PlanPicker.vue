<script setup>
import { computed } from 'vue'
import { PLANS } from '../lib/plans.js'
import { useCustomPlansStore } from '../stores/customPlans.js'
import { useFavoritesStore } from '../stores/favorites.js'

const props = defineProps({
  type: { type: String, required: true }
})

const emit = defineEmits(['select', 'edit-custom', 'delete-custom'])

const customPlans = useCustomPlansStore()
const favorites = useFavoritesStore()

const library = computed(() => (PLANS[props.type] || []).map(p => ({ ...p, _custom: false })))
const userPlans = computed(() => (customPlans.byType[props.type] || []).map(p => ({ ...p, _custom: true })))

const all = computed(() => {
  const combined = [...userPlans.value, ...library.value]
  // Stable sort: favorites first
  return combined.sort((a, b) => {
    const fa = favorites.isFavorite(props.type, a)
    const fb = favorites.isFavorite(props.type, b)
    if (fa !== fb) return Number(fb) - Number(fa)
    return 0
  })
})

function toggleFav(plan, e) {
  e.stopPropagation()
  favorites.toggle(props.type, plan)
}
</script>

<template>
  <div class="plan-picker">
    <div
      v-for="plan in all"
      :key="plan._custom ? plan.id : `lib_${plan.name}`"
      class="plan-card"
      :class="{ custom: plan._custom, favorite: favorites.isFavorite(type, plan) }"
      @click="emit('select', plan)"
    >
      <div class="plan-top">
        <div class="plan-name">
          {{ plan.name }}
          <span v-if="plan._custom" class="custom-badge">własny</span>
        </div>
        <button
          class="fav-btn"
          :class="{ active: favorites.isFavorite(type, plan) }"
          @click="toggleFav(plan, $event)"
          :aria-label="favorites.isFavorite(type, plan) ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'"
          :aria-pressed="favorites.isFavorite(type, plan)"
        >
          <i class="ti" :class="favorites.isFavorite(type, plan) ? 'ti-star-filled' : 'ti-star'"></i>
        </button>
      </div>
      <div class="plan-meta">
        {{ plan.exercises.length }} ćwiczeń ·
        {{ plan.exercises.reduce((s, e) => s + e.sets, 0) }} serii
      </div>
      <div v-if="plan._custom" class="custom-actions">
        <button class="btn-tiny" @click.stop="emit('edit-custom', plan)">
          <i class="ti ti-pencil"></i> Edytuj
        </button>
        <button class="btn-tiny btn-tiny-danger" @click.stop="emit('delete-custom', plan)">
          <i class="ti ti-trash"></i>
        </button>
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
  padding: 12px 14px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--dur) var(--ease);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.plan-card:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.plan-card.custom { border-style: dashed; }
.plan-card.favorite { border-color: var(--accent-soft-2); }

.plan-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}
.plan-name {
  font-weight: 600;
  font-size: 14px;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.custom-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  background: var(--accent-soft);
  color: var(--accent);
  border-radius: 100px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.plan-meta {
  font-size: 12px;
  color: var(--text-muted);
}
.fav-btn {
  background: transparent;
  border: none;
  color: var(--text-dim);
  font-size: 16px;
  padding: 0;
  cursor: pointer;
  transition: color var(--dur);
}
.fav-btn.active { color: var(--accent); }
.fav-btn:hover { color: var(--accent); }

.custom-actions { display: flex; gap: 6px; margin-top: 4px; }
.btn-tiny {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.btn-tiny:hover { color: var(--text); border-color: var(--border-strong); }
.btn-tiny-danger:hover { color: var(--danger); border-color: var(--danger); }
</style>
