-- Add being_edited column to notes table
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS being_edited BOOLEAN DEFAULT FALSE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notes_being_edited ON notes(being_edited);