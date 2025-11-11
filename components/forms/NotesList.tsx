'use client'

import { useState, useEffect, forwardRef, useImperativeHandle, startTransition } from 'react'
import { useTransition, useOptimistic } from 'react'
import { getNotes, deleteNote } from '@/utils/notes-api-client'
import EditNoteForm from '@/components/forms/EditNoteForm'
import NoteAccessManager from '@/components/forms/NoteAccessManager'

export interface NotesListHandle {
  refreshNotes: () => void;
}

interface Note {
  id: string | number;
  note: string;
  created_at: string;
  user?: {
    email: string;
  };
  [key: string]: any;
}

interface NotesListProps {
  notes?: Note[];
  onNoteDeleted?: () => void;
  onNoteUpdated?: () => void;
  currentUserId?: string;
}

const NotesList = forwardRef<NotesListHandle, NotesListProps>(({ notes: propNotes, onNoteDeleted, onNoteUpdated, currentUserId }, ref) => {
  const [notes, setNotes] = useState<Note[]>(propNotes || [])
  const [loading, setLoading] = useState(!propNotes)
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [editingNoteId, setEditingNoteId] = useState<number | string | null>(null)
  const [sharingNoteId, setSharingNoteId] = useState<number | string | null>(null)

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

  const handleDelete = async (id: number | string) => {
    try {
      // Optimistically remove the note
      setNotes(notes.filter(note => note.id !== id))
      
      // If it's a real note (not optimistic), delete from server
      if (typeof id === 'number') {
        await deleteNote(id.toString())
      }
      
      setError(null)
      // Notify parent if needed
      if (onNoteDeleted) {
        onNoteDeleted()
      }
    } catch (error: any) {
      console.error('Failed to delete note:', error)
      setError(error.message || 'Failed to delete note. Please try again.')
      // Revert optimistic update on error
      fetchNotes()
    }
  }

  const handleUpdate = (updatedNoteData?: any) => {
    // If this is an error notification, set the error state
    if (updatedNoteData && updatedNoteData.error) {
      setError('Failed to update note. Please try again.')
    } else {
      // Normal update flow
      setEditingNoteId(null)
      setSharingNoteId(null)
      if (onNoteUpdated) {
        onNoteUpdated()
      }
    }
  }

  const startEditing = (id: number | string) => {
    setEditingNoteId(id)
    setSharingNoteId(null)
    // Clear any existing errors when starting to edit
    setError(null)
  }

  const startSharing = (id: number | string) => {
    setSharingNoteId(sharingNoteId === id ? null : id)
    setEditingNoteId(null)
  }

  const cancelEditing = () => {
    setEditingNoteId(null)
    // Clear any existing errors when canceling edit
    setError(null)
  }

  // If we have prop notes, don't show loading
  if (!propNotes && loading) return <p className="text-gray-700">Loading notes...</p>
  if (notes.length === 0) return <p className="text-gray-500">No notes yet.</p>

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500 p-4 bg-red-50 rounded">
          <p>Error: {error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Dismiss
          </button>
        </div>
      )}
      {notes.map((note) => (
        <div key={note.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
          {editingNoteId === note.id ? (
            <EditNoteForm
              noteId={typeof note.id === 'number' ? note.id : 0}
              initialNote={note.note}
              onNoteUpdated={handleUpdate}
              onCancel={cancelEditing}
            />
          ) : (
            <>
              <div className="flex justify-between items-start">
                <p className="text-gray-800">{note.note}</p>
                <div className="flex gap-2">
                  {typeof note.id === 'number' && (
                    <>
                      <button
                        onClick={() => startEditing(note.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => startSharing(note.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Share
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span>{note.user?.email || 'Unknown user'}</span>
                <span>{new Date(note.created_at).toLocaleString()}</span>
              </div>
              {sharingNoteId === note.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <NoteAccessManager noteId={typeof note.id === 'number' ? note.id : 0} />
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  )
})

NotesList.displayName = 'NotesList'

export default NotesList