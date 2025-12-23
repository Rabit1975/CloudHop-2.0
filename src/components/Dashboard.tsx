import React, { useState, useEffect, useRef } from 'react';
import XPBar from './XPBar';
import { Icons, CloudHopLogo } from '../constants';
import { View, ActivityItem, Meeting, StreamType } from '../types';
import { useSpace } from '../contexts/SpaceContext';
import { api } from '../services/mockApi';
import { useWebSocket } from '../hooks/useWebSocket';

interface DashboardProps {
  onNavigate: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { currentSpace } = useSpace();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activeStream, setActiveStream] = useState<{type: StreamType, link?: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // WebSocket Connection
  const { events } = useWebSocket('me', currentSpace.id);

  // Fetch Initial Data
  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        const [feedData, streamData] = await Promise.all([
            api.getSpaceFeed(currentSpace.id),
            api.getSpaceStream(currentSpace.id)
        ]);
        setActivities(feedData);
        setActiveStream(streamData);
        setIsLoading(false);
    };
    loadData();
  }, [currentSpace.id]);

  // Handle Real-time Events
  useEffect(() => {
      if (events.length > 0) {
          const lastEvent = events[events.length - 1];
          if (lastEvent.type === 'feed_update') {
              setActivities(prev => [lastEvent.payload, ...prev]);
          }
      }
  }, [events]);

  const renderStreamPlayer = () => {
      if (!activeStream || !activeStream.link) return null;

      let embedUrl = '';
      if (activeStream.type === 'youtube') {
          embedUrl = `https://www.youtube.com/embed/${activeStream.link}?autoplay=1&mute=1&controls=0`;
      } else if (activeStream.type === 'twitch') {
          embedUrl = `https://player.twitch.tv/?channel=${activeStream.link}&parent=${window.location.hostname}`;
      } else if (activeStream.type === 'vimeo') {
          embedUrl = `https://player.vimeo.com/video/${activeStream.link}?autoplay=1&muted=1&background=1`;
      }

      return (
          <div className="w-full aspect-video bg-black rounded-[24px] overflow-hidden shadow-2xl relative group mb-8 border border-white/10 animate-scale-in">
              <iframe 
                  src={embedUrl}
                  className="w-full h-full pointer-events-none group-hover:pointer-events-auto transition-all"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
              ></iframe>
              <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF4D4D] animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white shadow-black drop-shadow-md">Live Stream</span>
              </div>
          </div>
      );
  };

  return (
    <div className="space-y-10 italic">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 animate-fade-in">
        <div className="flex items-center gap-6">
          <CloudHopLogo size={48} variant="main" />
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-1 uppercase italic tracking-tighter">{currentSpace.name}</h1>
            <p className="text-white/30 font-medium text-lg italic">{currentSpace.id === 'global-space' ? 'Global Dashboard' : 'Active Space Session'}</p>
          </div>
        </div>
        <div className="w-full lg:w-96 bg-[#0E1430] border border-[#1E3A5F] p-6 rounded-[24px] shadow-2xl relative group overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-20"><Icons.AI className="w-4 h-4" /></div>
           <XPBar xp={1250} level={5} nextLevelXP={2000} />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Feed & Stream */}
        <div className="lg:col-span-2 space-y-8">
            {/* Live Stream Player (Conditional) */}
            {activeStream && renderStreamPlayer()}

            <Card title="Live Activity Stream">
                {isLoading ? (
                    <div className="text-center py-10 text-white/20 font-black uppercase tracking-widest">Connecting to Mesh...</div>
                ) : (
                    <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                    {activities.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="text-4xl mb-4">🦗</div>
                            <p className="text-white/20 font-black uppercase tracking-widest">Quiet in here...</p>
                        </div>
                    ) : (
                        activities.map((item) => (
                            <div 
                            key={item.id} 
                            className="w-full text-left flex gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all cursor-default border border-transparent hover:border-white/5 animate-fade-in"
                            >
                            <img src={item.user.avatar} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10" alt="" />
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-0.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-white">{item.user.name}</span>
                                    {item.user.role && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/50 uppercase font-black tracking-wider">{item.user.role}</span>}
                                </div>
                                <span className="text-[9px] text-white/20 font-black uppercase">{item.timestamp}</span>
                                </div>
                                <p className="text-xs text-white/80 font-medium italic leading-relaxed">
                                    {item.type === 'join' && <span className="text-[#3DD68C]">→ </span>}
                                    {item.type === 'reaction' && <span className="text-[#FF4D4D]">♥ </span>}
                                    {item.content}
                                </p>
                            </div>
                            </div>
                        ))
                    )}
                    </div>
                )}
            </Card>
        </div>

        {/* Right Column: Schedule & AI */}
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
                  <button className="px-6 py-2.5 bg-[#53C8FF]/10 text-[#53C8FF] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#53C8FF] hover:text-[#0A0F1F] transition-all italic" aria-label={`Join meeting: ${mtg.title}`}>
                    Hop In
                  </button>
                </div>
              ))}
              {meetings.length === 0 && <p className="text-xs text-white/20 font-bold py-10 text-center uppercase tracking-widest italic">No pending meetings.</p>}
            </div>
          </Card>

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
                  <p className="text-[10px] text-white/70 leading-relaxed font-medium">Gemini suggests a quick huddle with Sarah regarding the logo concepts to finalize the Q1 sprint.</p>
               </div>
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
