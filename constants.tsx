
import React from 'react';

export const DOMAIN = "cloudhop.app";

export const COLORS = {
  PRIMARY: '#53C8FF',
  ACCENT: '#A3E7FF',
  DARK_GRADIENT_START: '#0A0F1F',
  DARK_GRADIENT_END: '#1B2350',
  LIGHT_BG: '#F7F9FE',
  DARK_BG: '#050819',
  SIDEBAR_BG: '#080C22',
  CARD_DARK: '#0E1430',
  DEEP_TEXT: '#111322',
  LIGHT_TEXT: '#DDE3FF',
  SUCCESS: '#3DD68C',
  WARNING: '#FFB020',
  ERROR: '#FF4D4D',
  XP_BAR: 'linear-gradient(90deg, #00ff99, #00ccff)',
  GLOW: 'rgba(83, 200, 255, 0.7)',
};

// Image asset references based on provided visuals
export const ASSETS = {
  LOGO_MAIN: 'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=1000&auto=format&fit=crop', // Placeholder for High Contrast Logo
  LOGO_TRANSPARENT: 'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=1000&auto=format&fit=crop', // Placeholder
  HERO_BUNNY: 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?q=80&w=1000&auto=format&fit=crop', // 3D Render Placeholder
  LOGO_NEON_OUTLINE: 'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=1000&auto=format&fit=crop', // Outline Placeholder
};

export const CloudHopLogo: React.FC<{ 
  size?: number; 
  className?: string; 
  variant?: 'color' | 'white' | 'monochrome' | 'neon' | 'high-contrast' 
}> = ({ size = 32, className = "", variant = 'high-contrast' }) => {
  
  // High Contrast Logo (Image 8) - Main branding
  if (variant === 'high-contrast' || variant === 'neon') {
    return (
      <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_8px_rgba(83,200,255,0.8)]">
           <circle cx="50" cy="50" r="45" stroke="#53C8FF" strokeWidth="1" strokeDasharray="4 4" className="opacity-20" />
           <path d="M30 65C30 52 42 48 50 52C50 38 65 38 72 48C80 48 85 55 82 68C82 75 75 80 65 80H40C32 80 30 72 30 65Z" fill="#53C8FF" fillOpacity="0.15" />
           <path d="M50 50C50 50 48 35 55 35C60 35 60 45 60 45" stroke="#53C8FF" strokeWidth="3" strokeLinecap="round" />
           <path d="M45 52C45 52 38 38 45 38C50 38 52 50 52 50" stroke="#53C8FF" strokeWidth="3" strokeLinecap="round" />
           <path d="M35 68C35 58 45 55 52 58C52 48 68 48 75 58C82 58 85 65 82 75C82 82 75 85 65 85H45C38 85 35 78 35 68Z" stroke="#53C8FF" strokeWidth="2.5" className="animate-pulse" />
        </svg>
      </div>
    );
  }

  const getFill = () => {
    if (variant === 'white') return '#FFFFFF';
    if (variant === 'monochrome') return 'currentColor';
    return "url(#cloudGradient)";
  };

  const getStroke = () => {
    if (variant === 'white') return '#FFFFFF';
    if (variant === 'monochrome') return 'currentColor';
    return "#53C8FF";
  };

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M20 60C20 45 35 40 45 45C45 30 65 30 75 40C85 40 90 50 85 65C85 75 75 80 65 80H35C25 80 20 70 20 60Z" 
        fill={getFill()}
      />
      <path 
        d="M45 42C45 42 42 20 52 20C58 20 58 35 58 35" 
        stroke={getStroke()}
        strokeWidth="4" 
        strokeLinecap="round"
      />
      <path 
        d="M38 45C38 45 30 25 40 25C46 25 48 40 48 40" 
        stroke={getStroke()}
        strokeWidth="4" 
        strokeLinecap="round"
      />
      {variant === 'color' && (
        <defs>
          <linearGradient id="cloudGradient" x1="20" y1="30" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#53C8FF" />
            <stop offset="1" stopColor="#1B2350" />
          </linearGradient>
        </defs>
      )}
    </svg>
  );
};

export const Icons = {
  Home: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Chat: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  Spaces: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  ),
  Meetings: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Communities: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  AI: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Profile: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Settings: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Billing: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
};
