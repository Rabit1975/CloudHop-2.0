
import React, { useState, useEffect, useRef } from 'react';
import { Icons, CloudHopLogo } from '../constants';
import Billing from './Billing';

const Settings: React.FC = () => {
  const [tab, setTab] = useState('General');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [mirrorVideo, setMirrorVideo] = useState(true);
  const [hd, setHd] = useState(true);
  const [inputLevel, setInputLevel] = useState(0);
  const [isTestingMic, setIsTestingMic] = useState(false);

  const menu = [
    { id: 'General', icon: '⚙️' },
    { id: 'Video', icon: '🎥' },
    { id: 'Audio', icon: '🔊' },
    { id: 'Billing', icon: '💳' },
    { id: 'Accessibility', icon: '♿' },
  ];

  useEffect(() => {
    let interval: any;
    if (isTestingMic) {
      interval = setInterval(() => {
        setInputLevel(Math.random() * 80 + 10);
      }, 100);
    } else {
      setInputLevel(0);
    }
    return () => clearInterval(interval);
  }, [isTestingMic]);

  const toggleCamera = async () => {
    if (isCameraOn) {
      if (stream) stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraOn(false);
    } else {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(newStream);
        setIsCameraOn(true);
      } catch (err) {
        alert("Camera permission required.");
      }
    }
  };

  useEffect(() => {
    if (videoRef.current && stream && tab === 'Video') {
      videoRef.current.srcObject = stream;
    }
  }, [stream, tab]);

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row bg-[#0E1430] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl min-h-[700px] animate-fade-in italic">
      {/* Settings Navigation */}
      <div className="w-full md:w-72 bg-[#080C22] p-4 flex flex-row md:flex-col gap-1 border-r border-white/5">
        <div className="hidden md:flex items-center gap-3 px-6 py-8 mb-4 border-b border-white/5">
           <CloudHopLogo size={28} variant="neon" />
           <h3 className="text-xl font-black italic tracking-tighter text-[#53C8FF]">SETUP</h3>
        </div>
        {menu.map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all italic ${
              tab === item.id 
                ? 'bg-[#1A2348] text-[#53C8FF] border border-[#53C8FF]/20 shadow-lg shadow-[#53C8FF]/5' 
                : 'text-white/30 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-xl opacity-70">{item.icon}</span>
            {item.id}
          </button>
        ))}
      </div>

      {/* Settings Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-12 bg-[#0E1430] relative">
        <div className="mb-12 border-b border-white/5 pb-8">
          <h2 className="text-4xl font-black mb-2 uppercase italic tracking-tighter">{tab}</h2>
          <p className="text-white/30 text-base font-medium italic">Calibration and workspace preferences.</p>
        </div>
        
        {tab === 'General' && (
          <div className="space-y-12 animate-fade-in">
            <SettingGroup title="Preferences">
               <SettingItem title="Color Mode" desc="Deep Space (Dark) is your default environment.">
                  <select className="bg-[#050819] border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase italic w-64 text-[#53C8FF]">
                    <option>Deep Space (Dark)</option>
                    <option>High Contrast</option>
                  </select>
               </SettingItem>
               <SettingItem title="Sync Across Devices" desc="Keep your cloud setup consistent everywhere.">
                  <Toggle active />
               </SettingItem>
            </SettingGroup>
          </div>
        )}

        {tab === 'Video' && (
          <div className="space-y-12 animate-fade-in">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Live Lens Preview</h4>
              <div className="relative aspect-video w-full max-w-xl bg-black rounded-[40px] overflow-hidden border-4 border-white/5 shadow-2xl group">
                 <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-transform duration-700 ${mirrorVideo ? 'scaleX(-1)' : ''}`} />
                 {!isCameraOn && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080C22] space-y-4">
                      <CloudHopLogo size={64} variant="neon" className="opacity-10 animate-pulse" />
                      <button onClick={toggleCamera} className="px-8 py-3 bg-[#53C8FF] text-[#0A0F1F] rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl italic hover:scale-105 transition-all">Enable Optics</button>
                   </div>
                 )}
              </div>
            </div>
            <SettingGroup title="Optics Config">
               <SettingItem title="Mirror Video" desc="Flips your local camera preview.">
                  <Toggle active={mirrorVideo} onToggle={() => setMirrorVideo(!mirrorVideo)} />
               </SettingItem>
               <SettingItem title="High Definition" desc="Enable 4K/1080p resolution where supported.">
                  <Toggle active={hd} onToggle={() => setHd(!hd)} />
               </SettingItem>
            </SettingGroup>
          </div>
        )}

        {tab === 'Audio' && (
          <div className="space-y-12 animate-fade-in">
            <SettingGroup title="Device Calibration">
               <div className="flex items-center justify-between gap-6 p-8 bg-[#050819] rounded-[32px] border border-white/5">
                  <div className="flex-1 space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">Microphone Activity</label>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex gap-1 px-0.5 items-center">
                       {Array.from({length: 20}).map((_, i) => (
                         <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-100 ${inputLevel > (i*5) ? 'bg-[#53C8FF]' : 'bg-white/5'}`}></div>
                       ))}
                    </div>
                  </div>
                  <button onClick={() => setIsTestingMic(!isTestingMic)} className={`px-10 py-6 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all italic border ${isTestingMic ? 'bg-[#53C8FF] text-[#0A0F1F] border-[#53C8FF]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    {isTestingMic ? 'Syncing...' : 'Test Mic'}
                  </button>
               </div>
               <SettingItem title="Echo Cancellation" desc="Suppresses background noise automatically.">
                  <Toggle active />
               </SettingItem>
            </SettingGroup>
          </div>
        )}

        {tab === 'Billing' && (
          <div className="animate-fade-in">
             <Billing />
          </div>
        )}

        {tab === 'Accessibility' && (
           <div className="space-y-12 animate-fade-in text-center py-20">
              <Icons.AI className="w-16 h-16 mx-auto text-white/10 mb-6" />
              <p className="text-white/30 italic font-black uppercase tracking-widest">Enhanced Accessibility Tools coming soon.</p>
           </div>
        )}
      </div>
    </div>
  );
};

const SettingGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-8">
    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#53C8FF] pb-4 border-b border-white/5 italic">{title}</h3>
    <div className="space-y-10">{children}</div>
  </div>
);

const SettingItem: React.FC<{ title: string; desc?: string; children: React.ReactNode }> = ({ title, desc, children }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 group">
    <div className="max-w-xl text-left">
      <h4 className="text-lg font-black text-white italic group-hover:text-[#53C8FF] transition-colors uppercase tracking-tight">{title}</h4>
      {desc && <p className="text-sm text-white/30 mt-1 italic font-medium leading-relaxed">{desc}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const Toggle: React.FC<{ active?: boolean; onToggle?: () => void }> = ({ active: initial = false, onToggle }) => {
  const [active, setActive] = useState(initial);
  const handleToggle = () => {
    setActive(!active);
    if (onToggle) onToggle();
  };
  return (
    <button onClick={handleToggle} className={`w-14 h-7 rounded-full transition-all relative flex items-center px-1.5 ${active ? 'bg-[#53C8FF]' : 'bg-[#1B2D45]'}`}>
      <span className={`w-4.5 h-4.5 bg-white rounded-full transition-all shadow-xl ${active ? 'translate-x-7' : 'translate-x-0'}`}></span>
    </button>
  );
};

export default Settings;
