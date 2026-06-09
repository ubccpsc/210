import DefaultTheme from 'vitepress/theme'
import './style.css'
import './tooltips.css'
import { onMounted, watch } from 'vue'
import { useRoute } from 'vitepress'
import CollapsibleCode from './collapsiblecode.vue'

export default {
  extends: DefaultTheme,
  setup() {
    const route = useRoute()
    const updateEmbedMode = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        if (params.has('embed')) {
          document.documentElement.classList.add('is-embedded')
        } else {
          document.documentElement.classList.remove('is-embedded')
        }
      }
    }
    onMounted(updateEmbedMode)
    watch(() => route.path, updateEmbedMode)
  },
  enhanceApp({ app }) {
     app.component('CollapsibleCode', CollapsibleCode)
  }
}
