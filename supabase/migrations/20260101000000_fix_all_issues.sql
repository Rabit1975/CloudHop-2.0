-- Fix Call History Table
create table if not exists public.call_history (
  id uuid primary key default gen_random_uuid(),
  caller_id uuid references auth.users(id) not null,
  receiver_id uuid references auth.users(id) not null,
  chat_id uuid references public.chats(id),
  started_at timestamptz default now(),
  ended_at timestamptz,
  status text default 'active', -- active, ended, missed, rejected
  duration int
);

-- Enable RLS
alter table public.call_history enable row level security;

-- Call History Policies
drop policy if exists "Users can see their own call history" on public.call_history;
create policy "Users can see their own call history"
  on public.call_history for select
  using (auth.uid() = caller_id or auth.uid() = receiver_id);

drop policy if exists "Users can insert call history" on public.call_history;
create policy "Users can insert call history"
  on public.call_history for insert
  with check (auth.uid() = caller_id);

drop policy if exists "Users can update their own calls" on public.call_history;
create policy "Users can update their own calls"
  on public.call_history for update
  using (auth.uid() = caller_id or auth.uid() = receiver_id);

-- Fix Chat Recursion Policies
-- Strategy: Use a SECURITY DEFINER function to break recursion loop for chat_participants
create or replace function get_user_chat_ids(user_uuid uuid)
returns setof uuid
language sql
security definer
as $$
  select chat_id from public.chat_participants where user_id = user_uuid;
$$;

-- Chat Participants Policies
alter table public.chat_participants enable row level security;

drop policy if exists "View participants" on public.chat_participants;
create policy "View participants"
  on public.chat_participants for select
  using (
    chat_id in (select get_user_chat_ids(auth.uid()))
  );

drop policy if exists "Join chat" on public.chat_participants;
create policy "Join chat"
  on public.chat_participants for insert
  with check (
    auth.uid() = user_id 
    or 
    exists (select 1 from public.chats where id = chat_id and created_by = auth.uid())
  );

-- Channels/Chats Policies
alter table public.chats enable row level security;

drop policy if exists "View chats" on public.chats;
create policy "View chats"
  on public.chats for select
  using (
    id in (select get_user_chat_ids(auth.uid()))
    or 
    is_private = false
  );

drop policy if exists "Create chats" on public.chats;
create policy "Create chats"
  on public.chats for insert
  with check (auth.uid() = created_by);

-- Wallet Tables
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null unique,
  balance numeric default 0,
  currency text default 'USD',
  created_at timestamptz default now()
);

alter table public.wallets enable row level security;

drop policy if exists "View own wallet" on public.wallets;
create policy "View own wallet"
  on public.wallets for select
  using (auth.uid() = user_id);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid references public.wallets(id) not null,
  amount numeric not null,
  type text not null, -- deposit, withdrawal, payment, transfer
  description text,
  status text default 'pending', -- pending, completed, failed
  created_at timestamptz default now()
);

alter table public.transactions enable row level security;

drop policy if exists "View own transactions" on public.transactions;
create policy "View own transactions"
  on public.transactions for select
  using (wallet_id in (select id from public.wallets where user_id = auth.uid()));

-- Add wallet_id to users for easier access if needed, or just use relation
-- (Skipping altering users table to avoid conflicts, standard relation is fine)
