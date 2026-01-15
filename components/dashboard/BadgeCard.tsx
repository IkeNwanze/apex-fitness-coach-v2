'use client'

import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'

interface BadgeCardProps {
  nextBadge?: {
    name: string
    description: string
    progress: number
    required: number
  }
}

export function BadgeCard({ nextBadge }: BadgeCardProps) {
  const router = useRouter()
  const { themeConfig } = useTheme()

  const progressPercent = nextBadge 
    ? Math.floor((nextBadge.progress / nextBadge.required) * 100)
    : 0

  return (
    <div
      onClick={() => router.push('/badges')}
      className="cursor-pointer transition-all duration-300 hover:scale-[1.02] p-6 rounded-xl border-4 h-full"
      style={{
        backgroundColor: themeConfig.colors.bgCard,
        borderColor: themeConfig.colors.borderColor,
      }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div 
          className="text-sm font-semibold mb-2"
          style={{ color: themeConfig.colors.textSecondary }}
        >
          Next Badge
        </div>

        {nextBadge ? (
          <>
            {/* Badge Icon */}
            <div className="text-6xl text-center my-4">
              🏅
            </div>

            {/* Badge Info */}
            <div className="text-center mb-4">
              <div 
                className="font-bold text-lg mb-1"
                style={{ color: themeConfig.colors.accent1 }}
              >
                {nextBadge.name}
              </div>
              <div 
                className="text-xs"
                style={{ color: themeConfig.colors.textSecondary }}
              >
                {nextBadge.description}
              </div>
            </div>

            {/* Progress */}
            <div className="mt-auto">
              <div 
                className="h-2 rounded-full overflow-hidden mb-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: themeConfig.colors.accent1,
                  }}
                />
              </div>
              <div 
                className="text-xs text-center"
                style={{ color: themeConfig.colors.textSecondary }}
              >
                {nextBadge.progress} / {nextBadge.required} • {progressPercent}%
              </div>
            </div>
          </>
        ) : (
          <div 
            className="flex-1 flex items-center justify-center text-center"
            style={{ color: themeConfig.colors.textSecondary }}
          >
            <p className="text-sm">Unlock your first badge!</p>
          </div>
        )}
      </div>
    </div>
  )
}