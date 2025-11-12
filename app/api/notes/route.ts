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
  version: number;
  being_edited?: boolean;
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

// GET /api/notes - Get all notes with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { userId, userEmail } = await getUserIdAndEmail()
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const searchQuery = searchParams.get('search') || ''
    
    // Calculate offset
    const offset = (page - 1) * limit
    
    // Build the query
    let query = supabase
      .from('notes')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    // Add search filter if query exists
    if (searchQuery) {
      query = query.ilike('note', `%${searchQuery}%`)
    }
    
    // Execute the query
    const { data: notes, error: notesError, count } = await query
    
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
    
    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit)
    
    return NextResponse.json({
      notes: notesWithUser,
      pagination: {
        currentPage: page,
        totalPages,
        totalNotes: count || 0,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })
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
        created_at: new Date().toISOString(),
        version: 1
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