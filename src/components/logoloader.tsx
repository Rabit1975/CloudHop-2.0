
import React from 'react';

const LogoLoader: React.FC<{ size?: number }> = ({ size = 120 }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative group" style={{ width: size, height: size }}>
        <div className="absolute inset-0 bg-[#53C8FF]/20 blur-[30px] rounded-full animate-pulse"></div>
        
        <svg 
          viewBox="0 0 397 351" 
          width={size} 
          height={size} 
          className="relative z-10"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            className="logo-path"
            stroke="#53C8FF" 
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="2000"
            strokeDashoffset="2000"
            d="M398 53c0 4.689 0 9.378-.425 14.534-5.382-.505-10.503-.98-15.263-2.551-9.385-3.098-18.583-6.764-27.821-10.292-1.69-.646-3.332-1.584-4.781-2.673-17.801-13.386-37.116-24.056-58.294-30.901-13.205-4.256-26.759-7.53-40.291-10.668-7.565-1.74-15.523-3.725-23.099-3.104-14.626 1.199-29.585 1.323-43.24 8.468-13.945 7.294-28.366 13.673-42.358 20.882-5.995 3.088-11.28 7.529-17.161 10.874-9.185 5.223-18.652 9.982-26.177 17.626-3.71 3.769-7.533 7.468-10.86 11.56-4.93 6.064-9.049 12.828-14.305 18.57-3.982 4.35-9.564 7.25-13.792 11.421-8.501 8.379-16.237 17.28-26.868 23.566-7.534 4.455-13.16 12.073-19.856 18.035-3.918 3.489-8.265 6.497-12.42 9.721"
          />
        </svg>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#53C8FF] animate-pulse italic">Initializing Cloud Core</span>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .logo-path {
          animation: draw-logo 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes draw-logo {
          0% { stroke-dashoffset: 2000; opacity: 0; }
          20% { opacity: 1; }
          80% { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: -2000; opacity: 0; }
        }
      `}} />
    </div>
  );
};

export default LogoLoader;
