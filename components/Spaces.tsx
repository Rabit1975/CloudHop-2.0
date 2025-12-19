
import React, { useState } from 'react';

const Spaces: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const categories = ['All', 'Work', 'Study', 'Gaming', 'Friends', 'Custom'];

  const spaces = [
    { name: 'Product Brainstorm', category: 'Work', participants: 4, description: 'Quick huddle for Q4 goals.', status: 'Live', image: 'https://picsum.photos/seed/work/400/225' },
    { name: 'Deep Focus (Lofi)', category: 'Study', participants: 28, description: 'Silent study with calm beats.', status: 'Live', image: 'https://picsum.photos/seed/study/400/225' },
    { name: 'Minecraft Build-off', category: 'Gaming', participants: 15, description: 'Competing for the best sky base!', status: 'Live', image: 'https://picsum.photos/seed/game/400/225' },
    { name: 'Coffee Lounge', category: 'Friends', participants: 2, description: 'Open mic for casual chats.', status: 'Idle', image: 'https://picsum.photos/seed/friends/400/225' },
    { name: 'Vibe Check 24/7', category: 'Custom', participants: 42, description: 'Chill vibes only.', status: 'Live', image: 'https://picsum.photos/seed/vibe/400/225' },
    { name: 'Exam Prep: Calc II', category: 'Study', participants: 8, description: 'Derivatives and integrations.', status: 'Live', image: 'https://picsum.photos/seed/calc/400/225' },
  ];

  const filteredSpaces = filter === 'All' ? spaces : spaces.filter(s => s.category === filter);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#0E1430] p-1 rounded-xl w-fit">
          <button className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[#1A2348] text-[#53C8FF] shadow-lg shadow-[#53C8FF]/10">All Spaces</button>
          <button className="px-4 py-1.5 text-xs font-bold rounded-lg text-white/40 hover:text-white">My Spaces</button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                filter === cat 
                  ? 'bg-[#53C8FF] text-[#0A0F1F] border-[#53C8FF] shadow-lg shadow-[#53C8FF]/30' 
                  : 'bg-white/5 text-white/50 border-white/5 hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button className="px-6 py-2 bg-[#53C8FF] text-[#0A0F1F] text-sm font-black rounded-xl hover:scale-105 transition-all shadow-xl shadow-[#53C8FF]/20">
          Create Space
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {filteredSpaces.map((space, i) => (
          <div key={i} className="group bg-[#0E1430] border border-white/5 rounded-2xl overflow-hidden shadow-xl hover:border-[#53C8FF]/40 transition-all hover:shadow-2xl hover:shadow-[#53C8FF]/5">
            <div className="relative h-40 overflow-hidden">
              <img src={space.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
              <div className="absolute top-3 right-3 flex gap-2">
                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${space.status === 'Live' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white/80'}`}>
                  {space.status}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E1430] to-transparent opacity-60"></div>
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1,2,3].map(j => (
                    <img key={j} src={`https://picsum.photos/seed/${space.name}${j}/32`} className="w-6 h-6 rounded-full border-2 border-[#0E1430]" alt="" />
                  ))}
                  <div className="w-6 h-6 rounded-full border-2 border-[#0E1430] bg-[#1A2348] flex items-center justify-center text-[8px] font-bold">
                    +{space.participants}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-base text-white group-hover:text-[#53C8FF] transition-colors">{space.name}</h4>
                  <p className="text-[10px] text-[#53C8FF] font-bold uppercase tracking-wider">{space.category}</p>
                </div>
              </div>
              <p className="text-xs text-white/50 line-clamp-2 h-8">{space.description}</p>
              <button className="w-full py-2.5 bg-white/5 hover:bg-[#53C8FF] hover:text-[#0A0F1F] border border-white/5 hover:border-[#53C8FF] rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                Hop In
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Spaces;
