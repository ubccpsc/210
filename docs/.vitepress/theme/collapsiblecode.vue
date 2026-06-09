<!---- Collapsible Code element. ---->
<!---- Generated first by chatgpt June 8 2026---->
<!---- Changed by Caroline with consultation to Gemini June 9 2026 --->

<script setup>
import { ref } from 'vue'

const expanded = ref(false)
</script>

<!---- template for the new html element--->
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
      {{ expanded ? '➤ Click to hide the code above' : '➤ Click to view all the code' }}
    </button>
  </div>
</template>

<style scoped>
/*The basic code container cuts off at a height of 10rem (10*font size) */
.code-container {
  max-height: 12rem;
  overflow: hidden; /* Hide beyond max height */
  position: relative; /* gemini claims this is crucial for the fade overlay */
}

/* add a gradient on top of the code */
.code-container:not(.expanded)::after {
  content: ""; /* required for this element to render */
  position: absolute;
  /* gemini claims these dimensions stretch the overlay over the code container */
  left: 0;
  right: 0;
  bottom: 0;
  height: 4rem; /*gradient size */
  background: linear-gradient(
    to bottom,
    transparent,
    var(--vp-c-bg)  /*vitepress background color*/
  );
  z-index: 1; /* so it can go on top of ```markdown code``` blocks */
}

.code-container.expanded {
  max-height: none;
  /* get the toggle button a little closer up*/
  margin-bottom: -0.7em;
}

.toggle-button {
  /* padding gives extra space to click*/
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  /* margin removes that space from the render */
  margin-top: -0.5rem;
  margin-bottom: -0.5rem;
  cursor: pointer;
  /* to put the button on top of the code container, so we can click the extra space */
  position: relative;
  z-index: 2;
}


</style>
