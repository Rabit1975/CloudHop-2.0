
import React, { useState, useEffect } from "react";

interface XPBarProps {
  xp: number;
  level: number;
  nextLevelXP: number;
  compact?: boolean;
}

const XPBar: React.FC<XPBarProps> = ({ xp, level, nextLevelXP, compact = false }) => {
  const progress = Math.min((xp / nextLevelXP) * 100, 100);

  return (
    <div className={`w-full ${compact ? 'space-y-1' : 'space-y-3'}`}>
      {!compact && (
        <div className="flex justify-between items-end">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#53C8FF]">Level</span>
            <span className="text-3xl font-black italic leading-none">{level}</span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white/30">
            {xp} <span className="text-white/10">/</span> {nextLevelXP} XP
          </div>
        </div>
      )}
      <div className={`w-full ${compact ? 'h-1' : 'h-2'} bg-white/5 rounded-full overflow-hidden border border-white/5`}>
        <div 
          className="h-full bg-gradient-to-r from-[#00ff99] to-[#53C8FF] transition-all duration-700 ease-out relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-white/40 blur-md animate-pulse"></div>
        </div>
      </div>
      {compact && (
        <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-white/20">
          <span>Lvl {level}</span>
          <span>{xp} XP</span>
        </div>
      )}
    </div>
  );
};

export default XPBar;
