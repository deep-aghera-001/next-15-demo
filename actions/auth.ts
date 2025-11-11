'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

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

export async function getHomePageData() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  
  // If user is authenticated, redirect to dashboard
  if (data?.user && !error) {
    redirect('/dashboard')
  }
  
  return { needsAuth: true }
}

export async function getDashboardData() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  
  if (error || !data?.user) {
    throw new Error('Unauthorized')
  }
  
  return { user: data.user }
}