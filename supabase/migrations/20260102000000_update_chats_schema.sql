-- Add type and category to chats
ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS type text DEFAULT 'group'; -- group, channel, dm
ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS category text DEFAULT 'general'; -- work, personal, crypto, gaming, general

-- Update existing records
UPDATE public.chats SET type = 'group' WHERE is_group = true;
UPDATE public.chats SET type = 'dm' WHERE is_group = false;
