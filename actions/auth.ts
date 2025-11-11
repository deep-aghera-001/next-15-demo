'use server'

import { createClient } from '@/utils/supabase/server'

export async function checkAuthStatus() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { isAuthenticated: false, user: null }
  }
  
  return { isAuthenticated: true, user }
}

export async function checkAdminStatus() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { isAdmin: false, user: null }
  }
  
  // Check if user has admin role (this would depend on your specific implementation)
  // For now, we'll just check if the user exists
  return { isAdmin: true, user }
}