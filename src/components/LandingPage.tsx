import React from 'react';
// Remove non-existent ASSETS export
import { CloudHopLogo, Icons } from '../constants';
import highResLogo from '../assets/highresolutionmasterlogo1.svg';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#050819] h-screen w-full text-white selection:bg-[#53C8FF]/30 font-sans relative overflow-x-hidden overflow-y-auto custom-scrollbar">
      {/* 1. Navigation Bar */}
      <nav className="fixed top-0 w-full h-20 bg-[#050819]/80 backdrop-blur-md border-b border-white/5 z-50 px-8 lg:px-24 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <img src={highResLogo} alt="CloudHop" width="32" height="32" className="w-8 h-8 object-contain" />
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

      <main>
      {/* 2. Hero Section */}
      <section className="pt-40 pb-32 px-6 flex flex-col items-center text-center max-w-5xl mx-auto">
        
        <div className="mb-12 animate-fade-in">
           <div className="w-64 h-64 flex items-center justify-center relative">
              <img src={highResLogo} alt="CloudHop Logo" className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(83,200,255,0.3)]" />
           </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in delay-100">
          Hop in. Cloud on.
        </h1>
        
        <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-10 leading-relaxed animate-fade-in delay-200">
          Chat, meet, play — all in one cloud. It's like Discord, Zoom, and Telegram had a Neon baby!
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
             <p className="text-white/80 max-w-2xl mx-auto">One platform. Infinite connections. Connection made cloud-simple.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <FeatureCard 
              icon={<Icons.Meetings className="w-6 h-6 text-[#53C8FF]" />}
              title="Unified Communication"
              desc="Video Meetings, Messaging & Channels, Social & Gaming Spaces, and Communities - all in one place."
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

      {/* About Section */}
      <section id="about" className="py-24 px-6 bg-[#0E1430] border-t border-white/5">
         <div className="max-w-4xl mx-auto text-center space-y-12">
             <div className="space-y-6">
                 <h2 className="text-3xl md:text-4xl font-bold">Built for connection. Designed for everyone.</h2>
                 <p className="text-white/80 leading-relaxed text-lg">
                    CloudHop was created to bring people together — without the friction, clutter, or limitations of traditional platforms. 
                    Meetings, messaging, AI features, and real-time hangouts belong in one seamless cloud. 
                    Whether you’re joining from home, work, school, or anywhere in between, CloudHop makes connection effortless.
                 </p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                 <div className="bg-[#050819] p-8 rounded-2xl border border-white/5">
                     <h3 className="text-[#53C8FF] font-bold uppercase tracking-widest mb-4">Our Mission</h3>
                     <p className="text-white/70">To create a cloud platform where communication, community, and creativity thrive together.</p>
                 </div>
                 <div className="bg-[#050819] p-8 rounded-2xl border border-white/5">
                     <h3 className="text-[#53C8FF] font-bold uppercase tracking-widest mb-4">Our Vision</h3>
                     <p className="text-white/70">A world where connecting with anyone is instant, simple, and joyful.</p>
                 </div>
             </div>
         </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-[#050819]">
         <div className="text-center mb-16 space-y-4">
             <h2 className="text-3xl md:text-4xl font-bold">Simple, transparent pricing.</h2>
             <p className="text-white/80">CloudHop offers flexible plans for casual users, creators, communities, and companies.</p>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
             {/* Free Plan */}
             <div className="bg-[#0E1430] border border-white/5 rounded-3xl p-8 flex flex-col hover:border-[#53C8FF]/30 transition-all">
                 <h3 className="text-xl font-bold text-[#53C8FF]">Free Plan</h3>
                 <p className="text-sm text-white/50 mt-2 mb-6">For individuals, friends, and casual users</p>
                 <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-white/40 font-normal"> / forever</span></div>
                 <ul className="space-y-3 text-sm text-white/70 flex-1 mb-8">
                     <li className="flex gap-2">✓ Unlimited messaging & 1:1 chats</li>
                     <li className="flex gap-2">✓ Up to 45-minute meetings</li>
                     <li className="flex gap-2">✓ 1 Hop Space</li>
                     <li className="flex gap-2">✓ 720p video & Basic screen share</li>
                     <li className="flex gap-2">✓ 1GB cloud storage</li>
                     <li className="flex gap-2">✓ Limited AI tools (5 actions/day)</li>
                 </ul>
                 <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all">Get Started</button>
             </div>

             {/* Plus Plan */}
             <div className="bg-[#0E1430] border border-white/5 rounded-3xl p-8 flex flex-col hover:border-[#53C8FF]/30 transition-all relative overflow-hidden">
                 <h3 className="text-xl font-bold text-[#53C8FF]">Plus Plan</h3>
                 <p className="text-sm text-white/50 mt-2 mb-6">For frequent users who want more freedom</p>
                 <div className="text-4xl font-bold mb-6">$5.99<span className="text-lg text-white/40 font-normal"> / mo</span></div>
                 <ul className="space-y-3 text-sm text-white/70 flex-1 mb-8">
                     <li className="flex gap-2 text-white">Everything in Free, plus:</li>
                     <li className="flex gap-2">✓ Unlimited meeting length</li>
                     <li className="flex gap-2">✓ 1080p HD video</li>
                     <li className="flex gap-2">✓ 5 Hop Spaces</li>
                     <li className="flex gap-2">✓ 25GB cloud storage</li>
                     <li className="flex gap-2">✓ 300 AI actions/month</li>
                 </ul>
                 <button className="w-full py-3 bg-[#53C8FF] text-[#0A0F1F] hover:bg-[#40b0e0] rounded-xl font-bold transition-all">Upgrade to Plus</button>
             </div>

             {/* Pro Plan */}
             <div className="bg-[#0E1430] border-2 border-[#53C8FF] rounded-3xl p-8 flex flex-col transform scale-105 shadow-2xl shadow-[#53C8FF]/10 z-10 relative">
                 <div className="absolute top-0 right-0 bg-[#53C8FF] text-[#0A0F1F] text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Most Popular</div>
                 <h3 className="text-xl font-bold text-[#53C8FF]">Pro Plan</h3>
                 <p className="text-sm text-white/50 mt-2 mb-6">For professionals & community owners</p>
                 <div className="text-4xl font-bold mb-6">$14.99<span className="text-lg text-white/40 font-normal"> / mo</span></div>
                 <ul className="space-y-3 text-sm text-white/70 flex-1 mb-8">
                     <li className="flex gap-2 text-white">Everything in Plus, plus:</li>
                     <li className="flex gap-2">✓ Unlimited Hop Spaces</li>
                     <li className="flex gap-2">✓ 4K video support</li>
                     <li className="flex gap-2">✓ 100GB cloud storage</li>
                     <li className="flex gap-2">✓ Advanced AI Assistant & Notes</li>
                     <li className="flex gap-2">✓ Real-time translation</li>
                 </ul>
                 <button className="w-full py-3 bg-[#53C8FF] text-[#0A0F1F] hover:bg-[#40b0e0] rounded-xl font-bold transition-all shadow-lg shadow-[#53C8FF]/20">Get Pro</button>
             </div>

             {/* Teams Plan */}
             <div className="bg-[#0E1430] border border-white/5 rounded-3xl p-8 flex flex-col hover:border-[#53C8FF]/30 transition-all">
                 <h3 className="text-xl font-bold text-[#53C8FF]">Teams Plan</h3>
                 <p className="text-sm text-white/50 mt-2 mb-6">For small–medium businesses</p>
                 <div className="text-4xl font-bold mb-6">$8.99<span className="text-lg text-white/40 font-normal"> / user / mo</span></div>
                 <ul className="space-y-3 text-sm text-white/70 flex-1 mb-8">
                     <li className="flex gap-2 text-white">Everything in Pro, plus:</li>
                     <li className="flex gap-2">✓ Admin dashboard</li>
                     <li className="flex gap-2">✓ Team spaces (shared)</li>
                     <li className="flex gap-2">✓ Unlimited storage per team</li>
                     <li className="flex gap-2">✓ Meeting transcripts</li>
                     <li className="flex gap-2">✓ Compliance mode</li>
                 </ul>
                 <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all">Contact Sales</button>
             </div>
         </div>
      </section>

      {/* Support Section */}
      <section id="support" className="py-24 px-6 bg-[#0E1430] border-t border-white/5">
         <div className="max-w-4xl mx-auto space-y-12">
             <div className="text-center space-y-4">
                 <h2 className="text-3xl md:text-4xl font-bold">We’re here to help.</h2>
                 <p className="text-white/60">Frequently asked questions about CloudHop.</p>
             </div>
             
             <div className="grid gap-6">
                 <div className="bg-[#050819] p-6 rounded-2xl border border-white/5">
                     <h3 className="font-bold text-lg mb-2">What is CloudHop?</h3>
                     <p className="text-white/70">CloudHop is a unified communication platform combining messaging, meetings, communities, and AI tools.</p>
                 </div>
                 <div className="bg-[#050819] p-6 rounded-2xl border border-white/5">
                     <h3 className="font-bold text-lg mb-2">Is CloudHop free?</h3>
                     <p className="text-white/70">Yes — CloudHop offers a free plan with optional paid upgrades.</p>
                 </div>
                 <div className="bg-[#050819] p-6 rounded-2xl border border-white/5">
                     <h3 className="font-bold text-lg mb-2">Does CloudHop have AI features?</h3>
                     <p className="text-white/70">Yes — CloudHop includes smart summaries, translation, meeting notes, and more.</p>
                 </div>
                 <div className="bg-[#050819] p-6 rounded-2xl border border-white/5">
                     <h3 className="font-bold text-lg mb-2">Where can I download CloudHop?</h3>
                     <p className="text-white/70">CloudHop is available for Windows, macOS, iOS, Android, and the web.</p>
                 </div>
             </div>
             
             <div className="text-center pt-8">
                 <p className="text-white/60">Need more help? Email us at <a href="mailto:support@cloudhop.com" className="text-[#53C8FF] hover:underline">support@cloudhop.com</a></p>
             </div>
         </div>
      </section>

      {/* 4. Download Section */}
      <section id="download" className="py-24 px-6 bg-[#0E1430] border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center space-y-8">
           <h2 className="text-3xl md:text-4xl font-bold">Download CloudHop</h2>
           <p className="text-white/60 max-w-2xl mx-auto">Get the full experience on your desktop or mobile device.</p>
           
           <div className="flex flex-wrap justify-center gap-6">
              <button className="px-8 py-4 bg-[#1e293b] text-white font-bold rounded-2xl border border-white/10 hover:bg-[#2a3855] hover:scale-105 transition-all flex items-center gap-3">
                 <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3 12l18-12v24z"/></svg>
                 <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider opacity-60">Get it on</div>
                    <div className="text-lg">Google Play</div>
                 </div>
              </button>
              
              <button className="px-8 py-4 bg-[#1e293b] text-white font-bold rounded-2xl border border-white/10 hover:bg-[#2a3855] hover:scale-105 transition-all flex items-center gap-3">
                 <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.21-1.96 1.07-3.11-1.05.05-2.31.74-3.03 1.58-.67.78-1.26 2.05-1.11 3.15 1.17.09 2.35-.79 3.07-1.62z"/></svg>
                 <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider opacity-60">Download on the</div>
                    <div className="text-lg">App Store</div>
                 </div>
              </button>

              <button className="px-8 py-4 bg-[#53C8FF] text-[#0A0F1F] font-bold rounded-2xl hover:bg-[#40b0e0] hover:scale-105 transition-all flex items-center gap-3">
                 <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M0 3.449L9.75 4.92v14.144l-9.75 1.489V3.449zm10.749 1.29l12.496-1.79v18.114l-12.496-1.64V4.739zm12.496 9.47l-12.496 1.55v-7.39l12.496-1.66v7.5z"/></svg>
                 <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider opacity-60">Download for</div>
                    <div className="text-lg">Windows</div>
                 </div>
              </button>
           </div>
        </div>
      </section>

      </main>

      {/* Footer */}
      <footer className="py-12 text-center border-t border-white/5 bg-[#050819] text-sm text-white/60">
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
