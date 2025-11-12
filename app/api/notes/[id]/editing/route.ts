import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/notes/[id]/editing - Toggle editing state
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { editing } = await request.json()
    const supabase = await createClient()
    
    // First check if the note exists and belongs to the user
    const { data: existingNote, error: fetchError } = await supabase
      .from('notes')
      .select('id')
      .eq('id', resolvedParams.id)
      .maybeSingle()
    
    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }
    
    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    
    // Update the editing state
    const { data, error } = await supabase
      .from('notes')
      .update({ being_edited: editing })
      .eq('id', resolvedParams.id)
      .select()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (data.length === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in editing route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}