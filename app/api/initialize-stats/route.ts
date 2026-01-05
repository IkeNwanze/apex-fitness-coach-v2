import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Calculate XP required for next level (RPG-style exponential curve)
function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5))
}

// Calculate current level based on total XP
function getLevelFromXP(totalXP: number): number {
  let level = 1
  let xpNeeded = 0
  
  while (xpNeeded <= totalXP) {
    level++
    xpNeeded += getXPForLevel(level - 1)
  }
  
  return level - 1
}

export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const accessToken = authHeader.replace('Bearer ', '')

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    )

    // Get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user_stats already exists
    const { data: existingStats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existingStats) {
      return NextResponse.json({
        message: 'Stats already initialized',
        stats: existingStats
      })
    }

    // Get active plan to determine plan start date
    const { data: activePlan } = await supabase
      .from('user_plans')
      .select('created_at')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    const planStartDate = activePlan?.created_at 
      ? new Date(activePlan.created_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]

    // Initialize user_stats
    const startingXP = 100 // Starting XP for creating account
    const startingLevel = getLevelFromXP(startingXP)
    
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .insert({
        user_id: user.id,
        plan_start_date: planStartDate,
        current_week: 1,
        total_workouts_completed: 0,
        total_workouts_planned: 0,
        current_streak_days: 0,
        longest_streak_days: 0,
        total_xp: startingXP,
        level: startingLevel,
        total_badges_earned: 0,
        current_x_percent: 0,
        best_x_percent: 0,
        average_x_percent: 0
      })
      .select()
      .single()

    if (statsError) {
      console.error('Error creating stats:', statsError)
      return NextResponse.json(
        { error: 'Failed to initialize stats', details: statsError.message },
        { status: 500 }
      )
    }

    // Award "Journey Begins" badge
    const badgeXP = 100
    const { data: firstBadge, error: badgeError } = await supabase
      .from('user_badges')
      .insert({
        user_id: user.id,
        badge_key: 'journey_begins',
        badge_name: 'Journey Begins',
        badge_description: 'Generated your first AI-powered fitness plan',
        badge_tier: 'bronze',
        theme_exclusive: null, // Universal badge
        xp_earned: badgeXP,
        progress_current: 1,
        progress_required: 1
      })
      .select()
      .single()

    // Update total XP and level with badge XP
    if (!badgeError) {
      const newTotalXP = startingXP + badgeXP
      const newLevel = getLevelFromXP(newTotalXP)
      
      await supabase
        .from('user_stats')
        .update({ 
          total_badges_earned: 1,
          total_xp: newTotalXP,
          level: newLevel
        })
        .eq('user_id', user.id)
    }

    // Initialize Week 1 progress
    const today = new Date()
    const weekStart = new Date(planStartDate)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const { data: weekProgress, error: progressError } = await supabase
      .from('user_progress')
      .insert({
        user_id: user.id,
        week_number: 1,
        week_start_date: weekStart.toISOString().split('T')[0],
        week_end_date: weekEnd.toISOString().split('T')[0],
        workouts_planned: 4, // Default from plan
        workouts_completed: 0,
        current_streak_days: 0,
        step_goal_days_hit: 0,
        step_goal_days_total: 7,
        x_percent_better: 0
      })
      .select()
      .single()

    return NextResponse.json({
      success: true,
      stats,
      firstBadge,
      weekProgress,
      xpSystem: {
        currentLevel: stats.level,
        totalXP: stats.total_xp,
        xpForNextLevel: getXPForLevel(stats.level),
        xpProgress: stats.total_xp % getXPForLevel(stats.level)
      },
      message: 'Stats initialized! You earned your first badge! 🎉'
    })

  } catch (error: any) {
    console.error('Initialization error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize', details: error.message },
      { status: 500 }
    )
  }
}