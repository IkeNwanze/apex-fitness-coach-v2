'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { useTheme } from '@/components/ThemeProvider'

export default function SignupPage() {
  const router = useRouter()
  const { themeConfig } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabaseBrowser.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      // Success!
      setSuccess(true)
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Signup failed')
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
            Start Your Journey
          </h1>
          <p style={{ color: 'var(--textSecondary)' }}>
            Create your Apex Fitness Coach account
          </p>
        </div>

        {/* Signup Card */}
        <div
          className="themed-card p-8 border-2 space-y-6"
          style={{
            backgroundColor: 'var(--bgCard)',
            borderColor: 'var(--borderColor)',
          }}
        >
          {success ? (
            // Success Message
            <div className="text-center space-y-4 py-8">
              <div 
                className="text-5xl mb-4"
                style={{ color: 'var(--accent1)' }}
              >
                ✓
              </div>
              <h3 
                className="text-2xl font-bold"
                style={{ color: 'var(--textPrimary)' }}
              >
                Account Created!
              </h3>
              <p style={{ color: 'var(--textSecondary)' }}>
                Check your email to verify your account.
              </p>
              <p style={{ color: 'var(--textSecondary)' }} className="text-sm">
                Redirecting to login...
              </p>
            </div>
          ) : (
            // Signup Form
            <form onSubmit={handleSignup} className="space-y-6">
              
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
                <p className="text-xs" style={{ color: 'var(--textSecondary)' }}>
                  Must be at least 6 characters
                </p>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-sm font-semibold"
                  style={{ color: 'var(--textPrimary)' }}
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

              {/* Signup Button */}
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
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {!success && (
            <>
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
                    Already have an account?
                  </span>
                </div>
              </div>

              {/* Login Link */}
              <Link 
                href="/login"
                className="block text-center font-semibold transition-all duration-300 hover:opacity-80"
                style={{ color: 'var(--accent1)' }}
              >
                Sign in instead →
              </Link>
            </>
          )}
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
