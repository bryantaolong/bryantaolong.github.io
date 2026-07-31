import { ref, onMounted } from 'vue'

const isDark = ref(false)
const isSystemPreference = ref(true)

function updateThemeClass(dark: boolean) {
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme')
  const savedPreference = localStorage.getItem('theme-preference')

  if (savedTheme && savedPreference === 'manual') {
    isDark.value = savedTheme === 'dark'
    isSystemPreference.value = false
    updateThemeClass(savedTheme === 'dark')
  } else {
    isSystemPreference.value = true
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    isDark.value = mediaQuery.matches
    updateThemeClass(mediaQuery.matches)
  }
}

function setupSystemListener() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = (e: MediaQueryListEvent) => {
    isDark.value = e.matches
    updateThemeClass(e.matches)
  }
  mediaQuery.addEventListener('change', handler)
  return () => mediaQuery.removeEventListener('change', handler)
}

let cleanupSystemListener: (() => void) | null = null

function toggleTheme() {
  const newValue = !isDark.value
  updateThemeClass(newValue)
  localStorage.setItem('theme', newValue ? 'dark' : 'light')
  localStorage.setItem('theme-preference', 'manual')
  isDark.value = newValue
  isSystemPreference.value = false
  if (cleanupSystemListener) {
    cleanupSystemListener()
    cleanupSystemListener = null
  }
}

function followSystemTheme() {
  isSystemPreference.value = true
  localStorage.removeItem('theme')
  localStorage.removeItem('theme-preference')
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  isDark.value = mediaQuery.matches
  updateThemeClass(mediaQuery.matches)
  cleanupSystemListener = setupSystemListener()
}

onMounted(() => {
  initTheme()
  if (isSystemPreference.value) {
    cleanupSystemListener = setupSystemListener()
  }
})

export function useTheme() {
  return {
    isDark,
    isSystemPreference,
    toggleTheme,
    followSystemTheme
  }
}
