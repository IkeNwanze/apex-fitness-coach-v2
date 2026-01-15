'use client'

import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'

interface TodayWorkoutCardProps {
  dayLabel: string
  exerciseCount: number
  sessionFocus: string
  estimatedDuration?: number
  isRestDay?: boolean
}

export function TodayWorkoutCard({ 
  dayLabel, 
  exerciseCount, 
  sessionFocus,
  estimatedDuration = 60,
  isRestDay = false
}: TodayWorkoutCardProps) {
  const router = useRouter()
  const { themeConfig } = useTheme()

  return (
    <div
      onClick={() => router.push('/plan')}
      className="cursor-pointer transition-all duration-300 hover:scale-[1.02] p-8 rounded-xl border-4"
      style={{
        backgroundColor: themeConfig.colors.bgCard,
        borderColor: themeConfig.colors.borderColor,
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div 
            className="text-sm font-semibold mb-1"
            style={{ color: themeConfig.colors.textSecondary }}
          >
            TODAY'S WORKOUT
          </div>
          <h3 
            className="text-3xl font-black"
            style={{ color: themeConfig.colors.accent1 }}
          >
            {dayLabel}
          </h3>
        </div>
        <div className="text-5xl">
          {isRestDay ? '😴' : '💪'}
        </div>
      </div>

      {/* Details */}
      {!isRestDay ? (
        <>
          <div 
            className="mb-6"
            style={{ color: themeConfig.colors.textSecondary }}
          >
            <p className="text-base mb-2">{sessionFocus}</p>
            <div className="flex gap-4 text-sm">
              <span>🏋️ {exerciseCount} exercises</span>
              <span>⏱️ ~{estimatedDuration} min</span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              router.push('/plan')
            }}
            className="w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
              color: '#FFFFFF',
            }}
          >
            Start Workout →
          </button>
        </>
      ) : (
        <>
          <div 
            className="mb-6 text-center"
            style={{ color: themeConfig.colors.textSecondary }}
          >
            <p className="text-lg mb-2">Recovery Day</p>
            <p className="text-sm">Your body needs rest to grow stronger!</p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              router.push('/plan')
            }}
            className="w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105 border-2"
            style={{
              borderColor: themeConfig.colors.borderColor,
              color: themeConfig.colors.textPrimary,
              backgroundColor: 'transparent',
            }}
          >
            View Full Schedule →
          </button>
        </>
      )}
    </div>
  )
}
