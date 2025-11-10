import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = await createClient()
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successfully authenticated
      const redirectTo = new URL(next, request.url)
      return NextResponse.redirect(redirectTo)
    }
    
    console.error('Error exchanging code for session:', error)
  }

  // If there's an error or no code, redirect to login with error message
  const redirectUrl = new URL('/login', request.url)
  redirectUrl.searchParams.set('message', 'Authentication failed. Please try again.')
  return NextResponse.redirect(redirectUrl)
}