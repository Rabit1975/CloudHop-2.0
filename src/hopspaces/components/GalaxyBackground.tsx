import React from 'react';
import { motion } from 'framer-motion';
import { HopSpaceMood } from '../../utils/types';

interface GalaxyBackgroundProps {
    mood: HopSpaceMood;
    className?: string;
    children?: React.ReactNode;
}

const moodGradients: Record<HopSpaceMood, string[]> = {
    'calm': ['#0F172A', '#1E3A8A', '#0F172A'], // Blue/Slate
    'dreamy': ['#2E1065', '#7C3AED', '#4C1D95'], // Purple/Violet
    'intense': ['#450A0A', '#991B1B', '#7F1D1D'], // Red/Maroon
    'chaotic': ['#0F172A', '#BE123C', '#1D4ED8', '#047857'], // Multicolor
    'ethereal': ['#0F172A', '#0D9488', '#3B82F6'], // Teal/Cyan/Blue
};

const GalaxyBackground: React.FC<GalaxyBackgroundProps> = ({ mood, className = "", children }) => {
    const colors = moodGradients[mood] || moodGradients['calm'];

    return (
        <div className={`relative w-full h-full overflow-hidden bg-[#050819] ${className}`}>
            {/* Base Layer */}
            <motion.div 
                className="absolute inset-0 z-0"
                animate={{
                    background: `linear-gradient(to bottom right, ${colors[0]}, ${colors[1]}, ${colors[2] || colors[0]})`
                }}
                transition={{ duration: 2, ease: "easeInOut" }}
            />

            {/* Nebula Fog Layer 1 */}
            <motion.div 
                className="absolute inset-0 z-0 opacity-30 mix-blend-screen"
                style={{
                    background: `radial-gradient(circle at 50% 50%, ${colors[1]} 0%, transparent 60%)`,
                    filter: 'blur(60px)',
                }}
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 20, -20, 0],
                    y: [0, -20, 20, 0],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Nebula Fog Layer 2 */}
            <motion.div 
                className="absolute inset-0 z-0 opacity-20 mix-blend-overlay"
                style={{
                    background: `radial-gradient(circle at 80% 20%, ${colors[2] || colors[0]} 0%, transparent 50%)`,
                    filter: 'blur(80px)',
                }}
                animate={{
                    scale: [1.2, 1, 1.2],
                    x: [0, -30, 30, 0],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Stars */}
            <div className="absolute inset-0 z-0 opacity-50">
                <div className="stars-small"></div>
                <div className="stars-medium"></div>
            </div>

            {/* Content Layer */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>

            {/* CSS for simple stars */}
            <style>{`
                .stars-small {
                    width: 1px;
                    height: 1px;
                    background: transparent;
                    box-shadow: ${generateStars(100)};
                    animation: animStar 50s linear infinite;
                }
                .stars-medium {
                    width: 2px;
                    height: 2px;
                    background: transparent;
                    box-shadow: ${generateStars(50)};
                    animation: animStar 100s linear infinite;
                }
                @keyframes animStar {
                    from { transform: translateY(0px); }
                    to { transform: translateY(-2000px); }
                }
            `}</style>
        </div>
    );
};

function generateStars(n: number) {
    let value = `${Math.random() * 2000}px ${Math.random() * 2000}px #FFF`;
    for (let i = 2; i <= n; i++) {
        value += `, ${Math.random() * 2000}px ${Math.random() * 2000}px #FFF`;
    }
    return value;
}

export default GalaxyBackground;
