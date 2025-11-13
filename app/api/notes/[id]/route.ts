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

// PATCH /api/notes/[id] - Update a note
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { userEmail } = await getUserIdAndEmail()
    const supabase = await createClient()
    
    const noteData = await request.json()
    
    // Get the current version of the note from the database
    const { data: currentNote, error: fetchError } = await supabase
      .from('notes')
      .select('version')
      .eq('id', resolvedParams.id)
      .single()
    
    if (fetchError) {
      console.error('Error fetching note:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }
    
    if (!currentNote) {
      return NextResponse.json({ error: 'Note not found or unauthorized' }, { status: 404 })
    }
    
    // Check if the version in the request matches the current version
    const clientVersion = noteData.version || 1
    if (clientVersion !== currentNote.version) {
      return NextResponse.json({ 
        error: 'Note has been modified by another user. Please refresh and try again.',
        conflict: true 
      }, { status: 409 })
    }
    
    // Update the note with incremented version - database policies will enforce access control
    const { data, error } = await supabase
      .from('notes')
      .update({
        ...noteData,
        version: currentNote.version + 1
      })
      .eq('id', resolvedParams.id)
      .select()
    
    if (error) {
      // Handle specific database errors
      if (error.code === '23505') { // unique_violation
        return NextResponse.json({ error: 'Note was modified by another user. Please try again.' }, { status: 409 })
      }
      console.error('Error updating note:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (data.length === 0) {
      return NextResponse.json({ error: 'Note not found or unauthorized' }, { status: 404 })
    }
    
    // Add user email to the updated note
    const noteWithUser = {
      ...data[0],
      user: { email: userEmail }
    }
    
    return NextResponse.json(noteWithUser)
  } catch (error: unknown) {
    console.error('Error in PATCH route:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/notes/[id] - Delete a note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { userEmail } = await getUserIdAndEmail()
    const supabase = await createClient()
    
    // Delete the note - database policies will enforce access control
    const { data, error } = await supabase
      .from('notes')
      .delete()
      .eq('id', resolvedParams.id)
      .select()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (data.length === 0) {
      return NextResponse.json({ error: 'Note not found or unauthorized' }, { status: 404 })
    }
    
    // Add user email to the deleted note data
    const noteWithUser = {
      ...data[0],
      user: { email: userEmail }
    }
    
    return NextResponse.json({ message: 'Note deleted successfully', note: noteWithUser })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
