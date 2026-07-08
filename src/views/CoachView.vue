<script setup>
import AICoach from '../components/AICoach.vue'
</script>

<template>
  <div class="coach-view">
    <AICoach />
  </div>
</template>

<style scoped>
.coach-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
</style>
