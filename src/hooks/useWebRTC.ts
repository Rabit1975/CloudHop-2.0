import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" }
];

type CallState = 'idle' | 'calling' | 'incoming' | 'connected' | 'ended';

interface WebRTCState {
  callState: CallState;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  startCall: (receiverId: string) => Promise<void>;
  acceptCall: () => Promise<void>;
  endCall: () => void;
  incomingCallFrom: string | null;
}

export const useWebRTC = (userId: string | undefined): WebRTCState => {
  const [callState, setCallState] = useState<CallState>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [incomingCallFrom, setIncomingCallFrom] = useState<string | null>(null);
  const [remoteUserId, setRemoteUserId] = useState<string | null>(null);

  const pc = useRef<RTCPeerConnection | null>(null);
  const signalingChannel = useRef<RealtimeChannel | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to signaling channel (user's private channel)
    const channel = supabase.channel(`calls:${userId}`);
    
    channel
      .on('broadcast', { event: 'call-offer' }, async ({ payload }) => {
        console.log('Received call offer from:', payload.fromUserId);
        setIncomingCallFrom(payload.fromUserId);
        setRemoteUserId(payload.fromUserId);
        setCallState('incoming');
        
        // Initialize PC to handle early candidates if any (optional optimization)
        // For now, we wait for accept to create PC to avoid permissions if declined
        
        // Store offer to set later
        (window as any).pendingOffer = payload.offer;
      })
      .on('broadcast', { event: 'call-answer' }, async ({ payload }) => {
        console.log('Received call answer');
        if (pc.current) {
          await pc.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
        }
      })
      .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        console.log('Received ICE candidate');
        if (pc.current && pc.current.remoteDescription) {
            await pc.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } else {
            pendingCandidates.current.push(payload.candidate);
        }
      })
      .on('broadcast', { event: 'call-end' }, () => {
        console.log('Call ended by remote');
        cleanupCall();
      })
      .subscribe();

    signalingChannel.current = channel;

    return () => {
      channel.unsubscribe();
      cleanupCall();
    };
  }, [userId]);

  const createPeerConnection = () => {
    if (pc.current) return pc.current;

    const peer = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    peer.onicecandidate = (event) => {
      if (event.candidate && remoteUserId) {
        // Send candidate to remote user
        const channel = supabase.channel(`calls:${remoteUserId}`);
        channel.subscribe(async (status) => {
           if (status === 'SUBSCRIBED') {
               await channel.send({
                 type: 'broadcast',
                 event: 'ice-candidate',
                 payload: { fromUserId: userId, candidate: event.candidate }
               });
               // We don't unsubscribe immediately to keep connection open for more candidates
               // Ideally we should have a dedicated sending channel or reuse one
           }
        });
      }
    };

    peer.ontrack = (event) => {
      console.log('Received remote track');
      setRemoteStream(event.streams[0]);
    };
    
    peer.onconnectionstatechange = () => {
        if (peer.connectionState === 'connected') {
            setCallState('connected');
        } else if (peer.connectionState === 'disconnected' || peer.connectionState === 'failed') {
            cleanupCall();
        }
    };

    pc.current = peer;
    return peer;
  };

  const startCall = async (receiverId: string) => {
    if (!userId) return;
    setRemoteUserId(receiverId);
    setCallState('calling');
    
    const peer = createPeerConnection();
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setLocalStream(stream);
        stream.getTracks().forEach(track => peer.addTrack(track, stream));
        
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        
        // Send offer
        // We broadcast to the receiver's channel
        // Note: In Supabase broadcast, anyone subscribed to the channel receives it.
        // We use `calls:receiverId` as a convention for their "inbox"
        const channel = supabase.channel(`calls:${receiverId}`);
        channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.send({
                    type: 'broadcast',
                    event: 'call-offer',
                    payload: { fromUserId: userId, offer }
                });
            }
        });
        
    } catch (e) {
        console.error("Error starting call:", e);
        cleanupCall();
    }
  };

  const acceptCall = async () => {
    if (!remoteUserId || !userId) return;
    
    const peer = createPeerConnection();
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setLocalStream(stream);
        stream.getTracks().forEach(track => peer.addTrack(track, stream));

        const offer = (window as any).pendingOffer;
        if (!offer) {
            console.error("No pending offer found");
            return;
        }

        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        
        // Process pending candidates
        while(pendingCandidates.current.length > 0) {
            const candidate = pendingCandidates.current.shift();
            if (candidate) await peer.addIceCandidate(new RTCIceCandidate(candidate));
        }
        
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        
        // Send answer
        const channel = supabase.channel(`calls:${remoteUserId}`);
        channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.send({
                    type: 'broadcast',
                    event: 'call-answer',
                    payload: { fromUserId: userId, answer }
                });
                setCallState('connected');
            }
        });

    } catch (e) {
        console.error("Error accepting call:", e);
        cleanupCall();
    }
  };

  const endCall = () => {
    if (remoteUserId) {
        const channel = supabase.channel(`calls:${remoteUserId}`);
        channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.send({
                    type: 'broadcast',
                    event: 'call-end',
                    payload: { fromUserId: userId }
                });
            }
        });
    }
    cleanupCall();
  };

  const cleanupCall = () => {
    if (pc.current) {
        pc.current.close();
        pc.current = null;
    }
    if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
        setLocalStream(null);
    }
    setRemoteStream(null);
    setCallState('idle');
    setIncomingCallFrom(null);
    setRemoteUserId(null);
    pendingCandidates.current = [];
  };

  return {
    callState,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    endCall,
    incomingCallFrom
  };
};
