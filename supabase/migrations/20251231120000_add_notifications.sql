-- Add chat_id to call_history if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'call_history' and column_name = 'chat_id') then
    alter table public.call_history add column chat_id uuid references public.chats(id);
  end if;
end $$;

-- Create notification_events table if not exists
create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);

-- Function: notify_new_message
create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
as $$
declare
  chat_participant uuid;
  sender_name text;
begin
  -- Get sender name for the notification
  select username into sender_name from public.users where id = new.sender_id;
  
  -- Loop through all participants except the sender
  for chat_participant in
    select user_id
    from public.chat_participants
    where chat_id = new.chat_id
      and user_id != new.sender_id
  loop
    -- Insert into a notification queue table
    insert into public.notification_events (user_id, event_type, payload)
    values (
      chat_participant,
      'new_message',
      jsonb_build_object(
        'chat_id', new.chat_id,
        'message_id', new.id,
        'sender_id', new.sender_id,
        'sender_name', sender_name,
        'content', new.content,
        'created_at', new.created_at
      )
    );
  end loop;

  return new;
end;
$$;

-- Trigger: on_new_message_notify
drop trigger if exists on_new_message_notify on public.messages;
create trigger on_new_message_notify
after insert on public.messages
for each row
execute procedure public.notify_new_message();

-- Function: notify_incoming_call
create or replace function public.notify_incoming_call()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Only notify on new active calls (offers)
  if new.status = 'active' then
      insert into public.notification_events (user_id, event_type, payload)
      values (
        new.receiver_id,
        'incoming_call',
        jsonb_build_object(
          'caller_id', new.caller_id,
          'chat_id', new.chat_id,
          'call_offer_id', new.id,
          'created_at', new.started_at
        )
      );
  end if;

  return new;
end;
$$;

-- Trigger: on_incoming_call_notify
drop trigger if exists on_incoming_call_notify on public.call_history;
create trigger on_incoming_call_notify
after insert on public.call_history
for each row
execute procedure public.notify_incoming_call();
