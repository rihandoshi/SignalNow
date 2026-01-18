-- Add repositories column to profiles table
 alter table profiles 
 add column if not exists repositories text;

-- Or if you prefer jsonb for structured data:
-- add column if not exists repositories jsonb;
-- But based on the plan, text (comma separated) is fine for now or just a string input.
