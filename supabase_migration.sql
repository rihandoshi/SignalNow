-- Add repositories column to profiles table if it doesn't exist
alter table profiles 
add column if not exists repositories text;

-- Add organizations column
alter table profiles
add column if not exists organizations text;

-- Add people column
alter table profiles
add column if not exists people text;
