'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useTransition } from 'react'
import { getNotes, deleteNote } from '@/utils/notes-api-client'
import EditNoteForm from '@/components/forms/EditNoteForm'

export interface NotesListHandle {
  refreshNotes: () => void;
}

interface NotesListProps {
  notes?: any[];
  onNoteDeleted?: () => void;
  onNoteUpdated?: () => void;
}

const NotesList = forwardRef<NotesListHandle, NotesListProps>(({ notes: propNotes, onNoteDeleted, onNoteUpdated }, ref) => {
  const [notes, setNotes] = useState<any[]>(propNotes || [])
  const [loading, setLoading] = useState(!propNotes)
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null)

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
      setError(null)
      // Notify parent if needed
      if (onNoteDeleted) {
        onNoteDeleted()
      }
    } catch (error: any) {
      console.error('Failed to delete note:', error)
      setError(error.message || 'Failed to delete note. Please try again.')
    }
  }

  const handleUpdate = () => {
    setEditingNoteId(null)
    fetchNotes()
    if (onNoteUpdated) {
      onNoteUpdated()
    }
  }

  const startEditing = (id: number) => {
    setEditingNoteId(id)
  }

  const cancelEditing = () => {
    setEditingNoteId(null)
  }

  // If we have prop notes, don't show loading
  if (!propNotes && loading) return <p className="text-gray-700">Loading notes...</p>
  if (notes.length === 0) return <p className="text-gray-500">No notes yet.</p>

  return (
    <div className="space-y-2">
      {error && (
        <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
          {error}
        </div>
      )}
      <ul className="space-y-2">
        {notes.map((n) => (
          <li
            key={n.id}
            className="flex justify-between items-center border-b border-gray-200 py-3 bg-white rounded-md shadow-sm p-3"
          >
            {editingNoteId === n.id ? (
              <EditNoteForm 
                noteId={n.id} 
                initialNote={n.note} 
                onNoteUpdated={handleUpdate} 
                onCancel={cancelEditing} 
              />
            ) : (
              <>
                <div className="flex-1">
                  <div className="text-gray-800">{n.note}</div>
                  {n.user && n.user.email && (
                    <div className="text-xs text-gray-500 mt-1">
                      By: {n.user.email}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEditing(n.id)}
                    disabled={pending}
                    className="text-blue-500 text-sm hover:text-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => start(() => handleDelete(n.id))}
                    disabled={pending}
                    className="text-red-500 text-sm hover:text-red-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                  >
                    {pending ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
})

NotesList.displayName = 'NotesList'

export default NotesList