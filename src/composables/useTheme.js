import { ref, onMounted, onUnmounted } from 'vue'

const isDark = ref(false)
const isSystemPreference = ref(true)
let mediaQuery = null
let systemChangeListener = null

export function useTheme() {
  const updateThemeClass = (dark) => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleSystemChange = (e) => {
    isDark.value = e.matches
    updateThemeClass(e.matches)
  }

  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    const savedPreference = localStorage.getItem('theme-preference')
    
    if (savedTheme && savedPreference === 'manual') {
      // 用户手动设置过主题
      isDark.value = savedTheme === 'dark'
      isSystemPreference.value = false
    } else {
      // 跟随系统主题
      isSystemPreference.value = true
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      isDark.value = mediaQuery.matches
      
      // 监听系统主题变化
      systemChangeListener = handleSystemChange
      mediaQuery.addEventListener('change', systemChangeListener)
    }
    
    updateThemeClass(isDark.value)
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    isSystemPreference.value = false
    updateThemeClass(isDark.value)
    
    // 保存用户手动选择
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    localStorage.setItem('theme-preference', 'manual')
    
    // 移除系统主题监听
    if (mediaQuery && systemChangeListener) {
      mediaQuery.removeEventListener('change', systemChangeListener)
    }
  }

  const followSystemTheme = () => {
    isSystemPreference.value = true
    localStorage.removeItem('theme')
    localStorage.removeItem('theme-preference')
    
    // 重新监听系统主题
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    isDark.value = mediaQuery.matches
    updateThemeClass(isDark.value)
    
    systemChangeListener = handleSystemChange
    mediaQuery.addEventListener('change', systemChangeListener)
  }

  onMounted(() => {
    initTheme()
  })

  onUnmounted(() => {
    if (mediaQuery && systemChangeListener) {
      mediaQuery.removeEventListener('change', systemChangeListener)
    }
  })

  return {
    isDark,
    isSystemPreference,
    toggleTheme,
    followSystemTheme
  }
}
