import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
    }

    const supabase = await createClient()

    // Update the user's password
    const { error } = await supabase.auth.updateUser({
      password
    })

    if (error) {
      console.error('Update password error:', error)
      
      // Handle specific error cases
      if (error.status === 401) {
        return NextResponse.json({ 
          error: 'Unauthorized. Please access this page through a valid password reset link.' 
        }, { status: 401 })
      }
      
      return NextResponse.json({ 
        error: 'Failed to update password. Please try again.' 
      }, { status: 500 })
    }

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Unexpected error in update-password route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}