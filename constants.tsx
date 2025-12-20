
import React from 'react';

export const DOMAIN = "cloudhop.app";

export const BrandingEngine = {
  themes: {
    neon: {
      primary: '#00D1FF', // Vibrant Cyan/Blue from bunny logo
      secondary: '#0070FF', // Deeper blue for gradients
      accent: '#FFFFFF', // High-energy white for eyes/highlights
      bg: '#050819',
      glow: 'rgba(0, 209, 255, 0.7)',
    },
    light: {
      primary: '#0A0F1F',
      secondary: '#E0E7FF',
      bg: '#FFFFFF',
    },
    'high-contrast': {
      primary: '#00D1FF',
      secondary: '#000000',
      bg: '#000000',
    }
  }
};

export const COLORS = {
  PRIMARY: '#00D1FF',
  ACCENT: '#FFFFFF',
  DARK_BG: '#050819',
  SIDEBAR_BG: '#080C22',
  CARD_DARK: '#0E1430',
  SUCCESS: '#3DD68C',
  ERROR: '#FF4D4D',
};

/**
 * CLOUDHOP LOGO COMPONENT
 * Recreated based on the "Neon Bunny in Cloud" brand image.
 */
export const CloudHopLogo: React.FC<{ 
  size?: number; 
  className?: string; 
  variant?: 'neon' | 'light' | 'dark' | 'high-contrast' 
}> = ({ size = 32, className = "", variant = 'neon' }) => {
  
  const themeKey = variant === 'dark' ? 'neon' : variant;
  const t = BrandingEngine.themes[themeKey as keyof typeof BrandingEngine.themes] || BrandingEngine.themes.neon;
  const filterId = `glow-${variant}`;
  const cloudId = `mist-${variant}`;

  return (
    <div className={`relative flex items-center justify-center ${className} gpu-accelerated`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <filter id={cloudId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
          </filter>

          <linearGradient id="bunny-grad" x1="50" y1="20" x2="50" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={t.primary} />
            <stop offset="100%" stopColor="#0070FF" />
          </linearGradient>

          <radialGradient id="mist-grad" cx="30%" cy="70%" r="50%">
            <stop offset="0%" stopColor={t.primary} stopOpacity="0.4" />
            <stop offset="100%" stopColor={t.primary} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* The Misty Cloud Background */}
        <circle cx="35" cy="65" r="25" fill="url(#mist-grad)" filter={`url(#${cloudId})`} opacity="0.6" />
        <circle cx="50" cy="75" r="20" fill="url(#mist-grad)" filter={`url(#${cloudId})`} opacity="0.4" />

        {/* The Neon Bunny Silhouette */}
        <g filter={variant === 'neon' ? `url(#${filterId})` : 'none'}>
          <path 
            d="M45 25 
               C 42 22, 43 18, 50 15 
               C 60 12, 65 22, 65 30 
               C 65 33, 62 35, 60 38 
               L 68 35 
               C 72 35, 75 40, 80 45 
               C 85 50, 82 58, 78 60 
               C 75 62, 70 58, 68 55 
               L 68 75 
               C 68 78, 65 80, 60 80 
               L 40 80 
               C 40 60, 45 50, 45 25 Z" 
            stroke={t.primary} 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          
          {/* Bunny Ears Detail */}
          <path 
            d="M48 24 C 45 20, 55 18, 62 28" 
            stroke={t.primary} 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            opacity="0.8"
          />

          {/* Glowing Eye */}
          <circle cx="72" cy="48" r="1.5" fill="white" className="animate-pulse" />
        </g>
      </svg>
    </div>
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
  CaretUp: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ),
};
