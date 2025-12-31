import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../constants';

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
  callerAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=unknown'
}) => {
  const [duration, setDuration] = useState(0);
  const [isPiP, setIsPip] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (callState === 'connected') {
      setDuration(0);
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
        setIsPip(false);
      } else if (remoteVideoRef.current) {
        await remoteVideoRef.current.requestPictureInPicture();
        setIsPip(true);
      }
    } catch (err) {
      console.error("PiP failed:", err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (callState === 'idle') return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 bg-[#0E1430] flex flex-col overflow-hidden"
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
             <div className="absolute top-8 left-0 right-0 flex justify-center z-20 pointer-events-none">
                 <motion.div 
                   initial={{ y: -50, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   className="bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-full flex items-center gap-3"
                 >
                     <div className={`w-2 h-2 rounded-full ${callState === 'connected' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                     <span className="text-xs font-black text-white uppercase tracking-widest">
                         {callState === 'calling' ? 'Calling...' : formatTime(duration)}
                     </span>
                 </motion.div>
             </div>

             {/* Video Grid */}
             <div className="w-full h-full p-4 flex items-center justify-center">
                 {/* Remote Video (Main) */}
                 <div className="relative w-full h-full max-w-5xl aspect-video bg-black/50 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                     {remoteStream ? (
                         <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                     ) : (
                         <div className="flex items-center justify-center h-full flex-col">
                             <img src={callerAvatar} className="w-32 h-32 rounded-full opacity-50 mb-4" />
                             <p className="text-white/20 font-bold uppercase tracking-widest">Waiting for video...</p>
                         </div>
                     )}
                     
                     {/* Local Video (PiP Style) */}
                     {localStream && (
                         <motion.div 
                           drag
                           dragConstraints={{ left: 0, right: 300, top: 0, bottom: 200 }}
                           className="absolute bottom-6 right-6 w-48 aspect-video bg-black rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl cursor-grab active:cursor-grabbing"
                         >
                             <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                         </motion.div>
                     )}
                 </div>
             </div>

             {/* Floating Control Bar */}
             <div className="absolute bottom-10 left-0 right-0 flex justify-center z-30">
                 <motion.div 
                   initial={{ y: 100, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   className="bg-[#050819]/80 backdrop-blur-2xl border border-white/10 px-8 py-4 rounded-3xl flex items-center gap-6 shadow-2xl"
                 >
                     <ControlButton 
                       icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>}
                       active={isMicOn}
                       onClick={toggleMic}
                       color="white"
                     />
                     <ControlButton 
                       icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>}
                       active={isCameraOn}
                       onClick={toggleCamera}
                       color="white"
                     />
                     <ControlButton 
                       icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>}
                       active={true}
                       onClick={switchCamera}
                       color="blue"
                       label="Flip"
                     />
                     <ControlButton 
                       icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>}
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
                         <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/></svg>
                     </button>
                 </motion.div>
             </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

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
