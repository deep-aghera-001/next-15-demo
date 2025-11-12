// Utility functions for calling our notes API routes from client components

export async function getNotes(page: number = 1, limit: number = 10, searchQuery: string = '') {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  if (searchQuery) {
    params.append('search', searchQuery);
  }

  const response = await fetch(`/api/notes?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || 'Failed to fetch notes. Please try again.';
    throw new Error(errorMessage);
  }
  
  return response.json()
}

export async function createNote(noteData: { note: string }) {
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(noteData),
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || 'Failed to create note. Please try again.';
    throw new Error(errorMessage);
  }
  
  return response.json()
}

export async function updateNote(id: string, noteData: { note: string, version: number }) {
  try {
    const response = await fetch(`/api/notes/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || 'Failed to update note. Please try again.';
      
      // Handle conflict specifically
      if (response.status === 409 && errorData.conflict) {
        throw new Error('CONFLICT: ' + errorMessage);
      }
      
      throw new Error(errorMessage);
    }
    
    return response.json()
  } catch (error) {
    console.error('Error in updateNote:', error)
    throw error
  }
}

export async function deleteNote(id: string) {
  const response = await fetch(`/api/notes/${id}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || 'Failed to delete note. Please try again.';
    throw new Error(errorMessage);
  }
  
  return response.json()
}