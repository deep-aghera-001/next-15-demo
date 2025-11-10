import { createClient } from '@/utils/supabase/server'
import UserProfileManager from '@/components/UserProfileManager'
import ProtectedDataDisplay from '@/components/ProtectedDataDisplay'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    // This should never happen due to layout protection, but good to have as fallback
    throw new Error('Unauthorized')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-2 text-gray-600">Welcome, {data.user.email}!</p>
            </div>
            <form action="/logout" method="post">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="py-6">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
          <div className="py-4 space-y-6">
            <UserProfileManager />
            <ProtectedDataDisplay />
          </div>
        </div>
      </div>
    </div>
  )
}