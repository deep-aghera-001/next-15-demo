'use client'

import { useEffect } from 'react'
import UserNotesManager from '@/components/UserNotesManager'

// Prevent static rendering during build
export const dynamic = 'force-dynamic'

export default function TestOfflinePage() {
  useEffect(() => {
    const handleOnline = () => {}
    const handleOffline = () => {}

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <UserNotesManager />
      </div>
    </div>
  )
}