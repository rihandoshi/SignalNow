-- 1. Users table (handled by Supabase Auth, but usually referenceable)
-- We don't create 'users' manually as it's part of auth.users, but we reference auth.users(id)

-- 2. Profiles table (Application specific user data)
-- Matches usage in src/app/api/onboard/route.js
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    github_username TEXT,
    goal TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User Watchlist (The configuration of what to track)
CREATE TABLE IF NOT EXISTS user_watchlist (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL, -- 'repo', 'org', 'username'
    target_value TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_value)
);

-- 4. Tracked Profiles (The analysis context for specific people)
CREATE TABLE IF NOT EXISTS tracked_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_username TEXT NOT NULL,
    
    -- Analysis State
    last_activity_hash TEXT,
    last_readiness_score INTEGER,
    last_readiness_level TEXT,
    last_decision TEXT,
    last_checked_at TIMESTAMP WITH TIME ZONE,
    last_bridge TEXT,
    last_reason TEXT,
    last_focus JSONB,
    
    -- NEW FIELDS (Rich Data persistence)
    last_trace JSONB,       -- Full AI output tree
    last_icebreaker TEXT,   -- Generated message
    last_next_step TEXT,    -- Recommended action
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_username)
);

-- Comments for clarity
COMMENT ON COLUMN tracked_profiles.last_trace IS 'Stores the full raw output from the AI agents (Researcher, Strategist, Ghostwriter)';
COMMENT ON COLUMN tracked_profiles.last_icebreaker IS 'Stores the generated icebreaker message';

-- 5. Analysis History (Historical log of all runs)
CREATE TABLE IF NOT EXISTS analysis_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tracked_profile_id BIGINT REFERENCES tracked_profiles(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    readiness_score INTEGER,
    decision TEXT,
    reasoning TEXT,
    bridge TEXT,
    trace JSONB -- Historical snapshot of the trace
);

-- 6. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_github ON profiles(github_username);
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON user_watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_tracked_profiles_user ON tracked_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_tracked_profiles_target ON tracked_profiles(user_id, target_username);
CREATE INDEX IF NOT EXISTS idx_analysis_history_user ON analysis_history(user_id);
