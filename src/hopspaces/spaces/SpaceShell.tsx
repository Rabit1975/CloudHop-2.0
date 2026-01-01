import React from 'react';
import { HopSpace } from '../utils/types';

export const SpaceShell = ({ space, onBack, children }: { space: HopSpace; onBack: () => void; children: React.ReactNode }) => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#050819]">
      {/* Shared Chrome / Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                ← Galaxy
            </button>
            <h2 className="text-xl font-black uppercase italic text-white">{space.name}</h2>
            <span className="px-2 py-0.5 rounded-full border border-white/20 text-[10px] text-white/60 uppercase tracking-widest">{space.type}</span>
          </div>
      </div>
      
      {/* Background (Optional, if not handled by interior) */}
      <div className="absolute inset-0 z-0">
          <img src={space.background_url || space.cover_image_url} className="w-full h-full object-cover opacity-30 blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full pt-16">
        {children}
      </div>
    </div>
  );
};
