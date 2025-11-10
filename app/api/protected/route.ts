import { createApiAuthClient } from '@/utils/supabase/api-auth'
import { NextResponse } from 'next/server'

// GET /api/protected - Example of a protected route
export async function GET(request: Request) {
  try {
    const supabase = await createApiAuthClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // User is authenticated, return protected data
    return NextResponse.json({
      message: 'This is protected data',
      user: session.user
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}