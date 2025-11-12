'use client'

import { useState, useEffect, useRef, startTransition, useCallback } from 'react'
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

// Define pagination type
interface Pagination {
  currentPage: number;
  totalPages: number;
  totalNotes: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function UserNotesManager() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalNotes: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  
  // Use useOptimistic hook for optimistic updates
  const [optimisticNotes, addOptimisticNote] = useOptimistic(
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

  // Fetch notes with proper error handling
  const fetchNotes = useCallback(async (page: number = 1, search: string = '') => {
    try {
      setLoading(true)
      const response = await getNotes(page, 10, search)
      
      // Handle both old and new response formats
      if (response.notes) {
        // New format with pagination
        setNotes(response.notes)
        setPagination(response.pagination)
      } else {
        // Old format without pagination
        setNotes(response)
      }
      
      setError(null)
    } catch (error: any) {
      console.error('Failed to fetch notes:', error)
      setError(error.message || 'Failed to load notes. Please try again.')
      // Reset pagination on error
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalNotes: 0,
        hasNextPage: false,
        hasPrevPage: false
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // Get current user on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }
    }
    
    fetchUser()
  }, [])

  // Handle search with debounce and pagination reset
  useEffect(() => {
    const handler = setTimeout(() => {
      // Always reset to page 1 when search query changes
      fetchNotes(1, searchQuery)
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [searchQuery, fetchNotes])

  // Handle pagination changes
  useEffect(() => {
    // Only fetch when not triggered by search (which already fetches)
    if (searchQuery === '') {
      fetchNotes(pagination.currentPage, '')
    }
  }, [pagination.currentPage, searchQuery, fetchNotes])

  // Set up real-time subscription
  useEffect(() => {
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
          // Refetch current page with current search query
          fetchNotes(pagination.currentPage, searchQuery)
        }
      )
      .subscribe()

    // Clean up subscription
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, pagination.currentPage, searchQuery, fetchNotes])

  const handleNoteAdded = (newNote: Note) => {
    // Set optimistic note using the useOptimistic hook
    startTransition(() => {
      addOptimisticNote(newNote)
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
    fetchNotes(pagination.currentPage, searchQuery)
  }

  const handleNoteDeleted = () => {
    // Refresh the notes list
    fetchNotes(pagination.currentPage, searchQuery)
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  const handleRetry = () => {
    setError(null)
    fetchNotes(pagination.currentPage, searchQuery)
  }

  // Show loading only for initial load
  const showLoading = loading && notes.length === 0;
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">My Notes</h2>
      </div>
      
      {/* Search Input with visible text */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
        />
      </div>
      
      {error && (
        <div className="text-red-500 p-4 bg-red-50 rounded mb-4">
          <p>Error: {error}</p>
          <button 
            onClick={handleRetry}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}
      
      <NoteForm onNoteAdded={handleNoteAdded} />
      
      <div className="mt-6">
        {showLoading ? (
          <p className="text-gray-700">Loading notes...</p>
        ) : (
          <NotesList 
            ref={notesListRef}
            notes={optimisticNotes} 
            onNoteDeleted={handleNoteDeleted} 
            onNoteUpdated={handleNoteUpdated}
            currentUserId={currentUserId || undefined}
          />
        )}
      </div>
      
      {/* Pagination Controls */}
      {!loading && pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className={`px-4 py-2 rounded ${
              pagination.hasPrevPage 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Previous
          </button>
          
          <span className="text-gray-700">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className={`px-4 py-2 rounded ${
              pagination.hasNextPage 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}