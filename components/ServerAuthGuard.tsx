import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function ServerAuthGuard({
  children,
  redirectTo = '/login'
}: {
  children: React.ReactNode
  redirectTo?: string
}) {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect(redirectTo)
  }
  
  return <>{children}</>
}