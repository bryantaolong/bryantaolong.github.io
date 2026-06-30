import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

interface ThemeContextType {
  isDark: boolean
  isSystemPreference: boolean
  toggleTheme: () => void
  followSystemTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false)
  const [isSystemPreference, setIsSystemPreference] = useState(true)

  const updateThemeClass = useCallback((dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const initTheme = useCallback(() => {
    const savedTheme = localStorage.getItem('theme')
    const savedPreference = localStorage.getItem('theme-preference')

    if (savedTheme && savedPreference === 'manual') {
      setIsDark(savedTheme === 'dark')
      setIsSystemPreference(false)
      updateThemeClass(savedTheme === 'dark')
    } else {
      setIsSystemPreference(true)
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      setIsDark(mediaQuery.matches)
      updateThemeClass(mediaQuery.matches)
    }
  }, [updateThemeClass])

  useEffect(() => {
    initTheme()
  }, [initTheme])

  useEffect(() => {
    if (!isSystemPreference) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      setIsDark(e.matches)
      updateThemeClass(e.matches)
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [isSystemPreference, updateThemeClass])

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const newValue = !prev
      updateThemeClass(newValue)
      localStorage.setItem('theme', newValue ? 'dark' : 'light')
      localStorage.setItem('theme-preference', 'manual')
      setIsSystemPreference(false)
      return newValue
    })
  }, [updateThemeClass])

  const followSystemTheme = useCallback(() => {
    setIsSystemPreference(true)
    localStorage.removeItem('theme')
    localStorage.removeItem('theme-preference')
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mediaQuery.matches)
    updateThemeClass(mediaQuery.matches)
  }, [updateThemeClass])

  return (
    <ThemeContext.Provider value={{ isDark, isSystemPreference, toggleTheme, followSystemTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
