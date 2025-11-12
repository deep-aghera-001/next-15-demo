-- Create note_access table
CREATE TABLE IF NOT EXISTS note_access (
  id SERIAL PRIMARY KEY,
  note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  granted_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(note_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_note_access_note_id ON note_access(note_id);
CREATE INDEX IF NOT EXISTS idx_note_access_user_id ON note_access(user_id);
CREATE INDEX IF NOT EXISTS idx_note_access_granted_by ON note_access(granted_by);