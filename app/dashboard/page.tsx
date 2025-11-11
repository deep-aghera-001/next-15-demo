import { getDashboardData } from '@/actions/auth'
import UserProfileManager from '@/components/UserProfileManager'
import ProtectedDataDisplay from '@/components/ProtectedDataDisplay'
import UserNotesManager from '@/components/UserNotesManager'

export default async function DashboardPage() {
  const { user } = await getDashboardData()

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-2 text-gray-600">Welcome, {user.email}!</p>
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
            <UserNotesManager />
            <UserProfileManager />
            <ProtectedDataDisplay />
          </div>
        </div>
      </div>
    </div>
  )
}