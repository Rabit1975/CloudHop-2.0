
import React, { useState, useEffect } from 'react';
import { View, User } from '../types';
import { CloudHopLogo, Icons, DOMAIN } from '../constants';
import { useWebSocket } from '../hooks/useWebSocket';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onNavigate: (view: View) => void;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, user, onLogout }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const { events, clearEvents } = useWebSocket(user?.id || "guest");

  useEffect(() => {
    if (events.length > 0) {
      const latest = events[events.length - 1];
      const newNotif = {
        id: Date.now(),
        text: latest.type === 'xp_award' ? `+${latest.amount} XP Earned!` : `Unlocked: ${latest.badge}`,
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
    { id: View.CHAT, label: 'Chat', icon: Icons.Chat },
    { id: View.MEETINGS, label: 'Meetings', icon: Icons.Meetings },
    { id: View.COMMUNITIES, label: 'Communities', icon: Icons.Communities },
    { id: View.BILLING, label: 'Billing', icon: Icons.Billing },
    { id: View.SETTINGS, label: 'Settings', icon: Icons.Settings },
  ];

  const viewLabels: Record<View, string> = {
    [View.LANDING]: 'Landing',
    [View.DASHBOARD]: 'Home',
    [View.CHAT]: 'Chat',
    [View.MEETINGS]: 'Meetings',
    [View.COMMUNITIES]: 'Communities',
    [View.PROFILE]: 'Profile',
    [View.SETTINGS]: 'Settings',
    [View.BILLING]: 'Billing'
  };

  return (
    <div className="flex h-screen bg-[#050819] overflow-hidden text-white italic">
      {/* Notifications Layer */}
      <div className="fixed top-20 right-6 z-[100] space-y-3">
        {notifications.map(n => (
          <div key={n.id} className="bg-[#1A2348] border border-[#53C8FF]/40 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-slide-in overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#53C8FF]"></div>
            <div className="text-2xl">{n.type === 'xp_award' ? '⚡' : '🏆'}</div>
            <div className="text-sm font-black uppercase tracking-widest">{n.text}</div>
          </div>
        ))}
      </div>

      {/* Sidebar - Branding Placement 1 */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#080C22] flex flex-col transition-all duration-300 border-r border-white/5 relative z-20`}
      >
        <div className="p-4 flex items-center gap-3 h-20 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-all overflow-hidden" onClick={() => onNavigate(View.DASHBOARD)}>
            <CloudHopLogo size={36} variant="neon" />
            {isSidebarOpen && <span className="font-black text-2xl tracking-tighter">CloudHop</span>}
        </div>

        <nav className="flex-1 px-3 mt-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all group ${
                  isActive 
                    ? 'bg-[#1A2348] text-[#53C8FF] shadow-[0_4px_15px_rgba(83,200,255,0.15)]' 
                    : 'text-white/30 hover:bg-white/5 hover:text-white'
                }`}
              >
                {typeof Icon === 'function' ? <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#53C8FF]' : 'group-hover:scale-110 transition-transform'}`} /> : <span className="w-5 h-5 flex items-center justify-center">{Icon}</span>}
                {isSidebarOpen && <span className="font-black uppercase tracking-widest text-[10px] whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          {isSidebarOpen && (
             <div className="space-y-4">
                <div className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] text-center">
                   Enterprise Cloud Workspace
                </div>
                <div className="flex justify-center gap-4 text-white/30 text-[9px] font-black uppercase">
                   <a href={`https://support.${DOMAIN}`} className="hover:text-[#53C8FF] transition-colors">Support</a>
                   <a href={`https://${DOMAIN}/terms`} className="hover:text-[#53C8FF] transition-colors">Legal</a>
                </div>
             </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top App Bar - Branding Placement 2 */}
        <header className="h-16 shrink-0 bg-[#080C22]/80 backdrop-blur-xl flex items-center justify-between px-6 border-b border-white/5 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[#53C8FF] italic">
              {viewLabels[currentView]}
            </h2>
          </div>

          <div className="flex-1 max-w-lg mx-12 hidden md:block">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Secure Search..." 
                className="w-full bg-[#0D1A2A] border border-[#1E3A5F] rounded-2xl py-2 pl-10 pr-4 text-xs font-bold focus:outline-none focus:border-[#53C8FF] transition-all placeholder:text-[#A7B9D3]/40"
              />
              <svg className="w-4 h-4 absolute left-3.5 top-2.5 text-white/20 group-focus-within:text-[#53C8FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 hover:bg-white/5 pl-1 py-1 pr-3 rounded-full transition-colors border border-transparent hover:border-white/10"
              >
                <img src={user?.avatar} className="w-9 h-9 rounded-[14px] bg-white/10 border border-white/10" alt=""/>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-black leading-none mb-1">{user?.name}</div>
                  <div className="text-[10px] text-[#53C8FF] font-black uppercase tracking-wider leading-none opacity-60">PRO MEMBER</div>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-[#10233A] border border-[#1E3A5F] rounded-2xl shadow-2xl p-2 z-50 animate-fade-in not-italic">
                  <button onClick={() => {onNavigate(View.PROFILE); setShowProfileMenu(false);}} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 rounded-xl text-sm font-medium text-white/80">
                    <Icons.Profile className="w-4 h-4" /> Account
                  </button>
                  <button onClick={() => {onNavigate(View.SETTINGS); setShowProfileMenu(false);}} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 rounded-xl text-sm font-medium text-white/80">
                    <Icons.Settings className="w-4 h-4" /> Workspace Settings
                  </button>
                  <hr className="my-2 border-white/5" />
                  <button onClick={() => {onLogout(); setShowProfileMenu(false);}} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 text-red-400 rounded-xl text-sm font-bold">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          <div className="flex-1 p-6 lg:p-8">
            {children}
          </div>
          <footer className="h-10 bg-[#080C22] border-t border-white/5 flex items-center justify-between px-8 text-[8px] font-black uppercase tracking-[0.2em] text-white/20">
             <div className="flex items-center gap-4">
                <span>CloudHop © 2025</span>
                <span className="opacity-30">•</span>
                <span className="italic">Pro Tier Architecture</span>
             </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Layout;
