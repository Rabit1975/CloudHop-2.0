
import React from 'react';
import { LogoMain, Logo3D, LogoGlow, LogoQ1, LogoQ2, LogoQ3, LogoQ4 } from './Logos';

const CloudHopLogo: React.FC<{ size?: number; variant?: 'main' | '3d' | 'glow' | 'neon' | 'q1' | 'q2' | 'q3' | 'q4'; className?: string }> = ({ size = 48, variant = 'main', className }) => {
  const style = { width: size, height: size };
  
  switch (variant) {
    case '3d': return <Logo3D className={className} style={style} />;
    case 'glow': return <LogoGlow className={className} style={style} />;
    case 'neon': return <LogoGlow className={`text-[#53C8FF] drop-shadow-[0_0_10px_rgba(83,200,255,0.8)] ${className}`} style={style} />;
    case 'q1': return <LogoQ1 className={className} style={style} />;
    case 'q2': return <LogoQ2 className={className} style={style} />;
    case 'q3': return <LogoQ3 className={className} style={style} />;
    case 'q4': return <LogoQ4 className={className} style={style} />;
    default: return <LogoMain className={className} style={style} />;
  }
};

export default CloudHopLogo;
