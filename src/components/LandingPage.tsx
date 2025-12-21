import React from 'react';
// Remove non-existent ASSETS export
import { CloudHopLogo, Icons } from '../constants';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#050819] min-h-screen text-white selection:bg-[#8B5CF6]/30 font-sans relative overflow-x-hidden">
      {/* 1. Navigation Bar */}
      <nav className="fixed top-0 w-full h-24 bg-[#050819]/80 backdrop-blur-3xl border-b border-white/5 z-50 px-8 lg:px-24 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <div className="bg-[#1e293b] p-1.5 rounded-lg border border-white/5 shadow-xl transition-all group-hover:border-[#53C8FF]/30">
            <CloudHopLogo size={32} variant="main" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#53C8FF] to-[#8B5CF6] bg-clip-text text-transparent italic uppercase">
            CloudHop
          </span>
        </div>
        
        <div className="hidden lg:flex items-center gap-10">
          <NavLink label="Features" onClick={() => scrollToSection('features')} />
          <NavLink label="Pricing" onClick={() => scrollToSection('pricing')} />
          <NavLink label="Download" />
          <NavLink label="About" />
          <NavLink label="Support" />
        </div>

        <button 
          onClick={onStart}
          className="px-8 py-3 bg-gradient-to-r from-[#53C8FF] to-[#8B5CF6] text-white font-black text-sm rounded-full hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] transition-all hover:scale-105 active:scale-95 italic uppercase tracking-widest"
        >
          Hop In
        </button>
      </nav>

      {/* 2. Hero Section */}
      <section className="pt-40 lg:pt-52 pb-24 px-8 lg:px-24 flex flex-col items-center text-center">
        {/* Deep Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#8B5CF6]/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#53C8FF]/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        
        {/* Hero Visual Block */}
        <div className="relative mb-16 animate-fade-in group">
           <div className="absolute inset-0 bg-gradient-to-t from-[#53C8FF]/20 to-transparent blur-3xl opacity-30 group-hover:opacity-60 transition-opacity"></div>
           <div className="w-[300px] h-[300px] lg:w-[480px] lg:h-[480px] bg-[#0E1430] rounded-[80px] border border-white/10 shadow-[0_60px_120px_rgba(0,0,0,0.9)] overflow-hidden relative flex items-center justify-center p-12 transition-transform duration-700 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#050819] via-transparent to-[#53C8FF]/10"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(83,200,255,0.08)_0%,_transparent_70%)]"></div>
              
              <div className="relative z-10 w-full h-full flex items-center justify-center animate-pulse-slow">
                 {/* Using the glow variant for hero to match the atmospheric style */}
                 <CloudHopLogo size={380} variant="glow" className="drop-shadow-[0_0_80px_rgba(83,200,255,0.5)]" />
              </div>
              <div className="absolute bottom-[-10%] w-[120%] h-40 bg-gradient-to-t from-[#050819] via-[#050819]/40 to-transparent blur-2xl"></div>
           </div>
        </div>

        <div className="max-w-4xl space-y-10 animate-fade-in delay-200">
          <h1 className="text-6xl md:text-8xl lg:text-[110px] font-black tracking-tighter leading-[1] text-white italic uppercase">
            Hop in. <span className="bg-gradient-to-r from-[#53C8FF] to-[#8B5CF6] bg-clip-text text-transparent">Cloud on.</span>
          </h1>
          <h2 className="text-xl md:text-2xl lg:text-3xl text-white/80 font-semibold max-w-2xl mx-auto leading-relaxed italic">
            Unified communication and cloud arcade for the hybrid era.
          </h2>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
             <button 
               onClick={onStart}
               className="w-full sm:w-auto px-14 py-5 bg-[#53C8FF] text-[#0A0F1F] font-black text-lg rounded-full shadow-[0_25px_80px_rgba(83,200,255,0.4)] hover:scale-105 active:scale-95 transition-all italic uppercase tracking-widest"
             >
               Start Your Session
             </button>
          </div>
        </div>
      </section>

      {/* 3. AI Features Section */}
      <section id="features" className="py-24 px-8 lg:px-24 bg-[#050819] relative scroll-mt-24">
         <div className="text-center mb-16 space-y-4">
             <div className="inline-block px-5 py-2 rounded-full bg-[#53C8FF]/10 border border-[#53C8FF]/20 text-[#53C8FF] text-[10px] font-black uppercase tracking-[0.4em] italic">Intelligence Hub</div>
             <h2 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter">Powered by Gemini.</h2>
             <p className="text-white/40 max-w-2xl mx-auto italic font-medium">Deep-context AI integrated into every flow, mesh, and meeting.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto italic">
            {/* Meeting AI Card */}
            <div className="bg-[#0E1430] border border-white/5 rounded-[48px] p-10 hover:border-[#53C8FF]/20 transition-all group shadow-2xl overflow-hidden relative">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Icons.Meetings className="w-40 h-40" /></div>
               <div className="w-14 h-14 bg-[#53C8FF]/10 rounded-2xl flex items-center justify-center text-[#53C8FF] mb-8 group-hover:scale-110 transition-transform border border-[#53C8FF]/20">
                  <Icons.Meetings className="w-7 h-7" />
               </div>
               <h3 className="text-2xl font-black mb-6 uppercase tracking-tighter">Meeting Engine</h3>
               <ul className="space-y-4 relative z-10">
                  {[
                    { title: 'Live Mesh Transcripts', desc: 'Real-time multi-speaker capture' },
                    { title: 'Contextual Action Items', desc: 'Auto-extract tasks from voice' },
                    { title: 'Crystal Clear Audio', desc: 'AI noise suppression core' },
                    { title: 'Infinite Huddle', desc: 'One-click huddle discovery' }
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4 items-start">
                       <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#53C8FF] shadow-[0_0_10px_#53C8FF]"></div>
                       <div>
                          <div className="text-xs font-black text-white uppercase tracking-widest">{item.title}</div>
                          <div className="text-[10px] text-white/30 font-bold">{item.desc}</div>
                       </div>
                    </li>
                  ))}
               </ul>
            </div>

            {/* Chat AI Card */}
            <div className="bg-[#0E1430] border border-white/5 rounded-[48px] p-10 hover:border-[#8B5CF6]/20 transition-all group shadow-2xl overflow-hidden relative">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Icons.Chat className="w-40 h-40" /></div>
               <div className="w-14 h-14 bg-[#8B5CF6]/10 rounded-2xl flex items-center justify-center text-[#8B5CF6] mb-8 group-hover:scale-110 transition-transform border border-[#8B5CF6]/20">
                  <Icons.Chat className="w-7 h-7" />
               </div>
               <h3 className="text-2xl font-black mb-6 uppercase tracking-tighter">Messaging Core</h3>
               <ul className="space-y-4 relative z-10">
                  {[
                    { title: 'Smart Summarize', desc: 'Catch up on hours of chat in seconds' },
                    { title: 'Tone Calibration', desc: 'AI-assisted professional rewrite' },
                    { title: 'Global Mesh', desc: 'Simultaneous translation everywhere' },
                    { title: 'Safe Flow', desc: 'Advanced moderation and safety' }
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4 items-start">
                       <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#8B5CF6] shadow-[0_0_10px_#8B5CF6]"></div>
                       <div>
                          <div className="text-xs font-black text-white uppercase tracking-widest">{item.title}</div>
                          <div className="text-[10px] text-white/30 font-bold">{item.desc}</div>
                       </div>
                    </li>
                  ))}
               </ul>
            </div>

            {/* Arcade AI Card */}
            <div className="bg-[#0E1430] border border-white/5 rounded-[48px] p-10 hover:border-[#3DD68C]/20 transition-all group shadow-2xl overflow-hidden relative">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Icons.Arcade className="w-40 h-40" /></div>
               <div className="w-14 h-14 bg-[#3DD68C]/10 rounded-2xl flex items-center justify-center text-[#3DD68C] mb-8 group-hover:scale-110 transition-transform border border-[#3DD68C]/20">
                  <Icons.Arcade className="w-7 h-7" />
               </div>
               <h3 className="text-2xl font-black mb-6 uppercase tracking-tighter">Cloud Arcade</h3>
               <ul className="space-y-4 relative z-10">
                  {[
                    { title: 'High FPS WebGL', desc: 'Optimized for Chrome desktop' },
                    { title: 'Live XP Rewards', desc: 'Earn levels as you play s-tier games' },
                    { title: 'Shared Lobby', desc: 'Play with your hop space members' },
                    { title: 'Chrome Performance', desc: 'Zero-latency browser engine' }
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4 items-start">
                       <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#3DD68C] shadow-[0_0_10px_#3DD68C]"></div>
                       <div>
                          <div className="text-xs font-black text-white uppercase tracking-widest">{item.title}</div>
                          <div className="text-[10px] text-white/30 font-bold">{item.desc}</div>
                       </div>
                    </li>
                  ))}
               </ul>
            </div>
         </div>
      </section>

      {/* 4. Pricing */}
      <section id="pricing" className="py-24 px-8 lg:px-24 bg-[#080C22] border-t border-white/5 scroll-mt-24 italic">
         <div className="text-center mb-24 space-y-4">
            <h2 className="text-5xl font-black uppercase tracking-tighter">The Infrastructure.</h2>
            <p className="text-white/40 max-w-2xl mx-auto font-medium">Accessible for solo hoppers, robust for global squads.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Free Plan */}
            <div className="bg-[#0E1430] border border-white/5 rounded-[40px] p-10 flex flex-col shadow-xl">
               <h3 className="text-xs font-black text-[#53C8FF] uppercase tracking-[0.3em] mb-2">Ground</h3>
               <div className="text-5xl font-black mb-6 uppercase">$0<span className="text-sm text-white/20 font-bold lowercase">/mo</span></div>
               <p className="text-[10px] text-white/30 mb-10 font-bold leading-relaxed">Essential cloud core for personal hopper sessions.</p>
               <ul className="space-y-4 mb-12 flex-1">
                  <li className="text-[10px] font-black uppercase flex gap-3 text-white/40 items-center"><span className="w-1 h-1 rounded-full bg-white/20"></span> Messaging</li>
                  <li className="text-[10px] font-black uppercase flex gap-3 text-white/40 items-center"><span className="w-1 h-1 rounded-full bg-white/20"></span> 1 Space Hub</li>
                  <li className="text-[10px] font-black uppercase flex gap-3 text-white/40 items-center"><span className="w-1 h-1 rounded-full bg-white/20"></span> 45m Huddle</li>
                  <li className="text-[10px] font-black uppercase flex gap-3 text-white/40 items-center"><span className="w-1 h-1 rounded-full bg-white/20"></span> Standard XP</li>
               </ul>
               <button onClick={onStart} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all border border-white/5">Start Free</button>
            </div>

            {/* Plus Plan */}
            <div className="bg-[#0E1430] border border-white/5 rounded-[40px] p-10 flex flex-col shadow-xl">
               <h3 className="text-xs font-black text-[#8B5CF6] uppercase tracking-[0.3em] mb-2">Plus</h3>
               <div className="text-5xl font-black mb-6 uppercase">$5.99<span className="text-sm text-white/20 font-bold lowercase">/mo</span></div>
               <p className="text-[10px] text-white/30 mb-10 font-bold leading-relaxed">Enhanced bandwidth and community mesh controls.</p>
               <ul className="space-y-4 mb-12 flex-1">
                  <li className="text-[10px] font-black uppercase flex gap-3 text-white/60 items-center"><span className="w-1 h-1 rounded-full bg-[#8B5CF6]"></span> Infinity Huddle</li>
                  <li className="text-[10px] font-black uppercase flex gap-3 text-white/60 items-center"><span className="w-1 h-1 rounded-full bg-[#8B5CF6]"></span> 5 Space Hubs</li>
                  <li className="text-[10px] font-black uppercase flex gap-3 text-white/60 items-center"><span className="w-1 h-1 rounded-full bg-[#8B5CF6]"></span> HD Optics</li>
                  <li className="text-[10px] font-black uppercase flex gap-3 text-white/60 items-center"><span className="w-1 h-1 rounded-full bg-[#8B5CF6]"></span> 1.5x XP Gain</li>
               </ul>
               <button onClick={onStart} className="w-full py-4 bg-[#8B5CF6] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-[#8B5CF6]/20">Go Plus</button>
            </div>

            {/* Pro Plan */}
            <div className="bg-[#1A2348] border-2 border-[#53C8FF] rounded-[48px] p-10 flex flex-col shadow-[0_40px_100px_rgba(83,200,255,0.2)] transform lg:scale-110 relative z-10">
               <div className="absolute top-6 right-10 bg-[#53C8FF] text-[#0A0F1F] text-[7px] font-black uppercase px-3 py-1 rounded-full">Recommended</div>
               <h3 className="text-xs font-black text-[#53C8FF] uppercase tracking-[0.3em] mb-2">Pro</h3>
               <div className="text-5xl font-black mb-6 uppercase">$14.99<span className="text-sm text-white/20 font-bold lowercase">/mo</span></div>
               <p className="text-[10px] text-[#53C8FF]/80 mb-10 font-bold leading-relaxed">Full Intelligence Suite. The ultimate cloud workspace.</p>
               <ul className="space-y-4 mb-12 flex-1">
                  <li className="text-[10px] font-black uppercase flex gap-3 text-white items-center"><span className="w-1.5 h-1.5 rounded-full bg-[#53C8FF]"></span> Gemini 3 Core</li>
                  <li className="text-[10px] font-black uppercase flex gap-3 text-white items-center"><span className="w-1.5 h-1.5 rounded-full bg-[#53C8FF]"></span> Ultra 4K Optics</li>
                  <li className="text-[10px] font-black uppercase flex gap-3 text-white items-center"><span className="w-1.5 h-1.5 rounded-full bg-[#53C8FF]"></span> Unl. Space Hubs</li>
                  <li className="text-[10px] font-black uppercase flex gap-3 text-white items-center"><span className="w-1.5 h-1.5 rounded-full bg-[#53C8FF]"></span> 2x XP + Badges</li>
               </ul>
               <button onClick={onStart} className="w-full py-5 bg-[#53C8FF] text-[#0A0F1F] font-black text-[10px] uppercase tracking-widest rounded-3xl transition-all shadow-xl shadow-[#53C8FF]/30">Launch Pro</button>
            </div>

            {/* Teams Plan */}
            <div className="bg-[#0E1430] border border-white/5 rounded-[40px] p-10 flex flex-col shadow-xl">
               <h3 className="text-xs font-black text-[#3DD68C] uppercase tracking-[0.3em] mb-2">Squad</h3>
               <div className="text-5xl font-black mb-6 uppercase">$8.99<span className="text-sm text-white/20 font-bold lowercase">/ho/mo</span></div>
               <p className="text-[10px] text-white/30 font-bold leading-relaxed">Organization mesh for high-performance squads.</p>
               <ul className="space-y-4 mb-12 flex-1">
                  <li className="text-[10px] font-black uppercase flex gap-3 text-white/60 items-center"><span className="w-1 h-1 rounded-full bg-[#3DD68C]"></span> Team Dashboard</li>
                  <li className="text-[10px] font-black uppercase flex gap-3 text-white/60 items-center"><span className="w-1 h-1 rounded-full bg-[#3DD68C]"></span> Mesh Recording</li>
                  <li className="text-[10px] font-black uppercase flex gap-3 text-white/60 items-center"><span className="w-1 h-1 rounded-full bg-[#3DD68C]"></span> Global ID Auth</li>
                  <li className="text-[10px] font-black uppercase flex gap-3 text-white/60 items-center"><span className="text-3xl">🛡️</span></li>
                  <li className="text-[10px] font-black uppercase flex gap-3 text-white/60 items-center"><span className="w-1 h-1 rounded-full bg-[#3DD68C]"></span> Audit Logs</li>
               </ul>
               <button onClick={onStart} className="w-full py-4 bg-[#3DD68C] text-[#0A0F1F] font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-[#3DD68C]/20">Deploy Squad</button>
            </div>
         </div>
      </section>

      {/* 5. Footer */}
      <footer className="py-24 text-center italic">
        <div className="flex flex-col items-center gap-10 mb-16">
            <div className="flex items-center gap-4">
               <CloudHopLogo size={64} variant="main" />
               <span className="text-4xl font-black uppercase tracking-tighter">CloudHop</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 px-8 py-3 rounded-full border border-white/5">
               <span className="w-2 h-2 rounded-full bg-[#3DD68C] animate-pulse"></span>
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">Node Active — CloudCore OS v2.5</p>
            </div>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/10">&copy; 2025 CloudHop Platform. Built for the Cloud Generation.</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-slow {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.95; }
          50% { transform: translateY(-15px) scale(1.03); opacity: 1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

const NavLink: React.FC<{ label: string; onClick?: () => void }> = ({ label, onClick }) => (
  <button onClick={onClick} className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-[#53C8FF] transition-all italic">{label}</button>
);

export default LandingPage;