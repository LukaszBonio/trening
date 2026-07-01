<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  title: { type: String, default: '' },
  collapsible: { type: Boolean, default: false },
  tag: { type: String, default: 'h3' }
})
</script>

<template>
  <details v-if="collapsible" v-bind="$attrs" class="card collapsible">
    <summary>
      <slot name="header">
        <span class="card-title" style="margin: 0">{{ title }}</span>
      </slot>
      <i class="ti ti-chevron-down collapsible-chevron"></i>
    </summary>
    <div class="collapsible-body">
      <slot />
    </div>
  </details>

  <div v-else v-bind="$attrs" class="card">
    <slot name="header">
      <component :is="tag" v-if="title" class="card-title">{{ title }}</component>
    </slot>
    <slot />
  </div>
</template>

<style scoped>
.collapsible > summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  list-style: none;
}
.collapsible > summary::-webkit-details-marker { display: none; }
.collapsible[open] .collapsible-chevron { transform: rotate(180deg); }
.collapsible-chevron { transition: transform var(--dur); color: var(--text-dim); }
.collapsible-body { margin-top: var(--space-4); }
</style>
