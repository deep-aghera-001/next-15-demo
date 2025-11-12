import { getDashboardData } from '@/actions/auth'
import UserProfileManager from '@/components/UserProfileManager'
import ProtectedDataDisplay from '@/components/ProtectedDataDisplay'
import UserNotesManager from '@/components/UserNotesManager'
import LogoutButton from '@/components/LogoutButton'

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
            <LogoutButton />
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