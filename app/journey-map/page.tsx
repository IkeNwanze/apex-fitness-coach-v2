'use client'

import { BottomNav } from '@/components/BottomNav'
import { useTheme } from '@/components/ThemeProvider'

export default function JourneyMapPage() {
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
            Journey Map
          </h1>
          <p style={{ color: themeConfig.colors.textSecondary }}>
            Your complete roadmap from start to goal, with milestones and time-to-goal visualization...
          </p>
          <div className="mt-8 p-6 rounded-xl border-4" style={{
            backgroundColor: themeConfig.colors.bgCard,
            borderColor: themeConfig.colors.borderColor,
          }}>
            <p className="text-sm" style={{ color: themeConfig.colors.textSecondary }}>
              🎓 Coming soon: Dynamic time-to-goal, milestone tracking, roadmap visualization, adaptive timeline
            </p>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  )
}