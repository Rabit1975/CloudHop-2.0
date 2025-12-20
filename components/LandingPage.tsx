import React from 'react';
import { CloudHopLogo, Icons, ASSETS } from '../constants';

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
            <CloudHopLogo size={32} />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#53C8FF] to-[#8B5CF6] bg-clip-text text-transparent">
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
          className="px-8 py-3 bg-gradient-to-r from-[#53C8FF] to-[#8B5CF6] text-white font-black text-sm rounded-full hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] transition-all hover:scale-105 active:scale-95"
        >
          Get Started
        </button>
      </nav>

      {/* 2. Hero Section */}
      <section className="pt-40 lg:pt-52 pb-24 px-8 lg:px-24 flex flex-col items-center text-center">
        {/* Deep Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#8B5CF6]/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#53C8FF]/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        
        {/* Hero Visual Block */}
        <div className="relative mb-16 animate-fade-in group">
           <div className="absolute inset-0 bg-gradient-to-t from-[#8B5CF6]/40 to-transparent blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
           <div className="w-[300px] h-[300px] lg:w-[420px] lg:h-[420px] bg-[#0E1430] rounded-[64px] border border-white/10 shadow-[0_60px_120px_rgba(0,0,0,0.9)] overflow-hidden relative flex items-center justify-center p-8 transition-transform duration-700 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#050819] via-transparent to-[#8B5CF6]/10"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(83,200,255,0.08)_0%,_transparent_70%)]"></div>
              
              <div className="relative z-10 w-full h-full flex items-center justify-center animate-pulse-slow">
                 <img 
                   src={ASSETS.rabbitMascot} 
                   alt="Hop" 
                   className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(83,200,255,0.3)]"
                 />
              </div>
              <div className="absolute bottom-[-10%] w-[120%] h-40 bg-gradient-to-t from-[#050819] via-[#050819]/40 to-transparent blur-2xl"></div>
           </div>
        </div>

        <div className="max-w-4xl space-y-10 animate-fade-in delay-200">
          <h1 className="text-6xl md:text-8xl lg:text-[110px] font-black tracking-tight leading-[1] text-white">
            Hop in. <span className="bg-gradient-to-r from-[#53C8FF] to-[#8B5CF6] bg-clip-text text-transparent">Cloud on.</span>
          </h1>
          <h2 className="text-xl md:text-2xl lg:text-3xl text-white/80 font-semibold max-w-2xl mx-auto leading-relaxed">
            Chat, meet, play — all in one cloud-powered platform.
          </h2>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
             <button 
               onClick={onStart}
               className="w-full sm:w-auto px-14 py-5 bg-gradient-to-r from-[#53C8FF] to-[#8B5CF6] text-white font-black text-lg rounded-full shadow-[0_25px_80px_rgba(139,92,246,0.4)] hover:scale-105 active:scale-95 transition-all"
             >
               Launch CloudHop Web
             </button>
          </div>
        </div>
      </section>

      {/* 3. AI Features Section */}
      <section id="features" className="py-24 px-8 lg:px-24 bg-[#050819] relative scroll-mt-24">
         <div className="text-center mb-16 space-y-4">
             <div className="inline-block px-4 py-1.5 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#8B5CF6] text-xs font-bold uppercase tracking-widest">✨ Smart AI Tools</div>
             <h2 className="text-4xl lg:text-5xl font-black">AI-Powered Features</h2>
             <p className="text-white/40 max-w-2xl mx-auto">Supercharge your productivity with our suite of AI tools for meetings, chat, and workflows.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Meeting AI Card */}
            <div className="bg-[#0E1430] border border-white/5 rounded-[32px] p-8 hover:border-[#53C8FF]/20 transition-all group">
               <div className="w-12 h-12 bg-[#53C8FF]/10 rounded-xl flex items-center justify-center text-[#53C8FF] mb-6 group-hover:scale-110 transition-transform">
                  <Icons.Meetings className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-bold mb-6">Meeting AI</h3>
               <ul className="space-y-4">
                  {[
                    { title: 'Summaries', desc: 'Auto-generated meeting summaries' },
                    { title: 'Action items', desc: 'Extract tasks automatically' },
                    { title: 'Translation', desc: 'Real-time meeting translation' },
                    { title: 'Captions', desc: 'Live closed captions' },
                    { title: 'Recording organization', desc: 'Smart recording tags' },
                    { title: 'Key moment highlights', desc: 'AI-detected highlights' }
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4 items-start">
                       <div className="mt-1 w-4 h-4 rounded bg-[#53C8FF]/20 flex items-center justify-center text-[#53C8FF] text-[8px] font-black">✨</div>
                       <div>
                          <div className="text-sm font-bold text-white">{item.title}</div>
                          <div className="text-xs text-white/40">{item.desc}</div>
                       </div>
                    </li>
                  ))}
               </ul>
            </div>

            {/* Chat AI Card */}
            <div className="bg-[#0E1430] border border-white/5 rounded-[32px] p-8 hover:border-[#53C8FF]/20 transition-all group">
               <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  <Icons.Chat className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-bold mb-6">Chat AI</h3>
               <ul className="space-y-4">
                  {[
                    { title: 'Rewrite', desc: 'Tone and style adjustments' },
                    { title: 'Translate', desc: 'Instant message translation' },
                    { title: 'Summarize', desc: 'Condense long conversations' },
                    { title: 'Smart search', desc: 'AI-powered search' },
                    { title: 'Auto polls', desc: 'Generate polls from discussion' },
                    { title: 'Moderation', desc: 'Content safety filters' }
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4 items-start">
                       <div className="mt-1 w-4 h-4 rounded bg-white/10 flex items-center justify-center text-white/60 text-[8px] font-black">✨</div>
                       <div>
                          <div className="text-sm font-bold text-white">{item.title}</div>
                          <div className="text-xs text-white/40">{item.desc}</div>
                       </div>
                    </li>
                  ))}
               </ul>
            </div>

            {/* Productivity AI Card */}
            <div className="bg-[#0E1430] border border-white/5 rounded-[32px] p-8 hover:border-[#8B5CF6]/20 transition-all group">
               <div className="w-12 h-12 bg-[#8B5CF6]/10 rounded-xl flex items-center justify-center text-[#8B5CF6] mb-6 group-hover:scale-110 transition-transform">
                  <Icons.AI className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-bold mb-6">Productivity AI</h3>
               <ul className="space-y-4">
                  {[
                    { title: 'Scheduling assistant', desc: 'Find optimal meeting times' },
                    { title: 'Smart reminders', desc: 'Context-aware notifications' },
                    { title: 'Rule generator', desc: 'Auto-create community rules' },
                    { title: 'AI onboarding', desc: 'Guided user onboarding' }
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4 items-start">
                       <div className="mt-1 w-4 h-4 rounded bg-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] text-[8px] font-black">✨</div>
                       <div>
                          <div className="text-sm font-bold text-white">{item.title}</div>
                          <div className="text-xs text-white/40">{item.desc}</div>
                       </div>
                    </li>
                  ))}
               </ul>
            </div>
         </div>
      </section>

      {/* 4. Pricing */}
      <section id="pricing" className="py-24 px-8 lg:px-24 bg-[#080C22] border-t border-white/5 scroll-mt-24">
         <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Available Plans</h2>
            <p className="text-white/40">Choose the perfect plan for your squad or organization.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Free Plan */}
            <div className="bg-[#0E1430] border border-white/5 rounded-[24px] p-8 flex flex-col">
               <h3 className="text-lg font-bold mb-1">Free</h3>
               <div className="text-3xl font-black mb-4">$0<span className="text-sm text-white/40 font-medium">/month</span></div>
               <p className="text-xs text-white/40 mb-6 min-h-[40px]">For individuals, friends, and casual users</p>
               <ul className="space-y-3 mb-8 flex-1">
                  <li className="text-xs flex gap-2"><span className="text-white/40">✓</span> Unlimited messaging</li>
                  <li className="text-xs flex gap-2"><span className="text-white/40">✓</span> Unlimited 1:1 chats</li>
                  <li className="text-xs flex gap-2"><span className="text-white/40">✓</span> Up to 45-minute meetings</li>
                  <li className="text-xs flex gap-2"><span className="text-white/40">✓</span> 1 Hop Space</li>
                  <li className="text-xs flex gap-2"><span className="text-white/40">✓</span> 720p video</li>
               </ul>
            </div>

            {/* Plus Plan */}
            <div className="bg-[#0E1430] border border-white/5 rounded-[24px] p-8 flex flex-col relative overflow-hidden">
               <h3 className="text-lg font-bold mb-1">Plus</h3>
               <div className="text-3xl font-black mb-4">$5.99<span className="text-sm text-white/40 font-medium">/month</span></div>
               <p className="text-xs text-white/40 mb-6 min-h-[40px]">For frequent users who want more freedom</p>
               <ul className="space-y-3 mb-8 flex-1">
                  <li className="text-xs flex gap-2"><span className="text-[#53C8FF]">✓</span> Everything in Free, plus:</li>
                  <li className="text-xs flex gap-2"><span className="text-white/40">✓</span> Unlimited meeting length</li>
                  <li className="text-xs flex gap-2"><span className="text-white/40">✓</span> Up to 1080p HD video</li>
                  <li className="text-xs flex gap-2"><span className="text-white/40">✓</span> 5 Hop Spaces</li>
               </ul>
            </div>

            {/* Pro Plan */}
            <div className="bg-[#0E1430] border border-[#53C8FF] rounded-[24px] p-8 flex flex-col relative shadow-[0_0_30px_rgba(83,200,255,0.1)] transform md:-translate-y-4">
               <div className="absolute top-0 left-0 right-0 bg-[#53C8FF] text-[#0A0F1F] text-[9px] font-black uppercase text-center py-1">Most Popular</div>
               <h3 className="text-lg font-bold mb-1 mt-4">Pro</h3>
               <div className="text-3xl font-black mb-4">$14.99<span className="text-sm text-white/40 font-medium">/month</span></div>
               <p className="text-xs text-white/40 mb-6 min-h-[40px]">For professionals, streamers, and community owners</p>
               <ul className="space-y-3 mb-8 flex-1">
                  <li className="text-xs flex gap-2"><span className="text-[#53C8FF]">✓</span> Everything in Plus, plus:</li>
                  <li className="text-xs flex gap-2"><span className="text-white/40">✓</span> Unlimited Hop Spaces</li>
                  <li className="text-xs flex gap-2"><span className="text-white/40">✓</span> Full AI assistant suite</li>
                  <li className="text-xs flex gap-2"><span className="text-white/40">✓</span> 4K video support</li>
               </ul>
               <button onClick={onStart} className="w-full py-3 bg-[#53C8FF] text-[#0A0F1F] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white transition-all">Get Pro</button>
            </div>

            {/* Teams Plan */}
            <div className="bg-[#0E1430] border border-white/5 rounded-[24px] p-8 flex flex-col">
               <h3 className="text-lg font-bold mb-1">Teams</h3>
               <div className="text-3xl font-black mb-4">$8.99<span className="text-sm text-white/40 font-medium">/user/month</span></div>
               <p className="text-xs text-white/40 mb-6 min-h-[40px]">For small-medium businesses (min 3 users)</p>
               <ul className="space-y-3 mb-8 flex-1">
                  <li className="text-xs flex gap-2"><span className="text-[#53C8FF]">✓</span> Everything in Pro, plus:</li>
                  <li className="text-xs flex gap-2"><span className="text-white/40">✓</span> Admin dashboard</li>
                  <li className="text-xs flex gap-2"><span className="text-white/40">✓</span> Team spaces (shared)</li>
                  <li className="text-xs flex gap-2"><span className="text-white/40">✓</span> Meeting recording transcripts</li>
               </ul>
            </div>
         </div>
      </section>

      {/* 5. Footer */}
      <footer className="py-24 text-center">
        <div className="flex flex-col items-center gap-6 mb-12">
            <CloudHopLogo size={64} variant="neon" />
            <div className="flex items-center gap-4 bg-white/5 px-6 py-2 rounded-full border border-white/5">
               <span className="w-2 h-2 rounded-full bg-[#3DD68C] animate-pulse"></span>
               <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/40">Powered by the CloudCore Engine</p>
            </div>
        </div>
        <p className="text-xs text-white/20">&copy; 2025 CloudHop Platform. Built for the Cloud Generation.</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-slow {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.95; }
          50% { transform: translateY(-20px) scale(1.05); opacity: 1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

const NavLink: React.FC<{ label: string; onClick?: () => void }> = ({ label, onClick }) => (
  <button onClick={onClick} className="text-sm font-bold text-white/40 hover:text-white transition-all tracking-tight">{label}</button>
);

export default LandingPage;