import { createAdminClient } from '@/utils/supabase/server-admin'
import { NextResponse } from 'next/server'

// GET /api/users - Get all users (admin only)
export async function GET(request: Request) {
  try {
    const supabase = createAdminClient()
    
    // Check if user is admin (you would implement your own admin check logic)
    // This is a simplified example
    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/users - Create a new user (admin only)
export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    const { email, password, ...userData } = await request.json()
    
    // Create user with admin privileges (bypasses email confirmation)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: userData
    })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data.user)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}