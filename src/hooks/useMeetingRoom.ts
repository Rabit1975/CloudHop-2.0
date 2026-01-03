import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';

export interface MeetingParticipant {
  id: string;
  name: string;
  avatar?: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  joinedAt: string;
  user_id?: string;
}

export function useMeetingRoom(meetingId: string, user: User, isMuted: boolean, isVideoOff: boolean) {
  const [participants, setParticipants] = useState<MeetingParticipant[]>([]);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!meetingId || !user) return;

    // Join the channel for this meeting
    const channel = supabase.channel(`meeting:${meetingId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const activeParticipants: MeetingParticipant[] = [];
        
        for (const key in newState) {
           const presence = newState[key][0] as any; // Supabase presence state
           if (presence.user_id !== user.id) { // Don't include self in remote participants list
               activeParticipants.push({
                   id: presence.user_id,
                   name: presence.name,
                   avatar: presence.avatar,
                   isSpeaking: presence.isSpeaking || false,
                   isMuted: presence.isMuted || false,
                   isVideoOff: presence.isVideoOff || false,
                   joinedAt: presence.joined_at,
                   user_id: presence.user_id
               });
           }
        }
        setParticipants(activeParticipants);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track self
          await channel.track({
            user_id: user.id,
            name: user.name || 'Guest',
            avatar: user.avatar,
            isMuted,
            isVideoOff,
            isSpeaking: false,
            joined_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [meetingId, user.id]); // Re-subscribe if meeting ID or user changes

  // Update presence when local state changes
  useEffect(() => {
      if (channelRef.current && meetingId) {
          channelRef.current.track({
            user_id: user.id,
            name: user.name || 'Guest',
            avatar: user.avatar,
            isMuted,
            isVideoOff,
            isSpeaking: false, // We'd need audio analysis to update this really
            joined_at: new Date().toISOString(), // This should ideally persist from initial join
          });
      }
  }, [isMuted, isVideoOff, user.name]);

  return { participants };
}
