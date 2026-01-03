-- Performance Optimization Migration
-- Based on Advisor Recommendations

-- 1. Add Missing Indexes for Foreign Keys and Common Queries
-- These indexes help with JOINs and filtering by foreign keys, which are currently causing sequential scans.

-- Call History
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_call_history_caller_id ON public.call_history(caller_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_call_history_receiver_id ON public.call_history(receiver_id);
-- Composite index for chat history lookups (often filtered by chat_id and ordered by created_at)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_call_history_chat_id_created_at ON public.call_history(chat_id, started_at DESC);

-- Chats
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chats_created_by ON public.chats(created_by);

-- Message Reactions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_reactions_user_id ON public.message_reactions(user_id);

-- Notification Events
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_events_user_id ON public.notification_events(user_id);

-- Push Subscriptions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);

-- Transactions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_wallet_id ON public.transactions(wallet_id);


-- 2. Drop Unused Indexes
-- These indexes were flagged as unused by the query planner. Removing them reduces write overhead.
DROP INDEX CONCURRENTLY IF EXISTS chat_participants_chat_id_idx;
DROP INDEX CONCURRENTLY IF EXISTS messages_chat_id_idx;
DROP INDEX CONCURRENTLY IF EXISTS messages_sender_id_idx;


-- 3. Optimize RLS Policies (Wrap auth.uid() in subselect)
-- This prevents Postgres from re-evaluating auth.uid() for every row, which is a major performance bottleneck.

-- Optimizing call_history policies
DROP POLICY IF EXISTS "Users can see their own call history" ON public.call_history;
CREATE POLICY "Users can see their own call history"
  ON public.call_history FOR SELECT
  USING ((SELECT auth.uid()) = caller_id OR (SELECT auth.uid()) = receiver_id);

DROP POLICY IF EXISTS "Users can insert call history" ON public.call_history;
CREATE POLICY "Users can insert call history"
  ON public.call_history FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = caller_id);

DROP POLICY IF EXISTS "Users can update their own calls" ON public.call_history;
CREATE POLICY "Users can update their own calls"
  ON public.call_history FOR UPDATE
  USING ((SELECT auth.uid()) = caller_id OR (SELECT auth.uid()) = receiver_id);

-- Optimizing wallets policies
DROP POLICY IF EXISTS "View own wallet" ON public.wallets;
CREATE POLICY "View own wallet"
  ON public.wallets FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

-- Optimizing transactions policies
DROP POLICY IF EXISTS "View own transactions" ON public.transactions;
CREATE POLICY "View own transactions"
  ON public.transactions FOR SELECT
  USING (wallet_id IN (SELECT id FROM public.wallets WHERE user_id = (SELECT auth.uid())));

-- Optimizing chats policies
DROP POLICY IF EXISTS "Create chats" ON public.chats;
CREATE POLICY "Create chats"
  ON public.chats FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = created_by);

-- Note: Complex policies like "View chats" relying on functions (get_user_chat_ids) are harder to wrap simply,
-- but the function itself is SECURITY DEFINER which helps.
