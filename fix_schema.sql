-- The logic to add columns to an EXISTING table must use ALTER TABLE.
-- Using CREATE TABLE IF NOT EXISTS will NOT update an existing table.

-- Run this script to fix the "column does not exist" error

ALTER TABLE tracked_profiles 
ADD COLUMN IF NOT EXISTS last_trace JSONB,
ADD COLUMN IF NOT EXISTS last_icebreaker TEXT,
ADD COLUMN IF NOT EXISTS last_next_step TEXT;

-- Verify the columns were added
COMMENT ON COLUMN tracked_profiles.last_trace IS 'Stores the full raw output from the AI agents';
COMMENT ON COLUMN tracked_profiles.last_icebreaker IS 'Stores the generated icebreaker message';
COMMENT ON COLUMN tracked_profiles.last_next_step IS 'Stores the recommended next action';
