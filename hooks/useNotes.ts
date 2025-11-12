'use client'

import { useState, useEffect, useCallback } from 'react'
import { getNotes, createNote, updateNote, deleteNote } from '@/utils/notes-api-client'

// Define the Note type
interface Note {
  id: string | number
  note: string
  created_at: string
  user?: {
    email: string
  }
  tempId?: string
  error?: boolean
  [key: string]: any
}

// Define pagination type
interface Pagination {
  currentPage: number
  totalPages: number
  totalNotes: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface UseNotesProps {
  initialPage?: number
  limit?: number
  initialSearchQuery?: string
}

export function useNotes({ 
  initialPage = 1, 
  limit = 10, 
  initialSearchQuery = '' 
}: UseNotesProps = {}) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: initialPage,
    totalPages: 1,
    totalNotes: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Fetch notes with proper error handling
  const fetchNotes = useCallback(async (page: number = initialPage, search: string = initialSearchQuery) => {
    try {
      setLoading(true)
      const response = await getNotes(page, limit, search)
      
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
    } catch (err: any) {
      console.error('Failed to fetch notes:', err)
      setError(err.message || 'Failed to load notes. Please try again.')
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
  }, [initialPage, initialSearchQuery, limit])

  // Handle search with debounce
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

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  const handleRetry = () => {
    setError(null)
    fetchNotes(pagination.currentPage, searchQuery)
  }

  // Optimistic update functions
  const addOptimisticNote = (newNote: Note) => {
    // If this is to remove an optimistic note due to error
    if (newNote.error) {
      setNotes(prevNotes => prevNotes.filter(note => note.id !== newNote.id))
      return
    }
    
    // If this is a replacement for an optimistic note, replace it
    if (newNote.tempId) {
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === newNote.tempId ? { ...newNote, id: newNote.id } : note
        )
      )
      return
    }
    
    // Otherwise, add the new note to the beginning of the list
    setNotes(prevNotes => [newNote, ...prevNotes])
  }

  // CRUD operations
  const createNewNote = async (noteData: { note: string }) => {
    try {
      const newNote = await createNote(noteData)
      // Add to the beginning of the list
      setNotes(prevNotes => [newNote, ...prevNotes])
      return newNote
    } catch (err: any) {
      setError(err.message || 'Failed to create note. Please try again.')
      throw err
    }
  }

  const updateExistingNote = async (id: string, noteData: { note: string, version: number }) => {
    try {
      const updatedNote = await updateNote(id, noteData)
      // Update the note in the list
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === id ? { ...note, ...updatedNote } : note
        )
      )
      return updatedNote
    } catch (err: any) {
      setError(err.message || 'Failed to update note. Please try again.')
      throw err
    }
  }

  const deleteExistingNote = async (id: string) => {
    try {
      await deleteNote(id)
      // Remove the note from the list
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id))
    } catch (err: any) {
      setError(err.message || 'Failed to delete note. Please try again.')
      throw err
    }
  }

  return {
    // Data
    notes,
    pagination,
    loading,
    error,
    searchQuery,
    
    // Functions
    fetchNotes,
    setSearchQuery,
    handlePageChange,
    handleRetry,
    addOptimisticNote,
    createNewNote,
    updateExistingNote,
    deleteExistingNote
  }
}