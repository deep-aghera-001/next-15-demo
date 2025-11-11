'use client'

import { useTransition, useState } from 'react'
import { createNote } from '@/utils/notes-api-client'

export default function NoteForm({ onNoteAdded }: { onNoteAdded?: () => void }) {
  const [pending, start] = useTransition()
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!note.trim()) return
    
    setError(null)
    try {
      await createNote({ note })
      setNote('')
      // Notify parent component if needed
      if (onNoteAdded) {
        onNoteAdded()
      }
    } catch (error: any) {
      console.error('Failed to create note:', error)
      setError(error.message || 'Failed to create note. Please try again.')
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