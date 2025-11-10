'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

type FormState = {
  error?: string
} | null

export async function login(prevState: FormState, formData: FormData) {
  const supabase = await createClient()

  // Type-casting here for convenience
  // In practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error, data: signInData } = await supabase.auth.signInWithPassword(data)

  if (error) {
    // Handle specific error cases
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Invalid email or password.' }
    }
    return { error: error.message }
  }

  // Check if user has confirmed their email
  if (signInData.user && !signInData.user.email_confirmed_at) {
    return { error: 'Please confirm your email address before logging in. Check your inbox for the confirmation email.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}