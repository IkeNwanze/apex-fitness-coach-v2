import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    // Get user data from request body
    const body = await request.json()
    const { profile, currentPhotos, goalPhotos } = body

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile data is required' },
        { status: 400 }
      )
    }

    // Build the enhanced AI prompt
    console.log('Building prompt for user:', profile.full_name)
    const prompt = buildEnhancedPrompt(profile, currentPhotos, goalPhotos)
    console.log('Prompt length:', prompt.length, 'characters')

    // Call Claude API
    console.log('Calling Claude API...')
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })
    console.log('✅ Claude API responded')

    // Extract the JSON response
    console.log('Raw AI message:', message)
    
    const responseText = message.content[0]?.type === 'text' 
      ? message.content[0].text 
      : ''

    console.log('Response text length:', responseText.length)
    console.log('First 500 chars:', responseText.substring(0, 500))

    if (!responseText || responseText.length === 0) {
      console.error('Empty response from AI')
      return NextResponse.json(
        { error: 'AI returned empty response', details: 'No content in message' },
        { status: 500 }
      )
    }

    // Parse the JSON (Claude should return pure JSON)
    let planData
    try {
      // Remove markdown code blocks if present
      let cleanedResponse = responseText
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/g, '')
        .trim()
      
      // Remove any leading/trailing text before/after JSON
      const jsonStart = cleanedResponse.indexOf('{')
      const jsonEnd = cleanedResponse.lastIndexOf('}')
      
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('No JSON object found in response')
      }
      
      cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1)
      
      console.log('Cleaned response length:', cleanedResponse.length)
      console.log('Attempting to parse JSON...')
      
      planData = JSON.parse(cleanedResponse)
      console.log('✅ JSON parsed successfully')
    } catch (parseError: any) {
      console.error('Failed to parse AI response')
      console.error('Parse error:', parseError.message)
      console.error('Full response:', responseText)
      return NextResponse.json(
        { 
          error: 'Failed to parse AI response', 
          details: parseError.message,
          responsePreview: responseText.substring(0, 1000)
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      plan: planData,
    })

  } catch (error: any) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate plan', details: error.message },
      { status: 500 }
    )
  }
}

function buildEnhancedPrompt(
  profile: any,
  currentPhotos: any[] = [],
  goalPhotos: any[] = []
): string {
  const hasPhotos = currentPhotos.length > 0 || goalPhotos.length > 0
  
  // Calculate BMR using Mifflin-St Jeor equation
  const heightCm = profile.height_cm || 178
  const weightKg = profile.weight_unit === 'kg' 
    ? profile.current_weight 
    : profile.current_weight * 0.453592
  const age = profile.age
  const isMale = profile.gender === 'Male'
  
  let bmr
  if (isMale) {
    bmr = Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5)
  } else {
    bmr = Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161)
  }
  
  // Calculate TDEE (BMR * activity multiplier)
  const activityMultiplier = 1.55 // Moderate activity (3-5 workouts/week)
  const tdee = Math.round(bmr * activityMultiplier)
  
  // Equipment context
  let equipmentContext = ''
  if (profile.training_location === 'commercial') {
    equipmentContext = `Training at a commercial gym (${profile.gym_chain || profile.gym_custom_name || 'unnamed gym'}). Assume access to standard gym equipment: barbells, dumbbells, cable machines, benches, smith machine, leg press, squat racks, etc. Avoid exotic or specialty machines that aren't universally available.`
  } else {
    const equipment = profile.available_equipment || []
    if (equipment.length === 0 || equipment.includes('No Equipment')) {
      equipmentContext = `Training location: ${profile.training_location}. NO EQUIPMENT AVAILABLE (bodyweight only). CRITICAL: ONLY prescribe bodyweight exercises. Do not suggest ANY equipment-based exercises.`
    } else {
      equipmentContext = `Training location: ${profile.training_location}. Available equipment: ${equipment.join(', ')}. CRITICAL: ONLY prescribe exercises using EXACTLY this equipment. Do not suggest equipment they don't have. If they don't have barbells, use dumbbells. If they don't have cables, use bands or bodyweight alternatives.`
    }
  }

  // Parse workout frequency
  const frequencyMap: Record<string, number> = {
    '1-2 days per week': 2,
    '3-4 days per week': 4,
    '5-6 days per week': 5,
    'Every day': 6
  }
  const daysPerWeek = frequencyMap[profile.workout_frequency] || 4

  return `You are an expert fitness coach creating a personalized training plan for Apex Fitness Coach.

CRITICAL RULES:
- No medical advice, diagnoses, or clinical guidance
- Do NOT estimate body fat %, weight, or health metrics from photos
- Use fitness-coach language: focus on visible development, proportions, definition, training priorities
- Output STRICT JSON ONLY (no markdown, no explanations outside JSON)
- If any input is missing, make conservative assumptions and list them in assumptions[]

=== USER PROFILE ===

VITALS & DEMOGRAPHICS:
- Name: ${profile.full_name}
- Age: ${profile.age}
- Gender: ${profile.gender}
- Height: ${profile.height_feet}'${profile.height_inches || 0}" (${heightCm}cm)
- Current Weight: ${profile.current_weight} ${profile.weight_unit} (${weightKg.toFixed(1)} kg)
${profile.goal_weight ? `- Goal Weight: ${profile.goal_weight} ${profile.weight_unit} (change needed: ${Math.abs(profile.goal_weight - profile.current_weight).toFixed(1)} ${profile.weight_unit})` : '- Goal: Body composition focus (not scale weight - user wants to look better, not chase a number)'}

METABOLIC DATA (calculated):
- BMR (Basal Metabolic Rate): ~${bmr} calories/day
- TDEE (Total Daily Energy Expenditure): ~${tdee} calories/day
- Activity Level: Moderate (${daysPerWeek} training days per week)

TRAINING PROFILE:
- Stated Fitness Goal: ${profile.fitness_goal}
- Experience Level: ${profile.experience_level}
- ${equipmentContext}
- Workout Frequency: ${profile.workout_frequency} (${daysPerWeek} days per week)

=== VISUAL ANALYSIS ${hasPhotos ? 'REQUIRED' : '(NO PHOTOS PROVIDED)'} ===

${hasPhotos ? `
PHOTOS PROVIDED: YES (${currentPhotos.length} current, ${goalPhotos.length} goal)

STEP 1: ANALYZE CURRENT PHYSIQUE
Based on visible indicators in the current photo(s), assess:

A) MUSCLE DEVELOPMENT (visual, descriptive only - NO percentages):
   - Upper Body: Shoulder width/roundness, chest thickness/definition, arm development, back width
   - Core: Visible ab development, oblique definition, overall torso structure
   - Lower Body: Leg development, glute development, proportions
   - Overall Symmetry: Balanced vs imbalanced development

B) BODY COMPOSITION (descriptive only - NO measurements):
   - Visible leanness level (use terms like "lean", "moderate leanness", "higher body fat")
   - Fat distribution (where fat is held - waist, hips, etc.)
   - Muscle definition visibility (where muscles are visible vs covered)

C) STRUCTURAL OBSERVATIONS:
   - Posture indicators
   - Natural body structure (frame size, limb lengths)
   - Proportions

D) STRENGTHS TO LEVERAGE (positive focus):
   - What already looks good
   - Areas with solid foundation
   - Natural advantages

STEP 2: ANALYZE GOAL PHYSIQUE
${goalPhotos.length > 0 ? `
Based on the goal photo(s):
${goalPhotos[0]?.description ? `- User's description: "${goalPhotos[0].description}"` : ''}
${goalPhotos[0]?.goal_person_name ? `- Reference: ${goalPhotos[0].goal_person_name}` : ''}
${goalPhotos[0]?.goal_person_height ? `- Reference height: ${goalPhotos[0].goal_person_height}` : ''}
${goalPhotos[0]?.goal_person_weight ? `- Reference weight: ${goalPhotos[0].goal_person_weight}` : ''}

Assess target aesthetics:
- TARGET MUSCLE DEVELOPMENT: What muscles are prominently developed
- TARGET LEANNESS: Relative body composition
- TARGET PROPORTIONS: Key aesthetic features (V-taper, X-frame, athletic build)
- TARGET DEFINITION: Specific features (abs, V-cut, shoulder definition, chest separation)
` : 'No goal photos provided - infer from fitness goal and experience level.'}

STEP 3: GAP ANALYSIS (CRITICAL FOR EXERCISE SELECTION)
Compare current vs goal:

A) MUSCLES TO BUILD (prioritized list):
   - Which muscle groups need development
   - Priority: HIGH/MEDIUM/LOW
   - Expected timeline for visible changes
   
B) DEFINITION TO REVEAL:
   - Areas where muscle exists but is covered
   - What will emerge as body fat reduces
   
C) PROPORTIONS TO BALANCE:
   - Any asymmetries to address
   - What needs emphasis to achieve goal proportions

D) EXERCISE SELECTION RATIONALE:
   For each major muscle group, explain:
   - Current state
   - Goal state
   - WHY specific exercises bridge that gap
   - Expected progression timeline

STEP 4: PERSONALIZED MOTIVATION
Create a motivational paragraph that:
- Acknowledges current strengths
- Explains specific focus areas
- Sets realistic expectations with timelines
- Sounds encouraging but honest

Example tone: "You have great shoulder width to build on - we'll focus on adding chest thickness, especially in the lower pecs, while progressively reducing body fat. Your abs will start showing around week 10-14 as we combine targeted core work with our calorie deficit."

` : `
PHOTOS PROVIDED: NO

Without photos, generate plan based on:
- Profile data (goal, experience, equipment, vitals)
- General principles for the stated goal
- Conservative assumptions

Note in assumptions[]:
- Visual analysis would significantly improve specificity
- Timeline estimates are conservative without visual data
- Exercise selection is based on goal type, not individual physique analysis
`}

=== REQUIRED JSON OUTPUT ===

Generate a complete plan with this EXACT structure:

{
  "assumptions": [
    "List any assumptions made due to missing data",
    ${!hasPhotos ? '"No photos provided - using general approach for goal type",' : ''}
    "Any equipment or experience assumptions"
  ],
  
  "disclaimer": "This plan is for educational purposes only. Consult healthcare professionals before starting any fitness program. Individual results vary based on consistency, nutrition adherence, genetics, and other factors.",
  
  ${hasPhotos ? `
  "current_state_assessment": {
    "strengths": [
      "Specific positive attributes visible in photos",
      "Areas with good development",
      "Natural advantages"
    ],
    "areas_to_develop": [
      "Specific muscles/areas needing work",
      "Body composition goals",
      "Proportional targets"
    ]
  },
  
  "visual_gap_summary": {
    "personalized_motivation": "3-5 sentence paragraph acknowledging strengths and explaining focus areas with timeline mentions",
    
    "priority_focus_areas": [
      {
        "area": "Muscle group or aesthetic feature",
        "current_state": "Visual assessment",
        "target_state": "Desired outcome",
        "why": "Why this matters for achieving goal physique",
        "priority": "high|medium|low",
        "timeline_weeks": number,
        "training_approach": "How we'll address this"
      }
    ]
  },
  ` : ''}
  
  "inputs_used": {
    "has_photos": ${hasPhotos},
    "height_cm": ${heightCm},
    "weight_kg": ${weightKg.toFixed(1)},
    "bmr": ${bmr},
    "tdee": ${tdee},
    "goal_weight": ${profile.goal_weight ? `"${profile.goal_weight} ${profile.weight_unit}"` : '"Body composition focus"'},
    "training_location": "${profile.training_location}",
    "equipment": ${JSON.stringify(profile.available_equipment || [])},
    "days_per_week": ${daysPerWeek}
  },
  
  "time_to_goal": {
    "estimate_weeks_range": { 
      "min": number, 
      "max": number 
    },
    "rationale": "Explanation based on current weight, goal, expected rate of change (0.5-2 lbs muscle/month or 0.5-2 lbs fat/week), age, experience level",
    "confidence": "low|medium|high"
  },
  
  "milestones": [
    {
      "week_range": { "start": 1, "end": 4 },
      "title": "Foundation Phase",
      "expected_changes": [
        "Improved form and technique",
        "Initial strength gains",
        "Routine establishment"
      ],
      "visual_changes": [
        "Pump becomes noticeable",
        "Slight muscle hardness increase",
        "Clothes may fit differently"
      ],
      "focus": ["Form mastery", "Building consistency"]
    }
  ],
  
  "weekly_plan": {
    "program_length_weeks": number,
    "days_per_week": ${daysPerWeek},
    "split_name": "Upper/Lower" | "Push/Pull/Legs" | "Full Body" | "Bro Split",
    "split_rationale": "WHY this split for THIS user based on days available, experience, and goals",
    
    "schedule": [
      {
        "day_label": "Day 1: [Muscle Focus]",
        "session_focus": "Brief description",
        "target_muscle_groups": ["Chest", "Triceps", "Shoulders"],
        ${hasPhotos ? '"why_this_session": "How this addresses gaps identified in visual analysis",' : ''}
        
        "warmup": [
          "5 min light cardio",
          "Dynamic stretches",
          "Mobility work"
        ],
        
        "workout": [
          {
            "exercise": "Exercise name",
            "sets": number,
            "reps": "8-10" | "12-15" | "AMRAP",
            "rest_seconds": 60-120,
            "tempo": "2-0-1-0 (eccentric-pause-concentric-pause)",
            "notes": "Execution tips",
            ${hasPhotos ? '"why_this_exercise": "CRITICAL - Explain how this addresses specific gap from visual analysis",' : '"why_this_exercise": "How this supports the stated fitness goal",'}
            "form_cues": [
              "Key technique point 1",
              "Key technique point 2"
            ],
            "substitutions": [
              "Alternative if equipment unavailable"
            ]
          }
        ],
        
        "cooldown": [
          "Static stretches for worked muscles",
          "5 min light cardio",
          "Foam rolling"
        ]
      }
    ],
    
    "progression_rules": [
      "If completing all reps with good form, increase weight by 2.5-5 lbs",
      "Track all workouts for progressive overload",
      "Deload every 4-6 weeks (reduce weight 40%, maintain frequency)"
    ],
    
    "cardio_and_conditioning": {
      "sessions_per_week": 2-4,
      "type": ["LISS", "HIIT"],
      "duration_minutes_each": 20-30,
      "why_this_cardio": "Based on ${profile.fitness_goal} - explanation",
      "timing_recommendation": "Separate from weights by 6+ hours or after weights"
    }
  },
  
  "recovery_and_steps": {
    "steps_target_range": { "min": number, "max": number },
    "why_these_steps": "Based on ${profile.fitness_goal} and activity level",
    "sleep_target_hours_range": { "min": 7, "max": 9 },
    "sleep_priority": "Sleep is when growth happens - aim for ${age < 25 ? '8-9' : '7-8'} hours"
  },
  
  "nutrition": {
    "goal": "${profile.fitness_goal}",
    
    "calorie_target_range": {
      "min": number,
      "max": number
    },
    
    "calorie_rationale": "Based on BMR ${bmr}, TDEE ${tdee}. ${profile.fitness_goal.includes('Lose') ? 'Deficit of 15-20% for fat loss' : profile.fitness_goal.includes('Build') ? 'Surplus of 10-15% for muscle gain' : 'Maintenance for recomposition'}",
    
    "macros_grams": {
      "protein": number,
      "carbs": number,
      "fat": number
    },
    
    "macro_rationale": "Protein: ~1g per lb bodyweight. Carbs: ${profile.fitness_goal.includes('Build') ? 'Higher for fuel' : 'Moderate for energy'}. Fats: Adequate for hormones.",
    
    "example_day": {
      "breakfast": ["Item 1", "Item 2"],
      "lunch": ["Item 1", "Item 2"],
      "dinner": ["Item 1", "Item 2"],
      "snacks": ["Item 1", "Item 2"]
    }
  }
}

CRITICAL REMINDERS:
1. Output ONLY valid JSON (no markdown, no commentary)
2. ${hasPhotos ? 'Every exercise MUST have "why_this_exercise" connecting to visual gap analysis' : 'Explain why each exercise supports the stated goal'}
3. Use ONLY the equipment available (or bodyweight if none)
4. Generate for EXACTLY ${daysPerWeek} days per week
5. Be realistic with timelines based on vitals and experience
6. ${hasPhotos ? 'Personalized motivation must reference specific visual observations' : 'Keep general but motivating'}

Generate the complete plan now.`
}