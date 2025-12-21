'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useTheme } from '@/components/ThemeProvider'
import { supabaseBrowser } from '@/lib/supabaseClient'

type OnboardingStep = 1 | 2 | 3 | 4

interface OnboardingData {
  full_name: string
  age: string
  gender: string
  fitness_goal: string
  experience_level: string
  available_equipment: string[]
  workout_frequency: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { themeConfig } = useTheme()
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<OnboardingData>({
    full_name: '',
    age: '',
    gender: '',
    fitness_goal: '',
    experience_level: '',
    available_equipment: [],
    workout_frequency: '',
  })

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleEquipmentToggle = (equipment: string) => {
    setFormData(prev => ({
      ...prev,
      available_equipment: prev.available_equipment.includes(equipment)
        ? prev.available_equipment.filter(e => e !== equipment)
        : [...prev.available_equipment, equipment]
    }))
  }

  const handleNext = () => {
    setError(null)
    
    if (currentStep === 1) {
      if (!formData.full_name || !formData.age || !formData.gender) {
        setError("Come on, don't leave us hanging! Fill in all the fields 😊")
        return
      }
      if (parseInt(formData.age) < 13 || parseInt(formData.age) > 120) {
        setError('That age seems... off. Give us a real number!')
        return
      }
    }
    
    if (currentStep === 2 && !formData.fitness_goal) {
      setError('Pick one! What are we working towards? 💪')
      return
    }
    
    if (currentStep === 3 && !formData.experience_level) {
      setError('No judgment! Where are you at right now?')
      return
    }
    
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as OnboardingStep)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as OnboardingStep)
      setError(null)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    if (!formData.workout_frequency) {
      setError('How many days can you commit? Pick one!')
      setLoading(false)
      return
    }

    try {
      const { error: dbError } = await supabaseBrowser
        .from('user_profiles')
        .insert({
          user_id: user?.id,
          full_name: formData.full_name,
          age: parseInt(formData.age),
          gender: formData.gender,
          fitness_goal: formData.fitness_goal,
          experience_level: formData.experience_level,
          available_equipment: formData.available_equipment,
          workout_frequency: formData.workout_frequency,
          has_completed_onboarding: true,
        })

      if (dbError) throw dbError

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  const equipmentOptions = [
    { name: 'Dumbbells', emoji: '💪' },
    { name: 'Barbell', emoji: '🏋️' },
    { name: 'Bench', emoji: '🪑' },
    { name: 'Pull-up Bar', emoji: '🔥' },
    { name: 'Resistance Bands', emoji: '🎗️' },
    { name: 'Kettlebells', emoji: '⚫' },
    { name: 'No Equipment', emoji: '🏃' }
  ]

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-8 transition-all duration-500"
      style={{ background: 'var(--bgPrimary)' }}
    >
      <div className="w-full max-w-2xl space-y-8">
        
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
            {currentStep === 1 && "Alright, let's get to know you! 👋"}
            {currentStep === 2 && "What's the dream? 🎯"}
            {currentStep === 3 && "Real talk: Where are you at? 💯"}
            {currentStep === 4 && "Last question - what's in your gym? 🏋️"}
          </h1>
          <p style={{ color: 'var(--textSecondary)' }}>
            {currentStep === 1 && "No judgment, just facts. We need the basics."}
            {currentStep === 2 && "What's the one thing you want most? Pick your mission."}
            {currentStep === 3 && "This helps us not kill you on Day 1 😅"}
            {currentStep === 4 && "Even if it's just your body weight, we'll make it work!"}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm" style={{ color: 'var(--textSecondary)' }}>
            <span>Question {currentStep} of 4</span>
            <span>{currentStep * 25}% there!</span>
          </div>
          <div 
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--bgSecondary)' }}
          >
            <div 
              className="h-full transition-all duration-500"
              style={{
                width: `${currentStep * 25}%`,
                background: `linear-gradient(90deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
              }}
            />
          </div>
        </div>

        <div
          className="themed-card p-8 border-2 space-y-6"
          style={{
            backgroundColor: 'var(--bgCard)',
            borderColor: 'var(--borderColor)',
          }}
        >
          
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold" style={{ color: 'var(--textPrimary)' }}>
                  What should we call you?
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--bgSecondary)',
                    borderColor: 'var(--borderColor)',
                    color: 'var(--textPrimary)',
                  }}
                  placeholder="Your actual name (we won't share it!)"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold" style={{ color: 'var(--textPrimary)' }}>
                  How many trips around the sun?
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--bgSecondary)',
                    borderColor: 'var(--borderColor)',
                    color: 'var(--textPrimary)',
                  }}
                  placeholder="Be honest - your body knows 😉"
                  min="13"
                  max="120"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold" style={{ color: 'var(--textPrimary)' }}>
                  Gender (helps with workout recommendations)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Male', 'Female', 'Other'].map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => handleInputChange('gender', gender)}
                      className="px-4 py-3 rounded-lg border-2 font-semibold transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: formData.gender === gender ? 'var(--accent1)' : 'var(--bgSecondary)',
                        borderColor: formData.gender === gender ? 'var(--accent1)' : 'var(--borderColor)',
                        color: formData.gender === gender ? '#FFFFFF' : 'var(--textPrimary)',
                      }}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid gap-3">
                {[
                  { goal: 'Lose Weight', sub: 'Get lean, feel lighter, drop fat', emoji: '🔥' },
                  { goal: 'Build Muscle', sub: 'Pack on size, look jacked, get swole', emoji: '💪' },
                  { goal: 'Get Stronger', sub: 'Lift heavy, hit PRs, feel powerful', emoji: '⚡' },
                  { goal: 'Improve Endurance', sub: "Run longer, don't get winded, beast mode", emoji: '🏃' },
                  { goal: 'General Fitness', sub: 'Just be healthier and feel good overall', emoji: '✨' },
                  { goal: 'Athletic Performance', sub: 'Compete, dominate, win at sports', emoji: '🏆' }
                ].map((item) => (
                  <button
                    key={item.goal}
                    type="button"
                    onClick={() => handleInputChange('fitness_goal', item.goal)}
                    className="px-6 py-4 rounded-lg border-2 text-left transition-all duration-300 hover:scale-102"
                    style={{
                      backgroundColor: formData.fitness_goal === item.goal ? 'var(--accent1)' : 'var(--bgSecondary)',
                      borderColor: formData.fitness_goal === item.goal ? 'var(--accent1)' : 'var(--borderColor)',
                      color: formData.fitness_goal === item.goal ? '#FFFFFF' : 'var(--textPrimary)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.emoji}</span>
                      <div className="flex-1">
                        <div className="font-bold">{item.goal}</div>
                        <div 
                          className="text-sm"
                          style={{ 
                            color: formData.fitness_goal === item.goal ? 'rgba(255,255,255,0.9)' : 'var(--textSecondary)' 
                          }}
                        >
                          {item.sub}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid gap-3">
                {[
                  { level: 'Beginner', desc: 'New to this, ready to learn', emoji: '🌱', sub: "(Don't worry - everyone starts here!)" },
                  { level: 'Intermediate', desc: '1-2 years in, got the basics down', emoji: '💪', sub: "(You know what a burpee is and hate it)" },
                  { level: 'Advanced', desc: '3+ years, you live this lifestyle', emoji: '🔥', sub: "(Gym is basically your second home)" },
                  { level: 'Expert', desc: 'Coach/athlete level, you could teach this', emoji: '🏆', sub: "(People ask YOU for fitness advice)" }
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => handleInputChange('experience_level', item.level)}
                    className="px-6 py-4 rounded-lg border-2 text-left transition-all duration-300 hover:scale-102"
                    style={{
                      backgroundColor: formData.experience_level === item.level ? 'var(--accent1)' : 'var(--bgSecondary)',
                      borderColor: formData.experience_level === item.level ? 'var(--accent1)' : 'var(--borderColor)',
                      color: formData.experience_level === item.level ? '#FFFFFF' : 'var(--textPrimary)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{item.emoji}</span>
                      <div className="flex-1">
                        <div className="font-bold text-lg">{item.level}</div>
                        <div 
                          className="text-sm mt-1"
                          style={{ 
                            color: formData.experience_level === item.level ? 'rgba(255,255,255,0.9)' : 'var(--textSecondary)' 
                          }}
                        >
                          {item.desc}
                        </div>
                        <div 
                          className="text-xs mt-1 italic"
                          style={{ 
                            color: formData.experience_level === item.level ? 'rgba(255,255,255,0.8)' : 'var(--textSecondary)' 
                          }}
                        >
                          {item.sub}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm" style={{ color: 'var(--textSecondary)' }}>
                  Pick all that apply - even if it's just you and the floor!
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {equipmentOptions.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => handleEquipmentToggle(item.name)}
                      className="px-4 py-3 rounded-lg border-2 font-semibold transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: formData.available_equipment.includes(item.name) ? 'var(--accent1)' : 'var(--bgSecondary)',
                        borderColor: formData.available_equipment.includes(item.name) ? 'var(--accent1)' : 'var(--borderColor)',
                        color: formData.available_equipment.includes(item.name) ? '#FFFFFF' : 'var(--textPrimary)',
                      }}
                    >
                      <span className="mr-2">{item.emoji}</span>
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 
                    className="text-xl font-bold"
                    style={{ color: 'var(--textPrimary)' }}
                  >
                    How many days can you REALISTICALLY commit?
                  </h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--textSecondary)' }}>
                    Be honest - we'd rather you crush 3 days than skip 6!
                  </p>
                </div>

                <div className="grid gap-3">
                  {[
                    { freq: '1-2 days per week', sub: 'Just starting or super busy', emoji: '🌱' },
                    { freq: '3-4 days per week', sub: 'The sweet spot for most people', emoji: '💪' },
                    { freq: '5-6 days per week', sub: 'You mean business', emoji: '🔥' },
                    { freq: 'Every day', sub: 'Absolute savage mode', emoji: '🏆' }
                  ].map((item) => (
                    <button
                      key={item.freq}
                      type="button"
                      onClick={() => handleInputChange('workout_frequency', item.freq)}
                      className="px-6 py-3 rounded-lg border-2 text-left transition-all duration-300 hover:scale-102"
                      style={{
                        backgroundColor: formData.workout_frequency === item.freq ? 'var(--accent1)' : 'var(--bgSecondary)',
                        borderColor: formData.workout_frequency === item.freq ? 'var(--accent1)' : 'var(--borderColor)',
                        color: formData.workout_frequency === item.freq ? '#FFFFFF' : 'var(--textPrimary)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.emoji}</span>
                        <div className="flex-1">
                          <div className="font-semibold">{item.freq}</div>
                          <div 
                            className="text-sm"
                            style={{ 
                              color: formData.workout_frequency === item.freq ? 'rgba(255,255,255,0.9)' : 'var(--textSecondary)' 
                            }}
                          >
                            {item.sub}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

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

          <div className="flex gap-4 pt-4">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 rounded-lg font-bold border-2 transition-all duration-300 hover:opacity-80"
                style={{
                  borderColor: 'var(--borderColor)',
                  color: 'var(--textPrimary)',
                }}
              >
                ← Back
              </button>
            )}
            
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
                  color: '#FFFFFF',
                }}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
                  color: '#FFFFFF',
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Saving your profile...' : "Let's Go! 🚀"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}