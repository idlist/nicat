import { ref, onUnmounted } from 'vue'

export const SCREEN_SM = 576
export const SCREEN_MD = 768
export const SCREEN_LG = 1024

const useMediaQuery = (query: string) => {
  const mql = window.matchMedia(query)
  const matches = ref<boolean>(mql.matches)

  const listener = (event: MediaQueryListEvent) => {
    matches.value = event.matches
  }

  mql.addEventListener('change', listener)

  onUnmounted(() => {
    mql.removeEventListener('change', listener)
  })

  return matches
}

export default useMediaQuery