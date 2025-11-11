'use client'

import { useState, useEffect } from 'react'
import { getNotes } from '@/utils/notes-api-client'
import NoteForm from '@/components/forms/NoteForm'
import NotesList from '@/components/forms/NotesList'

export default function NotesManager() {
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

  if (loading) return <p>Loading notes...</p>
  
  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded">
        <p>Error: {error}</p>
        <button 
          onClick={fetchNotes}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <NoteForm onNoteAdded={handleNoteAdded} />
      <NotesList notes={notes} onNoteDeleted={fetchNotes} />
    </div>
  )
}