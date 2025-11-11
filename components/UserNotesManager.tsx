'use client'

import { useState, useEffect } from 'react'
import { getNotes } from '@/utils/notes-api-client'
import NoteForm from '@/components/forms/NoteForm'
import NotesList from '@/components/forms/NotesList'

export default function UserNotesManager() {
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotes = async () => {
    try {
      const fetchedNotes = await getNotes()
      setNotes(fetchedNotes)
      setError(null)
    } catch (error: any) {
      console.error('Failed to fetch notes:', error)
      setError(error.message || 'Failed to load notes. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const handleNoteAdded = () => {
    // Refresh the notes list
    fetchNotes()
  }

  const handleNoteUpdated = () => {
    // Refresh the notes list
    fetchNotes()
  }

  if (loading) return <p className="text-gray-700">Loading notes...</p>
  
  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">My Notes</h2>
        </div>
        <div className="text-red-500 p-4 bg-red-50 rounded">
          <p>Error: {error}</p>
          <button 
            onClick={fetchNotes}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">My Notes</h2>
      </div>
      <div className="mt-4">
        <NoteForm onNoteAdded={handleNoteAdded} />
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Your Notes</h3>
          {notes.length === 0 ? (
            <p className="text-gray-500 py-4">You haven't created any notes yet.</p>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <NotesList 
                notes={notes} 
                onNoteDeleted={fetchNotes} 
                onNoteUpdated={handleNoteUpdated} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}