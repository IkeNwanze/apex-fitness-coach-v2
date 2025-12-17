'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useTheme } from '@/components/ThemeProvider'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const { themeConfig } = useTheme()
  const router = useRouter()

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Show loading while checking auth
  if (loading) {
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
                background: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Welcome to Your Dashboard
            </h1>
            <p style={{ color: 'var(--textSecondary)' }}>
              Logged in as: {user.email}
            </p>
          </div>

          {/* Logout Button */}
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

        {/* Welcome Card */}
        <div
          className="themed-card p-8 border-2"
          style={{
            backgroundColor: 'var(--bgCard)',
            borderColor: 'var(--borderColor)',
          }}
        >
          <h3 
            className="text-2xl font-bold mb-4"
            style={{ color: 'var(--accent1)' }}
          >
            🎉 Authentication Complete!
          </h3>
          <div className="space-y-3" style={{ color: 'var(--textSecondary)' }}>
            <p>✅ You successfully created an account</p>
            <p>✅ You successfully logged in</p>
            <p>✅ This page is protected (requires login)</p>
            <p>✅ You can sign out using the button above</p>
            <p>✅ Themes work across all pages</p>
          </div>
        </div>

        {/* Status Card */}
        <div
          className="themed-card p-8 border-2"
          style={{
            backgroundColor: 'var(--bgCard)',
            borderColor: 'var(--borderColor)',
          }}
        >
          <h3 
            className="text-xl font-bold mb-4"
            style={{ color: 'var(--textPrimary)' }}
          >
            Your Profile
          </h3>
          <div className="space-y-2" style={{ color: 'var(--textSecondary)' }}>
            <p><strong style={{ color: 'var(--textPrimary)' }}>Email:</strong> {user.email}</p>
            <p><strong style={{ color: 'var(--textPrimary)' }}>User ID:</strong> {user.id}</p>
            <p><strong style={{ color: 'var(--textPrimary)' }}>Current Theme:</strong> {themeConfig.displayName}</p>
          </div>
        </div>

        {/* Next Steps */}
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
            🚀 Phase 1 Complete!
          </h3>
          <div className="space-y-2" style={{ color: 'var(--textSecondary)' }}>
            <p><strong style={{ color: 'var(--textPrimary)' }}>What we built:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>4-theme system (Cyberpunk, Bee, Pastel, Minimal)</li>
              <li>Theme switching with persistence</li>
              <li>User authentication (signup/login/logout)</li>
              <li>Protected routes</li>
              <li>Session management</li>
            </ul>
            <p className="mt-4"><strong style={{ color: 'var(--textPrimary)' }}>Next up (Phase 2):</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Onboarding flow</li>
              <li>User profile setup</li>
              <li>Goal setting</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}