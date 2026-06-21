<script setup>
import { ref, computed } from 'vue'
import { calculatePlates, DEFAULT_BAR } from '../lib/plates.js'

const weight = ref(60)
const barWeight = ref(DEFAULT_BAR)
const expanded = ref(false)

const result = computed(() => calculatePlates(Number(weight.value) || 0, Number(barWeight.value) || DEFAULT_BAR))
</script>

<template>
  <div class="plate-calc" :class="{ expanded }">
    <button class="plate-toggle" @click="expanded = !expanded">
      <i class="ti ti-weight"></i>
      <span>Kalkulator talerzy</span>
      <i class="ti chevron" :class="expanded ? 'ti-chevron-up' : 'ti-chevron-down'"></i>
    </button>

    <div v-if="expanded" class="plate-body">
      <div class="plate-inputs">
        <div class="field-inline">
          <label>Ciężar (kg)</label>
          <input type="number" step="2.5" min="0" v-model.number="weight" />
        </div>
        <div class="field-inline">
          <label>Sztanga (kg)</label>
          <input type="number" step="5" min="0" v-model.number="barWeight" />
        </div>
      </div>

      <p v-if="result.impossible" class="dim" style="font-size: 13px;">
        Ciężar mniejszy niż sztanga.
      </p>

      <template v-else>
        <div class="plate-result">
          <div class="dim" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
            Na każdą stronę
          </div>
          <div class="per-side">{{ result.perSide }}<small> kg</small></div>
        </div>

        <div v-if="result.plates.length" class="plate-stack">
          <div
            v-for="p in result.plates"
            :key="p.weight"
            class="plate-row"
          >
            <div class="plate-count">{{ p.count }}×</div>
            <div class="plate-visual">
              <div
                v-for="i in p.count"
                :key="i"
                class="plate"
                :style="{ background: p.color.bg, color: p.color.text }"
              >
                {{ p.weight }}
              </div>
            </div>
          </div>
        </div>
        <p v-else-if="result.perSide === 0" class="dim" style="font-size: 13px;">Tylko sztanga (bez talerzy).</p>

        <p v-if="result.remainder > 0" class="warning-msg">
          <i class="ti ti-alert-triangle"></i>
          Brakuje {{ result.remainder }} kg — dostosuj ciężar.
        </p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.plate-calc {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.plate-toggle {
  width: 100%;
  padding: 12px var(--space-4);
  background: transparent;
  border: none;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.plate-toggle span { flex: 1; text-align: left; }
.plate-toggle .chevron { color: var(--text-dim); }
.plate-toggle:hover { background: var(--bg-hover); }

.plate-body {
  padding: 0 var(--space-4) var(--space-4);
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-top: var(--space-3);
}

.plate-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.field-inline { display: flex; flex-direction: column; gap: 4px; }
.field-inline label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.field-inline input {
  padding: 8px 12px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 14px;
  font-family: inherit;
}
.field-inline input:focus { outline: none; border-color: var(--accent); }

.plate-result {
  padding: 10px 14px;
  background: var(--accent-soft);
  border-radius: var(--radius-sm);
  text-align: center;
}
.per-side {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: var(--accent);
}
.per-side small { font-size: 14px; opacity: 0.7; }

.plate-stack { display: flex; flex-direction: column; gap: 8px; }
.plate-row { display: flex; align-items: center; gap: 12px; }
.plate-count {
  min-width: 32px;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: var(--text-muted);
}
.plate-visual { display: flex; gap: 4px; flex-wrap: wrap; }
.plate {
  min-width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  padding: 0 4px;
  box-shadow: var(--shadow-sm);
}

.warning-msg {
  font-size: 12px;
  color: var(--warning);
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
