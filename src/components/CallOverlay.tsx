"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../constants';
import CallStatusBanner from './CallStatusBanner'; // Import the new banner component

interface CallOverlayProps {
  callState: 'idle' | 'calling' | 'incoming' | 'connected' | 'ended';
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  incomingCallFrom: string | null;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  toggleMic: () => void;
  toggleCamera: () => void;
  switchCamera: () => void;
  toggleSpeaker: () => void;
  isMicOn: boolean;
  isCameraOn: boolean;
  callerName?: string;
  callerAvatar?: string;
  currentUserId?: string; // Added to identify local user for PiP
}

const CallOverlay: React.FC<CallOverlayProps> = ({
  callState,
  localStream,
  remoteStream,
  incomingCallFrom,
  onAccept,
  onReject,
  onEnd,
  toggleMic,
  toggleCamera,
  switchCamera,
  toggleSpeaker,
  isMicOn,
  isCameraOn,
  callerName = 'Unknown Caller',
  callerAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=unknown',
  currentUserId
}) => {
  const [duration, setDuration] = useState(0);
  const [isPiP, setIsPiP] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (callState === 'connected') {
      setDuration(0); // Reset duration on new connection
      interval = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  // Video Refs
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // PiP Handler
  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
      } else if (localVideoRef.current) { // PiP for local stream
        await localVideoRef.current.requestPictureInPicture();
        setIsPiP(true);
      }
    } catch (err) {
      console.error("PiP failed:", err);
    }
  };

  if (callState === 'idle') return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#0E1430] flex flex-col overflow-hidden"
      >
        {/* --- INCOMING CALL --- */}
        {callState === 'incoming' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-12 relative overflow-hidden">
             {/* Background Pulse */}
             <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-96 h-96 bg-[#53C8FF] rounded-full blur-3xl"
                />
             </div>

             <div className="z-10 text-center space-y-6">
                 <motion.div 
                   animate={{ scale: [1, 1.05, 1] }}
                   transition={{ duration: 1.5, repeat: Infinity }}
                   className="relative inline-block"
                 >
                     <img src={callerAvatar} className="w-40 h-40 rounded-full border-4 border-[#53C8FF] shadow-[0_0_50px_rgba(83,200,255,0.5)] object-cover" />
                     <div className="absolute bottom-2 right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-[#0E1430] animate-bounce" />
                 </motion.div>
                 
                 <div>
                     <h2 className="text-3xl font-black text-white tracking-tight">{callerName}</h2>
                     <p className="text-[#53C8FF] text-sm font-bold uppercase tracking-widest mt-2 animate-pulse">Incoming Video Call...</p>
                 </div>
             </div>

             <div className="flex gap-8 z-10">
                 <motion.button 
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   onClick={onReject}
                   className="flex flex-col items-center gap-2 group"
                 >
                     <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center border-2 border-red-500 group-hover:bg-red-500 group-hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                         <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/></svg>
                     </div>
                     <span className="text-xs font-bold text-white/50 group-hover:text-white uppercase tracking-wider">Decline</span>
                 </motion.button>

                 <motion.button 
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   onClick={onAccept}
                   className="flex flex-col items-center gap-2 group"
                 >
                     <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-[#0E1430] shadow-[0_0_30px_rgba(34,197,94,0.6)] group-hover:shadow-[0_0_50px_rgba(34,197,94,0.8)] transition-all">
                         <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                     </div>
                     <span className="text-xs font-bold text-white/50 group-hover:text-white uppercase tracking-wider">Accept</span>
                 </motion.button>
             </div>
          </div>
        )}

        {/* --- ACTIVE CALL / CALLING --- */}
        {(callState === 'connected' || callState === 'calling') && (
          <div className="flex-1 relative">
             {/* Status Banner */}
             <CallStatusBanner status={callState} duration={duration} />

             {/* Video Grid */}
             <div className="w-full h-full p-4 flex items-center justify-center">
                 {/* Responsive Video Layout */}
                 {remoteStream && localStream ? ( // Two users
                     <div className="grid grid-cols-2 gap-4 w-full h-full max-w-7xl">
                         <div className="relative w-full h-full bg-black/50 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                             <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                             <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-sm font-medium">{callerName}</div>
                         </div>
                         <div className="relative w-full h-full bg-black/50 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                             <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                             <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-sm font-medium">You</div>
                         </div>
                     </div>
                 ) : localStream ? ( // Only local user
                     <div className="relative w-full h-full max-w-5xl aspect-video bg-black/50 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                         <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                         <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-sm font-medium">You</div>
                     </div>
                 ) : remoteStream ? ( // Only remote user
                     <div className="relative w-full h-full max-w-5xl aspect-video bg-black/50 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                         <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                         <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-sm font-medium">{callerName}</div>
                     </div>
                 ) : ( // No streams yet or calling
                     <div className="flex items-center justify-center h-full flex-col">
                         <img src={callerAvatar} className="w-32 h-32 rounded-full opacity-50 mb-4" />
                         <p className="text-white/20 font-bold uppercase tracking-widest">
                             {callState === 'calling' ? 'Calling...' : 'Waiting for video...'}
                         </p>
                     </div>
                 )}
             </div>

             {/* Floating Control Bar */}
             <motion.div 
               initial={{ y: 100, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.5 }}
               className="absolute bottom-10 left-0 right-0 flex justify-center z-30"
             >
                 <div className="bg-[#050819]/80 backdrop-blur-2xl border border-white/10 px-8 py-4 rounded-3xl flex items-center gap-6 shadow-2xl">
                     <ControlButton 
                       icon={<Icons.Mic className="w-6 h-6" />}
                       active={isMicOn}
                       onClick={toggleMic}
                       color="white"
                       label={isMicOn ? 'Mute' : 'Unmute'}
                     />
                     <ControlButton 
                       icon={<Icons.Video className="w-6 h-6" />}
                       active={isCameraOn}
                       onClick={toggleCamera}
                       color="white"
                       label={isCameraOn ? 'Stop Video' : 'Start Video'}
                     />
                     <ControlButton 
                       icon={<Icons.FlipCamera className="w-6 h-6" />}
                       active={true} // Always active if multiple cameras exist
                       onClick={switchCamera}
                       color="blue"
                       label="Flip"
                     />
                     <ControlButton 
                       icon={<Icons.PictureInPicture className="w-6 h-6" />}
                       active={isPiP}
                       onClick={togglePiP}
                       color="blue"
                       label="PiP"
                     />
                     <div className="w-px h-10 bg-white/10 mx-2" />
                     <button 
                       onClick={onEnd}
                       className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all hover:scale-110"
                     >
                         <Icons.PhoneOff className="w-6 h-6" />
                     </button>
                 </div>
             </motion.div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// Helper component for control buttons
const ControlButton = ({ icon, active, onClick, color, label }: any) => (
    <div className="flex flex-col items-center gap-1">
        <button 
            onClick={onClick}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                active 
                ? `bg-white/10 text-${color === 'blue' ? '[#53C8FF]' : 'white'} hover:bg-white/20` 
                : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
            }`}
        >
            {icon}
        </button>
        {label && <span className="text-[10px] font-bold text-white/40 uppercase">{label}</span>}
    </div>
);

export default CallOverlay;