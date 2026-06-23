<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

const props = defineProps({
  workouts: { type: Array, required: true }
})

const WEEKS_TO_SHOW = 26  // ostatnie ~6 miesięcy
const todayISO = new Date().toISOString().slice(0, 10)
const scrollEl = ref(null)

// Map: 'YYYY-MM-DD' → [workouts]
const byDate = computed(() => {
  const map = new Map()
  for (const w of props.workouts) {
    const key = new Date(w.date).toISOString().slice(0, 10)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(w)
  }
  return map
})

// Grid: array of weeks, each week is 7 days (Mon-Sun)
const grid = computed(() => {
  const today = new Date()
  // Find this week's Sunday
  const sunday = new Date(today)
  sunday.setDate(today.getDate() + (7 - today.getDay()) % 7)
  // Start = sunday - (26 * 7) days, then back to Monday
  const start = new Date(sunday)
  start.setDate(sunday.getDate() - (WEEKS_TO_SHOW * 7) + 1)
  // Adjust start to Monday
  const dow = (start.getDay() + 6) % 7  // 0=Mon...6=Sun
  start.setDate(start.getDate() - dow)

  const weeks = []
  let cursor = new Date(start)
  for (let w = 0; w < WEEKS_TO_SHOW + 1; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const iso = cursor.toISOString().slice(0, 10)
      const items = byDate.value.get(iso) || []
      week.push({
        date: iso,
        count: items.length,
        items,
        isFuture: cursor > today
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
})

// Month labels — show at first week of each month
const monthLabels = computed(() => {
  const labels = []
  let lastMonth = -1
  grid.value.forEach((week, wi) => {
    const firstDay = new Date(week[0].date)
    if (firstDay.getMonth() !== lastMonth && firstDay.getDate() <= 7) {
      labels.push({ x: wi, label: firstDay.toLocaleDateString('pl-PL', { month: 'short' }) })
      lastMonth = firstDay.getMonth()
    }
  })
  return labels
})

function cellClass(cell) {
  if (cell.isFuture) return 'future'
  if (cell.count === 0) return 'empty'
  if (cell.count === 1) return 'level-1'
  if (cell.count === 2) return 'level-2'
  return 'level-3'
}

const selected = ref(null)

function selectCell(cell) {
  if (cell.count === 0 || cell.isFuture) {
    selected.value = null
    return
  }
  selected.value = cell
}

onMounted(async () => {
  await nextTick()
  if (scrollEl.value) {
    scrollEl.value.scrollLeft = scrollEl.value.scrollWidth
  }
})
</script>

<template>
  <div class="heatmap-wrap">
    <div class="heatmap-scroll" ref="scrollEl">
      <div class="heatmap-months">
        <span
          v-for="m in monthLabels"
          :key="m.x"
          class="month-label"
          :style="{ left: m.x * 14 + 'px' }"
        >
          {{ m.label }}
        </span>
      </div>
      <div class="heatmap-grid">
        <div v-for="(week, wi) in grid" :key="wi" class="hm-col">
          <button
            v-for="(cell, di) in week"
            :key="di"
            class="hm-cell"
            :class="[cellClass(cell), { today: cell.date === todayISO }]"
            :title="cell.date + (cell.count ? ` · ${cell.count} ${cell.count === 1 ? 'trening' : 'treningi'}` : '')"
            @click="selectCell(cell)"
          ></button>
        </div>
      </div>
    </div>

    <div class="heatmap-legend">
      <span class="muted" style="font-size: 11px;">mniej</span>
      <span class="hm-cell empty"></span>
      <span class="hm-cell level-1"></span>
      <span class="hm-cell level-2"></span>
      <span class="hm-cell level-3"></span>
      <span class="muted" style="font-size: 11px;">więcej</span>
    </div>

    <div v-if="selected" class="heatmap-detail">
      <div class="detail-date">{{ new Date(selected.date).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' }) }}</div>
      <ul class="detail-list">
        <li v-for="w in selected.items" :key="w.id">
          <span class="type-pill" :class="`type-${w.type}`">{{ w.type.toUpperCase() }}</span>
          {{ w.planName }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.heatmap-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.heatmap-scroll {
  overflow-x: auto;
  padding-top: 18px;
  position: relative;
}
.heatmap-months {
  position: relative;
  height: 16px;
  font-size: 10px;
  color: var(--text-muted);
  margin-bottom: 4px;
  margin-top: -18px;
}
.month-label {
  position: absolute;
  white-space: nowrap;
  text-transform: capitalize;
}
.heatmap-grid {
  display: flex;
  gap: 3px;
}
.hm-col { display: flex; flex-direction: column; gap: 3px; }
.hm-cell {
  width: 11px;
  height: 11px;
  border-radius: 2px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: transform var(--dur);
  padding: 0;
}
.hm-cell:hover { transform: scale(1.4); border-color: var(--accent); }
.hm-cell.empty { opacity: 0.6; cursor: default; }
.hm-cell.empty:hover { transform: none; border-color: var(--border); }
.hm-cell.future { opacity: 0.15; cursor: default; }
.hm-cell.future:hover { transform: none; border-color: var(--border); }
.hm-cell.level-1 { background: color-mix(in srgb, var(--accent) 35%, var(--bg-elev-2)); border-color: color-mix(in srgb, var(--accent) 35%, var(--border)); }
.hm-cell.level-2 { background: color-mix(in srgb, var(--accent) 65%, var(--bg-elev-2)); border-color: color-mix(in srgb, var(--accent) 65%, var(--border)); }
.hm-cell.level-3 { background: var(--accent); border-color: var(--accent); }
.hm-cell.today { box-shadow: 0 0 0 2px var(--accent); border-color: var(--accent); }

.heatmap-legend {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
}

.heatmap-detail {
  padding: var(--space-3);
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.detail-date {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: var(--space-2);
  text-transform: capitalize;
}
.detail-list { list-style: none; display: flex; flex-direction: column; gap: 4px; }
.detail-list li { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.type-pill {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 100px;
  background: var(--accent-soft);
  color: var(--accent);
}
.type-pill.type-push { background: var(--push-soft); color: var(--push); }
.type-pill.type-pull { background: var(--pull-soft); color: var(--pull); }
.type-pill.type-legs { background: var(--legs-soft); color: var(--legs); }
</style>
