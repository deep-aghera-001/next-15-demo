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

// PATCH /api/notes/[id] - Update a note (only if it belongs to the current user)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = await getUserId()
    const supabase = await createClient()
    
    const noteData = await request.json()
    
    // Update the note only if it belongs to the current user
    const { data, error } = await supabase
      .from('notes')
      .update(noteData)
      .eq('id', resolvedParams.id)
      .eq('user_id', userId) // Ensure user can only update their own notes
      .select()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (data.length === 0) {
      return NextResponse.json({ error: 'Note not found or unauthorized' }, { status: 404 })
    }
    
    return NextResponse.json(data[0])
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/notes/[id] - Delete a note (only if it belongs to the current user)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = await getUserId()
    const supabase = await createClient()
    
    // Delete the note only if it belongs to the current user
    const { data, error } = await supabase
      .from('notes')
      .delete()
      .eq('id', resolvedParams.id)
      .eq('user_id', userId) // Ensure user can only delete their own notes
      .select()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (data.length === 0) {
      return NextResponse.json({ error: 'Note not found or unauthorized' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Note deleted successfully' })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}