'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

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
  
  // Delete only if the note belongs to the current user
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
    
  if (error) throw error
  revalidatePath('/notes')
}

// 📋 Fetch
export async function getNotes() {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Unauthorized')
  
  // Get ALL notes (not filtered by user)
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}