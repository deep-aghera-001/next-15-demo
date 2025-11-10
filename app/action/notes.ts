'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/server-admin'

// ➕ Create
export async function createNote(formData: FormData) {
  const supabase = createAdminClient()
  const note = formData.get('note') as string
  const { error } = await supabase.from('notes').insert({ note })
  if (error) throw error
  revalidatePath('/notes')
}

// 🗑️ Delete
export async function deleteNote(id: number) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('notes').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/notes')
}