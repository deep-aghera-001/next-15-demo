// Utility functions for calling our note access API routes from client components

export async function grantNoteAccess(noteId: string, userEmail: string) {
  const response = await fetch(`/api/notes/${noteId}/access`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userEmail }),
  })
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to grant access: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return response.json()
}

export async function revokeNoteAccess(noteId: string, userId: string) {
  const response = await fetch(`/api/notes/${noteId}/access/${userId}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to revoke access: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return response.json()
}

export async function getNoteAccessUsers(noteId: string) {
  const response = await fetch(`/api/notes/${noteId}/access`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch access users: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return response.json()
}