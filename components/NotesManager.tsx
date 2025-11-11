'use client'

import { useState, useEffect, useRef } from 'react'
import { getNotes } from '@/utils/notes-api-client'
import NoteForm from '@/components/forms/NoteForm'
import NotesList, { NotesListHandle } from '@/components/forms/NotesList'

export default function NotesManager() {
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const notesListRef = useRef<NotesListHandle>(null)

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

  const handleNoteAdded = (newNote: any) => {
    // If it's an optimistic note (temporary ID), add it optimistically
    // If it's a confirmed note from server, replace the optimistic one
    if (notesListRef.current) {
      notesListRef.current.addOptimisticNote(newNote)
    }
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
      <NotesList 
        ref={notesListRef}
        notes={notes} 
        onNoteDeleted={fetchNotes} 
      />
    </div>
  )
}