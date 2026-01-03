import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Get all cookies
    const cookieStore = request.cookies
    const allCookies = cookieStore.getAll()
    
    console.log('=== AUTH DEBUG ===')
    console.log('Total cookies:', allCookies.length)
    console.log('Cookie names:', allCookies.map(c => c.name))
    
    // Try to find any Supabase cookies
    const supabaseCookies = allCookies.filter(c => 
      c.name.includes('supabase') || 
      c.name.includes('sb-') ||
      c.name.includes('auth')
    )
    
    console.log('Supabase-related cookies:', supabaseCookies.map(c => c.name))
    
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Try multiple ways to get the user
    let user = null
    let method = 'none'
    
    // Method 1: Try each cookie
    for (const cookie of supabaseCookies) {
      try {
        const { data, error } = await supabase.auth.getUser(cookie.value)
        if (data?.user && !error) {
          user = data.user
          method = `cookie: ${cookie.name}`
          break
        }
      } catch (e) {
        // Continue to next cookie
      }
    }
    
    // Method 2: Try without token (session from cookies)
    if (!user) {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (data?.user && !error) {
          user = data.user
          method = 'getUser() without token'
        }
      } catch (e) {
        // Failed
      }
    }
    
    return NextResponse.json({
      success: !!user,
      method: method,
      user: user ? {
        id: user.id,
        email: user.email
      } : null,
      cookies: allCookies.map(c => ({
        name: c.name,
        hasValue: !!c.value,
        valueLength: c.value.length
      })),
      supabaseCookies: supabaseCookies.map(c => c.name)
    })
    
  } catch (error: any) {
    console.error('Test error:', error)
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}