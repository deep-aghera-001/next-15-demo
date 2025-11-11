'use client'

import { useState, useEffect } from 'react'
import { getNotes } from '@/utils/notes-api-client'
import NoteForm from '@/components/forms/NoteForm'
import NotesList from '@/components/forms/NotesList'

export default function NotesManager() {
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotes = async () => {
    try {
      const fetchedNotes = await getNotes()
      setNotes(fetchedNotes)
    } catch (error) {
      console.error('Failed to fetch notes:', error)
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

  return (
    <div className="space-y-4">
      <NoteForm onNoteAdded={handleNoteAdded} />
      <NotesList notes={notes} onNoteDeleted={fetchNotes} />
    </div>
  )
}