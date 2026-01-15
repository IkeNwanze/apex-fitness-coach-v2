'use client'

import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'

interface XPercentCardProps {
  xPercent: number
  weekNumber: number
}

export function XPercentCard({ xPercent, weekNumber }: XPercentCardProps) {
  const router = useRouter()
  const { themeConfig } = useTheme()

  return (
    <div
      onClick={() => router.push('/weekly-performance')}
      className="cursor-pointer transition-all duration-300 hover:scale-[1.02] p-6 rounded-xl border-4 h-full"
      style={{
        backgroundColor: themeConfig.colors.bgCard,
        borderColor: themeConfig.colors.accent1,
      }}
    >
      <div className="flex flex-col h-full justify-center text-center">
        {/* Label */}
        <div 
          className="text-xs font-semibold mb-2"
          style={{ color: themeConfig.colors.textSecondary }}
        >
          This Week's Progress
        </div>

        {/* Big Number */}
        <div 
          className="text-7xl font-black mb-2"
          style={{
            background: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2}, ${themeConfig.colors.accent3})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {xPercent}%
        </div>

        {/* Subtitle */}
        <div 
          className="text-base font-bold mb-1"
          style={{ color: themeConfig.colors.textPrimary }}
        >
          Better Than Last Week!
        </div>

        <div 
          className="text-xs"
          style={{ color: themeConfig.colors.textSecondary }}
        >
          Week {weekNumber}
        </div>
      </div>
    </div>
  )
}