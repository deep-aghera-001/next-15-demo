'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

type FormState = {
  error?: string
  success?: boolean
} | null

export async function signup(prevState: FormState, formData: FormData) {
  const supabase = await createClient()

  // Type-casting here for convenience
  // In practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error, data: signUpData } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  // Check if email confirmation is required
  if (signUpData.user && !signUpData.user.identities) {
    // User already exists, but email might need confirmation
    return { 
      success: false, 
      error: 'Account already exists. Please check your email for confirmation.' 
    }
  } else if (signUpData.user) {
    // New user created, redirect to login with success message
    revalidatePath('/', 'layout')
    redirect('/login?message=Check your email to confirm your account')
  }

  return { success: true }
}