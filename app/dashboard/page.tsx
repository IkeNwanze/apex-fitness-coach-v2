'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useTheme } from '@/components/ThemeProvider'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { XPCard } from '@/components/dashboard/XPCard'
import { BadgeCard } from '@/components/dashboard/BadgeCard'
import { XPercentCard } from '@/components/dashboard/XPercentCard'
import { TodayWorkoutCard } from '@/components/dashboard/TodayWorkoutCard'
import { BottomNav } from '@/components/BottomNav'

function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5))
}

function getXPProgress(totalXP: number, currentLevel: number) {
  let totalNeeded = 0
  for (let i = 1; i < currentLevel; i++) {
    totalNeeded += getXPForLevel(i)
  }
  
  const xpIntoCurrentLevel = totalXP - totalNeeded
  const xpNeededForNextLevel = getXPForLevel(currentLevel)
  const percentToNext = Math.floor((xpIntoCurrentLevel / xpNeededForNextLevel) * 100)
  
  return {
    current: xpIntoCurrentLevel,
    needed: xpNeededForNextLevel,
    percent: percentToNext,
  }
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { themeConfig } = useTheme()
  const router = useRouter()

  const [profile, setProfile] = useState<any>(null)
  const [userStats, setUserStats] = useState<any>(null)
  const [currentWeekProgress, setCurrentWeekProgress] = useState<any>(null)
  const [activePlan, setActivePlan] = useState<any>(null)
  const [todayWorkout, setTodayWorkout] = useState<any>(null)
  const [nextBadge, setNextBadge] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user?.id) return

      try {
        setLoading(true)

        const { data: profileData } = await supabaseBrowser
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        setProfile(profileData)

        const { data: statsData } = await supabaseBrowser
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single()

        setUserStats(statsData)

        if (statsData) {
          const { data: weekProgress } = await supabaseBrowser
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('week_number', statsData.current_week)
            .single()

          setCurrentWeekProgress(weekProgress)
        }

        const { data: planData } = await supabaseBrowser
          .from('user_plans')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        setActivePlan(planData)

        if (planData?.plan_json?.weekly_plan?.schedule) {
          const firstWorkout = planData.plan_json.weekly_plan.schedule.find(
            (day: any) => day.workout && day.workout.length > 0
          )
          setTodayWorkout(firstWorkout || planData.plan_json.weekly_plan.schedule[0])
        }

        if (statsData) {
          setNextBadge({
            name: '7-Day Streak',
            description: 'Complete workouts for 7 days in a row',
            progress: statsData.current_streak || 0,
            required: 7,
          })
        }

      } catch (err: any) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  if (authLoading || loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#000000' }}
      >
        <div style={{ color: '#FFFFFF' }}>Loading your dashboard...</div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <>
        <div style={{ background: '#000000', minHeight: '100vh' }} className="pb-24">
          <div className="max-w-7xl mx-auto p-4">
            <p style={{ color: '#FFFFFF' }}>Please complete onboarding first.</p>
            <button
              onClick={() => router.push('/onboarding')}
              className="mt-4 px-6 py-3 rounded-lg font-bold"
              style={{
                background: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
                color: '#FFFFFF',
              }}
            >
              Complete Onboarding
            </button>
          </div>
        </div>
        <BottomNav />
      </>
    )
  }

  const xpProgress = userStats ? getXPProgress(userStats.total_xp, userStats.level) : null

  return (
    <>
      <div className="min-h-screen pb-24" style={{ background: '#000000' }}>
        {/* Mobile-first container - less padding, better spacing */}
        <div className="max-w-7xl mx-auto px-3 py-4 md:px-8 md:py-6 space-y-3">
          
          {/* Header - More compact on mobile */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 
                className="text-2xl md:text-4xl font-black mb-0.5"
                style={{
                  background: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Welcome back, {profile.full_name}
              </h1>
              <p className="text-xs md:text-base" style={{ color: themeConfig.colors.textSecondary }}>
                Current Focus: Consistency Phase
              </p>
            </div>

            {/* Avatar + Notification bell like mockup */}
            <div className="flex items-center gap-2">
              {/* Notification bell */}
              <button 
                className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center text-lg md:text-xl transition-all hover:scale-110"
                style={{ borderColor: themeConfig.colors.borderColor }}
              >
                🔔
              </button>
              
              {/* Avatar */}
              <div 
                className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center text-lg md:text-xl cursor-pointer transition-all hover:scale-110"
                style={{ borderColor: themeConfig.colors.accent1 }}
                onClick={() => router.push('/profile')}
              >
                👤
              </div>
            </div>
          </div>

          {/* Card Grid - Tighter spacing for mobile */}
          <div className="space-y-3">
            
            {/* XP Card - Full Width */}
            {userStats && xpProgress ? (
              <XPCard
                level={userStats.level}
                totalXP={userStats.total_xp}
                xpCurrent={xpProgress.current}
                xpNeeded={xpProgress.needed}
                percentToNext={xpProgress.percent}
              />
            ) : (
              <div className="p-6 rounded-xl border-4" style={{
                backgroundColor: themeConfig.colors.bgCard,
                borderColor: themeConfig.colors.borderColor,
              }}>
                <p style={{ color: themeConfig.colors.textSecondary }}>
                  Initializing your stats...
                </p>
              </div>
            )}

            {/* Badge + X% Better - Side by Side with small gap */}
            <div className="grid grid-cols-2 gap-3">
              <BadgeCard nextBadge={nextBadge} />
              {currentWeekProgress && userStats ? (
                <XPercentCard 
                  xPercent={currentWeekProgress.x_percent_better || 0}
                  weekNumber={userStats.current_week}
                />
              ) : (
                <div className="p-4 rounded-xl border-4 flex items-center justify-center" style={{
                  backgroundColor: themeConfig.colors.bgCard,
                  borderColor: themeConfig.colors.borderColor,
                }}>
                  <p className="text-xs text-center" style={{ color: themeConfig.colors.textSecondary }}>
                    Complete your first workout!
                  </p>
                </div>
              )}
            </div>

            {/* Today's Workout - Full Width */}
            {todayWorkout ? (
              <TodayWorkoutCard
                dayLabel={todayWorkout.day_label}
                exerciseCount={todayWorkout.workout?.length || 0}
                sessionFocus={todayWorkout.session_focus}
                estimatedDuration={activePlan?.plan_json?.weekly_plan?.session_length_minutes || 60}
                isRestDay={!todayWorkout.workout || todayWorkout.workout.length === 0}
              />
            ) : (
              <div className="p-6 rounded-xl border-4 text-center" style={{
                backgroundColor: themeConfig.colors.bgCard,
                borderColor: themeConfig.colors.borderColor,
              }}>
                <p className="text-base mb-4" style={{ color: themeConfig.colors.textSecondary }}>
                  No workout plan yet. Generate one to get started!
                </p>
                <button
                  onClick={() => router.push('/onboarding')}
                  className="px-6 py-3 rounded-lg font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
                    color: '#FFFFFF',
                  }}
                >
                  Generate Workout Plan
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      <BottomNav />
    </>
  )
}