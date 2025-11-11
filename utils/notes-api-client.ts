// Utility functions for calling our notes API routes from client components

export async function getNotes() {
  const response = await fetch('/api/notes', {
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

export async function updateNote(id: string, noteData: { note: string }) {
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
    throw new Error(errorMessage);
  }
  
  return response.json()
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