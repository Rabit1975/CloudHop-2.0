import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';
import { showError, showSuccess, showLoading, updateToast, dismissToast } from '../utils/toast'; // Import toast utilities

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" }
];

type CallState = 'idle' | 'calling' | 'incoming' | 'connected' | 'ended';

interface WebRTCState {
  callState: CallState;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  startCall: (receiverId: string, chatId?: string) => Promise<void>;
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
  const callStartTimeRef = useRef<number | null>(null); // To track call duration

  const pc = useRef<RTCPeerConnection | null>(null);
  const signalingChannel = useRef<RealtimeChannel | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const callToastId = useRef<string | null>(null);

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
        showLoading(`Incoming call from ${payload.fromUserId}`, { id: 'incoming-call' });
        
        // Store offer to set later
        (window as any).pendingOffer = payload.offer;
      })
      .on('broadcast', { event: 'call-answer' }, async ({ payload }) => {
        console.log('Received call answer');
        if (callToastId.current) {
            updateToast(callToastId.current, 'success', 'Call connected!');
            dismissToast(callToastId.current);
            callToastId.current = null;
        }
        if (pc.current) {
          await pc.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
        }
      })
      .on('broadcast', { event: 'call-rejected' }, () => {
        console.log('Call rejected by remote');
        if (callToastId.current) {
            updateToast(callToastId.current, 'error', 'Call rejected.');
            dismissToast(callToastId.current);
            callToastId.current = null;
        }
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
        showSuccess('Call ended.');
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
            callStartTimeRef.current = Date.now(); // Record start time
        } else if (peer.connectionState === 'disconnected' || peer.connectionState === 'failed') {
            cleanupCall();
        }
    };

    pc.current = peer;
    return peer;
  };

  const startCall = async (receiverId: string, chatId?: string) => {
    if (!userId) {
        showError('User ID not available. Cannot start call.');
        return;
    }
    setRemoteUserId(receiverId);
    setCallState('calling');
    callToastId.current = showLoading(`Calling ${receiverId}...`);
    
    // Create DB entry
    const { data: history, error: dbError } = await supabase.from('call_history').insert({
        caller_id: userId,
        receiver_id: receiverId,
        chat_id: chatId, // Optional, might be null if not in a chat or P2P
        started_at: new Date().toISOString(),
        status: 'active' // Set to active initially, update later
    }).select().single();
    
    if (dbError) {
        showError('Failed to log call history.');
        console.error('Supabase error:', dbError);
        cleanupCall();
        return;
    }
    
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
        
    } catch (e: any) {
        showError(`Failed to get media access: ${e.message}`);
        console.error("Error starting call:", e);
        cleanupCall();
    }
  };

  const acceptCall = async () => {
    if (!remoteUserId || !userId) {
        showError('Cannot accept call: missing user info.');
        return;
    }
    dismissToast('incoming-call'); // Dismiss incoming call toast
    
    // Update DB to 'active'
    if (callId) {
        await supabase.from('call_history').update({ status: 'active' }).eq('id', callId);
    }
    
    const peer = createPeerConnection();
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setLocalStream(stream);
        stream.getTracks().forEach(track => peer.addTrack(track, stream));

        const offer = (window as any).pendingOffer;
        if (!offer) {
            showError("No pending offer found to accept.");
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

    } catch (e: any) {
        showError(`Failed to accept call: ${e.message}`);
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
      dismissToast('incoming-call'); // Dismiss incoming call toast
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
        if (callId && callStartTimeRef.current) {
             const duration = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
             supabase.from('call_history').update({ status: 'ended', ended_at: new Date().toISOString(), duration }).eq('id', callId).then();
        } else if (callId) {
             // If call didn't connect, it might still be 'active' or 'missed'
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

  const switchCamera = async () => {
      if (!localStream) return;

      try {
          const videoTracks = localStream.getVideoTracks();
          if (videoTracks.length === 0) {
              showError('No camera found to switch.');
              return;
          }

          const currentCamera = videoTracks[0];
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(device => device.kind === 'videoinput');

          if (videoDevices.length <= 1) {
              showError('Only one camera available.');
              return;
          }

          const currentDeviceId = currentCamera.getSettings().deviceId;
          const nextDevice = videoDevices.find(device => device.deviceId !== currentDeviceId);

          if (nextDevice) {
              currentCamera.stop(); // Stop current track
              localStream.removeTrack(currentCamera); // Remove from stream

              const newStream = await navigator.mediaDevices.getUserMedia({
                  video: { deviceId: { exact: nextDevice.deviceId } },
                  audio: true // Keep audio enabled
              });

              const newVideoTrack = newStream.getVideoTracks()[0];
              localStream.addTrack(newVideoTrack); // Add new track to existing stream
              setLocalStream(newStream); // Update local stream state
              showSuccess(`Switched to ${nextDevice.label || 'new camera'}`);
          }
      } catch (e: any) {
          showError(`Failed to switch camera: ${e.message}`);
          console.error("Error switching camera:", e);
      }
  };

  const toggleSpeaker = () => {
      // This is typically handled by system volume controls or specific audio output device selection.
      // For a simple toggle, we can't directly control system speakers via WebRTC.
      // A more advanced implementation would involve enumerating audio output devices and setting `sinkId` on video/audio elements.
      showError('Speaker control is usually managed by system settings.');
      console.log("Toggling speaker (mock action)");
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
    setCallId(null);
    callStartTimeRef.current = null;
    dismissToast('incoming-call'); // Ensure incoming call toast is dismissed
    if (callToastId.current) {
        dismissToast(callToastId.current);
        callToastId.current = null;
    }
  };

  return {
    callState,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    incomingCallFrom,
    toggleMic,
    toggleCamera,
    switchCamera,
    toggleSpeaker,
    isMicOn,
    isCameraOn
  };
};