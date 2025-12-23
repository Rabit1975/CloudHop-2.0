import { useEffect, useState } from "react";
import { subscribe } from "../services/mockApi";
import { ActivityItem } from "../types";

export interface WebSocketEvent {
  type: string;
  payload: any;
  timestamp: string;
}

const NAMES = ['User_X', 'Dev_Alex', 'Design_Sarah', 'PM_Mike', 'Guest_User', 'Bot_System'];
const MESSAGES = [
    'Deployed v2.3 to prod.', 
    'Can someone review PR #42?', 
    'Starting the sync...', 
    'Lounge vibe is great today.', 
    'Meeting starting in 5m.',
    'Uploading assets...'
];

export function useWebSocket(userId: string, spaceId: string = 'global') {
  const [events, setEvents] = useState<WebSocketEvent[]>([]);

  useEffect(() => {
    console.log(`✅ WebSocket connected for user: ${userId} in space: ${spaceId}`);

    // 1. Subscribe to "Real" API updates (e.g. from other tabs/users creating data)
    const unsubscribe = subscribe((apiEvent: any) => {
        if (apiEvent) {
            setEvents((prev) => [...prev, {
                type: apiEvent.type || 'update',
                payload: apiEvent,
                timestamp: new Date().toISOString()
            }]);
        }
    });

    // 2. Simulate "Ambient" Activity (Users joining, chatting)
    const ambientInterval = setInterval(() => {
        // 30% chance of an event every 5 seconds
        if (Math.random() > 0.7) {
            const type = Math.random() > 0.5 ? 'message' : (Math.random() > 0.5 ? 'join' : 'reaction');
            const randomUser = NAMES[Math.floor(Math.random() * NAMES.length)];
            const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
            
            const newItem: ActivityItem = {
                id: `evt-${Date.now()}`,
                type: type as any,
                user: {
                    name: randomUser,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomUser}`,
                    role: 'Member'
                },
                content: type === 'message' ? randomMsg : (type === 'join' ? 'joined the space.' : 'reacted with 🔥'),
                timestamp: 'Just now',
                channel: 'General'
            };

            setEvents((prev) => [...prev, {
                type: 'feed_update',
                payload: newItem,
                timestamp: new Date().toISOString()
            }]);
        }
    }, 5000);

    return () => {
      console.log("❌ WebSocket disconnected");
      clearInterval(ambientInterval);
      unsubscribe();
    };
  }, [userId, spaceId]);

  const clearEvents = () => setEvents([]);

  return { events, clearEvents };
}
