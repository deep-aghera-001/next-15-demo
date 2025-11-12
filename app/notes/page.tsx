'use client'

import { useState, useEffect } from 'react'
import UserNotesManager from '@/components/UserNotesManager'

export default function TestOfflinePage() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Offline Testing Page</h1>
          
          <div className="mb-6 p-4 rounded-lg bg-blue-50">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Current Status</h2>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium  text-blue-800">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

         
        </div>

        <UserNotesManager />
      </div>
    </div>
  )
}