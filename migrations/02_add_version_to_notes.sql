-- Add version column to notes table for optimistic locking
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

-- Ensure all existing notes have version 1 (in case some were created before this migration)
UPDATE notes SET version = 1 WHERE version IS NULL;

-- Create index for better performance on version column
CREATE INDEX IF NOT EXISTS idx_notes_version ON notes(version);