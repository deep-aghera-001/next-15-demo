import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'
  const error = searchParams.get('error')
  const type = searchParams.get('type')

  // Handle OAuth errors
  if (error) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('message', `Authentication error: ${error}`)
    return NextResponse.redirect(redirectUrl)
  }

  // Handle password reset flow
  if (type === 'recovery' && code) {
    const supabase = await createClient()
    
    // Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!exchangeError) {
      // Successfully authenticated for password reset
      // Redirect to update password page
      const redirectTo = new URL('/update-password', request.url)
      return NextResponse.redirect(redirectTo)
    }
    
    console.error('Error exchanging code for session:', exchangeError)
    
    // If there's an error, redirect to login with error message
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('message', 'Password reset link is invalid or expired.')
    return NextResponse.redirect(redirectUrl)
  }

  // Handle regular OAuth flow
  if (code) {
    const supabase = await createClient()
    
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!exchangeError) {
      // Successfully authenticated
      const redirectTo = new URL(next, request.url)
      return NextResponse.redirect(redirectTo)
    }
    
    console.error('Error exchanging code for session:', exchangeError)
    
    // If there's an error, redirect to login with error message
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('message', 'Authentication failed. Please try again.')
    return NextResponse.redirect(redirectUrl)
  }

  // If there's no code, redirect to login
  const redirectUrl = new URL('/login', request.url)
  redirectUrl.searchParams.set('message', 'Authentication failed. Please try again.')
  return NextResponse.redirect(redirectUrl)
}