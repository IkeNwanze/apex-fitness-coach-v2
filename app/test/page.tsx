'use client'

import { CyberButton } from '@/components/cyber/CyberButton'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { useTheme } from '@/components/ThemeProvider'

export default function TestPage() {
  const { themeConfig } = useTheme()

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-8 transition-all duration-500"
      style={{ background: `var(--bgPrimary)` }}
    >
      <div className="max-w-5xl w-full space-y-12">
        
        {/* Theme Switcher */}
        <div className="space-y-4">
          <h2 
            className="text-center text-2xl font-bold"
            style={{ color: 'var(--textPrimary)' }}
          >
            Choose Your Theme
          </h2>
          <ThemeSwitcher />
        </div>

        {/* Title */}
        <div className="text-center space-y-4">
          <h1 
            className="text-5xl font-bold"
            style={{
              background: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2}, ${themeConfig.colors.accent3})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {themeConfig.displayName} Theme
          </h1>
          <p style={{ color: 'var(--textSecondary)' }} className="text-lg">
            {themeConfig.description}
          </p>
          <p style={{ color: 'var(--textSecondary)' }} className="text-sm">
            Shape: {themeConfig.shape} | Animation: {themeConfig.animation}
          </p>
        </div>

        {/* Color Palette Display */}
        <div className="space-y-4">
          <h3 
            className="text-xl font-bold text-center"
            style={{ color: 'var(--textPrimary)' }}
          >
            Color Palette
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div 
                className="h-20 rounded-lg border-2 transition-all hover:scale-105"
                style={{ 
                  backgroundColor: themeConfig.colors.accent1,
                  borderColor: themeConfig.colors.borderColor 
                }}
              />
              <p className="text-xs text-center font-semibold" style={{ color: 'var(--textSecondary)' }}>
                Accent 1
              </p>
            </div>
            
            <div className="space-y-2">
              <div 
                className="h-20 rounded-lg border-2 transition-all hover:scale-105"
                style={{ 
                  backgroundColor: themeConfig.colors.accent2,
                  borderColor: themeConfig.colors.borderColor 
                }}
              />
              <p className="text-xs text-center font-semibold" style={{ color: 'var(--textSecondary)' }}>
                Accent 2
              </p>
            </div>
            
            <div className="space-y-2">
              <div 
                className="h-20 rounded-lg border-2 transition-all hover:scale-105"
                style={{ 
                  backgroundColor: themeConfig.colors.accent3,
                  borderColor: themeConfig.colors.borderColor 
                }}
              />
              <p className="text-xs text-center font-semibold" style={{ color: 'var(--textSecondary)' }}>
                Accent 3
              </p>
            </div>
            
            <div className="space-y-2">
              <div 
                className="h-20 rounded-lg border-2 transition-all hover:scale-105"
                style={{ 
                  backgroundColor: themeConfig.colors.accent4,
                  borderColor: themeConfig.colors.borderColor 
                }}
              />
              <p className="text-xs text-center font-semibold" style={{ color: 'var(--textSecondary)' }}>
                Accent 4
              </p>
            </div>
          </div>
          
          {/* Show Queen accent for Bee theme */}
          {themeConfig.colors.accentSpecial && (
            <div className="flex justify-center">
              <div className="space-y-2 w-48">
                <div 
                  className="h-20 rounded-lg border-2 transition-all hover:scale-105 relative overflow-hidden"
                  style={{ 
                    backgroundColor: themeConfig.colors.accentSpecial,
                    borderColor: themeConfig.colors.borderColor 
                  }}
                >
                  <div className="absolute top-2 right-2 text-2xl">👑</div>
                </div>
                <p className="text-xs text-center font-bold" style={{ color: 'var(--textSecondary)' }}>
                  👑 Queen Accent (Special)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sample Cards */}
        <div className="space-y-4">
          <h3 
            className="text-xl font-bold text-center"
            style={{ color: 'var(--textPrimary)' }}
          >
            Sample Cards
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div 
              className="themed-card p-6 border-2 transition-all hover:scale-105"
              style={{ 
                backgroundColor: 'var(--bgCard)',
                borderColor: 'var(--borderColor)'
              }}
            >
              <h4 className="font-bold mb-2" style={{ color: 'var(--accent1)' }}>
                Progress Card
              </h4>
              <p style={{ color: 'var(--textSecondary)' }}>
                This card adapts to the current theme automatically.
              </p>
            </div>
            
            <div 
              className="themed-card p-6 border-2 transition-all hover:scale-105"
              style={{ 
                backgroundColor: 'var(--bgCard)',
                borderColor: 'var(--borderColor)'
              }}
            >
              <h4 className="font-bold mb-2" style={{ color: 'var(--accent2)' }}>
                Stats Card
              </h4>
              <p style={{ color: 'var(--textSecondary)' }}>
                Notice how colors change smoothly between themes.
              </p>
            </div>
            
            <div 
              className="themed-card p-6 border-2 transition-all hover:scale-105"
              style={{ 
                backgroundColor: 'var(--bgCard)',
                borderColor: 'var(--borderColor)'
              }}
            >
              <h4 className="font-bold mb-2" style={{ color: 'var(--accent3)' }}>
                Achievement Card
              </h4>
              <p style={{ color: 'var(--textSecondary)' }}>
                Shape adapts based on theme: angular, rounded, or hexagonal.
              </p>
            </div>
          </div>
        </div>

        {/* Test existing CyberButton */}
        <div className="space-y-4">
          <h3 
            className="text-xl font-bold text-center"
            style={{ color: 'var(--textPrimary)' }}
          >
            Old CyberButton (Not Theme-Aware Yet)
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <CyberButton variant="primary" size="md">
              Primary
            </CyberButton>
            <CyberButton variant="secondary" size="md">
              Secondary
            </CyberButton>
            <CyberButton variant="outline" size="md">
              Outline
            </CyberButton>
          </div>
          <p className="text-center text-sm" style={{ color: 'var(--textSecondary)' }}>
            ⬆️ These buttons don't change with theme - we'll build theme-aware buttons tomorrow!
          </p>
        </div>

      </div>
    </div>
  )
}
