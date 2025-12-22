import React from 'react';
// Remove non-existent ASSETS export
import { CloudHopLogo, Icons } from '../constants';
import highResLogo from '../src/assets/highresolutionmasterlogo1.svg';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#050819] min-h-screen text-white selection:bg-[#53C8FF]/30 font-sans relative overflow-x-hidden">
      {/* 1. Navigation Bar */}
      <nav className="fixed top-0 w-full h-20 bg-[#050819]/80 backdrop-blur-md border-b border-white/5 z-50 px-8 lg:px-24 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <div className="bg-[#1e293b] p-1.5 rounded-lg">
            <CloudHopLogo size={24} variant="main" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            CloudHop
          </span>
        </div>
        
        <div className="hidden lg:flex items-center gap-8">
          <NavLink label="Features" onClick={() => scrollToSection('features')} />
          <NavLink label="Pricing" onClick={() => scrollToSection('pricing')} />
          <NavLink label="Download" />
        </div>

        <button 
          onClick={onStart}
          className="px-6 py-2 bg-[#53C8FF] text-[#0A0F1F] font-bold text-xs rounded-full hover:bg-[#40b0e0] transition-all"
        >
          Get Started Free
        </button>
      </nav>

      {/* 2. Hero Section */}
      <section className="pt-40 pb-32 px-6 flex flex-col items-center text-center max-w-5xl mx-auto">
        
        <div className="mb-12 animate-fade-in">
           <div className="w-64 h-64 flex items-center justify-center relative">
              <img src={highResLogo} alt="CloudHop Logo" className="w-full h-full object-contain" />
           </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in delay-100">
          Hop in. Cloud on.
        </h1>
        
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mb-10 leading-relaxed animate-fade-in delay-200">
          CloudHop is the next-generation platform that brings meetings, messaging, AI tools, and shared spaces together — all in one beautifully simple cloud.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in delay-300">
           <button 
             onClick={onStart}
             className="px-8 py-3 bg-[#53C8FF] text-[#0A0F1F] font-bold rounded-full hover:bg-[#40b0e0] transition-all flex items-center gap-2"
           >
             Get Started Free <span className="text-lg">→</span>
           </button>
           <button 
             className="px-8 py-3 bg-[#1e293b] text-white font-bold rounded-full border border-white/10 hover:bg-[#2a3855] transition-all"
           >
             Download App
           </button>
        </div>
      </section>

      {/* 3. Features Grid */}
      <section id="features" className="py-24 px-6 bg-[#050819]">
         <div className="text-center mb-16 space-y-4">
             <h2 className="text-3xl md:text-4xl font-bold">The cloud where everyone belongs.</h2>
             <p className="text-white/60 max-w-2xl mx-auto">Whether you're hosting a meeting, playing games with friends, joining a study group, or hanging out in a community — CloudHop keeps you connected effortlessly.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <FeatureCard 
              icon={<Icons.Meetings className="w-6 h-6 text-[#53C8FF]" />}
              title="Unified Communication"
              desc="Messaging, voice, video, file sharing — all in one place."
            />
            <FeatureCard 
              icon={<Icons.AI className="w-6 h-6 text-[#53C8FF]" />}
              title="AI-Powered Productivity"
              desc="Smart summaries, translations, meeting notes, and message rewriting."
            />
            <FeatureCard 
              icon={<Icons.Spaces className="w-6 h-6 text-[#53C8FF]" />}
              title="Built for Work and Play"
              desc="Hop Spaces, group calls, watch-together rooms, and community hubs."
            />
            <FeatureCard 
              icon={<Icons.Profile className="w-6 h-6 text-[#53C8FF]" />}
              title="Beautiful. Simple. Yours."
              desc="A cloud experience that feels modern, friendly, and personal."
            />
         </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center border-t border-white/5 bg-[#050819] text-sm text-white/40">
        <p>&copy; 2025 CloudHop Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

const NavLink: React.FC<{ label: string; onClick?: () => void }> = ({ label, onClick }) => (
  <button onClick={onClick} className="text-sm font-medium text-white/70 hover:text-white transition-all">{label}</button>
);

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="bg-[#0E1430] border border-white/5 rounded-2xl p-8 flex flex-col items-center text-center hover:border-[#53C8FF]/30 transition-all group">
     <div className="w-12 h-12 bg-[#53C8FF]/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
       {icon}
     </div>
     <h3 className="text-lg font-bold mb-3">{title}</h3>
     <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;