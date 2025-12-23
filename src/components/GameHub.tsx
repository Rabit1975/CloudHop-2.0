
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
  { id: 'hextris', name: 'Hextris', desc: 'Fast-paced hexagonal puzzle game inspired by Tetris.', icon: '🔷', url: 'https://hextris.io/', category: 'Puzzle', color: '#f39c12' },
  { id: 'pacman', name: 'Pacman', desc: 'The legendary retro classic. Chase the high score.', icon: '🟡', url: 'https://freepacman.org/', category: 'Retro', color: '#ffff00' },
  { id: 'cube', name: 'Cube Slam', desc: 'Face off against a bear in this 3D Chrome Experiment.', icon: '🐻', url: 'https://cubeslam.com/', category: 'Arcade', color: '#ff4081', xpMultiplier: 1.5 },
  { id: 'snake', name: 'Google Snake', desc: 'Sleek, modern snake gameplay directly in your cloud.', icon: '🐍', url: 'https://snake.googlemaps.com/', category: 'Arcade', color: '#4caf50' },
  { id: 'tetris', name: 'React Tetris', desc: 'High-performance React-based tetrimino stacking.', icon: '🧱', url: 'https://chvin.github.io/react-tetris/', category: 'Puzzle', color: '#53C8FF', xpMultiplier: 1.5 },
  { id: 'quickdraw', name: 'Quick, Draw!', desc: 'Can a neural network recognize your drawing?', icon: '✏️', url: 'https://quickdraw.withgoogle.com/', category: 'Puzzle', color: '#9c27b0' },
  { id: 'crossy', name: 'Crossy Road', desc: 'Hop forever. Don\'t get squashed.', icon: '🐔', url: 'https://poki.com/en/g/crossy-road', category: 'Action', color: '#3DD68C' },
  { id: 'tower', name: 'Tower Stack', desc: 'Precision physics-based tower building.', icon: '🏙️', url: 'https://poki.com/en/g/stack', category: 'Action', color: '#ff4d4d' },
  { id: 'pong', name: 'Neon Pong', desc: 'Ultra-fast paddles in a neon-lit arena.', icon: '🏓', url: 'https://pong-2.com/', category: 'Arcade', color: '#3DD68C' },
  // New Additions
  { id: 'slowroads', name: 'Slow Roads', desc: 'Endless zen driving in your browser.', icon: '🚗', url: 'https://slowroads.io/', category: 'Racing', color: '#53C8FF' },
  { id: 'paperio', name: 'Paper.io 2', desc: 'Conquer territory and outsmart opponents.', icon: '🗺️', url: 'https://poki.com/en/g/paper-io-2', category: 'Strategy', color: '#FF4D4D', xpMultiplier: 1.2 },
  { id: 'templerun', name: 'Temple Run 2', desc: 'The classic endless runner remastered.', icon: '🏃', url: 'https://poki.com/en/g/temple-run-2', category: 'Action', color: '#FCD34D' },
  { id: 'subway', name: 'Subway Surfers', desc: 'Dash as fast as you can. Dodge the trains.', icon: '🏄', url: 'https://poki.com/en/g/subway-surfers', category: 'Action', color: '#3DD68C' },
  { id: 'tinyfishing', name: 'Tiny Fishing', desc: 'Relaxing fishing game. Catch rare fish.', icon: '🎣', url: 'https://poki.com/en/g/tiny-fishing', category: 'Arcade', color: '#53C8FF' },
  { id: 'moto', name: 'Moto X3M', desc: 'Extreme motorbike racing with crazy stunts.', icon: '🏍️', url: 'https://poki.com/en/g/moto-x3m', category: 'Racing', color: '#FF4D4D' },
  { id: 'wordle', name: 'Wordle Unlimited', desc: 'Guess the word. Unlimited play.', icon: '📝', url: 'https://wordleunlimited.org/', category: 'Puzzle', color: '#3DD68C' },
  { id: 'cutrope', name: 'Cut The Rope', desc: 'Feed Candy to Om Nom. Physics puzzle.', icon: '🍬', url: 'https://poki.com/en/g/cut-the-rope', category: 'Puzzle', color: '#3DD68C' }
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
        <div className="flex-1 bg-black overflow-hidden relative group flex flex-col items-center justify-center">
           {/* Chrome Performance Overlay */}
           <div className="absolute top-6 left-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
                 <div className="text-[8px] font-black uppercase tracking-widest text-[#53C8FF] mb-2">GameHub Engine</div>
                 <div className="space-y-1">
                    <div className="flex justify-between gap-8 text-[9px] font-bold text-white/40">GPU Usage <span className="text-white">12%</span></div>
                    <div className="flex justify-between gap-8 text-[9px] font-bold text-white/40">Latency <span className="text-white">Ultra-Low</span></div>
                 </div>
              </div>
           </div>

           <iframe 
             src={selectedGame.url} 
             className="w-full h-full border-none relative z-10"
             title={selectedGame.name}
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
             allowFullScreen
           />
           
           {/* Fallback Link */}
           <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
              <a 
                href={selectedGame.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold text-white/60 hover:text-white transition-all border border-white/10"
              >
                Game not loading? Open in new tab ↗
              </a>
           </div>
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
            <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none">Game<span className="text-[#53C8FF]">Hub</span></h1>
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
    </div>
  );
};

export default GameHub;
