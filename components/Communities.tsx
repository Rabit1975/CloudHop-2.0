
import React, { useState } from 'react';
import XPBar from './XPBar';
// Import Icons from constants to fix the "Cannot find name 'Icons'" error
import { Icons } from '../constants';

const Communities: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'spaces' | 'games' | 'ai'>('feed');
  const [selectedComm, setSelectedComm] = useState(0);

  const communities = [
    { name: 'Founders Circle', icon: '🚀' },
    { name: 'Engineering Group', icon: '💻' },
    { name: 'Creative Alliance', icon: '🎨' },
    { name: 'Cloud Gaming Squad', icon: '🎮' },
  ];

  const spaces = [
    { name: 'Product Brainstorm', category: 'Work', participants: 4, image: 'https://picsum.photos/seed/work/400/225' },
    { name: 'Deep Focus (Lofi)', category: 'Study', participants: 28, image: 'https://picsum.photos/seed/study/400/225' },
    { name: 'Q1 Vision Room', category: 'Strategic', participants: 12, image: 'https://picsum.photos/seed/vision/400/225' },
  ];

  const games = [
    { name: 'Cloudhop 2048', icon: '🔢', url: 'https://play2048.co/' },
    { name: 'Pacman Arena', icon: '🟡', url: 'https://www.google.com/logos/2010/pacman10-i.html' },
    { name: 'Snake Relay', icon: '🐍', url: 'https://www.google.com/logos/2010/pacman10-i.html' }
  ];

  return (
    <div className="h-full flex gap-1 rounded-[24px] overflow-hidden border border-white/5 bg-[#080C22] shadow-2xl animate-fade-in italic">
      <div className="w-20 bg-[#050819] flex flex-col items-center py-6 space-y-5 border-r border-white/5">
        {communities.map((c, i) => (
          <button key={i} onClick={() => setSelectedComm(i)} className={`w-12 h-12 rounded-[16px] flex items-center justify-center text-xl transition-all relative ${selectedComm === i ? 'bg-[#53C8FF] shadow-[0_0_20px_rgba(83,200,255,0.3)]' : 'bg-[#0E1430] text-white/30 hover:text-white'}`}>
            {c.icon}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col bg-[#0A0F1F]/50">
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#080C22]/40 backdrop-blur-md">
          <div className="flex items-center gap-8">
            <h3 className="font-black text-sm uppercase tracking-[0.2em]">{communities[selectedComm].name}</h3>
            <div className="flex gap-1 bg-[#050819] p-1 rounded-xl">
              {(['feed', 'spaces', 'games', 'ai'] as const).map(t => (
                <button key={t} onClick={() => setActiveTab(t)} className={`px-6 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === t ? 'bg-[#1A2348] text-[#53C8FF]' : 'text-white/20 hover:text-white'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          {activeTab === 'feed' && (
             <div className="max-w-3xl mx-auto space-y-6 animate-fade-in italic">
                <div className="p-10 bg-[#0E1430] border border-white/5 rounded-[32px] text-center space-y-4">
                   <div className="w-20 h-20 bg-[#53C8FF]/10 rounded-[24px] flex items-center justify-center text-4xl mx-auto mb-6 border border-[#53C8FF]/20 italic">{communities[selectedComm].icon}</div>
                   <h2 className="text-2xl font-black uppercase tracking-tighter italic">Workspace Intelligence Feed</h2>
                   <p className="text-white/30 text-xs font-medium italic">Latest updates and shared resources for your community group.</p>
                </div>
                <div className="grid gap-4">
                   {[1,2].map(i => (
                      <div key={i} className="bg-[#0E1430]/40 border border-white/5 p-6 rounded-2xl flex gap-6 hover:bg-[#0E1430] transition-all group">
                         <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 shrink-0"></div>
                         <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                               <span className="text-[10px] font-black uppercase tracking-widest text-[#53C8FF]">Project Update</span>
                               <span className="text-[8px] font-black text-white/20 uppercase">2h ago</span>
                            </div>
                            <p className="text-sm font-medium leading-relaxed italic">CloudHop Relay 2.5 architecture has been successfully deployed to the edge clusters.</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {activeTab === 'spaces' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in italic">
              {spaces.map((s, i) => (
                <div key={i} className="group bg-[#0E1430] border border-white/5 rounded-2xl overflow-hidden shadow-xl hover:border-[#53C8FF]/40 transition-all">
                  <div className="relative h-40 overflow-hidden">
                    <img src={s.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E1430] to-transparent opacity-60"></div>
                    <div className="absolute top-3 left-3 flex -space-x-2">
                      {[1,2,3].map(j => (
                        <div key={j} className="w-6 h-6 rounded-full border-2 border-[#0E1430] bg-[#1A2348] text-[8px] flex items-center justify-center font-black">U</div>
                      ))}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-base group-hover:text-[#53C8FF] transition-colors">{s.name}</h4>
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/30">{s.participants} online</span>
                    </div>
                    <p className="text-[10px] text-[#53C8FF] font-bold uppercase tracking-wider mb-4 italic">{s.category}</p>
                    <button className="w-full py-2.5 bg-white/5 hover:bg-[#53C8FF] hover:text-[#0A0F1F] rounded-xl text-xs font-black uppercase tracking-widest transition-all italic">Enter Huddle</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'games' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in italic">
              {games.map((g, i) => (
                <div key={i} className="bg-[#0E1430] border border-white/5 rounded-[40px] p-8 flex flex-col hover:border-[#53C8FF]/40 transition-all shadow-2xl relative group overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#53C8FF]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-16 h-16 bg-[#050819] rounded-[24px] flex items-center justify-center text-4xl mb-6 border border-white/5 shadow-inner transition-transform group-hover:scale-110 duration-500 italic">{g.icon}</div>
                  <h3 className="text-xl font-black uppercase tracking-tighter italic mb-8">{g.name}</h3>
                  <button className="w-full py-4 bg-[#53C8FF] text-[#0A0F1F] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-2xl transition-all italic">Launch</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in italic">
              <div className="p-8 bg-[#1A2348] border border-[#53C8FF]/20 rounded-[32px] shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                   <div className="p-3 bg-[#53C8FF] text-[#0A0F1F] rounded-2xl shadow-lg shadow-[#53C8FF]/20">
                      <Icons.AI className="w-6 h-6" />
                   </div>
                   <h4 className="text-xl font-black uppercase tracking-widest text-[#53C8FF] italic">Moderation Hub</h4>
                </div>
                <div className="space-y-6">
                  <div className="p-5 bg-black/40 border border-white/5 rounded-2xl">
                     <p className="text-xs text-white/60 italic leading-relaxed">"Gemini is observing high engagement in the **Founders Circle** regarding edge deployment. Trending keywords: #Relay, #Latency, #Hops."</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5 italic">Analyze Sentiment</button>
                    <button className="py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5 italic">Forecast Trends</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Communities;
