'use client'

import { useState, useEffect, useRef } from 'react'
import { getNotes } from '@/utils/notes-api-client'
import { Note } from '@/types/note'
import NoteForm from '@/components/forms/NoteForm'
import NotesList, { NotesListHandle } from '@/components/forms/NotesList'

export default function NotesManager() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const notesListRef = useRef<NotesListHandle>(null)

  const fetchNotes = async () => {
    try {
      const fetchedNotes = await getNotes()
      setNotes(fetchedNotes as Note[])
      setError(null)
    } catch (error: unknown) {
      console.error('Failed to fetch notes:', error)
      const message = error instanceof Error ? error.message : 'Failed to load notes. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const handleNoteAdded = (newNote: Note) => {
    if (newNote.tempId) {
      setNotes(prev => prev.map(n => (n.id === newNote.tempId ? { ...newNote, tempId: undefined } : n)))
      return
    }
    if (newNote.error) {
      setNotes(prev => prev.filter(n => n.id !== newNote.id))
      setError('Failed to create note. Please try again.')
      return
    }
    setNotes(prev => [newNote, ...prev])
  }

  if (loading) return <p>Loading notes...</p>
  
  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500 p-4 bg-red-50 rounded">
          <p>Error: {error}</p>
          <button 
            onClick={() => {
              setError(null)
              fetchNotes()
            }}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}
      <NoteForm onNoteAdded={handleNoteAdded} />
      <NotesList 
        ref={notesListRef}
        notes={notes} 
        onNoteDeleted={fetchNotes} 
      />
    </div>
  )
}
