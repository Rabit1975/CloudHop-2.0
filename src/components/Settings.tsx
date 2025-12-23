
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
            <SettingGroup title="Appearance">
               <SettingItem title="Color Mode" desc="Change the background color of the CloudHop desktop app.">
                  <select className="bg-[#050819] border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase italic w-64 text-[#53C8FF]">
                    <option>Deep Space (Dark)</option>
                    <option>Light Mode</option>
                    <option>System Default</option>
                  </select>
               </SettingItem>
               <SettingItem title="Theme" desc="Change the accent color when using light mode.">
                  <select className="bg-[#050819] border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase italic w-64 text-[#53C8FF]">
                    <option>CloudHop Blue</option>
                    <option>Neon Green</option>
                    <option>Cyber Pink</option>
                  </select>
               </SettingItem>
               <SettingItem title="Emoji Skin Tone" desc="Change your default reaction skin tone.">
                  <div className="flex gap-2">
                     {['👋', '👋🏻', '👋🏼', '👋🏽', '👋🏾', '👋🏿'].map(e => (
                        <button key={e} className="text-xl hover:scale-125 transition-transform">{e}</button>
                     ))}
                  </div>
               </SettingItem>
            </SettingGroup>
            <SettingGroup title="System">
               <SettingItem title="Start CloudHop when I start Windows" desc="Launch automatically on startup.">
                  <Toggle active />
               </SettingItem>
               <SettingItem title="When closed, minimize window to notification area" desc="Keep CloudHop running in the background.">
                  <Toggle active />
               </SettingItem>
               <SettingItem title="Use dual monitors" desc="Show participants and content on separate screens.">
                  <Toggle />
               </SettingItem>
               <SettingItem title="Enter full screen automatically when starting or joining a meeting">
                  <Toggle />
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
            <SettingGroup title="Camera">
               <SettingItem title="Camera Source">
                  <select className="bg-[#050819] border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase italic w-64 text-[#53C8FF]">
                    <option>FaceTime HD Camera</option>
                    <option>OBS Virtual Camera</option>
                  </select>
               </SettingItem>
               <SettingItem title="Original Ratio" desc="Maintain aspect ratio.">
                  <Toggle />
               </SettingItem>
               <SettingItem title="HD Video" desc="Enable 1080p streaming.">
                  <Toggle active={hd} onToggle={() => setHd(!hd)} />
               </SettingItem>
               <SettingItem title="Mirror Video" desc="Flip your video preview.">
                  <Toggle active={mirrorVideo} onToggle={() => setMirrorVideo(!mirrorVideo)} />
               </SettingItem>
            </SettingGroup>
            <SettingGroup title="My Video">
               <SettingItem title="Touch up my appearance">
                  <div className="w-48"><input type="range" className="w-full accent-[#53C8FF]" /></div>
               </SettingItem>
               <SettingItem title="Adjust for low light">
                  <select className="bg-[#050819] border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase italic w-32 text-[#53C8FF]">
                    <option>Auto</option>
                    <option>Manual</option>
                  </select>
               </SettingItem>
               <SettingItem title="Always display participant names">
                  <Toggle active />
               </SettingItem>
               <SettingItem title="Stop my video when joining">
                  <Toggle />
               </SettingItem>
               <SettingItem title="Always show video preview dialog when joining">
                  <Toggle active />
               </SettingItem>
               <SettingItem title="Hide non-video participants">
                  <Toggle />
               </SettingItem>
            </SettingGroup>
          </div>
        )}

        {tab === 'Audio' && (
          <div className="space-y-12 animate-fade-in">
            <SettingGroup title="Speaker">
               <div className="flex gap-4">
                  <button className="px-6 py-3 bg-[#1A2348] border border-[#53C8FF]/20 text-[#53C8FF] rounded-xl text-xs font-bold uppercase tracking-wider">Test Speaker</button>
                  <select className="bg-[#050819] border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase italic w-64 text-[#53C8FF]">
                    <option>MacBook Pro Speakers</option>
                    <option>System Default</option>
                  </select>
               </div>
               <SettingItem title="Output Volume">
                  <input type="range" className="w-64 accent-[#53C8FF]" />
               </SettingItem>
            </SettingGroup>

            <SettingGroup title="Microphone">
               <div className="flex gap-4">
                  <button onClick={() => setIsTestingMic(!isTestingMic)} className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border ${isTestingMic ? 'bg-[#53C8FF] text-[#0A0F1F]' : 'bg-[#1A2348] border-[#53C8FF]/20 text-[#53C8FF]'}`}>
                    {isTestingMic ? 'Stop Test' : 'Test Mic'}
                  </button>
                  <select className="bg-[#050819] border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase italic w-64 text-[#53C8FF]">
                    <option>MacBook Pro Microphone</option>
                    <option>System Default</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">Input Level</div>
                  <div className="h-2 w-full max-w-md bg-white/5 rounded-full overflow-hidden flex gap-1 px-0.5 items-center">
                     {Array.from({length: 20}).map((_, i) => (
                       <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-100 ${inputLevel > (i*5) ? 'bg-[#53C8FF]' : 'bg-white/5'}`}></div>
                     ))}
                  </div>
               </div>
               <SettingItem title="Automatically adjust microphone volume">
                  <Toggle active />
               </SettingItem>
            </SettingGroup>

            <SettingGroup title="Audio Profile">
               <SettingItem title="Suppress background noise">
                  <div className="flex gap-2">
                     {['Auto', 'Low', 'Medium', 'High'].map(l => (
                        <button key={l} className="px-4 py-2 bg-[#1A2348] rounded-lg text-xs hover:bg-[#53C8FF] hover:text-[#0A0F1F] transition-colors">{l}</button>
                     ))}
                  </div>
               </SettingItem>
               <SettingItem title="Show in-meeting option to 'Enable Original Sound'">
                  <Toggle />
               </SettingItem>
               <SettingItem title="Echo Cancellation">
                  <Toggle active />
               </SettingItem>
            </SettingGroup>
          </div>
        )}

        {tab === 'Share Screen' && (
           <div className="space-y-12 animate-fade-in">
              <SettingGroup title="Window Size">
                 <SettingItem title="Window size when sharing screen">
                    <select className="bg-[#050819] border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase italic w-64 text-[#53C8FF]">
                       <option>Maintain current size</option>
                       <option>Enter fullscreen</option>
                       <option>Maximize window</option>
                    </select>
                 </SettingItem>
                 <SettingItem title="Scale to fit shared content">
                    <Toggle active />
                 </SettingItem>
                 <SettingItem title="See shared content in side-by-side mode">
                    <Toggle active />
                 </SettingItem>
              </SettingGroup>
              <SettingGroup title="When I Share">
                 <SettingItem title="Silence system notifications when sharing desktop">
                    <Toggle active />
                 </SettingItem>
                 <SettingItem title="Share applications">
                    <select className="bg-[#050819] border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase italic w-64 text-[#53C8FF]">
                       <option>Share individual windows</option>
                       <option>Share all windows from app</option>
                    </select>
                 </SettingItem>
              </SettingGroup>
           </div>
        )}

        {tab === 'Recording' && (
           <div className="space-y-12 animate-fade-in">
              <SettingGroup title="Local Recording">
                 <SettingItem title="Store recordings at:" desc="C:\Users\CloudHop\Documents\Zoom">
                    <button className="px-4 py-2 bg-[#1A2348] rounded text-xs text-[#53C8FF]">Change</button>
                 </SettingItem>
                 <SettingItem title="Choose a location for recorded files when the meeting ends">
                    <Toggle />
                 </SettingItem>
                 <SettingItem title="Record separate audio file for each participant">
                    <Toggle />
                 </SettingItem>
                 <SettingItem title="Optimize for 3rd party video editor">
                    <Toggle />
                 </SettingItem>
                 <SettingItem title="Add a timestamp to the recording">
                    <Toggle />
                 </SettingItem>
                 <SettingItem title="Record video during screen sharing">
                    <Toggle active />
                 </SettingItem>
              </SettingGroup>
           </div>
        )}

        {tab === 'Accessibility' && (
           <div className="space-y-12 animate-fade-in">
              <SettingGroup title="Captions">
                 <SettingItem title="Closed Caption Font Size">
                    <input type="range" min="12" max="32" className="w-48 accent-[#53C8FF]" />
                 </SettingItem>
                 <SettingItem title="Always show captions">
                    <Toggle />
                 </SettingItem>
              </SettingGroup>
              <SettingGroup title="Screen Reader">
                 <SettingItem title="Screen reader alerts">
                    <button className="text-[#53C8FF] text-sm underline">Manage Alerts</button>
                 </SettingItem>
              </SettingGroup>
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
