import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import webpush from "https://esm.sh/web-push@3.6.3";
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
    const input = await req.json();
    let userId, title, body, icon, clickAction, eventId;

    // Initialize Supabase Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Check if called via Webhook (Database Insert)
    if (input.record && input.table === 'notification_events') {
      const record = input.record;
      userId = record.user_id;
      eventId = record.id;
      const payload = record.payload;
      const eventType = record.event_type;

      if (eventType === 'new_message') {
        title = `New message from ${payload.sender_name || 'User'}`;
        body = payload.content;
        icon = '/assets/cloudhopq1.png';
        clickAction = `/chat/${payload.chat_id}`;
      } else if (eventType === 'incoming_call') {
        title = 'Incoming Call';
        body = 'Tap to answer';
        icon = '/assets/cloudhopq1.png';
        clickAction = '/'; 
      } else {
        // Unknown event type, just delete it to clear queue? Or ignore?
        console.log('Unknown event type:', eventType);
        if (eventId) {
             await supabaseClient.from('notification_events').delete().eq('id', eventId);
        }
        return new Response(JSON.stringify({ message: 'Unknown event type' }), { headers: { 'Content-Type': 'application/json' } });
      }
    } else {
      // Direct call
      userId = input.user_id;
      title = input.title;
      body = input.body;
      icon = input.icon;
      clickAction = input.click_action;
    }

    if (!userId || !title) {
        return new Response(JSON.stringify({ message: 'Missing userId or title' }), { status: 400 });
    }

    // Fetch user's push subscriptions
    const { data: subscriptions, error } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (error || !subscriptions || subscriptions.length === 0) {
      console.log('No subscription found for user', userId);
      // Clean up event if no subscription
      if (eventId) {
          await supabaseClient.from('notification_events').delete().eq('id', eventId);
      }
      return new Response(JSON.stringify({ message: 'No subscription found' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const notificationPayload = JSON.stringify({ title, body, icon, click_action: clickAction });

    // Send push to all user's devices
    const results = await Promise.allSettled(
      subscriptions.map(sub => 
        webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        }, notificationPayload)
          .catch(err => {
            if (err.statusCode === 410) {
                // Subscription expired/gone, remove it
                supabaseClient.from('push_subscriptions').delete().eq('id', sub.id).then();
            }
            throw err;
          })
      )
    );

    // Delete event from queue if successful
    if (eventId) {
      await supabaseClient.from('notification_events').delete().eq('id', eventId);
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing notification:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
