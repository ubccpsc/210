import DefaultTheme from 'vitepress/theme'
import './style.css'
import { onMounted, watch } from 'vue'
import { useRoute } from 'vitepress'

export default {
  ...DefaultTheme,
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
  }
}