import { createAdminClient } from '@/utils/supabase/server-admin'
import { NextResponse } from 'next/server'

// GET /api/profiles - Get all profiles
export async function GET(request: Request) {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/profiles - Create a new profile
export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    const profileData = await request.json()
    
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}