import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    // Get the Authorization header (sent from frontend)
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No access token provided' },
        { status: 401 }
      )
    }

    // Extract the token
    const accessToken = authHeader.replace('Bearer ', '')

    // Create Supabase client with the user's auth token
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

    // Get user with the access token
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'User profile not found', details: profileError.message },
        { status: 404 }
      )
    }

    // Fetch current photos
    const { data: currentPhotos } = await supabase
      .from('user_current_photos')
      .select('photo_url, photo_type')
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false })

    // Fetch goal photos
    const { data: goalPhotos } = await supabase
      .from('user_goal_photos')
      .select('photo_url, description')
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false })
      .limit(1)

    const hasPhotos = (currentPhotos && currentPhotos.length > 0) || (goalPhotos && goalPhotos.length > 0)

    // Build the prompt
    const prompt = buildPlanPrompt(profile, currentPhotos || [], goalPhotos || [])

    // Prepare content array for Claude API
    const content: any[] = []

    // Add current photos if available
    if (currentPhotos && currentPhotos.length > 0) {
      content.push({
        type: 'text',
        text: '=== CURRENT PHYSIQUE PHOTOS ===\n'
      })
      
      for (const photo of currentPhotos) {
        content.push({
          type: 'text',
          text: `Current photo (${photo.photo_type}): ${photo.photo_url}\n`
        })
      }
    }

    // Add goal photos if available
    if (goalPhotos && goalPhotos.length > 0) {
      content.push({
        type: 'text',
        text: '\n=== GOAL PHYSIQUE PHOTOS ===\n'
      })
      
      for (const photo of goalPhotos) {
        content.push({
          type: 'text',
          text: `Goal: ${photo.description || 'No description'}\nURL: ${photo.photo_url}\n`
        })
      }
    }

    // Add the main prompt
    content.push({
      type: 'text',
      text: prompt
    })

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content
      }]
    })

    // Extract JSON from response
    const responseText = message.content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join('')

    // Parse JSON (handle potential markdown code blocks)
    let planJson
    try {
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                       responseText.match(/```\n([\s\S]*?)\n```/)
      
      if (jsonMatch) {
        planJson = JSON.parse(jsonMatch[1])
      } else {
        planJson = JSON.parse(responseText)
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText.substring(0, 500))
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      )
    }

    // Archive any existing active plans
    await supabase
      .from('user_plans')
      .update({ status: 'archived' })
      .eq('user_id', user.id)
      .eq('status', 'active')

    // Get next version number
    const { data: latestPlan } = await supabase
      .from('user_plans')
      .select('version')
      .eq('user_id', user.id)
      .order('version', { ascending: false })
      .limit(1)
      .single()

    const nextVersion = latestPlan ? latestPlan.version + 1 : 1

    // Save new plan
    const { data: newPlan, error: insertError } = await supabase
      .from('user_plans')
      .insert({
        user_id: user.id,
        plan_json: planJson,
        version: nextVersion,
        status: 'active',
        generated_with_photos: hasPhotos
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to save plan:', insertError)
      return NextResponse.json(
        { error: 'Failed to save plan', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      plan: newPlan,
      version: nextVersion
    })

  } catch (error: any) {
    console.error('Plan generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate plan', details: error.message },
      { status: 500 }
    )
  }
}

function buildPlanPrompt(
  profile: any,
  currentPhotos: any[],
  goalPhotos: any[]
): string {
  const hasPhotos = currentPhotos.length > 0 || goalPhotos.length > 0

  const frequencyMap: Record<string, number> = {
    '1-2 days per week': 2,
    '3-4 days per week': 4,
    '5-6 days per week': 5,
    'Every day': 6
  }
  const daysPerWeek = frequencyMap[profile.workout_frequency] || 4

  let equipmentContext = ''
  if (profile.training_location === 'commercial') {
    equipmentContext = `Training at a commercial gym (${profile.gym_chain || profile.gym_custom_name || 'unnamed gym'}). Assume access to common gym equipment (barbells, dumbbells, cable machines, benches, etc.). Avoid exotic or specialty machines.`
  } else {
    const equipment = profile.available_equipment || []
    equipmentContext = `Training location: ${profile.training_location}. Available equipment: ${equipment.length > 0 ? equipment.join(', ') : 'bodyweight only'}. ONLY prescribe exercises using this equipment.`
  }

  return `You are an expert fitness coach creating a personalized training plan for Apex Fitness Coach.

CRITICAL RULES:
- No medical advice, diagnoses, or clinical guidance
- Do NOT estimate body fat %, weight, or health metrics from photos
- Use fitness-coach language: focus on visible development, proportions, definition, training priorities
- Output STRICT JSON ONLY (no markdown, no explanations outside JSON)
- If any input is missing, make conservative assumptions and list them in assumptions[]

USER PROFILE:
- Name: ${profile.full_name}
- Age: ${profile.age}
- Gender: ${profile.gender}
- Goal: ${profile.fitness_goal}
- Experience: ${profile.experience_level}
- ${equipmentContext}
- Workout Frequency: ${profile.workout_frequency} (${daysPerWeek} days per week)

${hasPhotos ? `
PHOTOS PROVIDED:
- Current physique: ${currentPhotos.length} photo(s)
- Goal physique: ${goalPhotos.length} photo(s)
${goalPhotos[0]?.description ? `- Goal description: "${goalPhotos[0].description}"` : ''}

Use photos to identify visual gaps and priority focus areas. Describe relative development and proportions only.
` : `
NO PHOTOS PROVIDED:
Generate the plan based on profile data only. Note in assumptions[] that visual analysis will improve once photos are added.
`}

TASK: Generate a complete fitness plan following this EXACT JSON structure:

{
  "assumptions": [string],
  "disclaimer": string,
  "inputs_used": {
    "has_photos": boolean,
    "goal_description": string,
    "training_location": string,
    "gym_name": string,
    "available_equipment_used": [string],
    "days_per_week": number
  },
  "visual_gap_summary": {
    "note": string,
    "priority_focus_areas": [
      { "area": string, "why": string, "priority": "high"|"medium"|"low" }
    ]
  },
  "time_to_goal": {
    "estimate_weeks_range": { "min": number, "max": number },
    "confidence": "low"|"medium"|"high",
    "what_would_make_it_faster": [string],
    "what_would_make_it_slower": [string]
  },
  "milestones": [
    {
      "week_range": { "start": number, "end": number },
      "title": string,
      "expected_changes": [string],
      "focus": [string],
      "check_in_metrics": [string]
    }
  ],
  "weekly_plan": {
    "program_length_weeks": number,
    "days_per_week": number,
    "session_length_minutes": number,
    "split_name": string,
    "schedule": [
      {
        "day_label": string,
        "session_focus": string,
        "warmup": [string],
        "workout": [
          {
            "exercise": string,
            "sets": number,
            "reps": string,
            "rest_seconds": number,
            "tempo": string,
            "notes": string,
            "substitutions": [string]
          }
        ],
        "finisher_optional": [string],
        "cooldown": [string]
      }
    ],
    "progression_rules": [string],
    "cardio_and_conditioning": {
      "sessions_per_week": number,
      "type": [string],
      "duration_minutes_each": number,
      "intensity_guidance": string
    }
  },
  "recovery_and_steps": {
    "steps_target_range": { "min": number, "max": number },
    "sleep_target_hours_range": { "min": number, "max": number },
    "recovery_habits": [string]
  },
  "nutrition": {
    "goal": string,
    "calorie_target_range": { "min": number, "max": number },
    "macros_grams": { "protein": number, "carbs": number, "fat": number },
    "macro_notes": [string],
    "meal_structure": [string],
    "example_day": {
      "breakfast": [string],
      "lunch": [string],
      "dinner": [string],
      "snacks": [string]
    },
    "hydration": { "liters_per_day": number, "notes": [string] }
  },
  "weekly_check_in": {
    "questions": [string],
    "adjustment_rules": [
      { "if": string, "then": string }
    ]
  },
  "tone_and_motivation": {
    "weekly_message_template": string,
    "focus_reminders": [string]
  }
}

Generate the complete plan now. Output ONLY valid JSON.`
}