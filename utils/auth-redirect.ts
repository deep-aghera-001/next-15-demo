import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

/**
 * Redirects authenticated users to the specified path
 * @param redirectTo - The path to redirect authenticated users to
 */
export async function redirectIfAuthenticated(redirectTo: string = '/dashboard') {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (!error && user) {
    redirect(redirectTo)
  }
}