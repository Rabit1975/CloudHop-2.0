import React, { useState, useEffect } from 'react';
import { Icons, CloudHopLogo } from '../constants';
import { useSpace } from '../src/contexts/SpaceContext';

const Communities: React.FC = () => {
  const { setCurrentSpace } = useSpace();
  const [activeTab, setActiveTab] = useState<'Flow' | 'Mesh' | 'Beam' | 'Pulse'>('Flow');
  const [selectedComm, setSelectedComm] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const communities = [
    { id: 'founders-circle', name: 'Founders Circle', icon: '🚀', sub: 'Broadcast Only (Beam)', role: 'Admin' },
    { id: 'engineering-group', name: 'Engineering Group', icon: '💻', sub: 'Standard Hybrid (Flow+Mesh)', role: 'Member' },
    { id: 'creative-alliance', name: 'Creative Alliance', icon: '🎨', sub: 'Strategy Hub (Mesh)', role: 'Member' },
    { id: 'global-space', name: 'Global Squad', icon: '🌍', sub: 'Social (Flow)', role: 'Guest' },
  ];

  useEffect(() => {
    // Update global space context when selected community changes
    const comm = communities[selectedComm];
    setCurrentSpace({
      id: comm.id,
      name: comm.name,
      role: comm.role as any
    });
  }, [selectedComm, setCurrentSpace]);

  const channels = [
    { name: 'general-chat', type: 'Flow' },
    { name: 'hq-announcements', type: 'Beam' },
    { name: 'git-mesh-sync', type: 'Mesh' },
    { name: 'strategy-notes', type: 'Mesh' },
    { name: 'one-way-wire', type: 'Beam' }
  ];

  const handleSync = () => {
    setIsSyncing(true);
    setSyncProgress(0);
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsSyncing(false), 500);
          return 100;
        }
        return prev + 5;
      });
    }, 50);
  };

  return (
    <div className="h-full flex gap-1 rounded-[48px] overflow-hidden border border-white/5 bg-[#080C22] shadow-[0_50px_120px_rgba(0,0,0,0.9)] animate-fade-in italic">
      {/* 1. Hop Spaces Navigator */}
      <div className="w-24 bg-[#050819] flex flex-col items-center py-12 space-y-10 border-r border-white/5">
        <div className="mb-4 flex items-center justify-center p-2 bg-[#0E1430] border-2 border-[#53C8FF] rounded-2xl shadow-xl">
           <CloudHopLogo size={32} variant="main" />
        </div>
        {communities.map((c, i) => (
          <div key={i} className="relative group">
            <button 
              onClick={() => setSelectedComm(i)}
              className={`w-14 h-14 rounded-3xl flex items-center justify-center text-2xl transition-all relative ${selectedComm === i ? 'bg-[#53C8FF] shadow-[0_0_40px_rgba(83,200,255,0.4)] scale-110' : 'bg-[#0E1430] text-white/20 hover:text-white hover:scale-110'}`}
            >
              {c.icon}
            </button>
          </div>
        ))}
        <button className="w-14 h-14 rounded-3xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-white/20 hover:bg-white/10 transition-all">+</button>
      </div>

      {/* 2. Channel Tree */}
      <div className="w-72 bg-[#080C22] flex flex-col border-r border-white/5">
        <div className="p-8 border-b border-white/5">
           <div className="text-[9px] font-black uppercase tracking-[0.4em] text-[#53C8FF] mb-2 italic">Hop Spaces Hub</div>
           <h3 className="font-black text-lg uppercase tracking-tighter text-white italic">{communities[selectedComm].name}</h3>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
           {channels.map((chan, i) => (
             <button key={i} className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all group ${i === 2 ? 'bg-[#53C8FF]/10 text-[#53C8FF]' : 'text-white/30 hover:bg-white/5'}`}>
                <div className="flex items-center gap-4">
                   <span className="text-white/10 font-black text-sm">#</span>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">{chan.name}</span>
                </div>
                <div className={`w-1 h-1 rounded-full ${chan.type === 'Beam' ? 'bg-[#FF4D4D]' : chan.type === 'Mesh' ? 'bg-[#3DD68C]' : 'bg-[#53C8FF]'} opacity-0 group-hover:opacity-100`}></div>
             </button>
           ))}
        </nav>
      </div>

      {/* 3. The Hybrid Workspace */}
      <div className="flex-1 flex flex-col bg-[#0A0F1F]/40 overflow-hidden">
        <div className="h-24 shrink-0 border-b border-white/5 flex items-center justify-between px-10 bg-[#080C22]/60 backdrop-blur-3xl">
           <div className="flex flex-col gap-2">
              <div className="flex gap-2 bg-[#050819] p-1.5 rounded-2xl shadow-inner overflow-x-auto custom-scrollbar">
                 {(['Flow', 'Mesh', 'Beam', 'Pulse'] as const).map(t => (
                   <button key={t} onClick={() => setActiveTab(t)} className={`px-8 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all italic whitespace-nowrap ${activeTab === t ? 'bg-[#1A2348] text-[#53C8FF] ring-1 ring-[#53C8FF]/20' : 'text-white/20 hover:text-white'}`}>
                     {t}
                   </button>
                 ))}
              </div>
           </div>
        </div>

        <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
           {activeTab === 'Mesh' && (
             <div className="animate-fade-in space-y-10 italic">
                {/* GitHub Integration Card */}
                <div className="bg-[#0E1430] border border-[#53C8FF]/20 p-10 rounded-[48px] shadow-3xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><span className="text-8xl">🐙</span></div>
                   <div className="flex items-center justify-between mb-8">
                      <div>
                         <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#53C8FF] mb-2">GitHub Mesh Node</h4>
                         <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">cloudhop / core-engine</h2>
                      </div>
                      <div className="flex gap-4">
                         <button 
                           onClick={handleSync}
                           className="px-8 py-3.5 bg-white/5 border border-white/10 hover:border-[#53C8FF]/40 rounded-2xl text-[10px] font-black uppercase tracking-widest italic transition-all"
                         >
                            Pull
                         </button>
                         <button 
                           onClick={handleSync}
                           className="px-8 py-3.5 bg-[#53C8FF] text-[#0A0F1F] rounded-2xl text-[10px] font-black uppercase tracking-widest italic shadow-xl shadow-[#53C8FF]/20"
                         >
                            Push Changes
                         </button>
                      </div>
                   </div>

                   {isSyncing ? (
                      <div className="space-y-4 animate-pulse">
                         <div className="flex justify-between text-[9px] font-black uppercase text-[#53C8FF] tracking-widest">
                            <span>Pushing local mesh to GitHub...</span>
                            <span>{syncProgress}%</span>
                         </div>
                         <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[#53C8FF] transition-all duration-300" style={{ width: `${syncProgress}%` }}></div>
                         </div>
                      </div>
                   ) : (
                      <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/5">
                         <div className="space-y-3">
                            <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Recent Commits</div>
                            {[
                              { msg: 'feat: neon filter fix', time: '12m ago' },
                              { msg: 'refactor: hop-mesh core', time: '1h ago' }
                            ].map((c, i) => (
                               <div key={i} className="flex justify-between items-center text-[10px] font-bold text-white/40 italic">
                                  <span>{c.msg}</span>
                                  <span className="text-[8px] opacity-40">{c.time}</span>
                               </div>
                            ))}
                         </div>
                         <div className="flex flex-col justify-center items-end">
                            <div className="text-[8px] font-black text-[#3DD68C] uppercase tracking-[0.4em] mb-1">Status: Synced</div>
                            <div className="text-[10px] text-white/10 uppercase tracking-widest">Last Mesh Pulse: 2m ago</div>
                         </div>
                      </div>
                   )}
                </div>

                {/* File Mesh Dropzone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-[#0E1430] border-2 border-dashed border-white/5 p-12 rounded-[48px] text-center flex flex-col items-center justify-center hover:border-[#53C8FF]/20 transition-all group cursor-pointer">
                      <div className="text-4xl mb-6 group-hover:scale-125 transition-transform">☁️</div>
                      <h4 className="text-xl font-black uppercase tracking-tighter mb-2 italic">Drop Files to Mesh</h4>
                      <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Simultaneous Sync to All Hubs</p>
                   </div>
                   <div className="bg-[#0E1430] border border-white/5 p-12 rounded-[48px] shadow-xl space-y-6">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">Mesh Assets</h4>
                      <div className="space-y-4">
                         {[
                           { name: 'logo_mesh_v2.svg', size: '2.4mb', type: 'vector' },
                           { name: 'sprint_q1_notes.md', size: '12kb', type: 'doc' }
                         ].map((f, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-[#53C8FF]/20 transition-all">
                               <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 rounded-lg bg-[#53C8FF]/10 flex items-center justify-center text-[10px] font-black text-[#53C8FF]">#</div>
                                  <div className="text-xs font-bold">{f.name}</div>
                               </div>
                               <span className="text-[9px] font-black text-white/20">{f.size}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'Flow' && (
             <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-fade-in italic">
                <div className="text-[140px] opacity-20 select-none">{communities[selectedComm].icon}</div>
                <div className="space-y-4">
                  <h2 className="text-6xl font-black uppercase tracking-tighter italic leading-none">{communities[selectedComm].name}</h2>
                  <p className="text-white/20 text-xl font-medium max-w-xl mx-auto italic">Social heartbeat active. Drop into the conversation.</p>
                </div>
                <button className="px-16 py-6 bg-[#53C8FF] text-[#0A0F1F] rounded-[32px] text-sm font-black uppercase tracking-[0.2em] italic shadow-2xl shadow-[#53C8FF]/20 hover:scale-105 transition-all">Join Social Flow</button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Communities;