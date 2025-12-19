
import React from 'react';
// Added Icons to the import list from constants
import { CloudHopLogo, COLORS, ASSETS, Icons } from '../constants';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="bg-[#050819] text-white overflow-x-hidden selection:bg-[#53C8FF]/30">
      {/* 1. Navigation Bar */}
      <nav className="fixed top-0 w-full h-20 bg-[#050819]/80 backdrop-blur-2xl border-b border-white/5 z-50 px-6 lg:px-20 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <CloudHopLogo size={42} variant="high-contrast" className="group-hover:scale-110 transition-all" />
          <span className="text-2xl font-black tracking-tighter italic">CloudHop</span>
        </div>
        <div className="hidden lg:flex items-center gap-10">
          <NavLink label="Features" />
          <NavLink label="Pricing" />
          <NavLink label="Spaces" />
          <NavLink label="Communities" />
          <NavLink label="Support" />
        </div>
        <div className="flex items-center gap-4">
          <button className="px-6 py-2.5 text-sm font-bold text-white/60 hover:text-white transition-all">Sign In</button>
          <button 
            onClick={onStart}
            className="px-8 py-3 bg-[#53C8FF] text-[#0A0F1F] font-black uppercase tracking-widest text-xs rounded-[10px] hover:shadow-[0_0_20px_rgba(83,200,255,0.4)] transition-all active:scale-95"
          >
            Hop In
          </button>
        </div>
      </nav>

      {/* 2. Hero Section (Updated with Hero Illustration) */}
      <section className="pt-48 pb-32 px-6 lg:px-20 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-16 bg-gradient-to-br from-[#0A0F1F] to-[#1B2350] min-h-[95vh]">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#53C8FF]/5 rounded-full blur-[120px] -z-0"></div>
        
        <div className="relative z-10 max-w-2xl space-y-10 animate-fade-in text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-4">
             <span className="flex h-2 w-2 rounded-full bg-[#3DD68C] animate-pulse"></span>
             <span className="text-[10px] font-black uppercase tracking-widest text-[#53C8FF]">CloudHop v2.5 is now live</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[1] italic">
            Hop In, <br /> <span className="text-[#53C8FF] drop-shadow-[0_0_15px_rgba(83,200,255,0.4)]">Cloud On.</span>
          </h1>
          <p className="text-xl lg:text-2xl text-[#DDE3FF]/60 max-w-xl font-medium leading-relaxed italic">
            Messaging, meetings, and spaces reimagined for the generation that lives in the cloud.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-8 pt-6">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto px-12 py-5 bg-[#53C8FF] text-[#0A0F1F] font-black text-lg uppercase tracking-widest rounded-[12px] hover:shadow-[0_0_30px_rgba(83,200,255,0.5)] transition-all hover:scale-105 active:scale-95"
            >
              Start Hopping
            </button>
            <button className="text-lg font-bold text-white/40 hover:text-white transition-all flex items-center gap-2">
              Learn More <Icons.Chat className="w-5 h-5 rotate-90" />
            </button>
          </div>
        </div>

        {/* Hero Illustration (Image 1 style) */}
        <div className="relative w-full lg:w-[500px] aspect-square animate-float hidden lg:block">
           <div className="absolute inset-0 bg-[#53C8FF]/20 rounded-full blur-[100px] opacity-30"></div>
           {/* We simulate the Image 1 bunny with a high-end SVG/CSS render */}
           <div className="relative z-10 w-full h-full flex items-center justify-center">
              <CloudHopLogo size={320} variant="neon" className="drop-shadow-[0_0_50px_rgba(83,200,255,0.6)]" />
           </div>
        </div>
      </section>

      {/* 3. Feature Grid (Updated with Outline Logos) */}
      <section className="py-32 px-6 lg:px-20 bg-[#F7F9FE] text-[#111322]">
        <div className="max-w-7xl mx-auto space-y-20">
           <div className="text-center space-y-4">
              <h2 className="text-4xl lg:text-7xl font-black tracking-tighter italic">One App. Infinite Cloud.</h2>
              <p className="text-[#111322]/50 text-xl max-w-xl mx-auto font-medium italic">"CloudHop brings the best of communication into one neon-fueled interface."</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              <FeatureCard 
                title="Unified Chat" 
                desc="DMs and Channels with real-time AI summarization and smart thread clustering." 
                icon="💬"
              />
              <FeatureCard 
                title="Neon Spaces" 
                desc="Drop-in audio/video rooms with 3D spatial audio and interactive mini-games." 
                icon="🎧"
              />
              <FeatureCard 
                title="HD Meetings" 
                desc="Crystal clear 4K video calls with end-to-end encryption and live transcripts." 
                icon="🎥"
              />
              <FeatureCard 
                title="Communities" 
                desc="Gamified hubs for squads, developers, and creators to build together." 
                icon="👥"
              />
           </div>
        </div>
      </section>

      {/* 4. Showcase Section */}
      <section className="py-32 px-6 lg:px-20 bg-white text-[#111322] overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
           <div className="bg-[#050819] rounded-[48px] p-12 shadow-2xl relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                 <CloudHopLogo size={60} variant="neon" />
              </div>
              <div className="space-y-12 py-12">
                 <div className="space-y-4">
                    <h3 className="text-white text-3xl font-black italic tracking-tighter">THE CLOUD HUB</h3>
                    <div className="w-16 h-1.5 bg-[#53C8FF] rounded-full"></div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    {[1,2,3,4].map(i => (
                       <div key={i} className="aspect-square bg-white/5 rounded-3xl border border-white/10 hover:border-[#53C8FF]/40 transition-all flex items-center justify-center">
                          <CloudHopLogo size={40} variant="white" className="opacity-10 group-hover:opacity-100 transition-opacity" />
                       </div>
                    ))}
                 </div>
              </div>
           </div>
           <div className="space-y-10">
              <h2 className="text-5xl lg:text-6xl font-black leading-tight italic tracking-tighter">Built for the <br /> <span className="text-[#53C8FF]">Cloud Generation.</span></h2>
              <p className="text-xl text-[#111322]/40 leading-relaxed font-medium">CloudHop isn't just a tool; it's an ecosystem designed for high-performance teams and tight-knit communities.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <h4 className="text-[#53C8FF] font-black uppercase text-xs tracking-widest">Performance</h4>
                    <p className="text-sm font-bold opacity-60">Ultra-low latency globally distributed cloud architecture.</p>
                 </div>
                 <div className="space-y-3">
                    <h4 className="text-[#53C8FF] font-black uppercase text-xs tracking-widest">Experience</h4>
                    <p className="text-sm font-bold opacity-60">Gesture-driven UI with a signature neon aesthetic.</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 5. Footer (Updated with Main Logo) */}
      <footer className="py-24 px-6 lg:px-20 bg-gradient-to-b from-[#0A0F1F] to-[#050819] border-t border-white/5">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-20">
            <div className="space-y-8">
               <div className="flex items-center gap-4">
                 <CloudHopLogo size={48} variant="high-contrast" />
                 <span className="text-3xl font-black tracking-tighter italic">CloudHop</span>
               </div>
               <p className="text-lg text-white/30 max-w-sm font-medium italic leading-relaxed">Connecting the world, one hop at a time. The ultimate cloud destination for creators.</p>
               <div className="flex gap-4">
                  <SocialIcon icon="X" />
                  <SocialIcon icon="IG" />
                  <SocialIcon icon="DS" />
               </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
               <FooterColumn title="Product" links={['Features', 'Hop Spaces', 'Meetings', 'AI Tools', 'Roadmap']} />
               <FooterColumn title="Cloud" links={['Communities', 'Server Hosting', 'Security', 'Global Network']} />
               <FooterColumn title="Company" links={['About', 'Careers', 'Brand Kit', 'Contact']} />
            </div>
         </div>
         <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between gap-6 text-[10px] font-black uppercase tracking-widest text-white/20">
            <div>© 2025 CloudHop. Developed for the cloud.</div>
            <div className="flex gap-8">
               <button className="hover:text-white transition-colors">Privacy Policy</button>
               <button className="hover:text-white transition-colors">Terms of Service</button>
               <button className="hover:text-white transition-colors">Cookies</button>
            </div>
         </div>
      </footer>
    </div>
  );
};

const NavLink: React.FC<{ label: string }> = ({ label }) => (
  <button className="text-[10px] font-black text-white/40 hover:text-[#53C8FF] transition-all uppercase tracking-[0.3em] italic">{label}</button>
);

const FeatureCard: React.FC<{ title: string; desc: string; icon: string }> = ({ title, desc, icon }) => (
  <div className="bg-white border border-[#111322]/5 p-10 rounded-[32px] shadow-sm hover:border-[#53C8FF]/40 hover:shadow-2xl hover:shadow-[#53C8FF]/10 transition-all duration-500 group cursor-default relative overflow-hidden">
    <div className="absolute -top-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
       <CloudHopLogo size={100} variant="monochrome" />
    </div>
    <div className="text-5xl mb-8 transform group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="text-2xl font-black mb-4 italic tracking-tighter uppercase">{title}</h3>
    <p className="text-[#111322]/50 text-sm font-medium leading-relaxed italic">{desc}</p>
  </div>
);

const SocialIcon: React.FC<{ icon: string }> = ({ icon }) => (
  <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-xs text-white/40 hover:bg-[#53C8FF] hover:text-[#0A0F1F] transition-all">
    {icon}
  </button>
);

const FooterColumn: React.FC<{ title: string; links: string[] }> = ({ title, links }) => (
  <div className="space-y-6">
     <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#53C8FF]">{title}</h4>
     <div className="flex flex-col gap-4">
        {links.map(link => (
          <button key={link} className="text-sm font-bold text-white/40 hover:text-white transition-all text-left italic">{link}</button>
        ))}
     </div>
  </div>
);

export default LandingPage;
