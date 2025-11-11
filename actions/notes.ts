'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/server-admin'
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

// Helper function to check if user has access to a note
async function checkNoteAccess(supabase: any, noteId: number, userId: string) {
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

// ➕ Create
export async function createNote(formData: FormData) {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Unauthorized')
  
  const note = formData.get('note') as string
  const { error } = await supabase.from('notes').insert({ 
    note,
    user_id: user.id 
  })
  if (error) throw error
  revalidatePath('/notes')
}

// 🗑️ Delete
export async function deleteNote(id: number) {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Unauthorized')
  
  // Check if user has access to delete this note
  const hasAccess = await checkNoteAccess(supabase, id, user.id)
  if (!hasAccess) throw new Error('Unauthorized: You do not have access to this note')
  
  // Delete the note
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
    
  if (error) throw error
  revalidatePath('/notes')
}

// 📋 Fetch
export async function getNotes() {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Unauthorized')
  
  // Get ALL notes
  const { data: notes, error: notesError } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (notesError) throw notesError
  
  // Get all user emails using admin client directly from auth.users
  const { data: users, error: usersError } = await adminSupabase.auth.admin.listUsers()
  
  if (usersError) throw usersError
  
  // Create a map of user_id to email for efficient lookup
  const userMap = new Map(users.users.map((user: User) => [user.id, user.email || 'Unknown Email']))
  
  // Add correct user information to each note
  const notesWithUser: Note[] = notes.map((note: any) => ({
    ...note,
    user: { email: userMap.get(note.user_id) || 'Unknown User' }
  }))
  
  return notesWithUser
}