-- Add last_trace column to tracked_profiles to store full AI analysis details
ALTER TABLE tracked_profiles 
ADD COLUMN IF NOT EXISTS last_trace JSONB;

-- Add specific columns for key UI elements
ALTER TABLE tracked_profiles
ADD COLUMN IF NOT EXISTS last_icebreaker TEXT,
ADD COLUMN IF NOT EXISTS last_next_step TEXT;

-- Comments
COMMENT ON COLUMN tracked_profiles.last_trace IS 'Stores the full raw output from the AI agents (Researcher, Strategist, Ghostwriter) for debugging and display';
COMMENT ON COLUMN tracked_profiles.last_icebreaker IS 'Stores the generated icebreaker message';
COMMENT ON COLUMN tracked_profiles.last_next_step IS 'Stores the recommended next action';
