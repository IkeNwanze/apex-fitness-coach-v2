'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { useTheme } from '@/components/ThemeProvider'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { supabaseBrowser } from '@/lib/supabaseClient'

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { themeConfig } = useTheme()
  const router = useRouter()

  const [profile, setProfile] = useState<any>(null)
  const [activePlan, setActivePlan] = useState<any>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingPlan, setLoadingPlan] = useState(true)
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

        if (error) {
          // Only log if it's not a "no rows found" error
          if (error.code !== 'PGRST116') {
            console.error('Error fetching profile:', error)
          }
          console.log('No profile found - user needs to complete onboarding')
          return
        }
        console.log('Profile found:', data)
        setProfile(data)
      } catch (err: any) {
        // Silently handle - user probably hasn't completed onboarding
        console.log('Catch block: No profile found')
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

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
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

  // Generate plan
  const handleGeneratePlan = async () => {
    setGeneratingPlan(true)
    setError(null)

    try {
      // Get the current session token
      const { data: { session }, error: sessionError } = await supabaseBrowser.auth.getSession()
      
      if (sessionError || !session) {
        setError('Please log in again to generate a plan')
        setGeneratingPlan(false)
        return
      }

      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,  // ← Send token here!
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate plan')
      }

      // Refresh the plan
      setActivePlan(result.plan)
    } catch (err: any) {
      console.error('Plan generation error:', err)
      setError(err.message || 'Failed to generate plan')
    } finally {
      setGeneratingPlan(false)
    }
  }

  // Show loading while checking auth
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

  // Don't render if no user (will redirect)
  if (!user) {
    return null
  }

  return (
    <div 
      className="min-h-screen p-8 transition-all duration-500"
      style={{ background: 'var(--bgPrimary)' }}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 
              className="text-4xl font-bold mb-2"
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

          {/* Logout Button */}
          <button
            onClick={signOut}
            className="px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:opacity-80"
            style={{
              backgroundImage: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
              color: '#FFFFFF',
            }}
          >
            Sign Out
          </button>
        </div>

        {/* Generate Plan Section OR Onboarding Prompt */}
        {!loadingProfile && (
          <>
            {profile ? (
              // User has completed onboarding - show plan section
              <div
                className="themed-card p-8 border-2"
                style={{
                  backgroundColor: 'var(--bgCard)',
                  borderColor: 'var(--borderColor)',
                }}
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 
                      className="text-2xl font-bold mb-2"
                      style={{ color: 'var(--accent1)' }}
                    >
                      {activePlan ? '🎯 Your Fitness Plan' : '🚀 Ready to Start?'}
                    </h3>
                    <p style={{ color: 'var(--textSecondary)' }}>
                      {activePlan 
                        ? `Plan v${activePlan.version} created ${new Date(activePlan.created_at).toLocaleDateString()}`
                        : 'Generate your personalized AI-powered fitness plan'
                      }
                    </p>
                  </div>

                  <button
                    onClick={handleGeneratePlan}
                    disabled={generatingPlan}
                    className="px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    {/* Quick Stats */}
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

                    {/* Disclaimer */}
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

                    {/* Coming Soon Notice */}
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
              // User has NOT completed onboarding - show welcome prompt
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
            className="themed-card p-8 border-2"
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