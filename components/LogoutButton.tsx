'use client'

import { useRouter } from 'next/navigation'
import offlineSyncService from '@/utils/offline-sync-service'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    // Clear cached notes from localStorage for security
    // This ensures that when a user logs out, their cached notes are removed
    // so they won't be visible to anyone else who uses the device
    offlineSyncService.clearAllCachedData()

    // Perform the actual logout
    const response = await fetch('/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      // Redirect to login page
      router.push('/login')
    } else {
      console.error('Logout failed')
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    >
      Logout
    </button>
  )
}