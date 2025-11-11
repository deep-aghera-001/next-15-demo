import { getNotes } from '../../actions/notes'

import NoteForm from '@/components/forms/NoteForm'
import NotesList from '@/components/forms/NotesList'

export default async function NotesPage() {
  const notes = await getNotes()

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Notes</h1>
      <NoteForm />
      <NotesList notes={notes ?? []} />
    </div>
  )
}