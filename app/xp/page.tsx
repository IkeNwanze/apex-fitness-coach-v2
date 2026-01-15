'use client'

import { BottomNav } from '@/components/BottomNav'
import { useTheme } from '@/components/ThemeProvider'

export default function XPPage() {
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
            XP & Level History
          </h1>
          <p style={{ color: themeConfig.colors.textSecondary }}>
            Track your XP sources, level progression, and upcoming unlocks...
          </p>
          <div className="mt-8 p-6 rounded-xl border-4" style={{
            backgroundColor: themeConfig.colors.bgCard,
            borderColor: themeConfig.colors.borderColor,
          }}>
            <p className="text-sm" style={{ color: themeConfig.colors.textSecondary }}>
              📊 Coming soon: Detailed XP breakdown, level milestones, and progression charts
            </p>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  )
}