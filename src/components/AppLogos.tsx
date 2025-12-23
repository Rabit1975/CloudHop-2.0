import React from 'react';

export interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
  fill?: string;
}

// Simplified CloudHop Logo (Cloud shape with connection dots)
export const LogoMain: React.FC<LogoProps> = ({ className, style }) => (
  <svg viewBox="0 0 512 512" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      fill="#53C8FF" 
      d="M400 224c0-66-54-120-120-120-47 0-88 28-108 68-10 0-20-2-32-2-66 0-120 54-120 120 0 66 54 120 120 120h260c55 0 100-45 100-100 0-48-34-88-80-96z"
    />
    <circle cx="160" cy="280" r="20" fill="white" />
    <circle cx="280" cy="200" r="20" fill="white" />
    <circle cx="380" cy="280" r="20" fill="white" />
  </svg>
);

export const Logo3D: React.FC<LogoProps> = (props) => <LogoMain {...props} />;
export const LogoGlow: React.FC<LogoProps> = (props) => <LogoMain {...props} />;
export const LogoQ1: React.FC<LogoProps> = (props) => <LogoMain {...props} />;
export const LogoQ2: React.FC<LogoProps> = (props) => <LogoMain {...props} />;
export const LogoQ3: React.FC<LogoProps> = (props) => <LogoMain {...props} />;
export const LogoQ4: React.FC<LogoProps> = (props) => <LogoMain {...props} />;
