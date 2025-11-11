import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

// Helper function to get user ID from session
async function getUserId() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Unauthorized')
  }
  return user.id
}

// GET /api/notes - Get all notes for the current user
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    const supabase = await createClient()
    
    // Get only notes belonging to the current user
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/notes - Create a new note for the current user
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    const supabase = await createClient()
    
    const noteData = await request.json()
    
    // Insert the new note associated with the current user
    const { data, error } = await supabase
      .from('notes')
      .insert({
        ...noteData,
        user_id: userId,
        created_at: new Date().toISOString()
      })
      .select()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data[0])
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}