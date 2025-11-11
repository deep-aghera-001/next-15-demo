import NotesManager from '@/components/NotesManager'

export default function NotesPage() {
  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Notes</h1>
      <NotesManager />
    </div>
  )
}