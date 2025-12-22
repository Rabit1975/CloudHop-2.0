import React, { useState, useEffect } from 'react';
import XPBar from './XPBar';
import { Icons, CloudHopLogo } from '../constants';
import { View, ActivityItem, Meeting } from '../types';

interface DashboardProps {
  onNavigate: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  // Simulate fetching real-time, context-aware data
  useEffect(() => {
    // In a real app, this would be an API call fetching data based on user.id and currentSpace.id
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'message',
        user: { name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', role: 'Admin' },
        content: 'uploaded the final Q1 Design Assets.',
        timestamp: '2m ago',
        channel: 'Design Team'
      },
      {
        id: '2',
        type: 'event',
        user: { name: 'Mike Ross', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', role: 'Member' },
        content: 'scheduled "Client Onboarding" for tomorrow.',
        timestamp: '15m ago',
        channel: 'General'
      },
      {
        id: '3',
        type: 'join',
        user: { name: 'Emily Blunt', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', role: 'Guest' },
        content: 'joined the "Core Architecture" channel.',
        timestamp: '1h ago',
        channel: 'System Logs'
      },
    ];

    const mockMeetings: Meeting[] = [
      { id: 'm1', title: 'Q1 Sprint Planning', time: '10:00 AM', participants: ['Sarah', 'Mike'], type: 'video' },
      { id: 'm2', title: 'Design Review: Logo', time: '1:30 PM', participants: ['Sarah', 'Emily'], type: 'video' }
    ];

    setActivities(mockActivities);
    setMeetings(mockMeetings);
  }, []);

  return (
    <div className="space-y-10 italic">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 animate-fade-in">
        <div className="flex items-center gap-6">
          <CloudHopLogo size={48} variant="main" />
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-1 uppercase italic tracking-tighter">Welcome back, Matthew.</h1>
            <p className="text-white/30 font-medium text-lg italic">Your cloud workspace is optimized and secure.</p>
          </div>
        </div>
        <div className="w-full lg:w-96 bg-[#0E1430] border border-[#1E3A5F] p-6 rounded-[24px] shadow-2xl relative group overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-20"><Icons.AI className="w-4 h-4" /></div>
           <XPBar xp={1250} level={5} nextLevelXP={2000} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Activity */}
        <div className="space-y-8">
          <Card title="Live Activity Stream">
            <div className="space-y-4">
              {activities.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => onNavigate(View.CHAT)}
                  className="w-full text-left flex gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all cursor-pointer group border border-transparent hover:border-white/5 shadow-inner"
                >
                  <img src={item.user.avatar} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10" alt="" />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-[#53C8FF] transition-colors">{item.user.name}</span>
                        {item.user.role && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/50 uppercase font-black tracking-wider">{item.user.role}</span>}
                      </div>
                      <span className="text-[9px] text-white/20 font-black uppercase">{item.timestamp}</span>
                    </div>
                    <div className="text-[9px] text-[#53C8FF] font-black uppercase tracking-[0.2em] mb-1 italic">{item.channel}</div>
                    <p className="text-xs text-white/40 truncate font-medium italic">{item.content}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Center Column: Today's Schedule */}
        <div className="space-y-8">
          <Card title="Space Schedule">
            <div className="space-y-3">
              {meetings.map((mtg) => (
                <div key={mtg.id} className="flex items-center justify-between p-5 bg-[#0D1A2A] rounded-2xl border border-[#1E3A5F] group hover:border-[#53C8FF]/50 transition-all shadow-lg">
                  <div>
                    <div className="text-sm font-black tracking-tight group-hover:text-[#53C8FF] transition-all uppercase">{mtg.title}</div>
                    <div className="flex items-center gap-3 mt-1">
                       <div className="text-[10px] text-white/40 font-black uppercase tracking-widest italic">{mtg.time}</div>
                       <div className="w-1 h-1 rounded-full bg-white/20"></div>
                       <div className="text-[9px] text-white/20 font-medium">{mtg.participants.length} Attending</div>
                    </div>
                  </div>
                  <button className="px-6 py-2.5 bg-[#53C8FF]/10 text-[#53C8FF] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#53C8FF] hover:text-[#0A0F1F] transition-all italic">
                    Hop In
                  </button>
                </div>
              ))}
              {meetings.length === 0 && <p className="text-xs text-white/20 font-bold py-10 text-center uppercase tracking-widest italic">No pending meetings.</p>}
            </div>
          </Card>
        </div>

        {/* Right Column: AI Insights */}
        <div className="space-y-8">
          <Card title="Cloud Insights">
            <div className="space-y-4">
               <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 italic">
                  <div className="text-2xl font-black text-[#53C8FF]">⚡</div>
                  <div className="flex-1">
                     <div className="text-xs font-bold text-white uppercase tracking-widest">Workspace Health</div>
                     <div className="text-[9px] text-[#3DD68C] uppercase tracking-widest font-black">Optimal Performance</div>
                  </div>
               </div>
               <div className="p-5 bg-[#1A2348]/30 rounded-2xl border border-[#53C8FF]/10 italic">
                  <p className="text-[10px] text-white/50 leading-relaxed font-medium">Gemini suggests a quick huddle with Sarah regarding the logo concepts to finalize the Q1 sprint.</p>
               </div>
            </div>
          </Card>

          <Card title="Quick Hub">
            <div className="grid grid-cols-2 gap-3 italic">
              <ShortcutLink icon={<Icons.Chat className="w-5 h-5"/>} label="Chat Hub" />
              <ShortcutLink icon={<Icons.Meetings className="w-5 h-5"/>} label="Join Meet" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-[#0E1430] border border-white/5 rounded-[28px] p-7 shadow-2xl relative overflow-hidden group">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#53C8FF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#53C8FF] mb-8 opacity-60 italic">{title}</h3>
    {children}
  </div>
);

const ShortcutLink: React.FC<{ icon: React.ReactNode, label: string }> = ({ icon, label }) => (
  <button className="flex flex-col items-center justify-center gap-4 p-6 rounded-[24px] bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-[#53C8FF]/30 group shadow-lg">
    <div className="text-[#53C8FF]/40 group-hover:text-[#53C8FF] transition-all group-hover:scale-110 duration-500">{icon}</div>
    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 group-hover:text-[#53C8FF] transition-all whitespace-nowrap italic">{label}</span>
  </button>
);

export default Dashboard;