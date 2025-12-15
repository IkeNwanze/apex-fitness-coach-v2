'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ThemeName, themes } from '@/lib/themes'

interface ThemeContextType {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
  themeConfig: typeof themes[ThemeName]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('cyberpunk')

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('apex-theme') as ThemeName
    if (savedTheme && themes[savedTheme]) {
      setThemeState(savedTheme)
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    const currentTheme = themes[theme]
    document.documentElement.setAttribute('data-theme', theme)
    
    // Apply CSS variables
    const colors = currentTheme.colors
    Object.entries(colors).forEach(([key, value]) => {
      if (value) {
        document.documentElement.style.setProperty(`--${key}`, value)
      }
    })
    
    // Apply shape and animation preferences as data attributes
    document.documentElement.setAttribute('data-shape', currentTheme.shape)
    document.documentElement.setAttribute('data-animation', currentTheme.animation)
  }, [theme])

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme)
    localStorage.setItem('apex-theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeConfig: themes[theme] }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}