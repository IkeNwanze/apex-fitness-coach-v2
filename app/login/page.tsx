'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { useTheme } from '@/components/ThemeProvider'

export default function LoginPage() {
  const router = useRouter()
  const { themeConfig } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Successful login - redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-8 transition-all duration-500"
      style={{ background: `var(--bgPrimary)` }}
    >
      <div className="w-full max-w-md space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 
            className="text-4xl font-bold"
            style={{
              background: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Welcome Back
          </h1>
          <p style={{ color: 'var(--textSecondary)' }}>
            Sign in to continue your fitness journey
          </p>
        </div>

        {/* Login Card */}
        <div
          className="themed-card p-8 border-2 space-y-6"
          style={{
            backgroundColor: 'var(--bgCard)',
            borderColor: 'var(--borderColor)',
          }}
        >
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email Input */}
            <div className="space-y-2">
              <label 
                htmlFor="email" 
                className="block text-sm font-semibold"
                style={{ color: 'var(--textPrimary)' }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--bgSecondary)',
                  borderColor: 'var(--borderColor)',
                  color: 'var(--textPrimary)',
                }}
                placeholder="your@email.com"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="block text-sm font-semibold"
                style={{ color: 'var(--textPrimary)' }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--bgSecondary)',
                  borderColor: 'var(--borderColor)',
                  color: 'var(--textPrimary)',
                }}
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div 
                className="p-4 rounded-lg border-2"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderColor: '#EF4444',
                  color: '#EF4444',
                }}
              >
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg font-bold text-lg transition-all duration-300 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
                color: '#FFFFFF',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--borderColor)' }} />
            </div>
            <div className="relative flex justify-center text-sm">
              <span 
                className="px-2"
                style={{ 
                  backgroundColor: 'var(--bgCard)',
                  color: 'var(--textSecondary)'
                }}
              >
                Don't have an account?
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Link 
            href="/signup"
            className="block text-center font-semibold transition-all duration-300 hover:opacity-80"
            style={{ color: 'var(--accent1)' }}
          >
            Create an account →
          </Link>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link 
            href="/"
            className="text-sm font-medium transition-all duration-300 hover:opacity-80"
            style={{ color: 'var(--textSecondary)' }}
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}