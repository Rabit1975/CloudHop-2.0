import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import webpush from "https://esm.sh/web-push@3.6.3";
// Minimal Supabase Client stub for Deno (or import official one if preferred)
// For Edge Functions, usually 'esm.sh/@supabase/supabase-js' is used
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const vapidKeys = {
  publicKey: Deno.env.get('VAPID_PUBLIC_KEY')!,
  privateKey: Deno.env.get('VAPID_PRIVATE_KEY')!,
};

webpush.setVapidDetails(
  'mailto:support@cloudhop.tech',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const { user_id, title, body, icon, click_action } = await req.json();

    // Initialize Supabase Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Fetch user's push subscription
    const { data: subscriptions, error } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user_id);

    if (error || !subscriptions || subscriptions.length === 0) {
      console.log('No subscription found for user', user_id);
      return new Response(JSON.stringify({ message: 'No subscription found' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload = JSON.stringify({ title, body, icon, click_action });

    // Send push to all user's devices
    const results = await Promise.allSettled(
      subscriptions.map(sub => 
        webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        }, payload)
      )
    );

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
