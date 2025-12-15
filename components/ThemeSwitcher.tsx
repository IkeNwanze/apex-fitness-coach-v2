'use client'

import { useTheme } from './ThemeProvider'
import { themes, ThemeName } from '@/lib/themes'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {Object.values(themes).map((themeConfig) => (
        <button
          key={themeConfig.name}
          onClick={() => setTheme(themeConfig.name)}
          className={`
            px-5 py-3 rounded-lg font-bold text-sm
            transition-all duration-300 relative overflow-hidden
            border-2
            ${theme === themeConfig.name 
              ? 'scale-105 shadow-lg' 
              : 'opacity-70 hover:opacity-100 hover:scale-102'
            }
          `}
          style={{
            background: theme === themeConfig.name 
              ? `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`
              : themeConfig.colors.bgCard,
            borderColor: themeConfig.colors.accent1,
            color: theme === themeConfig.name ? '#ffffff' : themeConfig.colors.textPrimary,
          }}
        >
          <span className="relative z-10 flex items-center gap-2">
            {/* Theme icon/indicator */}
            <span 
              className="w-3 h-3 rounded-full"
              style={{ 
                background: themeConfig.colors.accent1,
                boxShadow: `0 0 8px ${themeConfig.colors.accent1}`
              }}
            />
            {themeConfig.displayName}
          </span>
          
          {/* Hover effect */}
          {theme !== themeConfig.name && (
            <span 
              className="absolute inset-0 opacity-0 hover:opacity-10 transition-opacity"
              style={{ background: themeConfig.colors.accent1 }}
            />
          )}
        </button>
      ))}
    </div>
  )
}