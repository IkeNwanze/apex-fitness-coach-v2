'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useTheme } from '@/components/ThemeProvider'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { BottomNav } from '@/components/BottomNav'

type SessionStatus = 'not_started' | 'in_progress' | 'paused' | 'completed'

export default function PlanPage() {
  const { user } = useAuth()
  const { themeConfig } = useTheme()
  const router = useRouter()

  const [activePlan, setActivePlan] = useState<any>(null)
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [selectedDay, setSelectedDay] = useState<any>(null)
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set())
  
  // Session tracking
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('not_started')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)

  const [loading, setLoading] = useState(true)

  // Fetch active plan
  useEffect(() => {
    async function fetchPlan() {
      if (!user?.id) return

      try {
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
          setSelectedDay(planData.plan_json.weekly_plan.schedule[0])
        }
      } catch (err) {
        console.error('Error fetching plan:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPlan()
  }, [user])

  // Update selected day when day index changes
  useEffect(() => {
    if (activePlan?.plan_json?.weekly_plan?.schedule) {
      setSelectedDay(activePlan.plan_json.weekly_plan.schedule[selectedDayIndex])
    }
  }, [selectedDayIndex, activePlan])

  // Timer effect
  useEffect(() => {
    if (sessionStatus === 'in_progress' && startTime) {
      const interval = setInterval(() => {
        const now = new Date()
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
        setElapsedSeconds(elapsed)
      }, 1000)
      setTimerInterval(interval)
      return () => clearInterval(interval)
    } else if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }
  }, [sessionStatus, startTime])

  // Format timer display
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Toggle exercise completion
  const toggleExercise = (index: number) => {
    setCompletedExercises(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  // Start workout session
  const handleStartWorkout = async () => {
    if (!user?.id || !activePlan || !selectedDay) return

    try {
      const now = new Date()
      setStartTime(now)
      setSessionStatus('in_progress')

      // Create session in database
      const { data: session, error } = await supabaseBrowser
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          plan_id: activePlan.id,
          workout_day: selectedDay.day_label,
          week_number: activePlan.current_week || 1,
          started_at: now.toISOString(),
          total_exercises: selectedDay.workout?.length || 0,
          completed_exercises: 0,
          completion_percentage: 0,
          status: 'in_progress',
        })
        .select()
        .single()

      if (error) throw error
      setSessionId(session.id)
    } catch (err) {
      console.error('Error starting workout:', err)
    }
  }

  // Pause workout
  const handlePauseWorkout = () => {
    setSessionStatus('paused')
  }

  // Resume workout
  const handleResumeWorkout = () => {
    setSessionStatus('in_progress')
  }

  // Finish workout
  const handleFinishWorkout = async () => {
    if (!sessionId || !user?.id) return

    try {
      const totalMinutes = Math.floor(elapsedSeconds / 60)
      const completionPercentage = selectedDay.workout 
        ? Math.floor((completedExercises.size / selectedDay.workout.length) * 100)
        : 0

      // Estimate calories (rough: 5 calories per minute of workout)
      const estimatedCalories = Math.floor(totalMinutes * 5)

      // Update session in database
      await supabaseBrowser
        .from('workout_sessions')
        .update({
          finished_at: new Date().toISOString(),
          total_duration_minutes: totalMinutes,
          completed_exercises: completedExercises.size,
          completion_percentage: completionPercentage,
          estimated_calories_burned: estimatedCalories,
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)

      // Award XP for completing workout
      const xpEarned = Math.floor(completionPercentage * 0.5) // Up to 50 XP per workout

      const { data: stats } = await supabaseBrowser
        .from('user_stats')
        .select('total_xp')
        .eq('user_id', user.id)
        .single()

      if (stats) {
        await supabaseBrowser
          .from('user_stats')
          .update({
            total_xp: stats.total_xp + xpEarned,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
      }

      // Reset state
      setSessionStatus('completed')
      alert(`Workout completed! 🎉\n\n${completionPercentage}% complete\n${totalMinutes} minutes\n~${estimatedCalories} calories burned\n+${xpEarned} XP earned!`)

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      console.error('Error finishing workout:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000000' }}>
        <div style={{ color: '#FFFFFF' }}>Loading workout...</div>
      </div>
    )
  }

  if (!activePlan || !selectedDay) {
    return (
      <>
        <div className="min-h-screen pb-24" style={{ background: '#000000' }}>
          <div className="max-w-7xl mx-auto p-8">
            <p style={{ color: '#FFFFFF' }}>No active plan found. Please complete onboarding.</p>
          </div>
        </div>
        <BottomNav />
      </>
    )
  }

  const schedule = activePlan.plan_json.weekly_plan.schedule || []

  return (
    <>
      <div className="min-h-screen pb-24" style={{ background: themeConfig.colors.bgPrimary }}>
        <div className="max-w-7xl mx-auto px-3 py-4 space-y-4">
          
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 
              className="text-2xl md:text-3xl font-black"
              style={{
                background: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Workout Plan
            </h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 rounded-lg border-2 font-semibold text-sm transition-all"
              style={{
                borderColor: themeConfig.colors.borderColor,
                color: themeConfig.colors.textPrimary,
              }}
            >
              ← Back
            </button>
          </div>

          {/* Day Selector Tabs */}
          <div className="overflow-x-auto pb-2 -mx-3 px-3">
            <div className="flex gap-2 min-w-max">
              {schedule.map((day: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedDayIndex(index)}
                  className="px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all border-2"
                  style={{
                    backgroundColor: selectedDayIndex === index ? themeConfig.colors.accent1 : themeConfig.colors.bgCard,
                    borderColor: selectedDayIndex === index ? themeConfig.colors.accent1 : themeConfig.colors.borderColor,
                    color: selectedDayIndex === index ? '#FFFFFF' : themeConfig.colors.textPrimary,
                  }}
                >
                  {day.day_label}
                </button>
              ))}
            </div>
          </div>

          {/* Timer Display (when workout is active) */}
          {sessionStatus !== 'not_started' && sessionStatus !== 'completed' && (
            <div 
              className="p-6 rounded-xl border-4 text-center"
              style={{
                backgroundColor: themeConfig.colors.bgCard,
                borderColor: themeConfig.colors.accent1,
              }}
            >
              <div className="text-sm font-semibold mb-2" style={{ color: themeConfig.colors.textSecondary }}>
                {sessionStatus === 'paused' ? '⏸️ PAUSED' : '⏱️ WORKOUT IN PROGRESS'}
              </div>
              <div 
                className="text-6xl font-black mb-2"
                style={{ color: themeConfig.colors.accent1 }}
              >
                {formatTime(elapsedSeconds)}
              </div>
              <div className="text-sm" style={{ color: themeConfig.colors.textSecondary }}>
                {completedExercises.size} / {selectedDay.workout?.length || 0} exercises completed
              </div>
            </div>
          )}

          {/* Workout Card */}
          <div 
            className="p-6 rounded-xl border-4"
            style={{
              backgroundColor: themeConfig.colors.bgCard,
              borderColor: themeConfig.colors.borderColor,
            }}
          >
            {/* Workout Header */}
            <div className="mb-6">
              <h2 
                className="text-2xl font-black mb-2"
                style={{ color: themeConfig.colors.accent1 }}
              >
                {selectedDay.day_label}
              </h2>
              <p className="text-sm mb-1" style={{ color: themeConfig.colors.textSecondary }}>
                {selectedDay.session_focus}
              </p>
              <div className="flex gap-4 text-xs" style={{ color: themeConfig.colors.textSecondary }}>
                <span>🏋️ {selectedDay.workout?.length || 0} exercises</span>
                <span>⏱️ ~{activePlan.plan_json.weekly_plan.session_length_minutes || 60} min</span>
              </div>
            </div>

            {/* Exercise List */}
            {selectedDay.workout && selectedDay.workout.length > 0 ? (
              <div className="space-y-3 mb-6">
                {selectedDay.workout.map((exercise: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg border-2 transition-all"
                    style={{
                      backgroundColor: completedExercises.has(index) ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                      borderColor: completedExercises.has(index) ? themeConfig.colors.accent1 : themeConfig.colors.borderColor,
                    }}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleExercise(index)}
                      className="flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all"
                      style={{
                        borderColor: themeConfig.colors.accent1,
                        backgroundColor: completedExercises.has(index) ? themeConfig.colors.accent1 : 'transparent',
                      }}
                    >
                      {completedExercises.has(index) && <span className="text-white text-sm">✓</span>}
                    </button>

                    {/* Exercise Info */}
                    <div className="flex-1">
                      <h4 
                        className="font-bold mb-1"
                        style={{ 
                          color: themeConfig.colors.textPrimary,
                          textDecoration: completedExercises.has(index) ? 'line-through' : 'none',
                        }}
                      >
                        {exercise.name || exercise.exercise_name}
                      </h4>
                      <p className="text-sm" style={{ color: themeConfig.colors.textSecondary }}>
                        {exercise.sets} sets × {exercise.reps} reps
                        {exercise.rest_seconds && ` • ${exercise.rest_seconds}s rest`}
                      </p>
                      {exercise.notes && (
                        <p className="text-xs mt-1" style={{ color: themeConfig.colors.textSecondary }}>
                          💡 {exercise.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8" style={{ color: themeConfig.colors.textSecondary }}>
                Rest day - No exercises scheduled
              </p>
            )}

            {/* Session Control Buttons */}
            {selectedDay.workout && selectedDay.workout.length > 0 && (
              <div className="space-y-3">
                {sessionStatus === 'not_started' && (
                  <button
                    onClick={handleStartWorkout}
                    className="w-full py-4 rounded-lg font-bold text-lg transition-all hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
                      color: '#FFFFFF',
                    }}
                  >
                    Start Workout 🚀
                  </button>
                )}

                {sessionStatus === 'in_progress' && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handlePauseWorkout}
                      className="py-3 rounded-lg font-bold border-2 transition-all"
                      style={{
                        borderColor: themeConfig.colors.borderColor,
                        color: themeConfig.colors.textPrimary,
                      }}
                    >
                      ⏸️ Pause
                    </button>
                    <button
                      onClick={handleFinishWorkout}
                      className="py-3 rounded-lg font-bold transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
                        color: '#FFFFFF',
                      }}
                    >
                      ✓ Finish
                    </button>
                  </div>
                )}

                {sessionStatus === 'paused' && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleResumeWorkout}
                      className="py-3 rounded-lg font-bold transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
                        color: '#FFFFFF',
                      }}
                    >
                      ▶️ Resume
                    </button>
                    <button
                      onClick={handleFinishWorkout}
                      className="py-3 rounded-lg font-bold border-2 transition-all"
                      style={{
                        borderColor: themeConfig.colors.borderColor,
                        color: themeConfig.colors.textPrimary,
                      }}
                    >
                      ✓ Finish
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </>
  )
}