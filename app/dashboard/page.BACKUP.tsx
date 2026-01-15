'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { useTheme } from '@/components/ThemeProvider'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { supabaseBrowser } from '@/lib/supabaseClient'

// XP System - RPG-style exponential curve
function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5))
}

function getXPProgress(totalXP: number, currentLevel: number) {
  // Calculate total XP needed for current level
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
    remaining: xpNeededForNextLevel - xpIntoCurrentLevel
  }
}

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { themeConfig } = useTheme()
  const router = useRouter()

  const [profile, setProfile] = useState<any>(null)
  const [activePlan, setActivePlan] = useState<any>(null)
  const [userStats, setUserStats] = useState<any>(null)
  const [recentBadges, setRecentBadges] = useState<any[]>([])
  const [currentWeekProgress, setCurrentWeekProgress] = useState<any>(null)
  
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingPlan, setLoadingPlan] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [initializingStats, setInitializingStats] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [latestPlan, setLatestPlan] = useState<any>(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return

      try {
        const { data, error } = await supabaseBrowser
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error)
          return
        }
        setProfile(data)
      } finally {
        setLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [user])

  // Fetch active plan
  useEffect(() => {
    async function fetchPlan() {
      if (!user) return

      try {
        const { data, error } = await supabaseBrowser
          .from('user_plans')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }
        setActivePlan(data)
      } catch (err: any) {
        console.error('Error fetching plan:', err)
      } finally {
        setLoadingPlan(false)
      }
    }

    fetchPlan()
  }, [user])

  // Fetch user stats, badges, and progress
  useEffect(() => {
    async function fetchGameData() {
      if (!user) return

      try {
        // Fetch user stats
        const { data: stats } = await supabaseBrowser
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single()

        setUserStats(stats)

        // Fetch recent badges (last 3)
        const { data: badges } = await supabaseBrowser
          .from('user_badges')
          .select('*')
          .eq('user_id', user.id)
          .order('unlocked_at', { ascending: false })
          .limit(3)

        setRecentBadges(badges || [])

        // Fetch current week progress
        if (stats) {
          const { data: weekProgress } = await supabaseBrowser
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('week_number', stats.current_week)
            .single()

          setCurrentWeekProgress(weekProgress)
        }

      } catch (err: any) {
        console.error('Error fetching game data:', err)
      } finally {
        setLoadingStats(false)
      }
    }

    fetchGameData()
  }, [user])

  // Initialize stats if they don't exist
  const handleInitializeStats = async () => {
    setInitializingStats(true)
    setError(null)

    try {
      const { data: { session } } = await supabaseBrowser.auth.getSession()
      
      if (!session) {
        setError('Please log in again')
        return
      }

      const response = await fetch('/api/initialize-stats', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to initialize stats')
      }

      // Refresh stats
      setUserStats(result.stats)
      if (result.firstBadge) {
        setRecentBadges([result.firstBadge])
      }
      if (result.weekProgress) {
        setCurrentWeekProgress(result.weekProgress)
      }

    } catch (err: any) {
      console.error('Initialization error:', err)
      setError(err.message || 'Failed to initialize stats')
    } finally {
      setInitializingStats(false)
    }
  }

  // Generate plan - FIXED VERSION
  const handleGeneratePlan = async () => {
    setGeneratingPlan(true)
    setError(null)

    try {
      console.log('🤖 Starting plan generation...')
      
      const { data: { session }, error: sessionError } = await supabaseBrowser.auth.getSession()
      
      if (sessionError || !session) {
        setError('Please log in again to generate a plan')
        setGeneratingPlan(false)
        return
      }

      console.log('✅ Session valid')

      // Check we have profile data
      if (!profile) {
        setError('Please complete your profile first')
        setGeneratingPlan(false)
        return
      }

      console.log('✅ Profile data ready, calling API...')

      // FIXED: Send profile data in the request body
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          profile: profile,        // ← THE FIX IS HERE
          currentPhotos: [],
          goalPhotos: []
        })
      })

      console.log('📡 Response status:', response.status)

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text()
        console.error('Non-JSON response:', textResponse)
        throw new Error('Server error - check console for details')
      }

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to generate plan')
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate plan')
      }

      console.log('✅ Plan generated successfully!')
      
      // Refresh the active plan from database
      const { data: savedPlan } = await supabaseBrowser
        .from('user_plans')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (savedPlan) {
        setActivePlan(savedPlan)
      }

      alert('✅ Plan generated successfully! Check the stats above.')

    } catch (err: any) {
      console.error('❌ Plan generation error:', err)
      setError(err.message || 'Failed to generate plan')
      alert('❌ Error: ' + err.message)
    } finally {
      setGeneratingPlan(false)
    }
  }

  // Show loading
  if (authLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bgPrimary)' }}
      >
        <div style={{ color: 'var(--textPrimary)' }}>
          Loading...
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div 
      className="min-h-screen p-4 md:p-8 transition-all duration-500"
      style={{ background: 'var(--bgPrimary)' }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 
              className="text-3xl md:text-4xl font-bold mb-2"
              style={{
                backgroundImage: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {profile?.full_name ? `Welcome, ${profile.full_name}!` : 'Welcome to Your Dashboard'}
            </h1>
            <p style={{ color: 'var(--textSecondary)' }}>
              {user.email}
            </p>
          </div>

          <button
            onClick={signOut}
            className="px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold transition-all duration-300 hover:opacity-80"
            style={{
              backgroundImage: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
              color: '#FFFFFF',
            }}
          >
            Sign Out
          </button>
        </div>

        {/* XP & Level Display */}
        {!loadingStats && userStats && (
          <div
            className="themed-card p-6 border-2"
            style={{
              backgroundColor: 'var(--bgCard)',
              borderColor: 'var(--borderColor)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-3xl font-black" style={{ color: 'var(--textPrimary)' }}>
                  Level {userStats.level}
                </div>
                <div className="text-sm" style={{ color: 'var(--textSecondary)' }}>
                  {getXPProgress(userStats.total_xp, userStats.level).remaining} XP to Level {userStats.level + 1}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold" style={{ color: 'var(--accent2)' }}>
                  Total XP
                </div>
                <div className="text-2xl font-bold" style={{ color: 'var(--accent1)' }}>
                  {userStats.total_xp.toLocaleString()}
                </div>
              </div>
            </div>
            
            {/* XP Progress Bar */}
            <div className="relative h-8 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bgSecondary)' }}>
              <div 
                className="absolute inset-0 transition-all duration-500"
                style={{
                  width: `${getXPProgress(userStats.total_xp, userStats.level).percent}%`,
                  backgroundImage: `linear-gradient(90deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold" style={{ 
                  color: getXPProgress(userStats.total_xp, userStats.level).percent > 50 ? '#FFFFFF' : 'var(--textPrimary)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>
                  {getXPProgress(userStats.total_xp, userStats.level).current.toLocaleString()} / {getXPProgress(userStats.total_xp, userStats.level).needed.toLocaleString()} XP
                </span>
              </div>
            </div>
            
            <div className="text-xs text-center mt-2" style={{ color: 'var(--textSecondary)' }}>
              {getXPProgress(userStats.total_xp, userStats.level).percent}% to next level
            </div>
          </div>
        )}

        {/* X% Better Hero Metric */}
        {!loadingStats && userStats && currentWeekProgress && (
          <div
            className="themed-card p-8 md:p-12 border-2 text-center relative overflow-hidden"
            style={{
              backgroundColor: 'var(--bgCard)',
              borderColor: 'var(--accent1)',
            }}
          >
            <div className="text-sm font-semibold mb-2" style={{ color: 'var(--textSecondary)' }}>
              This Week's Progress
            </div>
            <div 
              className="text-6xl md:text-8xl font-black mb-4"
              style={{
                backgroundImage: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2}, ${themeConfig.colors.accent3})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))',
              }}
            >
              {currentWeekProgress.x_percent_better || 0}%
            </div>
            <div className="text-xl md:text-2xl font-bold" style={{ color: 'var(--textPrimary)' }}>
              Better Than Last Week!
            </div>
            <div className="mt-4 text-sm" style={{ color: 'var(--textSecondary)' }}>
              Keep showing up - every workout counts! 💪
            </div>
          </div>
        )}

        {/* Initialize Stats Button (if no stats) */}
        {!loadingStats && !userStats && activePlan && (
          <div
            className="themed-card p-8 border-2 text-center"
            style={{
              backgroundColor: 'var(--bgCard)',
              borderColor: 'var(--borderColor)',
            }}
          >
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--textPrimary)' }}>
              Ready to Start Tracking?
            </h3>
            <p className="mb-6" style={{ color: 'var(--textSecondary)' }}>
              Initialize your progress tracking and earn your first badge!
            </p>
            <button
              onClick={handleInitializeStats}
              disabled={initializingStats}
              className="px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
              style={{
                backgroundImage: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
                color: '#FFFFFF',
              }}
            >
              {initializingStats ? 'Starting...' : 'Start Tracking Progress 🚀'}
            </button>
          </div>
        )}

        {/* Badges Section */}
        {!loadingStats && recentBadges.length > 0 && (
          <div
            className="themed-card p-6 border-2"
            style={{
              backgroundColor: 'var(--bgCard)',
              borderColor: 'var(--borderColor)',
            }}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--textPrimary)' }}>
              <span>🏆</span> Recent Badges
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="p-4 rounded-lg border-2 text-center transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: 'var(--bgSecondary)',
                    borderColor: 'var(--accent1)',
                  }}
                >
                  <div className="text-4xl mb-2">🏅</div>
                  <div className="font-bold mb-1" style={{ color: 'var(--accent1)' }}>
                    {badge.badge_name}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--textSecondary)' }}>
                    {badge.badge_description}
                  </div>
                  <div className="text-xs mt-2" style={{ color: 'var(--accent2)' }}>
                    +{badge.xp_earned} XP
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Plan Section OR Onboarding Prompt */}
        {!loadingProfile && (
          <>
            {profile ? (
              <div
                className="themed-card p-6 md:p-8 border-2"
                style={{
                  backgroundColor: 'var(--bgCard)',
                  borderColor: 'var(--borderColor)',
                }}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <h3 
                      className="text-2xl font-bold mb-2"
                      style={{ color: 'var(--accent1)' }}
                    >
                      {activePlan ? '🎯 Your Fitness Plan' : '🚀 Ready to Start?'}
                    </h3>
                    <p style={{ color: 'var(--textSecondary)' }}>
                      {activePlan 
                        ? `Plan created ${new Date(activePlan.created_at).toLocaleDateString()}`
                        : 'Generate your personalized AI-powered fitness plan'
                      }
                    </p>
                  </div>

                  <button
                    onClick={handleGeneratePlan}
                    disabled={generatingPlan}
                    className="px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
                      color: '#FFFFFF',
                    }}
                  >
                    {generatingPlan ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⚙️</span>
                        Generating...
                      </span>
                    ) : activePlan ? (
                      'Regenerate Plan'
                    ) : (
                      'Generate My Plan'
                    )}
                  </button>

                  {activePlan && (
                    <button
                      onClick={() => router.push('/plan')}
                      className="px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:opacity-80"
                      style={{
                        background: `linear-gradient(135deg, ${themeConfig.colors.accent2}, ${themeConfig.colors.accent3})`,
                        color: '#FFFFFF',
                      }}
                    >
                      📋 View My Plan
                    </button>
                  )}
                </div>

                {error && (
                  <div 
                    className="p-4 rounded-lg border-2 mb-4"
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      borderColor: '#EF4444',
                      color: '#EF4444',
                    }}
                  >
                    {error}
                  </div>
                )}

                {loadingPlan ? (
                  <div style={{ color: 'var(--textSecondary)' }}>
                    Loading plan...
                  </div>
                ) : activePlan ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div 
                        className="p-4 rounded-lg"
                        style={{ backgroundColor: 'var(--bgSecondary)' }}
                      >
                        <div className="text-sm" style={{ color: 'var(--textSecondary)' }}>
                          Time to Goal
                        </div>
                        <div className="text-2xl font-bold" style={{ color: 'var(--accent1)' }}>
                          {activePlan.plan_json.time_to_goal?.estimate_weeks_range?.min || 'N/A'}-
                          {activePlan.plan_json.time_to_goal?.estimate_weeks_range?.max || 'N/A'} weeks
                        </div>
                      </div>

                      <div 
                        className="p-4 rounded-lg"
                        style={{ backgroundColor: 'var(--bgSecondary)' }}
                      >
                        <div className="text-sm" style={{ color: 'var(--textSecondary)' }}>
                          Workouts/Week
                        </div>
                        <div className="text-2xl font-bold" style={{ color: 'var(--accent2)' }}>
                          {activePlan.plan_json.weekly_plan?.days_per_week || 'N/A'} days
                        </div>
                      </div>

                      <div 
                        className="p-4 rounded-lg"
                        style={{ backgroundColor: 'var(--bgSecondary)' }}
                      >
                        <div className="text-sm" style={{ color: 'var(--textSecondary)' }}>
                          Daily Calories
                        </div>
                        <div className="text-2xl font-bold" style={{ color: 'var(--accent3)' }}>
                          {activePlan.plan_json.nutrition?.calorie_target_range?.min || 'N/A'}-
                          {activePlan.plan_json.nutrition?.calorie_target_range?.max || 'N/A'}
                        </div>
                      </div>

                      <div 
                        className="p-4 rounded-lg"
                        style={{ backgroundColor: 'var(--bgSecondary)' }}
                      >
                        <div className="text-sm" style={{ color: 'var(--textSecondary)' }}>
                          Daily Steps
                        </div>
                        <div className="text-2xl font-bold" style={{ color: 'var(--accent4)' }}>
                          {activePlan.plan_json.recovery_and_steps?.steps_target_range?.min || 'N/A'}-
                          {activePlan.plan_json.recovery_and_steps?.steps_target_range?.max || 'N/A'}
                        </div>
                      </div>
                    </div>

                    {activePlan.plan_json.disclaimer && (
                      <div 
                        className="p-4 rounded-lg border"
                        style={{
                          backgroundColor: 'var(--bgSecondary)',
                          borderColor: 'var(--borderColor)',
                          color: 'var(--textSecondary)',
                        }}
                      >
                        <p className="text-sm">{activePlan.plan_json.disclaimer}</p>
                      </div>
                    )}

                    <div 
                      className="p-6 rounded-lg border-2"
                      style={{
                        backgroundColor: 'var(--bgSecondary)',
                        borderColor: 'var(--accent1)',
                      }}
                    >
                      <h4 className="font-bold mb-2" style={{ color: 'var(--accent1)' }}>
                        📱 Full Plan Viewer Coming Soon
                      </h4>
                      <p style={{ color: 'var(--textSecondary)' }}>
                        Your complete plan has been generated! We're building the full interface to display workouts, meals, milestones, and more. For now, you can see your quick stats above.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--textSecondary)' }}>
                    <p className="mb-2">Click "Generate My Plan" to create your personalized fitness plan.</p>
                    <p className="text-sm">This uses AI to analyze your goals and create a complete workout, nutrition, and recovery plan.</p>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="themed-card p-12 border-2 text-center"
                style={{
                  backgroundColor: 'var(--bgCard)',
                  borderColor: 'var(--borderColor)',
                }}
              >
                <div className="text-6xl mb-6">👋</div>
                <h2 
                  className="text-3xl font-bold mb-4"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Let's Get You Started!
                </h2>
                <p className="text-lg mb-8" style={{ color: 'var(--textSecondary)' }}>
                  Complete your profile so we can build your personalized fitness plan
                </p>
                <Link href="/onboarding">
                  <button
                    className="px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
                      color: '#FFFFFF',
                    }}
                  >
                    Complete Your Profile →
                  </button>
                </Link>
                <p className="text-sm mt-4" style={{ color: 'var(--textSecondary)' }}>
                  Takes less than 2 minutes • 4 simple questions
                </p>
              </div>
            )}
          </>
        )}

        {/* Theme Switcher */}
        <div className="space-y-4">
          <h2 
            className="text-2xl font-bold"
            style={{ color: 'var(--textPrimary)' }}
          >
            Choose Your Theme
          </h2>
          <ThemeSwitcher />
        </div>

        {/* Profile Summary */}
        {!loadingProfile && profile && (
          <div
            className="themed-card p-6 md:p-8 border-2"
            style={{
              backgroundColor: 'var(--bgCard)',
              borderColor: 'var(--borderColor)',
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 
                className="text-xl font-bold"
                style={{ color: 'var(--textPrimary)' }}
              >
                Your Profile
              </h3>
              <div className="flex gap-2">
                <Link href="/photos/upload">
                  <button
                    className="px-4 py-2 rounded-lg font-semibold text-sm border-2 transition-all duration-300 hover:scale-105"
                    style={{
                      borderColor: 'var(--borderColor)',
                      color: 'var(--textPrimary)',
                      backgroundColor: 'var(--bgSecondary)',
                    }}
                  >
                    📸 Edit Photos
                  </button>
                </Link>
                <Link href="/onboarding">
                  <button
                    className="px-4 py-2 rounded-lg font-semibold text-sm border-2 transition-all duration-300 hover:scale-105"
                    style={{
                      borderColor: 'var(--borderColor)',
                      color: 'var(--textPrimary)',
                      backgroundColor: 'var(--bgSecondary)',
                    }}
                  >
                    ✏️ Edit Profile
                  </button>
                </Link>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4" style={{ color: 'var(--textSecondary)' }}>
              <div>
                <p><strong style={{ color: 'var(--textPrimary)' }}>Age:</strong> {profile.age}</p>
                <p><strong style={{ color: 'var(--textPrimary)' }}>Gender:</strong> {profile.gender}</p>
                <p><strong style={{ color: 'var(--textPrimary)' }}>Experience:</strong> {profile.experience_level}</p>
              </div>
              <div>
                <p><strong style={{ color: 'var(--textPrimary)' }}>Goal:</strong> {profile.fitness_goal}</p>
                <p><strong style={{ color: 'var(--textPrimary)' }}>Frequency:</strong> {profile.workout_frequency}</p>
                <p><strong style={{ color: 'var(--textPrimary)' }}>Location:</strong> {profile.training_location}</p>
              </div>
            </div>

            {profile.training_location === 'commercial' && (
              <div className="mt-4">
                <p style={{ color: 'var(--textSecondary)' }}>
                  <strong style={{ color: 'var(--textPrimary)' }}>Gym:</strong>{' '}
                  {profile.gym_chain || profile.gym_custom_name || 'Not specified'}
                </p>
              </div>
            )}

            {profile.available_equipment && profile.available_equipment.length > 0 && (
              <div className="mt-4">
                <p className="mb-2" style={{ color: 'var(--textPrimary)' }}>
                  <strong>Available Equipment:</strong>
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.available_equipment.map((item: string, idx: number) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: 'var(--accent1)',
                        color: '#FFFFFF',
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}