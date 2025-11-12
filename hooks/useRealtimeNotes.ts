'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

interface UseRealtimeNotesProps {
  onNoteChange: () => void
  currentPage: number
  searchQuery: string
}

export function useRealtimeNotes({ 
  onNoteChange,
  currentPage,
  searchQuery
}: UseRealtimeNotesProps) {
  const supabase = createClient()

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
        () => {
          // Trigger the callback to refetch notes
          onNoteChange()
        }
      )
      .subscribe()

    // Clean up subscription
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, currentPage, searchQuery, onNoteChange])
}