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

  // Attempt to sign up the user
  const { error, data: signUpData } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  // Check the signUpData to determine what happened
  if (signUpData.user && (!signUpData.user.identities || signUpData.user.identities.length === 0)) {
    // User already exists (no new identity was created)
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