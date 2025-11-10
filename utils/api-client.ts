// Utility functions for calling our API routes

export async function getUsers() {
  const response = await fetch('/api/users', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }
  
  return response.json()
}

export async function getProtectedData() {
  const response = await fetch('/api/protected', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch protected data')
  }
  
  return response.json()
}

export async function getProfiles() {
  const response = await fetch('/api/profiles', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch profiles')
  }
  
  return response.json()
}

export async function createProfile(profileData: any) {
  const response = await fetch('/api/profiles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  })
  
  if (!response.ok) {
    throw new Error('Failed to create profile')
  }
  
  return response.json()
}

export async function updateProfile(id: string, profileData: any) {
  const response = await fetch(`/api/profiles/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  })
  
  if (!response.ok) {
    throw new Error('Failed to update profile')
  }
  
  return response.json()
}

export async function deleteProfile(id: string) {
  const response = await fetch(`/api/profiles/${id}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    throw new Error('Failed to delete profile')
  }
  
  return response.json()
}

export async function createUser(userData: { email: string; password: string }) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })
  
  if (!response.ok) {
    throw new Error('Failed to create user')
  }
  
  return response.json()
}
