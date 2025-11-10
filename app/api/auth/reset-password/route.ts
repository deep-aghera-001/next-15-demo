import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const supabase = await createClient()

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/update-password`,
    })

    if (error) {
      console.error('Password reset error:', error)
      return NextResponse.json({ error: 'Failed to send reset email. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Password reset email sent successfully' })
  } catch (error) {
    console.error('Unexpected error in reset-password route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}