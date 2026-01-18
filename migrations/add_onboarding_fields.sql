-- Add missing onboarding fields to profiles table
-- This migration adds columns for organizations and people tracking

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS organizations TEXT,
ADD COLUMN IF NOT EXISTS people TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.organizations IS 'Target organizations to track (comma-separated or newline-separated)';
COMMENT ON COLUMN public.profiles.people IS 'Target people/usernames to track (comma-separated or newline-separated)';
