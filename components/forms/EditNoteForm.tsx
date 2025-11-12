'use client'

import { useTransition, useState, useEffect } from 'react'
import { updateNote } from '@/utils/notes-api-client'

export default function EditNoteForm({ 
  noteId, 
  initialNote, 
  initialVersion,
  onNoteUpdated, 
  onCancel 
}: { 
  noteId: number; 
  initialNote: string; 
  initialVersion: number;
  onNoteUpdated: (updatedNote?: any) => void; 
  onCancel: () => void 
}) {
  const [pending, start] = useTransition()
  const [note, setNote] = useState(initialNote)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(initialVersion)

  // Update local state when initialNote changes
  useEffect(() => {
    setNote(initialNote)
    setVersion(initialVersion)
  }, [initialNote, initialVersion])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!note.trim()) return
    
    setError(null)
    
    // Optimistically update the note
    if (onNoteUpdated) {
      onNoteUpdated({ note: note.trim() })
    }
    
    try {
      const savedNote = await updateNote(noteId.toString(), { note: note.trim(), version })
      // Update with actual data from server
      if (onNoteUpdated) {
        onNoteUpdated(savedNote)
      }
      // Clear any previous error state
      setError(null)
      // Update version for next edit
      setVersion(savedNote.version)
    } catch (error: any) {
      console.error('Failed to update note:', error)
      
      // Handle conflict specifically
      if (error.message && error.message.startsWith('CONFLICT:')) {
        setError('This note was modified by another user. Please refresh the page to get the latest version.')
        // Notify parent of the conflict
        if (onNoteUpdated) {
          onNoteUpdated({ error: true, conflict: true })
        }
      } else {
        setError(error.message || 'Failed to update note. Please try again.')
        // Revert to initial note on error and notify parent of the error
        if (onNoteUpdated) {
          onNoteUpdated({ note: initialNote, error: true })
        }
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
      {error && (
        <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write a note..."
          required
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {pending ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}