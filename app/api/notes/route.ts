import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

// Helper function to get user ID from session
async function getUserIdAndEmail() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Unauthorized')
  }
  return { userId: user.id, userEmail: user.email }
}

// GET /api/notes - Get all notes (no longer filtered by user)
export async function GET(request: NextRequest) {
  try {
    const { userId, userEmail } = await getUserIdAndEmail()
    const supabase = await createClient()
    
    // Get ALL notes (not filtered by user)
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Add user email to each note
    const notesWithUser = data.map(note => ({
      ...note,
      user: { email: userEmail }
    }))
    
    return NextResponse.json(notesWithUser)
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
    const { userId, userEmail } = await getUserIdAndEmail()
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
    
    // Add user email to the created note
    const noteWithUser = {
      ...data[0],
      user: { email: userEmail }
    }
    
    return NextResponse.json(noteWithUser)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}