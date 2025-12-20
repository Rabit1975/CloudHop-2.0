
import React, { useState } from 'react';
import XPBar from './XPBar';
import { CloudHopLogo } from '../constants';

interface Game {
  id: string;
  name: string;
  desc: string;
  icon: string;
  url: string;
  category: 'Arcade' | 'Puzzle' | 'Action' | 'Retro';
  color: string;
  xpMultiplier?: number;
}

const GAMES: Game[] = [
  { id: '2048', name: '2048', desc: 'Classic tile merging logic. Highly addictive.', icon: '🔢', url: 'https://play2048.co/', category: 'Puzzle', color: '#edc22e', xpMultiplier: 2 },
  { id: 'hextris', name: 'Hextris', desc: 'Fast-paced hexagonal puzzle game inspired by Tetris.', icon: '🔷', url: 'https://hextris.io/', category: 'Puzzle', color: '#f39c12' },
  { id: 'pacman', name: 'Pacman', desc: 'The legendary retro classic. Chase the high score.', icon: '🟡', url: 'https://www.google.com/logos/2010/pacman10-i.html', category: 'Retro', color: '#ffff00' },
  { id: 'snake', name: 'Google Snake', desc: 'Sleek, modern snake gameplay directly in your cloud.', icon: '🐍', url: 'https://www.google.com/logos/2010/pacman10-i.html', category: 'Arcade', color: '#4caf50' },
  { id: 'tetris', name: 'React Tetris', desc: 'High-performance React-based tetrimino stacking.', icon: '🧱', url: 'https://chvin.github.io/react-tetris/', category: 'Puzzle', color: '#53C8FF', xpMultiplier: 1.5 },
  { id: 'dino', name: 'Dino Run', desc: 'The offline classic, now always online in CloudHop.', icon: '🦖', url: 'https://chromedino.com/', category: 'Arcade', color: '#a3a3a3' },
  { id: 'tower', name: 'Tower Stack', desc: 'Precision physics-based tower building.', icon: '🏙️', url: 'https://play.google.com/logos/2010/pacman10-i.html', category: 'Action', color: '#ff4d4d' },
  { id: 'pong', name: 'Neon Pong', desc: 'Ultra-fast paddles in a neon-lit arena.', icon: '🏓', url: 'https://play2048.co/', category: 'Arcade', color: '#3DD68C' }
];

const GameHub: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Arcade', 'Puzzle', 'Action', 'Retro'];
  const filteredGames = activeCategory === 'All' ? GAMES : GAMES.filter(g => g.category === activeCategory);

  if (selectedGame) {
    return (
      <div className="fixed inset-0 z-[150] bg-[#050819] flex flex-col animate-fade-in italic select-none">
        <header className="h-20 bg-[#080C22] border-b border-white/5 px-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
             <button onClick={() => setSelectedGame(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-[#53C8FF] border border-white/5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
             </button>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#050819] rounded-xl flex items-center justify-center text-3xl border border-white/5 shadow-inner">
                   {selectedGame.icon}
                </div>
                <div>
                   <h2 className="text-xl font-black uppercase tracking-tighter italic leading-none mb-1">{selectedGame.name}</h2>
                   <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/30">{selectedGame.category} Mode</span>
                      <span className="w-1 h-1 rounded-full bg-white/20"></span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-[#3DD68C]">Live XP Multiplier: {selectedGame.xpMultiplier || 1}x</span>
                   </div>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-10">
             <div className="hidden md:flex flex-col items-end">
                <div className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 mb-1">Engine Performance</div>
                <div className="flex gap-4">
                   <div className="text-[10px] font-black uppercase text-[#53C8FF]">60 FPS</div>
                   <div className="text-[10px] font-black uppercase text-[#3DD68C]">12ms PING</div>
                </div>
             </div>
             <button onClick={() => setSelectedGame(null)} className="px-8 py-4 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-red-500/5">Terminate Game</button>
          </div>
        </header>
        <div className="flex-1 bg-black overflow-hidden relative group">
           {/* Chrome Performance Overlay */}
           <div className="absolute top-6 left-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
                 <div className="text-[8px] font-black uppercase tracking-widest text-[#53C8FF] mb-2">Cloud Arcade Engine</div>
                 <div className="space-y-1">
                    <div className="flex justify-between gap-8 text-[9px] font-bold text-white/40">GPU Usage <span className="text-white">12%</span></div>
                    <div className="flex justify-between gap-8 text-[9px] font-bold text-white/40">Latency <span className="text-white">Ultra-Low</span></div>
                 </div>
              </div>
           </div>

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
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in italic pb-20">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
        <div className="flex items-center gap-8">
          <CloudHopLogo size={80} variant="neon" className="gpu-accelerated drop-shadow-[0_0_30px_rgba(83,200,255,0.4)]" />
          <div className="space-y-1">
            <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none">Cloud <span className="text-[#53C8FF]">Arcade</span></h1>
            <p className="text-white/30 text-xl font-medium italic">High-performance gaming built for the Chrome Desktop Core.</p>
          </div>
        </div>
        <div className="w-full xl:w-[420px] bg-[#0E1430] border border-white/10 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group hover:border-[#53C8FF]/30 transition-all duration-700">
           <div className="absolute top-0 right-0 p-5 opacity-20 transform group-hover:rotate-12 transition-transform"><span className="text-3xl">🎮</span></div>
           <XPBar level={5} xp={1250} nextLevelXP={2000} />
           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#53C8FF] mt-5 opacity-60 animate-pulse italic">Level Up to unlock the 'Elite Hopper' Badge</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              activeCategory === cat 
                ? 'bg-[#53C8FF] text-[#0A0F1F] border-[#53C8FF] shadow-[0_10px_30px_rgba(83,200,255,0.3)]' 
                : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
         {filteredGames.map(game => (
           <div key={game.id} className="group bg-[#0E1430] border border-white/5 rounded-[48px] p-10 flex flex-col hover:border-[#53C8FF]/40 transition-all duration-500 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-[#53C8FF]/10 to-transparent blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <div className="w-20 h-20 bg-[#050819] rounded-[28px] flex items-center justify-center text-5xl mb-8 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 border border-white/5">
                {game.icon}
              </div>
              
              <div className="space-y-4 flex-1">
                 <div className="flex justify-between items-start">
                    <div>
                       <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none mb-1">{game.name}</h3>
                       <span className="text-[9px] font-black uppercase tracking-widest text-[#53C8FF] opacity-60">{game.category} System</span>
                    </div>
                    {game.xpMultiplier && (
                       <span className="px-3 py-1 bg-[#3DD68C]/10 text-[#3DD68C] text-[8px] font-black uppercase tracking-widest rounded-lg border border-[#3DD68C]/20">{game.xpMultiplier}x XP</span>
                    )}
                 </div>
                 <p className="text-sm text-white/30 leading-relaxed font-medium italic group-hover:text-white/50 transition-colors">{game.desc}</p>
              </div>

              <div className="mt-12">
                 <button 
                   onClick={() => setSelectedGame(game)}
                   className="w-full py-5 bg-[#53C8FF] text-[#0A0F1F] rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] hover:shadow-[0_20px_40px_rgba(83,200,255,0.3)] hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-[#53C8FF]/10"
                 >
                   Hop Into Play
                 </button>
              </div>
           </div>
         ))}
      </div>

      <div className="bg-[#080C22] border border-white/10 rounded-[64px] p-16 relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-br from-[#1A2348]/40 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
         <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
               <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#53C8FF]/10 border border-[#53C8FF]/20 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#53C8FF] animate-pulse"></span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#53C8FF]">Live Leaderboard Analytics</span>
               </div>
               <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-[0.9]">The Arena <br /> <span className="text-[#53C8FF] drop-shadow-[0_0_20px_rgba(83,200,255,0.4)]">Top Hoppers</span></h2>
               <p className="text-white/30 text-xl font-medium leading-relaxed italic max-w-md">Compete with the global CloudHop squad to claim exclusive digital assets and badge upgrades.</p>
               <button className="px-12 py-5 bg-white/5 hover:bg-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-white/10 transition-all italic">Launch Full Analytics</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
               {[
                 { name: 'Matthew', xp: '12,450', rank: '1', color: '#FFD700', trend: 'up' },
                 { name: 'Sarah_Ops', xp: '10,892', rank: '2', color: '#C0C0C0', trend: 'stable' },
                 { name: 'Mike_Ross', xp: '9,510', rank: '3', color: '#CD7F32', trend: 'up' },
                 { name: 'Emily_AI', xp: '8,200', rank: '4', color: '#1A2348', trend: 'down' }
               ].map((user, i) => (
                 <div key={i} className="flex items-center justify-between p-6 bg-black/40 backdrop-blur-2xl border border-white/5 rounded-[32px] hover:border-[#53C8FF]/40 transition-all duration-500 group/item">
                    <div className="flex items-center gap-6">
                       <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-2xl transition-transform group-hover/item:scale-110" style={{backgroundColor: user.color, color: 'black'}}>{user.rank}</div>
                       <div className="space-y-1">
                          <span className="font-black uppercase italic text-lg tracking-tighter">{user.name}</span>
                          <div className="text-[8px] font-black text-white/20 uppercase tracking-widest italic">Global Rank #{user.rank}</div>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="font-black text-[#53C8FF] text-xl uppercase tracking-tighter italic">{user.xp} <span className="text-[10px] opacity-40">XP</span></div>
                       <div className={`text-[8px] font-black uppercase tracking-widest ${user.trend === 'up' ? 'text-[#3DD68C]' : user.trend === 'down' ? 'text-red-500' : 'text-white/20'}`}>
                          {user.trend === 'up' ? '▲ CLIMBING' : user.trend === 'down' ? '▼ DROPPING' : '• STABLE'}
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default GameHub;
