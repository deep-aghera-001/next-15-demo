'use client'

import { useTransition } from 'react'
import { deleteNote } from '../../actions/notes'

export default function NotesList({ notes }: { notes: any[] }) {
  const [pending, start] = useTransition()

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
            onClick={() => start(() => deleteNote(n.id))}
            disabled={pending}
            className="text-red-500 text-sm"
          >
            {pending ? '...' : 'Delete'}
          </button>
        </li>
      ))}
    </ul>
  )
}
