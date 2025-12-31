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
  rejectCall: () => void;
  endCall: () => void;
  incomingCallFrom: string | null;
  toggleMic: () => void;
  toggleCamera: () => void;
  switchCamera: () => void;
  toggleSpeaker: () => void;
  isMicOn: boolean;
  isCameraOn: boolean;
}

export const useWebRTC = (userId: string | undefined): WebRTCState => {
  const [callState, setCallState] = useState<CallState>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [incomingCallFrom, setIncomingCallFrom] = useState<string | null>(null);
  const [remoteUserId, setRemoteUserId] = useState<string | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [callId, setCallId] = useState<string | null>(null);

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
        setCallId(payload.callId); // Track the DB ID of the call
        setCallState('incoming');
        
        // Store offer to set later
        (window as any).pendingOffer = payload.offer;
      })
      .on('broadcast', { event: 'call-answer' }, async ({ payload }) => {
        console.log('Received call answer');
        if (pc.current) {
          await pc.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
        }
      })
      .on('broadcast', { event: 'call-rejected' }, () => {
        console.log('Call rejected by remote');
        // Update history if we initiated
        if (callId) {
             supabase.from('call_history').update({ status: 'rejected', ended_at: new Date().toISOString() }).eq('id', callId).then();
        }
        cleanupCall();
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
  }, [userId, callId]);

  const createPeerConnection = () => {
    if (pc.current) return pc.current;

    const peer = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    peer.onicecandidate = (event) => {
      if (event.candidate && remoteUserId) {
        const channel = supabase.channel(`calls:${remoteUserId}`);
        channel.subscribe(async (status) => {
           if (status === 'SUBSCRIBED') {
               await channel.send({
                 type: 'broadcast',
                 event: 'ice-candidate',
                 payload: { fromUserId: userId, candidate: event.candidate }
               });
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
    
    // Create DB entry
    const { data: history } = await supabase.from('call_history').insert({
        caller_id: userId,
        receiver_id: receiverId,
        status: 'missed' // Default until answered
    }).select().single();
    
    if (history) setCallId(history.id);

    const peer = createPeerConnection();
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setLocalStream(stream);
        stream.getTracks().forEach(track => peer.addTrack(track, stream));
        
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        
        const channel = supabase.channel(`calls:${receiverId}`);
        channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.send({
                    type: 'broadcast',
                    event: 'call-offer',
                    payload: { fromUserId: userId, offer, callId: history?.id }
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
    
    // Update DB to 'started' (we can use 'ended' status for active calls too, or add 'active' enum, but user spec said 'missed, ended, rejected'. We'll assume 'ended' is set when it finishes, so currently it's just running.)
    // Actually user spec: status in ('missed', 'ended', 'rejected'). 
    // We'll leave it as is or maybe update a separate field if we had one.
    // For now, we just proceed.
    
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
        
        while(pendingCandidates.current.length > 0) {
            const candidate = pendingCandidates.current.shift();
            if (candidate) await peer.addIceCandidate(new RTCIceCandidate(candidate));
        }
        
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        
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

  const rejectCall = () => {
      if (remoteUserId) {
          const channel = supabase.channel(`calls:${remoteUserId}`);
          channel.subscribe(async (status) => {
              if (status === 'SUBSCRIBED') {
                  await channel.send({
                      type: 'broadcast',
                      event: 'call-rejected',
                      payload: { fromUserId: userId }
                  });
              }
          });
          // Update DB if we have the ID
          if (callId) {
              supabase.from('call_history').update({ status: 'rejected', ended_at: new Date().toISOString() }).eq('id', callId).then();
          }
      }
      cleanupCall();
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
        
        // Update DB
        if (callId) {
             // Calculate duration if we had start time, but for now just mark ended
             supabase.from('call_history').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', callId).then();
        }
    }
    cleanupCall();
  };

  const toggleMic = () => {
    if (!localStream) return; // Should not happen if call is active
      
    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length > 0) {
      audioTracks.forEach(track => {
          track.enabled = !track.enabled;
      });
      setIsMicOn(audioTracks[0].enabled);
    }
  };

  const toggleCamera = () => {
    if (!localStream) return; // Should not happen if call is active

    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length > 0) {
      videoTracks.forEach(track => {
          track.enabled = !track.enabled;
      });
      setIsCameraOn(videoTracks[0].enabled);
    }
  };

  const switchCamera = () => {
      // Mock implementation
      console.log("Switching camera...");
      // Real impl would require enumerating devices and replacing track
  };

  const toggleSpeaker = () => {
      console.log("Toggling speaker...");
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
    setIsMicOn(true);
    setIsCameraOn(true);
  };

  return {
    callState,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall, // Added missing property
    endCall,
    incomingCallFrom,
    toggleMic,
    toggleCamera,
    switchCamera, // Added missing property
    toggleSpeaker, // Added missing property
    isMicOn,
    isCameraOn
  };
};