import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

async function getUserIdAndEmail() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Unauthorized')
  }
  return { userId: user.id, userEmail: user.email }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const resolvedParams = await params
    const { userId } = await getUserIdAndEmail()
    const supabase = await createClient()

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

    const { error: deleteError } = await supabase
      .from('note_access')
      .delete()
      .eq('note_id', resolvedParams.id)
      .eq('user_id', resolvedParams.userId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Access revoked successfully' })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
