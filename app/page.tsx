import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  
  // If user is authenticated, redirect to dashboard
  if (data?.user && !error) {
    redirect('/dashboard')
  }

  // If not authenticated, show home page
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-900">Welcome to Our App</h1>
        <p className="text-center text-gray-600">
          Please log in or sign up to continue
        </p>
        <div className="flex flex-col space-y-4">
          <a
            href="/login"
            className="px-4 py-2 text-sm font-medium text-center text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Login
          </a>
          <a
            href="/signup"
            className="px-4 py-2 text-sm font-medium text-center text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  )
}