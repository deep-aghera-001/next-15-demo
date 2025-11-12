import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/server-admin'
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

// GET /api/notes/[id]/access - Get users who have access to a note
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { userId } = await getUserIdAndEmail()
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    
    // Verify that the current user owns the note
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('user_id')
      .eq('id', resolvedParams.id)
      .single()
      
    if (noteError || !note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    
    if (note.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized: You do not own this note' }, { status: 403 })
    }
    
    // Get users who have access to this note
    const { data: accessRecords, error: accessError } = await supabase
      .from('note_access')
      .select('user_id')
      .eq('note_id', resolvedParams.id)
      
    if (accessError) {
      return NextResponse.json({ error: accessError.message }, { status: 500 })
    }
    
    // Get user details using admin client
    const { data: users, error: usersError } = await adminSupabase.auth.admin.listUsers()
    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }
    
    // Filter to only users who have access
    const accessUserIds = (accessRecords as Array<{ user_id: string }>).map(record => record.user_id)
    const accessUsers = users.users
      .filter(u => accessUserIds.includes(u.id))
      .map(u => ({
        id: u.id,
        email: u.email
      }))
      
    return NextResponse.json(accessUsers)
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/notes/[id]/access - Grant access to a note for a user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { userId } = await getUserIdAndEmail()
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    
    const { userEmail } = await request.json()
    
    // Verify that the current user owns the note
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('user_id')
      .eq('id', resolvedParams.id)
      .single()
      
    if (noteError || !note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    
    if (note.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized: You do not own this note' }, { status: 403 })
    }
    
    // Find the user by email using admin client
    const { data: users, error: usersError } = await adminSupabase.auth.admin.listUsers()
    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }
    
    const targetUser = users.users.find(u => u.email === userEmail)
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Grant access by inserting into note_access table
    const { error: insertError } = await supabase
      .from('note_access')
      .insert({
        note_id: parseInt(resolvedParams.id),
        user_id: targetUser.id,
        granted_by: userId
      })
      
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
    
    return NextResponse.json({ message: 'Access granted successfully' })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
