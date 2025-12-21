import React, { useState } from 'react';
import XPBar from './XPBar';
import { CloudHopLogo } from '../constants';

interface Game {
  id: string;
  name: string;
  desc: string;
  icon: string;
  url: string;
  category: 'Arcade' | 'Puzzle' | 'Action' | 'Retro' | 'Racing' | 'Strategy';
  color: string;
  xpMultiplier?: number;
}

const GAMES: Game[] = [
  { id: '2048', name: '2048', desc: 'Classic tile merging logic. Highly addictive.', icon: '🔢', url: 'https://play2048.co/', category: 'Puzzle', color: '#edc22e', xpMultiplier: 2 },
  { id: 'pacman', name: 'Pacman', desc: 'The legendary retro classic. Chase the high score.', icon: '🟡', url: 'https://freepacman.org/', category: 'Retro', color: '#ffff00' },
  { id: 'snake', name: 'Google Snake', desc: 'Sleek, modern snake gameplay directly in your cloud.', icon: '🐍', url: 'https://snake.googlemaps.com/', category: 'Arcade', color: '#4caf50' },
  { id: 'crossy', name: 'Crossy Road', desc: 'Hop forever. Don\'t get squashed.', icon: '🐔', url: 'https://poki.com/en/g/crossy-road', category: 'Action', color: '#3DD68C' },
  { id: 'slowroads', name: 'Slow Roads', desc: 'Endless zen driving in your browser.', icon: '🚗', url: 'https://slowroads.io/', category: 'Racing', color: '#53C8FF' },
  { id: 'paperio', name: 'Paper.io 2', desc: 'Conquer territory and outsmart opponents.', icon: '🗺️', url: 'https://poki.com/en/g/paper-io-2', category: 'Strategy', color: '#FF4D4D', xpMultiplier: 1.2 }
];

const GameHub: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Arcade', 'Puzzle', 'Action', 'Racing', 'Strategy', 'Retro'];
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
                </div>
             </div>
          </div>
          <button onClick={() => setSelectedGame(null)} className="px-8 py-4 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Terminate Game</button>
        </header>
        <div className="flex-1 bg-black overflow-hidden relative">
           <iframe src={selectedGame.url} className="w-full h-full border-none" title={selectedGame.name} allowFullScreen />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in italic pb-20">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
        <div className="flex items-center gap-8">
          <CloudHopLogo size={80} variant="neon" className="drop-shadow-[0_0_30px_rgba(83,200,255,0.4)]" />
          <div className="space-y-1">
            <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none">Game<span className="text-[#53C8FF]">Hub</span></h1>
            <p className="text-white/30 text-xl font-medium italic">High-performance gaming built for the Chrome Desktop Core.</p>
          </div>
        </div>
        <div className="w-full xl:w-[420px] bg-[#0E1430] border border-white/10 p-8 rounded-[40px] shadow-2xl">
           <XPBar level={5} xp={1250} nextLevelXP={2000} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              activeCategory === cat ? 'bg-[#53C8FF] text-[#0A0F1F] border-[#53C8FF]' : 'bg-white/5 text-white/40 border-white/5 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
         {filteredGames.map(game => (
           <div key={game.id} className="group bg-[#0E1430] border border-white/5 rounded-[48px] p-10 flex flex-col hover:border-[#53C8FF]/40 transition-all duration-500 shadow-2xl relative overflow-hidden">
              <div className="w-20 h-20 bg-[#050819] rounded-[28px] flex items-center justify-center text-5xl mb-8 shadow-inner border border-white/5">{game.icon}</div>
              <div className="space-y-4 flex-1">
                 <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none mb-1">{game.name}</h3>
                 <p className="text-sm text-white/30 leading-relaxed font-medium italic">{game.desc}</p>
              </div>
              <div className="mt-12">
                 <button onClick={() => setSelectedGame(game)} className="w-full py-5 bg-[#53C8FF] text-[#0A0F1F] rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] transition-all">Hop Into Play</button>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default GameHub;