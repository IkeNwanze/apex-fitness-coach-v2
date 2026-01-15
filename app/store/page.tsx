'use client'

import { BottomNav } from '@/components/BottomNav'
import { useTheme } from '@/components/ThemeProvider'

export default function StorePage() {
  const { themeConfig } = useTheme()

  return (
    <>
      <div 
        className="min-h-screen pb-24"
        style={{ background: '#000000' }}
      >
        <div className="max-w-7xl mx-auto p-8">
          <h1 
            className="text-4xl font-black mb-4"
            style={{
              background: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Store
          </h1>
          <p style={{ color: themeConfig.colors.textSecondary }}>
            Customize your avatar and gym with XP rewards...
          </p>
          
          <div className="mt-8 space-y-6">
            {/* Teaser Card */}
            <div className="p-8 rounded-xl border-4 text-center" style={{
              backgroundColor: themeConfig.colors.bgCard,
              borderColor: themeConfig.colors.borderColor,
            }}>
              <div className="text-6xl mb-4">🎮</div>
              <h3 
                className="text-2xl font-bold mb-2"
                style={{ color: themeConfig.colors.accent1 }}
              >
                Toca Boca Style Customization
              </h3>
              <p className="mb-6" style={{ color: themeConfig.colors.textSecondary }}>
                Unlock outfits, gym equipment, and decorations as you level up!
              </p>
              <p className="text-sm" style={{ color: themeConfig.colors.textSecondary }}>
                🛒 Coming after MVP: Avatar customization, gym scene decoration, XP-based unlocks
              </p>
            </div>

            {/* Preview Categories */}
            <div className="grid md:grid-cols-3 gap-4">
              {['Avatar Outfits', 'Gym Equipment', 'Decorations'].map((category) => (
                <div 
                  key={category}
                  className="p-6 rounded-xl border-4 text-center" 
                  style={{
                    backgroundColor: themeConfig.colors.bgCard,
                    borderColor: themeConfig.colors.borderColor,
                    opacity: 0.5,
                  }}
                >
                  <div className="text-4xl mb-2">🔒</div>
                  <p className="text-sm font-semibold" style={{ color: themeConfig.colors.textSecondary }}>
                    {category}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  )
}
