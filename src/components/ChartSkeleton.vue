<script setup>
defineProps({
  height: { type: Number, default: 240 },
  variant: { type: String, default: 'line' }  // 'line' | 'bar'
})
</script>

<template>
  <div class="skeleton-wrap" :style="{ height: height + 'px' }">
    <div class="skel-grid">
      <span v-for="i in 5" :key="i" class="skel-gridline"></span>
    </div>
    <svg v-if="variant === 'line'" class="skel-svg" viewBox="0 0 400 100" preserveAspectRatio="none">
      <path
        d="M 0,70 Q 50,60 100,55 T 200,45 T 300,30 T 400,25"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        class="skel-line"
      />
    </svg>
    <div v-else class="skel-bars">
      <div v-for="i in 8" :key="i" class="skel-bar" :style="{ height: (30 + Math.sin(i * 1.5) * 25 + 25) + '%' }"></div>
    </div>
    <div class="skel-shimmer"></div>
  </div>
</template>

<style scoped>
.skeleton-wrap {
  position: relative;
  background: var(--bg-elev-2);
  border-radius: var(--radius-sm);
  overflow: hidden;
  color: var(--text-dim);
}
.skel-grid {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 16px 0;
}
.skel-gridline {
  height: 1px;
  background: var(--border);
}
.skel-svg {
  position: absolute;
  inset: 16px;
  width: calc(100% - 32px);
  height: calc(100% - 32px);
}
.skel-line { opacity: 0.4; }
.skel-bars {
  position: absolute;
  inset: 16px;
  display: flex;
  align-items: flex-end;
  gap: 8%;
  justify-content: space-evenly;
}
.skel-bar {
  flex: 1;
  background: var(--border-strong);
  border-radius: 4px 4px 0 0;
  opacity: 0.5;
}
.skel-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255,255,255,0.04) 50%,
    transparent 100%
  );
  animation: shimmer 1.4s ease-in-out infinite;
}
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
@media (prefers-reduced-motion: reduce) {
  .skel-shimmer { animation: none; opacity: 0.3; }
}
</style>
