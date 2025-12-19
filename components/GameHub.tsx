
import React, { useState } from 'react';
import XPBar from './XPBar';

interface Game {
  id: string;
  name: string;
  desc: string;
  icon: string;
  url: string;
  category: 'Arcade' | 'Puzzle' | 'Action';
  color: string;
}

const GAMES: Game[] = [
  { id: '2048', name: '2048', desc: 'Join the numbers and get to the 2048 tile!', icon: '🔢', url: 'https://play2048.co/', category: 'Puzzle', color: '#edc22e' },
  { id: 'hextris', name: 'Hextris', desc: 'A fast-paced puzzle game inspired by Tetris.', icon: '🔷', url: 'https://hextris.io/', category: 'Puzzle', color: '#f39c12' },
  { id: 'pacman', name: 'Pacman', desc: 'The legendary retro arcade classic.', icon: '🟡', url: 'https://www.google.com/logos/2010/pacman10-i.html', category: 'Arcade', color: '#ffff00' },
  { id: 'snake', name: 'Google Snake', desc: 'Classic snake gameplay in your browser.', icon: '🐍', url: 'https://www.google.com/logos/2010/pacman10-i.html', category: 'Arcade', color: '#4caf50' }
];

const GameHub: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  if (selectedGame) {
    return (
      <div className="fixed inset-0 z-[150] bg-[#050819] flex flex-col animate-fade-in italic">
        <header className="h-20 bg-[#080C22] border-b border-white/5 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button onClick={() => setSelectedGame(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-[#53C8FF]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
             </button>
             <div>
                <h2 className="text-xl font-black uppercase tracking-tighter italic">{selectedGame.name}</h2>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">{selectedGame.category} • Earning 2x Bonus XP</p>
             </div>
          </div>
          <div className="flex items-center gap-8">
             <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#3DD68C]">Live Session</div>
                <div className="text-sm font-black">+240 XP Earned</div>
             </div>
             <button onClick={() => setSelectedGame(null)} className="px-6 py-3 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-500/10">Quit Game</button>
          </div>
        </header>
        <div className="flex-1 bg-black overflow-hidden relative">
           <iframe 
             src={selectedGame.url} 
             className="w-full h-full border-none"
             title={selectedGame.name}
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
             allowFullScreen
           />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in italic">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic mb-2">Game Hub</h1>
          <p className="text-white/30 text-lg font-medium italic">Play solo or with your community to earn CloudHop XP.</p>
        </div>
        <div className="w-80 bg-[#0E1430] border border-white/5 p-6 rounded-[32px] shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-3"><span className="text-xl">⚡</span></div>
           <XPBar level={5} xp={1250} nextLevelXP={2000} />
           <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#53C8FF] mt-4 opacity-60">Level Up to unlock exclusive avatars</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
         {GAMES.map(game => (
           <div key={game.id} className="group bg-[#0E1430] border border-white/5 rounded-[40px] p-8 flex flex-col hover:border-[#53C8FF]/40 transition-all shadow-2xl hover:shadow-[#53C8FF]/10 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-[#53C8FF]/20 to-transparent blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="w-16 h-16 bg-[#050819] rounded-[24px] flex items-center justify-center text-4xl mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500 border border-white/5">
                {game.icon}
              </div>
              
              <div className="space-y-3 flex-1">
                 <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic">{game.name}</h3>
                    <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-black uppercase text-white/30 tracking-widest">{game.category}</span>
                 </div>
                 <p className="text-sm text-white/40 leading-relaxed font-medium italic">{game.desc}</p>
              </div>

              <div className="mt-10">
                 <button 
                   onClick={() => setSelectedGame(game)}
                   className="w-full py-4 bg-[#53C8FF] text-[#0A0F1F] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-2xl hover:scale-[1.02] transition-all"
                 >
                   Launch Game
                 </button>
                 <div className="text-center mt-3">
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#3DD68C] animate-pulse">Double XP Enabled</span>
                 </div>
              </div>
           </div>
         ))}
      </div>

      <div className="bg-[#080C22] border border-white/5 rounded-[48px] p-12 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-[#1A2348]/20 to-transparent"></div>
         <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
               <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">The Arena <br /> <span className="text-[#53C8FF]">Leaderboards</span></h2>
               <p className="text-white/30 text-base font-medium leading-relaxed italic">Compete with other hoppers to climb the global ranks and earn unique badges.</p>
               <button className="px-10 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all">View All Rankings</button>
            </div>
            <div className="grid grid-cols-1 gap-3">
               {[
                 { name: 'Matthew', xp: '4,201', rank: '1', color: '#FFD700' },
                 { name: 'SarahC', xp: '3,892', rank: '2', color: '#C0C0C0' },
                 { name: 'MikeR', xp: '3,510', rank: '3', color: '#CD7F32' }
               ].map((user, i) => (
                 <div key={i} className="flex items-center justify-between p-5 bg-black/40 backdrop-blur-xl border border-white/5 rounded-[24px] hover:border-[#53C8FF]/30 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs" style={{backgroundColor: user.color, color: 'black'}}>{user.rank}</div>
                       <span className="font-black uppercase italic text-sm">{user.name}</span>
                    </div>
                    <span className="font-black text-[#53C8FF] text-xs uppercase">{user.xp} XP</span>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default GameHub;
