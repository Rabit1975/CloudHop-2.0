import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import GalaxyBackground from '../components/GalaxyBackground';
import SpaceCreationWizard from './creation-flow/SpaceCreationWizard';
import { HopSpace, HopSpaceMood, HopSpaceType } from '../utils/types';

interface GalaxyHomeScreenProps {
    spaces: HopSpace[];
    onCreateSpace: (data: { name: string; type: HopSpaceType; mood: HopSpaceMood }) => void;
    onEnterSpace: (space: HopSpace) => void;
    galaxyMood?: HopSpaceMood;
}

const GalaxyHomeScreen: React.FC<GalaxyHomeScreenProps> = ({ 
    spaces, 
    onCreateSpace, 
    onEnterSpace,
    galaxyMood = 'calm' 
}) => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative w-full h-full overflow-hidden text-white font-sans" ref={containerRef}>
        
        <GalaxyBackground mood={galaxyMood} className="absolute inset-0">
            
            {/* Interactive Layer */}
            <div className="absolute inset-0 overflow-hidden cursor-move" 
                 onWheel={(e) => setScale(s => Math.min(3, Math.max(0.5, s - e.deltaY * 0.001)))}
            >
                <motion.div 
                    className="w-full h-full relative"
                    style={{ scale }}
                    drag
                    dragConstraints={containerRef}
                >
                    {/* Orbit Lines (SVG) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                        {spaces.map((s, i) => (
                            i > 0 && (
                                <line 
                                    key={`line-${i}`}
                                    x1={`${spaces[i-1].galaxy_position.x}%`} y1={`${spaces[i-1].galaxy_position.y}%`}
                                    x2={`${s.galaxy_position.x}%`} y2={`${s.galaxy_position.y}%`}
                                    stroke="white"
                                    strokeWidth="1"
                                />
                            )
                        ))}
                    </svg>

                    {/* Planets */}
                    {spaces.map((space) => (
                        <motion.div
                            key={space.id}
                            className="absolute flex flex-col items-center justify-center group cursor-pointer"
                            style={{ 
                                left: `${space.galaxy_position.x}%`, 
                                top: `${space.galaxy_position.y}%`,
                                width: `${space.glow_intensity * 60}px`,
                                height: `${space.glow_intensity * 60}px`,
                                x: '-50%',
                                y: '-50%'
                            }}
                            whileHover={{ scale: 1.2, zIndex: 50 }}
                            onClick={() => onEnterSpace(space)}
                        >
                            {/* Planet Visual */}
                            <div className={`relative w-full h-full rounded-full overflow-hidden border-2 border-white/10 group-hover:border-[#53C8FF] shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500 ${
                                space.mood === 'intense' ? 'shadow-red-500/20' : 
                                space.mood === 'dreamy' ? 'shadow-purple-500/20' : 
                                'shadow-blue-500/20'
                            }`}>
                                <img src={space.cover_image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent" />
                                
                                {/* Status Ring */}
                                <div className="absolute inset-0 rounded-full border border-white/20 animate-spin-slow opacity-50" />
                            </div>

                            {/* Label */}
                            <motion.div 
                                className="absolute top-full mt-4 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity"
                                initial={{ y: -10 }}
                                whileHover={{ y: 0 }}
                            >
                                <span className="text-sm font-black uppercase tracking-widest whitespace-nowrap bg-black/50 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">{space.name}</span>
                                <span className="text-[9px] text-[#53C8FF] font-bold uppercase tracking-wider mt-1">{space.type}</span>
                            </motion.div>
                        </motion.div>
                    ))}

                </motion.div>
            </div>

            {/* UI Overlay */}
            <div className="absolute top-8 left-8 z-50 pointer-events-none">
                <div className="pointer-events-auto">
                    <h1 className="text-6xl font-black uppercase tracking-tighter italic leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        Hop<span className="text-[#53C8FF]">Spaces</span>
                    </h1>
                    <p className="text-white/40 text-xs font-black uppercase tracking-[0.4em] ml-1 mt-2">Galaxy View • {galaxyMood} Sector</p>
                </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-8 right-8 z-50 flex gap-4 pointer-events-none">
                <button 
                    onClick={() => setIsWizardOpen(true)}
                    className="pointer-events-auto flex items-center gap-3 px-8 py-4 bg-[#53C8FF] text-[#0A0F1F] rounded-full font-black uppercase tracking-widest shadow-[0_0_40px_rgba(83,200,255,0.3)] hover:scale-105 hover:shadow-[0_0_60px_rgba(83,200,255,0.5)] transition-all"
                >
                    <span className="text-xl">+</span>
                    Create Space
                </button>
            </div>

            {/* Leonardo Helper */}
            <div className="absolute bottom-8 left-8 z-50 pointer-events-none">
                <div className="pointer-events-auto bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl max-w-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 bg-[#53C8FF] rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#53C8FF]">Leonardo • Galactic Architect</span>
                    </div>
                    <p className="text-xs text-white/80 italic leading-relaxed">
                        "The galaxy is calm today. Your creative flow suggests we should build a new <strong>Music Space</strong>. Shall we?"
                    </p>
                </div>
            </div>

        </GalaxyBackground>

        {/* Wizard Modal */}
        <SpaceCreationWizard 
            isOpen={isWizardOpen} 
            onClose={() => setIsWizardOpen(false)}
            onCreate={onCreateSpace}
        />
    </div>
  );
};

export default GalaxyHomeScreen;
