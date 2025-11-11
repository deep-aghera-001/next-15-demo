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

// Helper function to check if user has access to a note
async function checkNoteAccess(supabase: any, noteId: string, userId: string) {
  // Check if user is the owner
  const { data: note, error: noteError } = await supabase
    .from('notes')
    .select('user_id')
    .eq('id', noteId)
    .single()
  
  if (noteError || !note) {
    throw new Error('Note not found')
  }
  
  // If user is the owner, they have access
  if (note.user_id === userId) {
    return true
  }
  
  // Check if user has been granted access
  const { data: access, error: accessError } = await supabase
    .from('note_access')
    .select('id')
    .eq('note_id', noteId)
    .eq('user_id', userId)
    .single()
  
  // If there's no access error and we have access data, user has access
  return !accessError && !!access
}

// PATCH /api/notes/[id] - Update a note (if user owns it or has access)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { userId, userEmail } = await getUserIdAndEmail()
    const supabase = await createClient()
    
    // Check if user has access to update this note
    const hasAccess = await checkNoteAccess(supabase, resolvedParams.id, userId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized: You do not have access to this note' }, { status: 403 })
    }
    
    const noteData = await request.json()
    
    // Update the note
    const { data, error } = await supabase
      .from('notes')
      .update(noteData)
      .eq('id', resolvedParams.id)
      .select()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (data.length === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    
    // Add user email to the updated note
    const noteWithUser = {
      ...data[0],
      user: { email: userEmail }
    }
    
    return NextResponse.json(noteWithUser)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Note not found') {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/notes/[id] - Delete a note (if user owns it or has access)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { userId, userEmail } = await getUserIdAndEmail()
    const supabase = await createClient()
    
    // Check if user has access to delete this note
    const hasAccess = await checkNoteAccess(supabase, resolvedParams.id, userId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized: You do not have access to this note' }, { status: 403 })
    }
    
    // Delete the note
    const { data, error } = await supabase
      .from('notes')
      .delete()
      .eq('id', resolvedParams.id)
      .select()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (data.length === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    
    // Add user email to the deleted note data
    const noteWithUser = {
      ...data[0],
      user: { email: userEmail }
    }
    
    return NextResponse.json({ message: 'Note deleted successfully', note: noteWithUser })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Note not found') {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}