'use client'

import { useState, useEffect } from 'react'
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
  training_location: string
  gym_chain: string
  gym_custom_name: string
  available_equipment: string[]
  workout_frequency: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { themeConfig } = useTheme()
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  
  const [formData, setFormData] = useState<OnboardingData>({
    full_name: '',
    age: '',
    gender: '',
    fitness_goal: '',
    experience_level: '',
    training_location: '',
    gym_chain: '',
    gym_custom_name: '',
    available_equipment: [],
    workout_frequency: '',
  })

  // Vitals state
  const [heightFeet, setHeightFeet] = useState('')
  const [heightInches, setHeightInches] = useState('')
  const [currentWeight, setCurrentWeight] = useState('')
  const [goalWeight, setGoalWeight] = useState('')
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs')

  // Load existing profile data if editing
  useEffect(() => {
    loadExistingProfile()
  }, [user])

  async function loadExistingProfile() {
    if (!user) return

    try {
      const { data: profile, error } = await supabaseBrowser
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        setIsEditing(true)
        
        setFormData({
          full_name: profile.full_name || '',
          age: profile.age?.toString() || '',
          gender: profile.gender || '',
          fitness_goal: profile.fitness_goal || '',
          experience_level: profile.experience_level || '',
          training_location: profile.training_location || '',
          gym_chain: profile.gym_chain || '',
          gym_custom_name: profile.gym_custom_name || '',
          available_equipment: profile.available_equipment || [],
          workout_frequency: profile.workout_frequency || '',
        })

        setHeightFeet(profile.height_feet?.toString() || '')
        setHeightInches(profile.height_inches?.toString() || '')
        setCurrentWeight(profile.current_weight?.toString() || '')
        setGoalWeight(profile.goal_weight?.toString() || '')
        setWeightUnit(profile.weight_unit || 'lbs')
      }
    } catch (err) {
      console.error('Error loading profile:', err)
    } finally {
      setInitialLoading(false)
    }
  }

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

      if (!heightFeet || parseInt(heightFeet) < 4 || parseInt(heightFeet) > 7) {
        setError('Please enter a valid height between 4-7 feet')
        return
      }
      
      const inches = parseInt(heightInches || '0')
      if (inches < 0 || inches >= 12) {
        setError('Inches must be between 0-11')
        return
      }
      
      if (!currentWeight || parseFloat(currentWeight) < 50) {
        setError('Please enter a valid weight (minimum 50)')
        return
      }
      
      if (goalWeight && parseFloat(goalWeight) < 50) {
        setError('Goal weight must be at least 50')
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

    if (!formData.training_location) {
      setError('Where will you be training? Pick one!')
      setLoading(false)
      return
    }

    if (formData.training_location === 'commercial' && !formData.gym_chain && !formData.gym_custom_name) {
      setError('Tell us which gym you go to!')
      setLoading(false)
      return
    }

    if (formData.training_location !== 'commercial' && formData.available_equipment.length === 0) {
      setError('What equipment do you have access to? Pick at least one!')
      setLoading(false)
      return
    }

    try {
      const heightCm = Math.round(
        (parseInt(heightFeet) * 30.48) + (parseInt(heightInches || '0') * 2.54)
      )

      const profileData = {
        user_id: user?.id,
        full_name: formData.full_name,
        age: parseInt(formData.age),
        gender: formData.gender,
        
        height_feet: parseInt(heightFeet),
        height_inches: parseInt(heightInches || '0'),
        height_cm: heightCm,
        current_weight: parseFloat(currentWeight),
        goal_weight: goalWeight ? parseFloat(goalWeight) : null,
        weight_unit: weightUnit,
        
        fitness_goal: formData.fitness_goal,
        experience_level: formData.experience_level,
        
        training_location: formData.training_location,
        gym_chain: formData.training_location === 'commercial' ? formData.gym_chain : null,
        gym_custom_name: formData.training_location === 'commercial' ? formData.gym_custom_name : null,
        
        available_equipment: formData.training_location !== 'commercial' ? formData.available_equipment : [],
        
        workout_frequency: formData.workout_frequency,
        has_completed_onboarding: true,
        updated_at: new Date().toISOString()
      }

      const { error: dbError } = await supabaseBrowser
        .from('user_profiles')
        .upsert(profileData, {
          onConflict: 'user_id'
        })

      if (dbError) {
        console.error('Database error:', dbError)
        throw dbError
      }

      router.push('/dashboard')
    } catch (err: any) {
      console.error('Submit error:', err)
      setError(err.message || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  // COMPREHENSIVE EQUIPMENT LIST - 31 items
  const equipmentOptions = [
    // Free Weights
    { name: 'Dumbbells', emoji: '💪', category: 'Free Weights' },
    { name: 'Barbell', emoji: '🏋️', category: 'Free Weights' },
    { name: 'Kettlebells', emoji: '⚫', category: 'Free Weights' },
    { name: 'Weight Plates', emoji: '⚙️', category: 'Free Weights' },
    
    // Benches
    { name: 'Flat Bench', emoji: '🪑', category: 'Benches' },
    { name: 'Adjustable Bench', emoji: '🛋️', category: 'Benches' },
    
    // Racks & All-in-One
    { name: 'Squat Rack', emoji: '🦵', category: 'Racks' },
    { name: 'Power Rack', emoji: '🏗️', category: 'Racks' },
    { name: 'Smith Machine', emoji: '🔧', category: 'Machines' },
    { name: 'All-in-One Home Gym', emoji: '🏛️', category: 'Machines' },
    
    // Cable Systems
    { name: 'Cable Machine', emoji: '🔌', category: 'Cables' },
    { name: 'Functional Trainer', emoji: '🎯', category: 'Cables' },
    
    // Bars & Bodyweight
    { name: 'Pull-up Bar', emoji: '🔥', category: 'Bodyweight' },
    { name: 'Dip Station', emoji: '💺', category: 'Bodyweight' },
    
    // Leg Machines
    { name: 'Leg Extension Machine', emoji: '🦿', category: 'Leg Machines' },
    { name: 'Leg Curl Machine', emoji: '🦵', category: 'Leg Machines' },
    { name: 'Leg Press Machine', emoji: '🏋️‍♂️', category: 'Leg Machines' },
    
    // Specialty
    { name: 'Landmine Attachment', emoji: '⛏️', category: 'Specialty' },
    { name: 'Suspension Trainer (TRX)', emoji: '🪢', category: 'Specialty' },
    { name: 'Resistance Bands', emoji: '🎗️', category: 'Specialty' },
    { name: 'Battle Ropes', emoji: '🪢', category: 'Specialty' },
    
    // Cardio
    { name: 'Walking Pad', emoji: '🚶', category: 'Cardio' },
    { name: 'Treadmill', emoji: '🏃', category: 'Cardio' },
    { name: 'Exercise Bike', emoji: '🚴', category: 'Cardio' },
    { name: 'Rowing Machine', emoji: '🚣', category: 'Cardio' },
    { name: 'Elliptical', emoji: '🎿', category: 'Cardio' },
    
    // Core/Accessories
    { name: 'Ab Wheel', emoji: '⭕', category: 'Accessories' },
    { name: 'Medicine Ball', emoji: '⚽', category: 'Accessories' },
    { name: 'Foam Roller', emoji: '🌀', category: 'Accessories' },
    
    // No Equipment
    { name: 'No Equipment', emoji: '🤸', category: 'Bodyweight' }
  ]

  const popularGyms = [
    '24 Hour Fitness',
    'Anytime Fitness',
    'Crunch Fitness',
    'Equinox',
    'Gold\'s Gym',
    'LA Fitness',
    'Lifetime Fitness',
    'Planet Fitness',
    'Other (specify below)'
  ]

  if (initialLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bgPrimary)' }}
      >
        <p style={{ color: 'var(--textPrimary)' }}>Loading...</p>
      </div>
    )
  }

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
            {isEditing ? "Update Your Profile ✏️" : "Alright, let's get to know you! 👋"}
          </h1>
          <p style={{ color: 'var(--textSecondary)' }}>
            {currentStep === 1 && "No judgment, just facts. We need the basics."}
            {currentStep === 2 && "What's the one thing you want most? Pick your mission."}
            {currentStep === 3 && "This helps us not kill you on Day 1 😅"}
            {currentStep === 4 && "Where will you train and what do you have?"}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm" style={{ color: 'var(--textSecondary)' }}>
            <span>Step {currentStep} of 4</span>
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
              {/* NAME */}
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

              {/* AGE */}
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

              {/* GENDER */}
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

              {/* HEIGHT */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold" style={{ color: 'var(--textPrimary)' }}>
                  Your Height 📏
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Feet"
                      value={heightFeet}
                      onChange={(e) => setHeightFeet(e.target.value)}
                      min="4"
                      max="7"
                      className="w-full px-4 py-3 rounded-lg border-2"
                      style={{
                        backgroundColor: 'var(--bgSecondary)',
                        borderColor: 'var(--borderColor)',
                        color: 'var(--textPrimary)',
                      }}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--textSecondary)' }}>
                      Feet (4-7)
                    </p>
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Inches"
                      value={heightInches}
                      onChange={(e) => setHeightInches(e.target.value)}
                      min="0"
                      max="11"
                      className="w-full px-4 py-3 rounded-lg border-2"
                      style={{
                        backgroundColor: 'var(--bgSecondary)',
                        borderColor: 'var(--borderColor)',
                        color: 'var(--textPrimary)',
                      }}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--textSecondary)' }}>
                      Inches (0-11)
                    </p>
                  </div>
                </div>
                <p className="text-xs" style={{ color: 'var(--textSecondary)' }}>
                  Example: 5 feet, 10 inches = 5'10"
                </p>
              </div>

              {/* CURRENT WEIGHT */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold" style={{ color: 'var(--textPrimary)' }}>
                  Current Weight ⚖️
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Weight"
                      value={currentWeight}
                      onChange={(e) => setCurrentWeight(e.target.value)}
                      step="0.1"
                      min="50"
                      className="w-full px-4 py-3 rounded-lg border-2"
                      style={{
                        backgroundColor: 'var(--bgSecondary)',
                        borderColor: 'var(--borderColor)',
                        color: 'var(--textPrimary)',
                      }}
                    />
                  </div>
                  <select 
                    value={weightUnit} 
                    onChange={(e) => setWeightUnit(e.target.value as 'lbs' | 'kg')}
                    className="px-4 py-3 rounded-lg border-2"
                    style={{
                      backgroundColor: 'var(--bgSecondary)',
                      borderColor: 'var(--borderColor)',
                      color: 'var(--textPrimary)',
                    }}
                  >
                    <option value="lbs">lbs</option>
                    <option value="kg">kg</option>
                  </select>
                </div>
                <p className="text-xs" style={{ color: 'var(--textSecondary)' }}>
                  Be honest - this helps us create the best plan for you 🎯
                </p>
              </div>

              {/* GOAL WEIGHT */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold" style={{ color: 'var(--textPrimary)' }}>
                  Goal Weight (Optional)
                </label>
                <input
                  type="number"
                  placeholder="Target weight"
                  value={goalWeight}
                  onChange={(e) => setGoalWeight(e.target.value)}
                  step="0.1"
                  className="w-full px-4 py-3 rounded-lg border-2"
                  style={{
                    backgroundColor: 'var(--bgSecondary)',
                    borderColor: 'var(--borderColor)',
                    color: 'var(--textPrimary)',
                  }}
                />
                <p className="text-xs" style={{ color: 'var(--textSecondary)' }}>
                  💡 Leave blank if you're focusing on body composition, not the scale
                </p>
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
              
              {/* TRAINING LOCATION */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold" style={{ color: 'var(--textPrimary)' }}>
                  Where will you train? 🏋️
                </h3>
                <div className="grid gap-3">
                  {[
                    { loc: 'commercial', name: 'Commercial Gym', sub: 'Full gym access (24 Hour, Planet Fitness, etc)', emoji: '🏢' },
                    { loc: 'home', name: 'Home Gym', sub: 'Training at home with your equipment', emoji: '🏠' },
                    { loc: 'outdoor', name: 'Outdoor/Park', sub: 'Parks, trails, outdoor spaces', emoji: '🌳' },
                    { loc: 'minimal', name: 'Limited Space', sub: 'Apartment, dorm, small space', emoji: '📦' }
                  ].map((item) => (
                    <button
                      key={item.loc}
                      type="button"
                      onClick={() => handleInputChange('training_location', item.loc)}
                      className="px-6 py-3 rounded-lg border-2 text-left transition-all duration-300 hover:scale-102"
                      style={{
                        backgroundColor: formData.training_location === item.loc ? 'var(--accent1)' : 'var(--bgSecondary)',
                        borderColor: formData.training_location === item.loc ? 'var(--accent1)' : 'var(--borderColor)',
                        color: formData.training_location === item.loc ? '#FFFFFF' : 'var(--textPrimary)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.emoji}</span>
                        <div className="flex-1">
                          <div className="font-semibold">{item.name}</div>
                          <div 
                            className="text-sm"
                            style={{ 
                              color: formData.training_location === item.loc ? 'rgba(255,255,255,0.9)' : 'var(--textSecondary)' 
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

              {/* GYM CHAIN (if commercial) */}
              {formData.training_location === 'commercial' && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold" style={{ color: 'var(--textPrimary)' }}>
                    Which gym? 💼
                  </h3>
                  <select
                    value={formData.gym_chain}
                    onChange={(e) => handleInputChange('gym_chain', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2"
                    style={{
                      backgroundColor: 'var(--bgSecondary)',
                      borderColor: 'var(--borderColor)',
                      color: 'var(--textPrimary)',
                    }}
                  >
                    <option value="">Select your gym...</option>
                    {popularGyms.map(gym => (
                      <option key={gym} value={gym}>{gym}</option>
                    ))}
                  </select>
                  
                  {(formData.gym_chain === 'Other (specify below)' || formData.gym_chain === '') && (
                    <input
                      type="text"
                      placeholder="Enter your gym name..."
                      value={formData.gym_custom_name}
                      onChange={(e) => handleInputChange('gym_custom_name', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2"
                      style={{
                        backgroundColor: 'var(--bgSecondary)',
                        borderColor: 'var(--borderColor)',
                        color: 'var(--textPrimary)',
                      }}
                    />
                  )}
                </div>
              )}

              {/* EQUIPMENT (if not commercial) */}
              {formData.training_location !== 'commercial' && formData.training_location !== '' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold" style={{ color: 'var(--textPrimary)' }}>
                    What equipment do you have? 💪
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--textSecondary)' }}>
                    Pick all that apply - we have 31 options including Walking Pad, Smith Machines, Leg Machines, and more!
                  </p>

                  <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto p-2">
                    {equipmentOptions.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => handleEquipmentToggle(item.name)}
                        className="px-4 py-3 rounded-lg border-2 font-semibold transition-all duration-300 hover:scale-105 text-left"
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
                  
                  {formData.available_equipment.length > 0 && (
                    <p className="text-sm" style={{ color: 'var(--accent1)' }}>
                      ✓ Selected {formData.available_equipment.length} item(s)
                    </p>
                  )}
                </div>
              )}

              {/* WORKOUT FREQUENCY */}
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
                {loading ? 'Saving your profile...' : isEditing ? "Update Profile 💾" : "Let's Go! 🚀"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}