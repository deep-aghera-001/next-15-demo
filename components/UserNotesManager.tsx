'use client'

import { useState, useEffect, useRef, startTransition } from 'react'
import { useOptimistic } from 'react'
import { getNotes } from '@/utils/notes-api-client'
import NoteForm from '@/components/forms/NoteForm'
import NotesList, { NotesListHandle } from '@/components/forms/NotesList'
import { createClient } from '@/utils/supabase/client'

// Define the Note type
interface Note {
  id: string | number;
  note: string;
  created_at: string;
  user?: {
    email: string;
  };
  tempId?: string;
  error?: boolean;
  [key: string]: any;
}

export default function UserNotesManager() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  // Use useOptimistic hook for optimistic updates
  const [optimisticNotes, setOptimisticNotes] = useOptimistic(
    notes,
    (state: Note[], newNote: Note) => {
      // If this is to remove an optimistic note due to error
      if (newNote.error) {
        return state.filter(note => note.id !== newNote.id)
      }
      // If this is a replacement for an optimistic note, replace it
      if (newNote.tempId) {
        return state.map(note => 
          note.id === newNote.tempId ? { ...newNote, id: newNote.id } : note
        )
      }
      // Otherwise, add the new note to the beginning of the list
      return [newNote, ...state]
    }
  )
  const notesListRef = useRef<NotesListHandle>(null)

  const supabase = createClient()

  useEffect(() => {
    // Get current user
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }
    }
    
    fetchUser()
  }, [])

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

  useEffect(() => {
    fetchNotes()
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('user-notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes'
        },
        (payload) => {
          // For real-time updates, we need to refetch all notes to ensure
          // we have the correct user information for each note
          fetchNotes()
        }
      )
      .subscribe()

    // Clean up subscription
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleNoteAdded = (newNote: Note) => {
    // Set optimistic note using the useOptimistic hook wrapped in startTransition
    startTransition(() => {
      setOptimisticNotes(newNote)
    })
    
    // If this is a confirmed note from the server (has a real ID), 
    // and it has a tempId, it's replacing an optimistic note
    if (newNote.id && typeof newNote.id === 'number' && newNote.tempId) {
      // Update the actual notes state as well
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === newNote.tempId ? { ...newNote, id: newNote.id } : note
        )
      )
      return
    }
    
    // If this is an error notification for an optimistic note, 
    // display the error to the user
    if (newNote.error) {
      setError('Failed to create note. Please try again.')
      return
    }
    
    // If this is a new optimistic note, add it to our state too
    if (newNote.id && newNote.id.toString().startsWith('optimistic_')) {
      setNotes(prevNotes => [newNote, ...prevNotes])
    }
  }

  const handleNoteUpdated = () => {
    // Refresh the notes list
    fetchNotes()
  }

  if (loading) return <p className="text-gray-700">Loading notes...</p>
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">My Notes</h2>
      </div>
      
      {error && (
        <div className="text-red-500 p-4 bg-red-50 rounded mb-4">
          <p>Error: {error}</p>
          <button 
            onClick={() => {
              setError(null)
              fetchNotes()
            }}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}
      
      <NoteForm onNoteAdded={handleNoteAdded} />
      
      <div className="mt-6">
        <NotesList 
          ref={notesListRef}
          notes={optimisticNotes} 
          onNoteDeleted={fetchNotes} 
          onNoteUpdated={handleNoteUpdated}
          currentUserId={currentUserId || undefined}
        />
      </div>
    </div>
  )
}