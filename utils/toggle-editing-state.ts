// Utility function to toggle note editing state

export async function toggleNoteEditingState(noteId: string, editing: boolean) {
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
  
  return response.json()
}