import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';

export interface MeetingParticipant {
  id: string;
  name: string;
  avatar?: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeaking: boolean;
  joinedAt: string;
}

export const useMeetingRoom = (roomId: string, user: User | null | undefined, isMuted: boolean, isVideoOff: boolean) => {
  const [participants, setParticipants] = useState<MeetingParticipant[]>([]);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!roomId || !user) return;

    const channel = supabase.channel(`meeting:${roomId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const users: MeetingParticipant[] = [];
        
        for (const key in newState) {
          const state = newState[key] as any[];
          if (state && state.length > 0) {
            // Use the most recent presence state for this user
            const p = state[0];
            if (p.user_id !== user.id) { // Exclude self from remote participants list
                users.push({
                    id: p.user_id,
                    name: p.name,
                    avatar: p.avatar,
                    isMuted: p.isMuted,
                    isVideoOff: p.isVideoOff,
                    isSpeaking: p.isSpeaking,
                    joinedAt: p.joinedAt
                });
            }
          }
        }
        setParticipants(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined meeting:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left meeting:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            name: user.name,
            avatar: user.avatar,
            isMuted,
            isVideoOff,
            isSpeaking: false,
            joinedAt: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [roomId, user?.id]); // Re-run if room or user changes

  // Update presence when local state changes
  useEffect(() => {
      if (channelRef.current && user) {
          channelRef.current.track({
            user_id: user.id,
            name: user.name,
            avatar: user.avatar,
            isMuted,
            isVideoOff,
            isSpeaking: false, // Todo: wire up VAD
            joinedAt: new Date().toISOString(),
          });
      }
  }, [isMuted, isVideoOff]);

  return { participants };
};
