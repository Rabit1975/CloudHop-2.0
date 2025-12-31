-- Add settings, bio, phone to users table
alter table public.users
add column if not exists settings jsonb default '{}'::jsonb,
add column if not exists bio text,
add column if not exists phone text;
