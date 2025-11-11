// Utility functions for calling our notes API routes from client components

export async function getNotes() {
  const response = await fetch('/api/notes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch notes')
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
    throw new Error('Failed to create note')
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
    throw new Error('Failed to update note')
  }
  
  return response.json()
}

export async function deleteNote(id: string) {
  const response = await fetch(`/api/notes/${id}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    throw new Error('Failed to delete note')
  }
  
  return response.json()
}