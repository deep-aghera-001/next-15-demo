'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useTransition } from 'react'
import { getNotes, deleteNote } from '@/utils/notes-api-client'

export interface NotesListHandle {
  refreshNotes: () => void;
}

interface NotesListProps {
  notes?: any[];
  onNoteDeleted?: () => void;
}

const NotesList = forwardRef<NotesListHandle, NotesListProps>(({ notes: propNotes, onNoteDeleted }, ref) => {
  const [notes, setNotes] = useState<any[]>(propNotes || [])
  const [loading, setLoading] = useState(!propNotes)
  const [pending, start] = useTransition()

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

  // Update internal state when props change
  useEffect(() => {
    if (propNotes) {
      setNotes(propNotes)
      setLoading(false)
    } else if (!propNotes) {
      fetchNotes()
    }
  }, [propNotes])

  useImperativeHandle(ref, () => ({
    refreshNotes: fetchNotes
  }))

  const handleDelete = async (id: number) => {
    try {
      await deleteNote(id.toString())
      // Remove the deleted note from the state
      setNotes(notes.filter(note => note.id !== id))
      // Notify parent if needed
      if (onNoteDeleted) {
        onNoteDeleted()
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  // If we have prop notes, don't show loading
  if (!propNotes && loading) return <p>Loading notes...</p>
  if (notes.length === 0) return <p>No notes yet.</p>

  return (
    <ul className="space-y-2">
      {notes.map((n) => (
        <li
          key={n.id}
          className="flex justify-between items-center border-b py-2"
        >
          <span>{n.note}</span>
          <button
            onClick={() => start(() => handleDelete(n.id))}
            disabled={pending}
            className="text-red-500 text-sm"
          >
            {pending ? '...' : 'Delete'}
          </button>
        </li>
      ))}
    </ul>
  )
})

NotesList.displayName = 'NotesList'

export default NotesList
