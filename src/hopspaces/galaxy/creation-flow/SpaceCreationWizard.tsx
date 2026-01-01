import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HopSpaceMood, HopSpaceType } from '../../utils/types';

interface SpaceCreationWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: { name: string; type: HopSpaceType; mood: HopSpaceMood }) => void;
}

const LeonardoAvatar = ({ state }: { state: 'idle' | 'listening' | 'thinking' | 'generating' }) => {
    return (
        <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Core */}
            <motion.div 
                className="w-12 h-12 bg-white rounded-full blur-sm"
                animate={{
                    scale: state === 'thinking' ? [1, 1.2, 1] : 1,
                    opacity: state === 'listening' ? [0.8, 1, 0.8] : 1
                }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Rings */}
            <motion.div 
                className="absolute w-full h-full border-2 border-[#53C8FF]/50 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
                className="absolute w-[80%] h-[80%] border-2 border-[#A3E7FF]/30 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
            {/* Particles */}
            {state === 'generating' && (
                <motion.div 
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {[...Array(5)].map((_, i) => (
                        <motion.div 
                            key={i}
                            className="absolute w-2 h-2 bg-[#53C8FF] rounded-full"
                            style={{ left: '50%', top: '50%' }}
                            animate={{
                                x: Math.cos(i * 72) * 60,
                                y: Math.sin(i * 72) * 60,
                                opacity: [1, 0]
                            }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                    ))}
                </motion.div>
            )}
        </div>
    );
};

const SpaceCreationWizard: React.FC<SpaceCreationWizardProps> = ({ isOpen, onClose, onCreate }) => {
    const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
    const [name, setName] = useState('');
    const [selectedType, setSelectedType] = useState<HopSpaceType | null>(null);
    const [selectedMood, setSelectedMood] = useState<HopSpaceMood | null>(null);
    const [leonardoState, setLeonardoState] = useState<'idle' | 'listening' | 'thinking' | 'generating'>('idle');

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setName('');
            setSelectedType(null);
            setSelectedMood(null);
            setLeonardoState('idle');
        }
    }, [isOpen]);

    const handleNameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            setStep(2);
            setLeonardoState('thinking');
        }
    };

    const handleTypeSelect = (type: HopSpaceType) => {
        setSelectedType(type);
        setStep(3);
    };

    const handleMoodSelect = (mood: HopSpaceMood) => {
        setSelectedMood(mood);
        setStep(4);
        setLeonardoState('generating');
        
        // Simulate generation
        setTimeout(() => {
            setStep(5);
            setLeonardoState('idle');
        }, 3000);
    };

    const handleFinalize = () => {
        if (name && selectedType && selectedMood) {
            onCreate({ name, type: selectedType, mood: selectedMood });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl">
            <div className="relative w-full max-w-4xl p-8 flex flex-col items-center text-center space-y-12">
                
                {/* Leonardo Presence */}
                <div className="flex flex-col items-center gap-4">
                    <LeonardoAvatar state={leonardoState} />
                    <motion.p 
                        key={step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xl font-medium text-[#53C8FF] italic font-serif"
                    >
                        {step === 1 && "A new world is forming... What shall we call it?"}
                        {step === 2 && "Every Space has a nature. Choose the one that feels right."}
                        {step === 3 && "What energy should this world carry?"}
                        {step === 4 && "Leonardo is shaping your world..."}
                        {step === 5 && "Your Space is ready. Shall we enter?"}
                    </motion.p>
                </div>

                {/* Steps Content */}
                <div className="w-full">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.form 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onSubmit={handleNameSubmit}
                                className="w-full max-w-md mx-auto"
                            >
                                <input 
                                    autoFocus
                                    type="text" 
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setLeonardoState('listening');
                                    }}
                                    onBlur={() => setLeonardoState('idle')}
                                    placeholder="Name your Space"
                                    className="w-full bg-transparent border-b-2 border-white/20 py-4 text-4xl text-center font-black text-white focus:border-[#53C8FF] outline-none placeholder:text-white/20 transition-all"
                                />
                                <p className="mt-4 text-sm text-white/40">Leonardo listens as you type.</p>
                            </motion.form>
                        )}

                        {step === 2 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex flex-wrap justify-center gap-8"
                            >
                                {(['music', 'fluid_art', 'ideas', 'world', 'anima'] as HopSpaceType[]).map((type) => (
                                    <button 
                                        key={type}
                                        onClick={() => handleTypeSelect(type)}
                                        className="group flex flex-col items-center gap-4 p-6 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#53C8FF] transition-all w-40"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-[#0E1430] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-lg shadow-[#53C8FF]/10 group-hover:shadow-[#53C8FF]/30">
                                            {type === 'music' && '🎧'}
                                            {type === 'fluid_art' && '🌊'}
                                            {type === 'ideas' && '🧠'}
                                            {type === 'world' && '🪐'}
                                            {type === 'anima' && '🤖'}
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest text-white/60 group-hover:text-white">{type.replace('_', ' ')}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex justify-center gap-4"
                            >
                                {(['calm', 'dreamy', 'intense', 'chaotic', 'ethereal'] as HopSpaceMood[]).map((mood) => (
                                    <button 
                                        key={mood}
                                        onClick={() => handleMoodSelect(mood)}
                                        className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white transition-all"
                                    >
                                        <div className={`w-full h-2 rounded-full mb-2 bg-gradient-to-r ${
                                            mood === 'calm' ? 'from-blue-500 to-slate-500' :
                                            mood === 'dreamy' ? 'from-purple-500 to-pink-500' :
                                            mood === 'intense' ? 'from-red-500 to-orange-500' :
                                            mood === 'chaotic' ? 'from-green-500 to-blue-500' :
                                            'from-teal-200 to-white'
                                        }`} />
                                        <span className="text-sm font-bold uppercase tracking-widest">{mood}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div 
                                className="flex flex-col items-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="w-64 h-64 rounded-full bg-black relative overflow-hidden border border-white/20">
                                    <div className={`absolute inset-0 opacity-50 bg-gradient-to-br ${
                                        selectedMood === 'calm' ? 'from-blue-900 to-slate-900' :
                                        selectedMood === 'dreamy' ? 'from-purple-900 to-pink-900' :
                                        selectedMood === 'intense' ? 'from-red-900 to-orange-900' :
                                        'from-teal-900 to-slate-900'
                                    }`} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xs font-black uppercase tracking-widest animate-pulse">Generating Assets...</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 5 && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center gap-8"
                            >
                                <div className="relative group cursor-pointer" onClick={handleFinalize}>
                                    <div className="w-64 h-64 rounded-full bg-black relative overflow-hidden border-2 border-[#53C8FF] shadow-[0_0_50px_rgba(83,200,255,0.3)]">
                                        <img 
                                            src={`https://picsum.photos/seed/${name}/500/500`} 
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-4xl font-black uppercase tracking-tighter drop-shadow-lg">{name}</span>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center w-full">
                                        <p className="text-[#53C8FF] text-xs font-black uppercase tracking-[0.3em]">Click to Enter</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SpaceCreationWizard;
