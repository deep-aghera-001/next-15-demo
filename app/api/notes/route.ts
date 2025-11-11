import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/server-admin'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { User } from '@supabase/auth-js'

interface Note {
  id: number;
  user_id: string;
  note: string;
  created_at: string;
  user?: {
    email: string;
  };
}

// Helper function to get user ID from session
async function getUserIdAndEmail() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Unauthorized')
  }
  return { userId: user.id, userEmail: user.email }
}

// GET /api/notes - Get all notes
export async function GET(request: NextRequest) {
  try {
    await getUserIdAndEmail()
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    
    // Get ALL notes
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (notesError) {
      return NextResponse.json({ error: notesError.message }, { status: 500 })
    }
    
    // Get all user emails using admin client directly from auth.users
    const { data: users, error: usersError } = await adminSupabase.auth.admin.listUsers()
    
    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }
    
    // Create a map of user_id to email for efficient lookup
    const userMap = new Map(users.users.map((user: User) => [user.id, user.email || 'Unknown Email']))
    
    // Add correct user information to each note
    const notesWithUser: Note[] = notes.map((note: any) => ({
      ...note,
      user: { email: userMap.get(note.user_id) || 'Unknown User' }
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
    const noteWithUser: Note = {
      ...data[0],
      user: { email: userEmail || 'Unknown User' }
    }
    
    return NextResponse.json(noteWithUser)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}