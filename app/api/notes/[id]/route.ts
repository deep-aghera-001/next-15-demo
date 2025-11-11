import { createAdminClient } from '@/utils/supabase/server-admin'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

// PATCH /api/notes/[id] - Update a note (admin access)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const supabase = createAdminClient()
    
    const noteData = await request.json()
    
    // Update the note (admin access - no user verification)
    const { data, error } = await supabase
      .from('notes')
      .update(noteData)
      .eq('id', resolvedParams.id)
      .select()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (data.length === 0) {
      return NextResponse.json({ error: 'Note not found or unauthorized' }, { status: 404 })
    }
    
    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/notes/[id] - Delete a note (admin access)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const supabase = createAdminClient()
    
    // Delete the note (admin access - no user verification)
    const { data, error } = await supabase
      .from('notes')
      .delete()
      .eq('id', resolvedParams.id)
      .select()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // For delete operations, we don't need to check data length
    // If there was an error, it would have been caught above
    
    return NextResponse.json({ message: 'Note deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}