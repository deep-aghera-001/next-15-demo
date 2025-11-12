// Service for handling offline caching and synchronization
'use client'

import { createNote, updateNote, deleteNote } from './notes-api-client'

// Define offline operation type
interface OfflineOperation {
  id: string
  type: 'create' | 'update' | 'delete'
  data: any
  timestamp: number
}

class OfflineSyncService {
  private STORAGE_KEY = 'offline_operations'
  private onlineStatus = true

  constructor() {
    // Check initial online status
    this.updateOnlineStatus(navigator.onLine)
    
    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.updateOnlineStatus(true))
      window.addEventListener('offline', () => this.updateOnlineStatus(false))
    }
  }

  // Check current online status
  isOnline(): boolean {
    if (typeof navigator !== 'undefined') {
      this.onlineStatus = navigator.onLine
    }
    return this.onlineStatus
  }

  // Set online status and trigger appropriate actions
  updateOnlineStatus(status: boolean): void {
    this.onlineStatus = status
    
    // If we're back online, sync pending operations
    if (status) {
      this.syncPendingOperations()
    }
  }

  // Get online status
  getOnlineStatus(): boolean {
    return this.onlineStatus
  }

  // Store operation for offline execution
  queueOperation(operation: Omit<OfflineOperation, 'timestamp'>): void {
    try {
      const existing = localStorage.getItem(this.STORAGE_KEY)
      const operations: OfflineOperation[] = existing ? JSON.parse(existing) : []
      operations.push({
        ...operation,
        timestamp: Date.now()
      })
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(operations))
    } catch (err) {
      console.error('Failed to queue offline operation:', err)
    }
  }

  // Sync pending operations when coming back online or when manually triggered
  async syncPendingOperations(): Promise<void> {
    if (!this.isOnline()) {
      throw new Error('Cannot sync while offline')
    }

    try {
      const existing = localStorage.getItem(this.STORAGE_KEY)
      if (!existing) return

      const operations: OfflineOperation[] = JSON.parse(existing)
      
      // Process operations in order
      for (const operation of operations) {
        try {
          switch (operation.type) {
            case 'create':
              const newNote = await createNote(operation.data)
              // Update cache - replace offline note with real one
              this.updateCachedNote(operation.id, newNote)
              break
            case 'update':
              await updateNote(operation.id, operation.data)
              break
            case 'delete':
              await deleteNote(operation.id)
              break
          }
        } catch (err) {
          console.error(`Failed to sync operation ${operation.id}:`, err)
          // Keep the operation in the queue for retry
          continue
        }
      }

      // Clear successful operations
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (err) {
      console.error('Failed to sync offline operations:', err)
    }
  }

  // Helper to update cached notes
  private updateCachedNote(tempId: string, realNote: any): void {
    try {
      const cachedNotes = localStorage.getItem('notes_cache')
      if (cachedNotes) {
        const notes = JSON.parse(cachedNotes)
        const updatedNotes = notes.map((note: any) => 
          note.id === tempId ? { ...realNote } : note
        )
        localStorage.setItem('notes_cache', JSON.stringify(updatedNotes))
      }
    } catch (err) {
      console.error('Failed to update cached note:', err)
    }
  }

  // Clear all cached data for security purposes
  clearAllCachedData(): void {
    try {
      localStorage.removeItem('notes_cache')
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (err) {
      console.error('Failed to clear cached data:', err)
    }
  }
}

// Export singleton instance
const offlineSyncService = new OfflineSyncService()
export default offlineSyncService