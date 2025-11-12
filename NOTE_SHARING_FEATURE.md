# Note Sharing Feature

This document explains how to set up and use the note sharing feature in the application.

## Setup

1. **Database Migration**: Run the SQL migration to create the `note_access` table:
   ```sql
   CREATE TABLE IF NOT EXISTS note_access (
     id SERIAL PRIMARY KEY,
     note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
     user_id UUID NOT NULL,
     granted_by UUID NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(note_id, user_id)
   );
   
   CREATE INDEX IF NOT EXISTS idx_note_access_note_id ON note_access(note_id);
   CREATE INDEX IF NOT EXISTS idx_note_access_user_id ON note_access(user_id);
   CREATE INDEX IF NOT EXISTS idx_note_access_granted_by ON note_access(granted_by);
   ```

2. **Dependencies**: Ensure all required dependencies are installed:
   - `@supabase/ssr`
   - `@supabase/supabase-js`

## Feature Overview

The note sharing feature allows note creators to grant other users access to their notes. Users with access can view, edit, and delete notes they don't own.

### How It Works

1. **Note Ownership**: Each note has an owner (creator) who has full control over the note.
2. **Access Management**: Note owners can grant or revoke access to other users via email.
3. **Permission Checking**: When performing operations on notes, the system checks if the user is either the owner or has been granted access.
4. **Shared Operations**: Users with access can:
   - View the note in their notes list
   - Edit the note
   - Delete the note

### Components

1. **Backend**:
   - Actions: `grantNoteAccess`, `revokeNoteAccess`, `getNoteAccessUsers`
   - API Routes: `/api/notes/[id]/access`
   - Modified existing note operations to check access permissions

2. **Frontend**:
   - `NoteAccessManager`: Component for managing note access
   - Updated `NotesList` to show sharing options for owned notes
   - Updated `UserNotesManager` to pass current user ID

### API Endpoints

- `GET /api/notes/[id]/access` - Get users who have access to a note
- `POST /api/notes/[id]/access` - Grant access to a note for a user
- `DELETE /api/notes/[id]/access/[userId]` - Revoke access to a note for a user

### Client Utilities

- `grantNoteAccess(noteId, userEmail)` - Grant access to a note
- `revokeNoteAccess(noteId, userId)` - Revoke access to a note
- `getNoteAccessUsers(noteId)` - Get users who have access to a note

## Usage

1. **Sharing a Note**:
   - Navigate to the notes page
   - Find a note you own
   - Click the "Share" button
   - Enter the email of the user you want to share with
   - Click "Share"

2. **Managing Access**:
   - After sharing, you can see a list of users who have access
   - You can revoke access at any time by clicking "Revoke"

3. **Accessing Shared Notes**:
   - Users with access will see shared notes in their notes list
   - They can edit and delete shared notes just like their own notes

## Security Considerations

- Only note owners can grant or revoke access
- All operations are validated on the server side
- Access is checked for all note operations (view, edit, delete)
- User emails are validated before granting access

## Extending the Feature

Possible extensions to this feature:
- Add different permission levels (read-only, edit, etc.)
- Add expiration dates for access
- Add notifications when access is granted/revoked
- Add bulk sharing capabilities