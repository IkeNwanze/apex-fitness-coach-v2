'use client'

import { BottomNav } from '@/components/BottomNav'
import { useTheme } from '@/components/ThemeProvider'
import { useAuth } from '@/components/AuthProvider'

export default function ProfilePage() {
  const { themeConfig } = useTheme()
  const { user, signOut } = useAuth()

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
            Profile
          </h1>
          <p style={{ color: themeConfig.colors.textSecondary }}>
            Your avatar, progress photos, and account settings...
          </p>
          
          <div className="mt-8 space-y-4">
            <div className="p-6 rounded-xl border-4" style={{
              backgroundColor: themeConfig.colors.bgCard,
              borderColor: themeConfig.colors.borderColor,
            }}>
              <p className="text-sm mb-4" style={{ color: themeConfig.colors.textSecondary }}>
                👤 Coming soon: Avatar customization, progress photos timeline, personal stats
              </p>
              
              {user && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: themeConfig.colors.borderColor }}>
                  <p className="text-sm mb-2" style={{ color: themeConfig.colors.textSecondary }}>
                    Logged in as: {user.email}
                  </p>
                  <button
                    onClick={signOut}
                    className="mt-2 px-4 py-2 rounded-lg font-semibold text-sm border-2 transition-all hover:scale-105"
                    style={{
                      borderColor: themeConfig.colors.borderColor,
                      color: themeConfig.colors.textPrimary,
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  )
}