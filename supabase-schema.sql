-- TrackedProfiles table
CREATE TABLE IF NOT EXISTS tracked_profiles (
    id BIGSERIAL PRIMARY KEY,
    source_username TEXT NOT NULL,
    target_username TEXT NOT NULL,
    last_activity_hash TEXT,
    last_readiness_score INTEGER,
    last_readiness_level TEXT,
    last_decision TEXT,
    last_checked_at TIMESTAMP WITH TIME ZONE,
    last_bridge TEXT,
    last_reason TEXT,
    last_focus JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(source_username, target_username)
);

-- AnalysisHistory table
CREATE TABLE IF NOT EXISTS analysis_history (
    id BIGSERIAL PRIMARY KEY,
    tracked_profile_id BIGINT NOT NULL REFERENCES tracked_profiles(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    readiness_score INTEGER,
    decision TEXT,
    reasoning TEXT,
    bridge TEXT,
    raw_trace_json JSONB,
    FOREIGN KEY(tracked_profile_id) REFERENCES tracked_profiles(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tracked_profiles_source_target ON tracked_profiles(source_username, target_username);
CREATE INDEX IF NOT EXISTS idx_analysis_history_profile_id ON analysis_history(tracked_profile_id);
CREATE INDEX IF NOT EXISTS idx_analysis_history_timestamp ON analysis_history(timestamp DESC);
