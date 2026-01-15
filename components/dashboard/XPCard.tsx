'use client'

import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'

interface XPCardProps {
  level: number
  totalXP: number
  xpCurrent: number
  xpNeeded: number
  percentToNext: number
}

export function XPCard({ level, totalXP, xpCurrent, xpNeeded, percentToNext }: XPCardProps) {
  const router = useRouter()
  const { themeConfig } = useTheme()

  return (
    <div
      onClick={() => router.push('/xp')}
      className="cursor-pointer transition-all duration-300 hover:scale-[1.02] p-6 rounded-xl border-4"
      style={{
        backgroundColor: themeConfig.colors.bgCard,
        borderColor: themeConfig.colors.borderColor,
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <div 
            className="text-5xl font-black"
            style={{ color: themeConfig.colors.textPrimary }}
          >
            Level {level}
          </div>
          <div 
            className="text-sm mt-1"
            style={{ color: themeConfig.colors.textSecondary }}
          >
            {xpNeeded - xpCurrent} XP to Level {level + 1}
          </div>
        </div>
        <div className="text-right">
          <div 
            className="text-xs font-semibold"
            style={{ color: themeConfig.colors.accent2 }}
          >
            Total XP
          </div>
          <div 
            className="text-3xl font-black"
            style={{ color: themeConfig.colors.accent1 }}
          >
            {totalXP.toLocaleString()}
          </div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div 
        className="relative h-10 rounded-full overflow-hidden border-2"
        style={{ 
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderColor: 'rgba(255,255,255,0.1)'
        }}
      >
        <div
          className="absolute inset-0 transition-all duration-1000"
          style={{
            width: `${percentToNext}%`,
            background: `linear-gradient(90deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="text-sm font-bold z-10"
            style={{
              color: percentToNext > 50 ? '#FFFFFF' : themeConfig.colors.textPrimary,
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            }}
          >
            {xpCurrent.toLocaleString()} / {xpNeeded.toLocaleString()} XP
          </span>
        </div>
      </div>

      <div 
        className="text-xs text-center mt-2"
        style={{ color: themeConfig.colors.textSecondary }}
      >
        {percentToNext}% to next level • Tap to view details
      </div>
    </div>
  )
}