import UpdatePasswordForm from './UpdatePasswordForm'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function UpdatePasswordPage() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.getUser()
  
  // If there's a user (already logged in through normal means), redirect to dashboard
  // But if they're here through password reset flow, they should be allowed
  // In a real implementation, we'd check for the specific password reset session
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Update Password</h1>
        <p className="text-sm text-gray-600 text-center">
          Please enter your new password below.
        </p>
        <UpdatePasswordForm />
      </div>
    </div>
  )
}