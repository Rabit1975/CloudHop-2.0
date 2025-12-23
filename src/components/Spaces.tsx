import React, { useState, useEffect } from 'react';
import { CloudHopLogo, Icons } from '../constants';
import GameHub from './GameHub';
import AITools from './AITools';
import { useSpace } from '../contexts/SpaceContext';
import { View, SpaceInfo } from '../types';
import { api } from '../services/mockApi';
import Modal from './Modal';

interface SpacesProps {
  onNavigate: (view: View) => void;
}

const Spaces: React.FC<SpacesProps> = ({ onNavigate }) => {
  const { setCurrentSpace } = useSpace();
  const [filter, setFilter] = useState('World Map');
  const [currentMode, setCurrentMode] = useState<'Grid' | 'Arcade' | 'IntelliRabbit'>('Grid');
  const [spaces, setSpaces] = useState<SpaceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceDesc, setNewSpaceDesc] = useState('');
  const [newSpaceCategory, setNewSpaceCategory] = useState('Voice Lounges');

  const categories = ['World Map', 'Trending', 'Friends', 'Voice Lounges', 'Avatar Rooms', 'Gaming Squads', 'Study Halls'];

  useEffect(() => {
    loadSpaces();
  }, []);

  const loadSpaces = async () => {
    setLoading(true);
    const data = await api.getPublicSpaces();
    setSpaces(data);
    setLoading(false);
  };

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createSpace({
        name: newSpaceName,
        desc: newSpaceDesc,
        category: newSpaceCategory,
        image: `https://picsum.photos/seed/${newSpaceName}/400/225`,
        type: 'Custom Space',
        tags: ['New'],
        visibility: 'Public'
    });
    setIsModalOpen(false);
    loadSpaces(); // Refresh list
    // Reset form
    setNewSpaceName('');
    setNewSpaceDesc('');
  };

  const filteredSpaces = filter === 'World Map' ? spaces : spaces.filter(s => s.category === filter || filter === 'World Map');

  const handleHopIn = async (space: SpaceInfo) => {
    await api.joinSpace(space.id);
    
    setCurrentSpace({
        id: space.id,
        name: space.name,
        role: 'Member'
    });
    
    if (space.category === 'Gaming Squads' && currentMode === 'Grid') {
        // Optional: could route to Arcade view directly if desired
        // For now, we route to Dashboard as requested "hop the user into that room" context
        onNavigate(View.DASHBOARD);
    } else {
        onNavigate(View.DASHBOARD);
    }
  };

  if (currentMode === 'Arcade') {
      return (
          <div className="h-full flex flex-col animate-fade-in">
              <div className="flex items-center gap-4 mb-6">
                  <button onClick={() => setCurrentMode('Grid')} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest">← Back</button>
                  <h2 className="text-2xl font-black uppercase tracking-tighter italic">The Arcade</h2>
              </div>
              <GameHub />
          </div>
      );
  }

  if (currentMode === 'IntelliRabbit') {
      return (
          <div className="h-full flex flex-col animate-fade-in">
              <div className="flex items-center gap-4 mb-6">
                  <button onClick={() => setCurrentMode('Grid')} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest">← Back</button>
                  <h2 className="text-2xl font-black uppercase tracking-tighter italic">IntelliRabbit Suite</h2>
              </div>
              <AITools />
          </div>
      );
  }

  return (
    <div className="space-y-12 animate-fade-in italic">
      {/* Create Space Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Public Space">
        <form onSubmit={handleCreateSpace} className="space-y-6">
            <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-[#53C8FF]">Space Name</label>
                <input 
                    type="text" 
                    value={newSpaceName}
                    onChange={e => setNewSpaceName(e.target.value)}
                    className="w-full bg-[#050819] border border-white/10 rounded-xl p-4 text-white focus:border-[#53C8FF] outline-none transition-all font-bold"
                    placeholder="e.g. Neon Night Lounge"
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-[#53C8FF]">Category</label>
                <select 
                    value={newSpaceCategory}
                    onChange={e => setNewSpaceCategory(e.target.value)}
                    className="w-full bg-[#050819] border border-white/10 rounded-xl p-4 text-white focus:border-[#53C8FF] outline-none transition-all font-bold appearance-none"
                >
                    {categories.filter(c => c !== 'World Map').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-[#53C8FF]">Description</label>
                <textarea 
                    value={newSpaceDesc}
                    onChange={e => setNewSpaceDesc(e.target.value)}
                    className="w-full bg-[#050819] border border-white/10 rounded-xl p-4 text-white focus:border-[#53C8FF] outline-none transition-all font-medium h-32"
                    placeholder="Describe the vibe..."
                    required
                />
            </div>
            <button type="submit" className="w-full py-4 bg-[#53C8FF] text-[#0A0F1F] rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] transition-transform">
                Launch Space
            </button>
        </form>
      </Modal>

      {/* Hero / Discovery Header: Hop World */}
      <div className="bg-gradient-to-r from-[#1A2348] to-[#0E1430] p-16 rounded-[56px] border border-[#53C8FF]/20 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none transform translate-x-20 translate-y-[-20px]">
            <svg className="w-[500px] h-[500px]" fill="currentColor" viewBox="0 0 24 24"><path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
         </div>
         <div className="relative z-10 space-y-8">
            <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-3 px-5 py-2 bg-[#53C8FF]/10 border border-[#53C8FF]/20 rounded-full">
                   <span className="w-1.5 h-1.5 rounded-full bg-[#53C8FF] animate-pulse"></span>
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#53C8FF] italic">Public Social Discovery Layer</span>
                </div>
                <button 
                  onClick={() => setCurrentMode('IntelliRabbit')}
                  className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-[#53C8FF]/20 border border-white/10 hover:border-[#53C8FF] rounded-2xl transition-all group"
                >
                    <Icons.AI className="w-5 h-5 text-[#53C8FF] group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80 group-hover:text-white">IntelliRabbit</span>
                </button>
            </div>
            <h1 className="text-7xl lg:text-9xl font-black tracking-tighter uppercase italic leading-[0.8] transition-all">Hop World<br /> <span className="text-[#53C8FF] drop-shadow-[0_0_30px_rgba(83,200,255,0.4)]">Communities.</span></h1>
            <p className="text-white/60 text-2xl font-medium max-w-3xl leading-relaxed italic">The explorable map of CloudHop. Discover new squads, wander into public lounges, and drop into experiences instantly.</p>
         </div>
      </div>

      {/* Discovery Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div className="flex flex-wrap gap-2 bg-[#0E1430] p-2.5 rounded-[32px] border border-white/5 shadow-inner">
           {categories.map(cat => (
             <button 
               key={cat} 
               onClick={() => setFilter(cat)}
               className={`px-8 py-3.5 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all italic ${filter === cat ? 'bg-[#53C8FF] text-[#0A0F1F] shadow-lg shadow-[#53C8FF]/10' : 'text-white/20 hover:text-white hover:bg-white/5'}`}
             >
               {cat}
             </button>
           ))}
        </div>
        <div className="flex gap-4 shrink-0">
           <button className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest italic shadow-xl">Discovery Map View</button>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="px-10 py-4 bg-[#53C8FF] text-[#0A0F1F] rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-[#53C8FF]/20 italic transition-transform hover:scale-105 active:scale-95"
           >
             Open A Space
           </button>
        </div>
      </div>

      {/* World Grid */}
      {loading ? (
          <div className="text-center py-20 text-white/20 font-black uppercase tracking-widest">Loading Spaces...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-10">
            {filteredSpaces.map((space) => (
            <div key={space.id} className="group bg-[#0E1430] border border-white/5 rounded-[48px] overflow-hidden shadow-2xl hover:border-[#53C8FF]/40 transition-all hover:shadow-[#53C8FF]/10 flex flex-col h-full transform hover:translate-y-[-10px] duration-500">
                <div className="relative h-60 overflow-hidden">
                <img src={space.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1430] via-transparent to-transparent opacity-90"></div>
                <div className="absolute top-5 right-5 bg-[#3DD68C] text-black px-5 py-1.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest animate-pulse italic">Live</div>
                <div className="absolute bottom-5 left-5 flex -space-x-4">
                    {[1,2,3,4].map(j => (
                        <div key={j} className="w-10 h-10 rounded-2xl border-2 border-[#0E1430] bg-[#1A2348] flex items-center justify-center text-[10px] font-black italic shadow-xl">U</div>
                    ))}
                    <div className="w-10 h-10 rounded-2xl border-2 border-[#0E1430] bg-[#050819] flex items-center justify-center text-[9px] font-black text-[#53C8FF] italic shadow-xl">+{space.participants}</div>
                </div>
                </div>
                <div className="p-10 space-y-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h3 className="text-3xl font-black uppercase tracking-tighter leading-none group-hover:text-[#53C8FF] transition-colors italic">{space.name}</h3>
                        <div className="text-[10px] font-black text-[#53C8FF]/60 uppercase tracking-widest italic">{space.type}</div>
                    </div>
                </div>
                <p className="text-sm text-white/60 font-medium leading-relaxed italic line-clamp-2 flex-1">{space.desc}</p>
                <button 
                    onClick={() => handleHopIn(space)}
                    className="w-full py-5 bg-white/5 hover:bg-[#53C8FF] hover:text-[#0A0F1F] rounded-[28px] text-[10px] font-black uppercase tracking-[0.3em] transition-all border border-white/10 group-hover:border-[#53C8FF] shadow-2xl italic"
                    aria-label={`Hop into ${space.name}`}
                >
                    Hop In
                </button>
                </div>
            </div>
            ))}
        </div>
      )}

      {/* Presence Footer */}
      <div className="pt-24 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-12">
         <div className="flex items-center gap-8">
            <CloudHopLogo size={72} variant="neon" />
            <div className="space-y-2 text-left">
               <h4 className="text-4xl font-black uppercase tracking-tighter italic leading-none">Global Discovery</h4>
               <p className="text-white/20 text-sm font-black uppercase tracking-[0.4em] italic">Real-time presence. Chrome-native. Fast.</p>
            </div>
         </div>
         <div className="flex -space-x-5">
            {[1,2,3,4,5,6,7,8].map(i => (
               <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Friend${i}`} className="w-16 h-16 rounded-3xl border-4 border-[#050819] bg-[#0E1430] shadow-2xl hover:scale-110 transition-transform z-10" alt="" />
            ))}
            <button className="w-16 h-16 rounded-3xl border-4 border-[#050819] bg-[#53C8FF] text-[#0A0F1F] flex items-center justify-center font-black text-xl z-20 hover:scale-110 transition-transform shadow-2xl shadow-[#53C8FF]/30 italic">+</button>
         </div>
      </div>
    </div>
  );
};

export default Spaces;
