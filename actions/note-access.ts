'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/server-admin'

// Grant access to a note for a specific user
export async function grantNoteAccess(noteId: number, userEmail: string) {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()
  
  // Get the current user (note owner)
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Unauthorized')
  
  // Verify that the current user owns the note
  const { data: note, error: noteError } = await supabase
    .from('notes')
    .select('user_id')
    .eq('id', noteId)
    .single()
    
  if (noteError || !note) throw new Error('Note not found')
  if (note.user_id !== user.id) throw new Error('Unauthorized: You do not own this note')
  
  // Find the user by email using admin client
  const { data: users, error: usersError } = await adminSupabase.auth.admin.listUsers()
  if (usersError) throw usersError
  
  const targetUser = users.users.find(u => u.email === userEmail)
  if (!targetUser) throw new Error('User not found')
  
  // Grant access by inserting into note_access table
  const { error: insertError } = await supabase
    .from('note_access')
    .insert({
      note_id: noteId,
      user_id: targetUser.id,
      granted_by: user.id
    })
    
  if (insertError) throw insertError
  
  revalidatePath('/notes')
}

// Revoke access to a note for a specific user
export async function revokeNoteAccess(noteId: number, userId: string) {
  const supabase = await createClient()
  
  // Get the current user (note owner)
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Unauthorized')
  
  // Verify that the current user owns the note
  const { data: note, error: noteError } = await supabase
    .from('notes')
    .select('user_id')
    .eq('id', noteId)
    .single()
    
  if (noteError || !note) throw new Error('Note not found')
  if (note.user_id !== user.id) throw new Error('Unauthorized: You do not own this note')
  
  // Revoke access by deleting from note_access table
  const { error: deleteError } = await supabase
    .from('note_access')
    .delete()
    .eq('note_id', noteId)
    .eq('user_id', userId)
    
  if (deleteError) throw deleteError
  
  revalidatePath('/notes')
}

// Get users who have access to a specific note
export async function getNoteAccessUsers(noteId: number) {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Unauthorized')
  
  // Verify that the current user owns the note
  const { data: note, error: noteError } = await supabase
    .from('notes')
    .select('user_id')
    .eq('id', noteId)
    .single()
    
  if (noteError || !note) throw new Error('Note not found')
  if (note.user_id !== user.id) throw new Error('Unauthorized: You do not own this note')
  
  // Get users who have access to this note
  const { data: accessRecords, error: accessError } = await supabase
    .from('note_access')
    .select('user_id')
    .eq('note_id', noteId)
    
  if (accessError) throw accessError
  
  // Get user details using admin client
  const { data: users, error: usersError } = await adminSupabase.auth.admin.listUsers()
  if (usersError) throw usersError
  
  // Filter to only users who have access
  const accessUserIds = accessRecords.map(record => record.user_id)
  const accessUsers = users.users
    .filter(u => accessUserIds.includes(u.id))
    .map(u => ({
      id: u.id,
      email: u.email
    }))
    
  return accessUsers
}