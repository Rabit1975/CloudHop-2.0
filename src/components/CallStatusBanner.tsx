"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface CallStatusBannerProps {
  status: 'idle' | 'calling' | 'incoming' | 'connected' | 'ended';
  duration?: number; // in seconds
}

const CallStatusBanner: React.FC<CallStatusBannerProps> = ({ status, duration }) => {
  const getStatusText = () => {
    switch (status) {
      case 'calling': return 'Calling...';
      case 'incoming': return 'Incoming Call...';
      case 'connected': return formatTime(duration || 0);
      case 'ended': return 'Call Ended';
      case 'idle': return 'Ready';
      default: return 'Connecting...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'calling': return 'bg-yellow-500';
      case 'incoming': return 'bg-blue-500';
      case 'connected': return 'bg-green-500';
      case 'ended': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === 'idle') return null;

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      className="absolute top-8 left-0 right-0 flex justify-center z-20 pointer-events-none"
    >
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-full flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${status === 'calling' || status === 'incoming' ? 'animate-pulse' : ''}`} />
        <span className="text-xs font-black text-white uppercase tracking-widest">
          {getStatusText()}
        </span>
      </div>
    </motion.div>
  );
};

export default CallStatusBanner;