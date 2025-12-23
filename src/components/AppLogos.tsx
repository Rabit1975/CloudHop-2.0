import React from 'react';

// Import Assets from src/assets
// Using the file paths relative to this component
import MainLogo from '../assets/highresolutionmasterlogo1.svg';
import ThreeDLogo from '../assets/3dsplashlogo.svg';
import GlowLogo from '../assets/hopglow.svg';
import Q1Logo from '../assets/cloudhopq1.svg';
import Q2Logo from '../assets/cloudhopq2.svg';
import Q3Logo from '../assets/cloudhopq3.svg';
import Q4Logo from '../assets/cloudhopq4.svg';

export interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
  fill?: string;
}

const ImageLogo = ({ src, className, style }: { src: string } & LogoProps) => (
  <img 
    src={src} 
    className={className} 
    style={{ ...style, objectFit: 'contain' }} 
    alt="CloudHop Logo" 
  />
);

export const LogoMain: React.FC<LogoProps> = (props) => <ImageLogo src={MainLogo} {...props} />;
export const Logo3D: React.FC<LogoProps> = (props) => <ImageLogo src={ThreeDLogo} {...props} />;
export const LogoGlow: React.FC<LogoProps> = (props) => <ImageLogo src={GlowLogo} {...props} />;
export const LogoQ1: React.FC<LogoProps> = (props) => <ImageLogo src={Q1Logo} {...props} />;
export const LogoQ2: React.FC<LogoProps> = (props) => <ImageLogo src={Q2Logo} {...props} />;
export const LogoQ3: React.FC<LogoProps> = (props) => <ImageLogo src={Q3Logo} {...props} />;
export const LogoQ4: React.FC<LogoProps> = (props) => <ImageLogo src={Q4Logo} {...props} />;
