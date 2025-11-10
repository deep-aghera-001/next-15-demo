import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signInWithOAuth(provider: 'github' | 'google') {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error(`${provider} OAuth error:`, error)
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }

  return { error: `Failed to redirect to ${provider}` }
}

export async function signUpWithOAuth(provider: 'github' | 'google') {
  // For OAuth, sign up and sign in use the same method
  return await signInWithOAuth(provider)
}