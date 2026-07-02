<script setup>
import { computed } from 'vue'
import { useWorkoutsStore } from '../stores/workouts.js'
import { useBodyStore } from '../stores/body.js'
import { computeAchievements, unlockedCount } from '../lib/achievements'

const workouts = useWorkoutsStore()
const body = useBodyStore()

const achievements = computed(() => computeAchievements(workouts.history, body.entries))
const unlocked = computed(() => unlockedCount(achievements.value))

const sorted = computed(() => {
  return [...achievements.value].sort((a, b) => {
    if (!!b.unlockedAt - !!a.unlockedAt !== 0) return !!b.unlockedAt - !!a.unlockedAt
    if (a.unlockedAt && b.unlockedAt) return b.unlockedAt.localeCompare(a.unlockedAt)
    if (a.progress && b.progress) {
      return (b.progress.current / b.progress.target) - (a.progress.current / a.progress.target)
    }
    return 0
  })
})
</script>

<template>
  <div class="achievements">
    <div class="achievements-header">
      <h3 class="card-title" style="margin: 0">Osiągnięcia</h3>
      <span class="ach-count">{{ unlocked }} / {{ achievements.length }}</span>
    </div>

    <div class="ach-grid">
      <div
        v-for="a in sorted"
        :key="a.id"
        class="ach-card"
        :class="{ locked: !a.unlockedAt }"
      >
        <div class="ach-icon">
          <i class="ti" :class="a.icon"></i>
        </div>
        <div class="ach-body">
          <div class="ach-title">{{ a.title }}</div>
          <div class="ach-desc">{{ a.desc }}</div>
          <div v-if="a.unlockedAt" class="ach-date">
            {{ new Date(a.unlockedAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' }) }}
          </div>
          <div v-else-if="a.progress" class="ach-progress">
            <div class="ach-progress-bar">
              <div class="ach-progress-fill" :style="{ width: Math.min(100, a.progress.current / a.progress.target * 100) + '%' }"></div>
            </div>
            <div class="ach-progress-text">{{ a.progress.current }} / {{ a.progress.target }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.achievements-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}
.ach-count {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--accent);
}
.ach-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}
.ach-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: all var(--dur);
}
.ach-card.locked { opacity: 0.5; }
.ach-card:not(.locked):hover {
  border-color: var(--accent-soft-2);
  background: color-mix(in srgb, var(--accent) 5%, var(--bg-elev-2));
}
.ach-icon {
  width: 44px; height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  background: var(--accent-soft);
  color: var(--accent);
  flex-shrink: 0;
}
.ach-card.locked .ach-icon {
  background: var(--bg-elev);
  color: var(--text-dim);
}
.ach-body { flex: 1; min-width: 0; }
.ach-title { font-weight: 600; font-size: 14px; }
.ach-desc { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.ach-date { font-size: 11px; color: var(--text-dim); margin-top: 4px; }
.ach-progress { margin-top: 6px; }
.ach-progress-bar {
  height: 4px;
  background: var(--bg-elev);
  border-radius: 100px;
  overflow: hidden;
}
.ach-progress-fill {
  height: 100%;
  background: var(--accent);
}
.ach-progress-text {
  font-size: 11px;
  color: var(--text-dim);
  margin-top: 4px;
}
</style>
