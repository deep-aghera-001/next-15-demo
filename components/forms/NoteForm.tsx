'use client'

import { useTransition, useState } from 'react'
import { createNote } from '@/utils/notes-api-client'
import { Note } from '@/types/note'

export default function NoteForm({ onNoteAdded }: { onNoteAdded?: (newNote: Note) => void }) {
  const [pending, start] = useTransition()
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!note.trim()) return
    
    setError(null)
    
    // Create optimistic note with a unique temporary ID
    const tempId = `optimistic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const optimisticNote: Note = {
      id: tempId,
      note: note.trim(),
      created_at: new Date().toISOString(),
      user: { email: 'You' }
    }
    
    // Notify parent component with optimistic note
    if (onNoteAdded) {
      onNoteAdded(optimisticNote)
    }
    
    try {
      const savedNote = await createNote({ note: note.trim() })
      // Replace optimistic note with real note
      if (onNoteAdded) {
        onNoteAdded({ ...savedNote, tempId }) // Pass tempId to identify which note to replace
      }
      setNote('')
    } catch (error: any) {
      console.error('Failed to create note:', error)
      setError(error.message || 'Failed to create note. Please try again.')
      // Notify parent to remove the optimistic note on error
      if (onNoteAdded) {
        onNoteAdded({ id: tempId, error: true } as Note)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
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
          {pending ? 'Saving...' : 'Add'}
        </button>
      </div>
    </form>
  )
}