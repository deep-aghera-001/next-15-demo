'use client'

import { useState, useEffect } from 'react'
import { grantNoteAccess, revokeNoteAccess, getNoteAccessUsers } from '@/utils/note-access-api-client'

export default function NoteAccessManager({ noteId }: { noteId: number }) {
  const [email, setEmail] = useState('')
  const [accessUsers, setAccessUsers] = useState<{ id: string; email: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchAccessUsers = async () => {
    try {
      setLoading(true)
      const users = await getNoteAccessUsers(noteId.toString())
      setAccessUsers(users)
      setError(null)
    } catch (err: unknown) {
      console.error('Failed to fetch access users:', err)
      const message = err instanceof Error ? err.message : 'Failed to load access users'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccessUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId])

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    try {
      setLoading(true)
      await grantNoteAccess(noteId.toString(), email)
      setEmail('')
      setSuccess('Access granted successfully')
      setError(null)
      // Refresh the access users list
      await fetchAccessUsers()
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: unknown) {
      console.error('Failed to grant access:', err)
      const message = err instanceof Error ? err.message : 'Failed to grant access'
      setError(message)
      setSuccess(null)
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeAccess = async (userId: string) => {
    try {
      setLoading(true)
      await revokeNoteAccess(noteId.toString(), userId)
      setSuccess('Access revoked successfully')
      setError(null)
      // Refresh the access users list
      await fetchAccessUsers()
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: unknown) {
      console.error('Failed to revoke access:', err)
      const message = err instanceof Error ? err.message : 'Failed to revoke access'
      setError(message)
      setSuccess(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium text-gray-800 mb-3">Share Note</h3>
      
      {success && (
        <div className="mb-3 p-2 bg-green-100 text-green-700 rounded text-sm">
          {success}
        </div>
      )}
      
      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleGrantAccess} className="flex gap-2 mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter user email"
          required
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {loading ? 'Sharing...' : 'Share'}
        </button>
      </form>
      
      <div className="mt-4">
        <h4 className="text-md font-medium text-gray-700 mb-2">Users with access:</h4>
        {accessUsers.length === 0 ? (
          <p className="text-gray-500 text-sm">No users have access to this note yet.</p>
        ) : (
          <ul className="space-y-2">
            {accessUsers.map((user) => (
              <li 
                key={user.id} 
                className="flex justify-between items-center p-2 bg-white rounded border border-gray-200"
              >
                <span className="text-gray-700">{user.email}</span>
                <button
                  onClick={() => handleRevokeAccess(user.id)}
                  disabled={loading}
                  className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                >
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
