
import { useEffect, useState } from "react";

export interface WebSocketEvent {
  type: string;
  userId?: string;
  amount?: number;
  badge?: string;
  timestamp: string;
}

export function useWebSocket(userId: string) {
  const [events, setEvents] = useState<WebSocketEvent[]>([]);

  useEffect(() => {
    // Mock WebSocket connection logic
    console.log("✅ WebSocket connected for user:", userId);

    const mockInterval = setInterval(() => {
      // Simulate random XP gains
      if (Math.random() > 0.9) {
        const newEvent: WebSocketEvent = {
          type: "xp_award",
          userId,
          amount: 50,
          timestamp: new Date().toISOString(),
        };
        setEvents((prev) => [...prev, newEvent]);
      }
    }, 15000);

    return () => {
      console.log("❌ WebSocket disconnected");
      clearInterval(mockInterval);
    };
  }, [userId]);

  const clearEvents = () => setEvents([]);

  return { events, clearEvents };
}
