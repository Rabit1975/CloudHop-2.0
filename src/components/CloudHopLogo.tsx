
import React from 'react';
import { CloudHopLogo as BaseLogo } from '../constants';

const CloudHopLogo: React.FC<{ size?: number; variant?: any; className?: string }> = ({ size = 48, variant, className }) => {
  return (
    <BaseLogo size={size} variant={variant} className={className} />
  );
};

export default CloudHopLogo;
