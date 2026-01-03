'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { useTheme } from '@/components/ThemeProvider'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { supabaseBrowser } from '@/lib/supabaseClient'

interface UserProfile {
  id: string
  user_id: string
  full_name: string
  age: number
  gender: string
  fitness_goal: string
  experience_level: string
  available_equipment: string[]
  workout_frequency: string
  has_completed_onboarding: boolean
  created_at: string
}

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { themeConfig } = useTheme()
  const router = useRouter()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        setProfileLoading(true)
        setProfileError(null)

        const { data, error } = await supabaseBrowser
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            setProfile(null)
          } else {
            throw error
          }
        } else {
          setProfile(data)
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err)
        setProfileError(err.message || 'Failed to load profile')
      } finally {
        setProfileLoading(false)
      }
    }

    if (user) {
      fetchProfile()
    }
  }, [user])

  if (authLoading || profileLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bgPrimary)' }}
      >
        <div className="text-center space-y-4">
          <div 
            className="text-2xl font-bold"
            style={{ color: 'var(--textPrimary)' }}
          >
            Loading your dashboard...
          </div>
          <div 
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto"
            style={{ borderColor: 'var(--accent1)', borderTopColor: 'transparent' }}
          />
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (profileError) {
    return (
      <div 
        className="min-h-screen p-8 transition-all duration-500"
        style={{ background: 'var(--bgPrimary)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div
            className="themed-card p-8 border-2"
            style={{
              backgroundColor: 'var(--bgCard)',
              borderColor: '#EF4444',
            }}
          >
            <h2 
              className="text-2xl font-bold mb-4"
              style={{ color: '#EF4444' }}
            >
              Error Loading Profile
            </h2>
            <p style={{ color: 'var(--textSecondary)' }}>
              {profileError}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:opacity-80"
              style={{
                background: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
                color: '#FFFFFF',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen p-8 transition-all duration-500"
      style={{ background: 'var(--bgPrimary)' }}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 
              className="text-4xl font-bold mb-2"
              style={{
                background: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {profile ? `Welcome back, ${profile.full_name}!` : 'Welcome to Apex Fitness Coach'}
            </h1>
            <p style={{ color: 'var(--textSecondary)' }}>
              {user.email}
            </p>
          </div>

          <button
            onClick={signOut}
            className="px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:opacity-80"
            style={{
              background: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
              color: '#FFFFFF',
            }}
          >
            Sign Out
          </button>
        </div>

        {!profile && (
          <div
            className="themed-card p-8 border-2 text-center"
            style={{
              backgroundColor: 'var(--bgCard)',
              borderColor: 'var(--borderColor)',
            }}
          >
            <div className="space-y-6">
              <div>
                <div 
                  className="text-6xl mb-4"
                  style={{ color: 'var(--accent1)' }}
                >
                  👋
                </div>
                <h2 
                  className="text-3xl font-bold mb-2"
                  style={{ color: 'var(--textPrimary)' }}
                >
                  Let's Get You Started!
                </h2>
                <p 
                  className="text-lg"
                  style={{ color: 'var(--textSecondary)' }}
                >
                  Complete your profile so we can build your personalized fitness plan
                </p>
              </div>

              <Link href="/onboarding">
                <button
                  className="px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
                    color: '#FFFFFF',
                  }}
                >
                  Complete Your Profile →
                </button>
              </Link>

              <div className="pt-6 border-t" style={{ borderColor: 'var(--borderColor)' }}>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--textSecondary)' }}
                >
                  Takes less than 2 minutes • 4 simple questions
                </p>
              </div>
            </div>
          </div>
        )}

        {profile && (
          <>
            <div
              className="themed-card p-8 border-2"
              style={{
                backgroundColor: 'var(--bgCard)',
                borderColor: 'var(--borderColor)',
              }}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--accent1)' }}
                >
                  Your Profile
                </h2>
                <button
                  className="px-4 py-2 rounded-lg font-semibold text-sm border-2 transition-all duration-300 hover:opacity-80"
                  style={{
                    borderColor: 'var(--accent1)',
                    color: 'var(--accent1)',
                  }}
                >
                  Edit Profile
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p 
                      className="text-sm font-semibold mb-1"
                      style={{ color: 'var(--textSecondary)' }}
                    >
                      Age
                    </p>
                    <p 
                      className="text-lg font-bold"
                      style={{ color: 'var(--textPrimary)' }}
                    >
                      {profile.age} years old
                    </p>
                  </div>

                  <div>
                    <p 
                      className="text-sm font-semibold mb-1"
                      style={{ color: 'var(--textSecondary)' }}
                    >
                      Gender
                    </p>
                    <p 
                      className="text-lg font-bold"
                      style={{ color: 'var(--textPrimary)' }}
                    >
                      {profile.gender}
                    </p>
                  </div>

                  <div>
                    <p 
                      className="text-sm font-semibold mb-1"
                      style={{ color: 'var(--textSecondary)' }}
                    >
                      Experience Level
                    </p>
                    <p 
                      className="text-lg font-bold"
                      style={{ color: 'var(--textPrimary)' }}
                    >
                      {profile.experience_level}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p 
                      className="text-sm font-semibold mb-1"
                      style={{ color: 'var(--textSecondary)' }}
                    >
                      Primary Goal
                    </p>
                    <p 
                      className="text-lg font-bold"
                      style={{ color: 'var(--textPrimary)' }}
                    >
                      {profile.fitness_goal}
                    </p>
                  </div>

                  <div>
                    <p 
                      className="text-sm font-semibold mb-1"
                      style={{ color: 'var(--textSecondary)' }}
                    >
                      Training Frequency
                    </p>
                    <p 
                      className="text-lg font-bold"
                      style={{ color: 'var(--textPrimary)' }}
                    >
                      {profile.workout_frequency}
                    </p>
                  </div>

                  <div>
                    <p 
                      className="text-sm font-semibold mb-1"
                      style={{ color: 'var(--textSecondary)' }}
                    >
                      Available Equipment
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.available_equipment.map((equipment) => (
                        <span
                          key={equipment}
                          className="px-3 py-1 rounded-full text-sm font-semibold"
                          style={{
                            backgroundColor: 'var(--bgSecondary)',
                            color: 'var(--accent2)',
                          }}
                        >
                          {equipment}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="themed-card p-8 border-2"
              style={{
                backgroundColor: 'var(--bgCard)',
                borderColor: 'var(--borderColor)',
              }}
            >
              <h3 
                className="text-xl font-bold mb-4"
                style={{ color: 'var(--accent2)' }}
              >
                🚀 What's Next?
              </h3>
              <div className="space-y-3" style={{ color: 'var(--textSecondary)' }}>
                <p>✅ Profile complete!</p>
                <p>📸 Next: Upload your current and goal physique photos</p>
                <p>🤖 Then: AI will generate your personalized plan</p>
                <p>💪 After that: Start crushing your workouts!</p>
              </div>
              
              <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--borderColor)' }}>
                <p 
                  className="text-sm font-semibold mb-3"
                  style={{ color: 'var(--textPrimary)' }}
                >
                  Current Phase Status:
                </p>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--textSecondary)' }}
                >
                  Phase 2 Day 2 Complete: Profile data is now displayed on your dashboard!
                </p>
              </div>
            </div>
          </>
        )}

        <div className="space-y-4">
          <h2 
            className="text-2xl font-bold"
            style={{ color: 'var(--textPrimary)' }}
          >
            Choose Your Theme
          </h2>
          <ThemeSwitcher />
        </div>

      </div>
    </div>
  )
}