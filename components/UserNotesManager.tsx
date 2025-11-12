'use client'

import { useState, useEffect, useRef } from 'react'
import NoteForm from '@/components/forms/NoteForm'
import NotesList, { NotesListHandle } from '@/components/forms/NotesList'
import { useNotes } from '@/hooks/useNotes'
import { useRealtimeNotes } from '@/hooks/useRealtimeNotes'
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  
  // Use our custom hooks for data fetching and state management
  const {
    notes,
    loading,
    error,
    searchQuery,
    pagination,
    setSearchQuery,
    handlePageChange,
    handleRetry,
    fetchNotes,
    addOptimisticNote
  } = useNotes({ limit: 10 })
  
  const notesListRef = useRef<NotesListHandle>(null)
  const supabase = createClient()

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

  // Set up real-time subscription using our custom hook
  useRealtimeNotes({
    onNoteChange: () => fetchNotes(pagination.currentPage, searchQuery),
    currentPage: pagination.currentPage,
    searchQuery
  })

  const handleNoteAdded = (newNote: Note) => {
    // Handle optimistic note using the hook function
    addOptimisticNote(newNote)
  }

  const handleNoteUpdated = () => {
    // Refresh the notes list
    fetchNotes(pagination.currentPage, searchQuery)
  }

  const handleNoteDeleted = () => {
    // Refresh the notes list
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
            notes={notes} 
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