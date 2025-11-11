import { createAdminClient } from '@/utils/supabase/server-admin'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

// GET /api/notes - Get all notes (admin access)
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    
    // Get all notes (admin access - no user filtering)
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/notes - Create a new note (admin access)
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    
    const noteData = await request.json()
    
    // Insert the new note (admin access - no user association)
    const { data, error } = await supabase
      .from('notes')
      .insert({
        ...noteData,
        created_at: new Date().toISOString()
      })
      .select()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}