// Utility function to toggle note editing state
// Using a simple in-memory cache to prevent duplicate requests
const editingStateCache = new Map<string, { editing: boolean; timestamp: number }>()

export async function toggleNoteEditingState(noteId: string, editing: boolean) {
  const cacheKey = `${noteId}-${editing}`
  const now = Date.now()
  
  // Check if we've made this exact request recently (within 1 second)
  const cached = editingStateCache.get(cacheKey)
  if (cached && now - cached.timestamp < 1000) {
    return Promise.resolve({ success: true })
  }
  
  try {
    const response = await fetch(`/api/notes/${noteId}/editing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ editing }),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || 'Failed to update note editing state';
      throw new Error(errorMessage);
    }
    
    const result = await response.json()
    
    // Cache the successful request
    editingStateCache.set(cacheKey, { editing, timestamp: now })
    
    // Clean up cache entries older than 5 seconds
    editingStateCache.forEach((value, key) => {
      if (now - value.timestamp > 5000) {
        editingStateCache.delete(key)
      }
    })
    
    return result
  } catch (error) {
    // Don't cache failed requests
    console.error('Error toggling note editing state:', error)
    throw error
  }
}