import { onMounted, onUnmounted, ref } from 'vue'
import { debounce } from 'lodash-es'

const useWindowSize = () => {
  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)

  const listener = () => {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  onMounted(() => {
    window.addEventListener('resize', debounce(listener, 100))
  })

  onUnmounted(() => {
    window.removeEventListener('resize', listener)
  })

  return { width, height }
}

export default useWindowSize