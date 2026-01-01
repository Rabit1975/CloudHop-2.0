import React, { useState, useEffect } from 'react';
import { View, User } from '../types';
import { CloudHopLogo, Icons } from '../constants';
import { useWebSocket } from '../hooks/useWebSocket';
import { useSpace } from '../contexts/SpaceContext';
import AIAssistant from './AIAssistant';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onNavigate: (view: View) => void;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, user, onLogout }) => {
  const { currentSpace } = useSpace();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const { events, clearEvents } = useWebSocket(user?.id || "guest", currentSpace.id);

  useEffect(() => {
    if (events.length > 0) {
      const latest = events[events.length - 1];
      
      // Only show notifications for specific relevant events
      if (latest.type !== 'xp_award' && latest.type !== 'badge_unlock') {
        return;
      }

      const payload = latest.payload || {};
      const newNotif = {
        id: Date.now(),
        text: latest.type === 'xp_award' ? `+${payload.amount} XP Earned!` : `Unlocked: ${payload.badge}`,
        type: latest.type
      };
      setNotifications(prev => [...prev, newNotif]);
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
      }, 4000);
      clearEvents();
    }
  }, [events]);

  const navItems = [
    { id: View.DASHBOARD, label: 'Home', icon: Icons.Home },
    { id: View.CHAT, label: 'RabbitChat', icon: Icons.Chat },
    { id: View.WORLD, label: 'HopHub', icon: Icons.Spaces },
    { id: View.MEETINGS, label: 'HopMeets', icon: Icons.Meetings },
    { id: View.CORE, label: 'Hop Spaces', icon: Icons.Communities },
    { id: View.ARCADE, label: 'GameHub', icon: Icons.Arcade }, // Restored to sidebar
  ];

  const viewLabels: Record<View, string> = {
    [View.SPECTRUM]: 'The Spectrum',
    [View.DASHBOARD]: 'Home',
    [View.CHAT]: 'RabbitChat',
    [View.WORLD]: 'HopHub',
    [View.MEETINGS]: 'HopMeets',
    [View.CORE]: 'HopSpaces — Private Hub',
    [View.ARCADE]: 'GameHub Engine',
    [View.PROFILE]: 'Digital ID',
    [View.SETTINGS]: 'System Config',
    [View.AI_TOOLS]: 'AI Agent Studio',
    [View.AUTH]: 'Authentication' // Added missing entry
  };

  return (
    <div className={`flex h-screen bg-[#050819] overflow-hidden text-white italic selection:bg-[#53C8FF]/30`}>
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-24'} bg-[#080C22] flex flex-col transition-all duration-500 border-r border-white/5 relative z-20 shadow-[20px_0_60px_rgba(0,0,0,0.5)]`}>
        <button 
          className="p-4 flex items-center gap-3 h-20 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-all overflow-hidden w-full text-left" 
          onClick={() => onNavigate(View.DASHBOARD)}
          aria-label="Go to Dashboard"
        >
            <CloudHopLogo size={36} variant="neon" className="gpu-accelerated shrink-0" />
            {isSidebarOpen && <span className="font-black text-2xl tracking-tighter animate-fade-in italic uppercase">CloudHop</span>}
        </button>

        <nav className="flex-1 px-4 mt-8 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                aria-label={`Navigate to ${item.label}`}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-[#1A2348] text-[#53C8FF] shadow-[0_8px_20px_rgba(0,0,0,0.4)] ring-1 ring-[#53C8FF]/20' 
                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform duration-500 ${isActive ? 'text-[#53C8FF] scale-110' : 'group-hover:scale-110'}`} />
                {isSidebarOpen && <span className="font-black uppercase tracking-[0.2em] text-[10px] whitespace-nowrap animate-fade-in italic">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
           <div className={`p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-3 ${!isSidebarOpen && 'p-2 hidden md:flex'}`}>
              <div className="text-[8px] font-black uppercase tracking-widest text-white/80 italic">Cloud Core</div>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#3DD68C] animate-pulse"></div>
                 {isSidebarOpen && <span className="text-[8px] font-black uppercase tracking-widest text-[#3DD68C] italic">Optimized</span>}
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[#050819]">
        <header className="h-20 shrink-0 bg-[#080C22]/60 backdrop-blur-2xl flex items-center justify-between px-8 border-b border-white/5 z-10">
          <div className="flex items-center gap-6">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-xl transition-all text-white/80 hover:text-white" aria-label="Toggle Sidebar">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#53C8FF] italic">{viewLabels[currentView]}</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-3 hover:bg-white/5 pl-1 py-1 pr-3 rounded-full transition-all border border-transparent hover:border-white/10" aria-label="Open profile menu">
                <img src={user?.avatar} className="w-10 h-10 rounded-[16px] bg-white/10 border border-white/10 shadow-lg gpu-accelerated" alt={`Avatar of ${user?.name}`}/>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-black leading-none mb-1 italic">{user?.name}</div>
                  <div className="text-[8px] text-[#53C8FF] font-black uppercase tracking-widest leading-none opacity-60 italic">Lvl {user?.level}</div>
                </div>
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-4 w-64 bg-[#10233A] border border-[#1E3A5F] rounded-[24px] shadow-2xl p-2 z-50 animate-fade-in not-italic overflow-hidden italic">
                  <button onClick={() => {onNavigate(View.PROFILE); setShowProfileMenu(false);}} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all italic">My ID</button>
                  <button onClick={() => {onNavigate(View.SETTINGS); setShowProfileMenu(false);}} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all italic">Setup</button>
                  <hr className="my-2 border-white/5" />
                  <button onClick={() => {onLogout(); setShowProfileMenu(false);}} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-red-400 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all italic">Exit</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          <div className="flex-1 p-4 md:p-8 lg:p-12 optimize-render">{children}</div>
        </main>
      </div>
      
      {/* Notifications */}
      <div className="fixed top-6 right-6 z-[200] space-y-4 w-80 pointer-events-none">
         {notifications.map(n => (
           <div key={n.id} className="bg-[#1A2348] border border-[#53C8FF]/40 px-6 py-4 rounded-2xl shadow-2xl animate-fade-in flex items-center gap-4 italic pointer-events-auto">
              <div className="w-8 h-8 bg-[#53C8FF] text-[#0A0F1F] rounded-lg flex items-center justify-center font-black">!</div>
              <span className="text-xs font-bold uppercase tracking-wider">{n.text}</span>
           </div>
         ))}
      </div>

      {/* Global AI Assistant */}
      <AIAssistant currentView={currentView} />
    </div>
  );
};

export default Layout;