'use client'

import { useTransition } from 'react'
import { createNote } from '../../actions/notes'

export default function NoteForm() {
  const [pending, start] = useTransition()

  return (
    <form
      action={(formData) => start(() => createNote(formData))}
      className="flex gap-2"
    >
      <input
        type="text"
        name="note"
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
