'use client'

import { useState } from 'react'

export default function AdminUserManager() {
  const [message, setMessage] = useState('')
  
  const handleRefresh = () => {
    // In a real implementation, this would refresh the user list
    setMessage('User list refreshed!')
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Admin User Management</h2>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Refresh Users
        </button>
      </div>
      
      <p className="text-gray-600 mb-4">
        Use the refresh button to update the user list from Supabase auth.
      </p>
      
      {message && (
        <div className="mt-4 p-4 bg-green-50 rounded-md">
          <p className="text-green-800">{message}</p>
        </div>
      )}
    </div>
  )
}
