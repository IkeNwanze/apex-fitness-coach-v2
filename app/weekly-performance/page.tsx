'use client'

import { BottomNav } from '@/components/BottomNav'
import { useTheme } from '@/components/ThemeProvider'

export default function WeeklyPerformancePage() {
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
            Weekly Performance
          </h1>
          <p style={{ color: themeConfig.colors.textSecondary }}>
            Your X% Better breakdown, calendar view, and AI-powered recommendations...
          </p>
          <div className="mt-8 p-6 rounded-xl border-4" style={{
            backgroundColor: themeConfig.colors.bgCard,
            borderColor: themeConfig.colors.borderColor,
          }}>
            <p className="text-sm" style={{ color: themeConfig.colors.textSecondary }}>
              📅 Coming soon: Weekly calendar, performance trends, AI recommendations, improvement breakdown
            </p>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  )
}