'use client'

import { BottomNav } from '@/components/BottomNav'
import { useTheme } from '@/components/ThemeProvider'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'

export default function SettingsPage() {
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
            Settings
          </h1>
          <p style={{ color: themeConfig.colors.textSecondary }}>
            Customize your theme, account preferences, and app settings...
          </p>
          
          <div className="mt-8 space-y-8">
            {/* Theme Selection */}
            <div>
              <h2 
                className="text-2xl font-bold mb-4"
                style={{ color: themeConfig.colors.textPrimary }}
              >
                Choose Your Theme
              </h2>
              <ThemeSwitcher />
            </div>

            {/* Future Settings */}
            <div className="p-6 rounded-xl border-4" style={{
              backgroundColor: themeConfig.colors.bgCard,
              borderColor: themeConfig.colors.borderColor,
            }}>
              <p className="text-sm" style={{ color: themeConfig.colors.textSecondary }}>
                ⚙️ More settings coming soon: Notifications, units (lbs/kg), language, account management
              </p>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  )
}