
import React, { useState, useEffect, useRef } from 'react';
import { Icons, CloudHopLogo } from '../constants';

const Settings: React.FC = () => {
  const [tab, setTab] = useState('General');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // States for requested settings
  const [resolution, setResolution] = useState('1080p');
  const [bandwidth, setBandwidth] = useState('Auto');
  const [customDomain, setCustomDomain] = useState('');
  const [noiseRemoval, setNoiseRemoval] = useState('Auto');
  const [mirrorVideo, setMirrorVideo] = useState(true);

  const menu = [
    { id: 'General', icon: '⚙️' },
    { id: 'Domain & Identity', icon: '🌐' },
    { id: 'Video & Effects', icon: '🎥' },
    { id: 'Audio', icon: '🔊' },
    { id: 'Meetings', icon: '👥' },
    { id: 'Privacy', icon: '🔒' },
    { id: 'Advanced', icon: '⚡' },
  ];

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
    if (videoRef.current && stream && tab === 'Video & Effects') {
      videoRef.current.srcObject = stream;
    }
  }, [stream, tab]);

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row bg-[#0E1430] border border-white/5 rounded-[24px] overflow-hidden shadow-2xl h-[750px] animate-fade-in italic">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-[#080C22] p-4 flex flex-row md:flex-col gap-1 overflow-x-auto custom-scrollbar border-r border-white/5">
        <div className="hidden md:flex items-center gap-3 px-4 py-6 mb-4">
           <CloudHopLogo size={24} variant="neon" />
           <h3 className="text-xl font-black italic tracking-tighter text-[#53C8FF]">SETUP</h3>
        </div>
        {menu.map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              tab === item.id 
                ? 'bg-[#1A2348] text-[#53C8FF] shadow-lg shadow-[#53C8FF]/10' 
                : 'text-white/40 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-lg opacity-70">{item.icon}</span>
            {item.id}
          </button>
        ))}
      </div>

      {/* Main Settings Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-[#0E1430] relative">
        <div className="mb-10">
          <h2 className="text-3xl font-black mb-2 uppercase italic tracking-tighter">{tab}</h2>
          <p className="text-white/30 text-sm font-medium italic">Configure your CloudHop workspace architecture.</p>
        </div>
        
        {tab === 'General' && (
          <div className="space-y-10 animate-fade-in">
            <SettingGroup title="Appearance Settings">
               <SettingItem title="Interface Mode" desc="Adjust the global contrast of the CloudHop UI.">
                  <select className="bg-[#0D1A2A] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none w-48 text-white font-black uppercase tracking-widest italic">
                    <option>Deep Dark</option>
                    <option>High Contrast</option>
                    <option>Cloud Light</option>
                  </select>
               </SettingItem>
               <SettingItem title="Font Rendering" desc="Optimized for high-resolution displays.">
                  <Toggle active />
               </SettingItem>
            </SettingGroup>
          </div>
        )}

        {tab === 'Video & Effects' && (
          <div className="space-y-10 animate-fade-in">
            <div className="relative aspect-video w-full max-w-xl bg-black rounded-3xl overflow-hidden border border-white/5 mb-8">
               <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${mirrorVideo ? 'scaleX(-1)' : ''}`} />
               {!isCameraOn && <div className="absolute inset-0 flex items-center justify-center text-white/20 italic text-xs font-black uppercase tracking-widest">Camera Off</div>}
            </div>
            <SettingGroup title="Camera Configuration">
               <SettingItem title="Hardware Device" desc="Select your primary broadcast camera.">
                  <button onClick={toggleCamera} className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all italic">
                     {isCameraOn ? 'Stop Preview' : 'Start Preview'}
                  </button>
               </SettingItem>
               <SettingItem title="Mirror My Video" desc="Flips your video feed horizontally.">
                  <Toggle active={mirrorVideo} onToggle={() => setMirrorVideo(!mirrorVideo)} />
               </SettingItem>
               <SettingItem title="Touch-Up Intensity" desc="Softens video feed for professional clarity.">
                  <input type="range" className="w-48 accent-[#53C8FF]" />
               </SettingItem>
            </SettingGroup>
          </div>
        )}

        {tab === 'Audio' && (
          <div className="space-y-10 animate-fade-in">
            <SettingGroup title="Input & Output">
               <SettingItem title="Microphone Device" desc="Select your active audio input source.">
                  <select className="bg-[#0D1A2A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold italic w-64">
                    <option>System Default (MacBook Pro)</option>
                    <option>USB Studio Mic</option>
                  </select>
               </SettingItem>
               <SettingItem title="Noise Suppression" desc="Advanced Gemini-powered background filtering.">
                  <select value={noiseRemoval} onChange={(e) => setNoiseRemoval(e.target.value)} className="bg-[#0D1A2A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold italic w-48">
                    <option value="Auto">Auto (Smart)</option>
                    <option value="Low">Low</option>
                    <option value="High">Maximum</option>
                  </select>
               </SettingItem>
               <SettingItem title="Output Gain" desc="Adjust speaker volume for meetings.">
                  <input type="range" className="w-48 accent-[#53C8FF]" />
               </SettingItem>
            </SettingGroup>
          </div>
        )}

        {tab === 'Privacy' && (
          <div className="space-y-10 animate-fade-in">
            <SettingGroup title="Security Standards">
               <SettingItem title="End-to-End Encryption" desc="Mandatory for all 1:1 and Team Huddles.">
                  <span className="text-[10px] font-black text-[#3DD68C] uppercase tracking-widest bg-[#3DD68C]/10 px-3 py-1.5 rounded-lg border border-[#3DD68C]/20 italic">Active</span>
               </SettingItem>
               <SettingItem title="Search Visibility" desc="Allow workspace members to find you via email.">
                  <Toggle active />
               </SettingItem>
               <SettingItem title="AI Training Participation" desc="Allow anonymous data for localized model tuning.">
                  <Toggle />
               </SettingItem>
            </SettingGroup>
          </div>
        )}

        {tab === 'Advanced' && (
          <div className="space-y-10 animate-fade-in">
            <SettingGroup title="Developer Controls">
               <SettingItem title="Experimental Flags" desc="Access pre-release cinematic framing modes.">
                  <button className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-[#53C8FF] transition-all italic">Enable Beta</button>
               </SettingItem>
               <SettingItem title="Cache Management" desc="Clear local workspace data to improve speed.">
                  <button className="px-6 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all italic">Purge Cache</button>
               </SettingItem>
            </SettingGroup>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-2">
               <h5 className="text-[10px] font-black uppercase tracking-widest text-white/30">Network Diagnostics</h5>
               <div className="flex justify-between text-xs italic font-medium">
                  <span>Ping</span>
                  <span className="text-[#3DD68C]">12ms</span>
               </div>
               <div className="flex justify-between text-xs italic font-medium">
                  <span>Packet Loss</span>
                  <span className="text-white/40">0%</span>
               </div>
            </div>
          </div>
        )}

        {tab === 'Domain & Identity' && (
          <div className="space-y-10">
             <SettingGroup title="Custom Domain Mapping">
                <div className="p-6 bg-[#1A2348]/40 border border-[#53C8FF]/20 rounded-3xl space-y-6">
                   <p className="text-xs text-white/70 italic leading-relaxed">
                     Point your own domain to the CloudHop edge network. Requires a <strong>Pro</strong> or <strong>Teams</strong> subscription.
                   </p>
                   <div className="space-y-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Your Domain Name</label>
                         <div className="flex gap-3">
                            <input 
                               type="text" 
                               placeholder="e.g. hq.mycompany.com" 
                               value={customDomain}
                               onChange={(e) => setCustomDomain(e.target.value)}
                               className="flex-1 bg-[#050819] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold italic focus:border-[#53C8FF] transition-all"
                            />
                            <button className="px-6 bg-[#53C8FF] text-[#0A0F1F] rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 italic">Verify</button>
                         </div>
                      </div>
                   </div>
                   <div className="pt-6 border-t border-white/5 space-y-4">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-[#53C8FF]">DNS Instructions</h5>
                      <div className="grid grid-cols-1 gap-3">
                         <div className="bg-[#050819] p-4 rounded-xl flex items-center justify-between">
                            <div>
                               <div className="text-[9px] font-black text-white/30 uppercase">Record Type</div>
                               <div className="text-xs font-black italic">CNAME</div>
                            </div>
                            <div className="text-right">
                               <div className="text-[9px] font-black text-white/30 uppercase">Value</div>
                               <div className="text-xs font-black text-[#53C8FF] italic">edge.cloudhop.app</div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </SettingGroup>
          </div>
        )}

        {tab === 'Meetings' && (
          <div className="space-y-10">
            <SettingGroup title="Video Stream Engine">
               <SettingItem title="Default Resolution" desc="Auto-select quality for all outgoing streams.">
                  <select 
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="bg-[#0D1A2A] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none w-48 text-white font-black italic uppercase tracking-widest"
                  >
                    <option value="720p">720p (HD)</option>
                    <option value="1080p">1080p (FHD)</option>
                    <option value="4K">4K (UHD)</option>
                  </select>
               </SettingItem>
               <SettingItem title="Network Optimization" desc="Smart bitrate adjustment based on connection strength.">
                  <select 
                    value={bandwidth}
                    onChange={(e) => setBandwidth(e.target.value)}
                    className="bg-[#0D1A2A] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none w-48 text-white font-black italic uppercase tracking-widest"
                  >
                    <option value="Low">Low (Data Saver)</option>
                    <option value="Balanced">Balanced</option>
                    <option value="High">High (Broadcaster)</option>
                    <option value="Auto">Auto (Smart)</option>
                  </select>
               </SettingItem>
            </SettingGroup>
          </div>
        )}

        <div className="h-32"></div>
      </div>

      <div className="absolute bottom-10 right-10 z-20">
         <button className="px-12 py-5 bg-[#53C8FF] text-[#0A0F1F] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all italic">
            Save Changes
         </button>
      </div>
    </div>
  );
};

const SettingGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-6">
    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#53C8FF] pb-4 border-b border-white/5 italic">{title}</h3>
    <div className="space-y-8">{children}</div>
  </div>
);

const SettingItem: React.FC<{ title: string; desc?: string; children: React.ReactNode }> = ({ title, desc, children }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div className="max-w-md">
      <h4 className="text-sm font-bold text-white italic">{title}</h4>
      {desc && <p className="text-xs text-white/30 mt-1 italic font-medium">{desc}</p>}
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
    <button 
      onClick={handleToggle}
      className={`w-12 h-6 rounded-full transition-all relative flex items-center px-1 ${active ? 'bg-[#53C8FF]' : 'bg-white/10'}`}
    >
      <span className={`w-4 h-4 bg-white rounded-full transition-all shadow-md ${active ? 'translate-x-6' : 'translate-x-0'}`}></span>
    </button>
  );
};

export default Settings;
