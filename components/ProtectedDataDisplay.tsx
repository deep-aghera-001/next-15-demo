'use client'

import { useState, useEffect } from 'react'
import { getProtectedData } from '@/utils/api-client'

interface ProtectedData {
  message: string
  user: {
    id: string
    email: string
    [key: string]: any
  }
}

export default function ProtectedDataDisplay() {
  const [data, setData] = useState<ProtectedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProtectedData()
  }, [])

  const fetchProtectedData = async () => {
    try {
      setLoading(true)
      const result = await getProtectedData()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-gray-500">Loading protected data...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Protected Data</h2>
      {data ? (
        <div>
          <p className="text-gray-600">{data.message}</p>
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium text-gray-900">User Information</h3>
            <p className="text-gray-600">ID: {data.user.id}</p>
            <p className="text-gray-600">Email: {data.user.email}</p>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No protected data available.</p>
      )}
    </div>
  )
}