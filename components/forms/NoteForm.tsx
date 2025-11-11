'use client'

import { useTransition, useState } from 'react'
import { createNote } from '@/utils/notes-api-client'

export default function NoteForm({ onNoteAdded }: { onNoteAdded?: () => void }) {
  const [pending, start] = useTransition()
  const [note, setNote] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!note.trim()) return
    
    try {
      await createNote({ note })
      setNote('')
      // Notify parent component if needed
      if (onNoteAdded) {
        onNoteAdded()
      }
    } catch (error) {
      console.error('Failed to create note:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write a note..."
        required
        className="flex-1 border rounded px-3 py-2"
      />
      <button
        type="submit"
        disabled={pending}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {pending ? 'Saving...' : 'Add'}
      </button>
    </form>
  )
}
