-- Add Google Drive folder URL field to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS google_drive_folder_url TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS google_drive_folder_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tasks_google_drive_folder_id ON tasks(google_drive_folder_id);

-- Add comment for documentation
COMMENT ON COLUMN tasks.google_drive_folder_url IS 'URL to the Google Drive folder for task deliverables';
COMMENT ON COLUMN tasks.google_drive_folder_id IS 'Google Drive folder ID for API operations';
