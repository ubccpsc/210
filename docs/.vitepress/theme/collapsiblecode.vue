<script setup>
import { ref } from 'vue'

const expanded = ref(false)
</script>

<template>
  <div class="collapsible-code">
    <div
      class="code-container"
      :class="{ expanded }"
    >
      <slot />
    </div>

    <button
      class="toggle-button"
      @click="expanded = !expanded"
    >
      {{ expanded ? 'Show less' : 'Show more' }}
    </button>
  </div>
</template>

<style scoped>
.code-container {
  max-height: 12rem;
  overflow: hidden;
  position: relative;
}

.code-container:not(.expanded)::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 4rem;
  background: linear-gradient(
    to bottom,
    transparent,
    var(--vp-c-bg)
  );
}

.code-container.expanded {
  max-height: none;
}

.toggle-button {
  margin-top: 0.5rem;
  cursor: pointer;
}
</style>
