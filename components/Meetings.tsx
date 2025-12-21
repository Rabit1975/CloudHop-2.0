import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { CloudHopLogo, Icons } from '../constants';

const Meetings: React.FC = () => {
  const [tab, setTab] = useState<'manage' | 'instant'>('manage');
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [activeSidePanel, setActiveSidePanel] = useState<'ai' | 'chat' | 'effects' | 'settings' | null>(null);
  
  const [isChromePerformanceMode, setIsChromePerformanceMode] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);

  const [mirrorVideo, setMirrorVideo] = useState(true);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedMic, setSelectedMic] = useState<string>('');
  const [activeControlMenu, setActiveControlMenu] = useState<'mic' | 'cam' | null>(null);

  // Zoom State
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomCapabilities, setZoomCapabilities] = useState<{min: number, max: number, step: number} | null>(null);

  const [aiCaptionsEnabled, setAiCaptionsEnabled] = useState(true);
  const [liveTranscript, setLiveTranscript] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isComponentActiveRef = useRef(false);

  const participants = useMemo(() => [
    { id: 'p-0', name: 'Matthew (Me)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Matthew' },
    { id: 'p-1', name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { id: 'p-2', name: 'Mike Ross', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
    { id: 'p-3', name: 'Emily Blunt', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily' },
    { id: 'p-4', name: 'CloudBot 2.0', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=CloudBot' },
  ], []);

  useEffect(() => {
    isComponentActiveRef.current = isMeetingActive;
    if (!isMeetingActive) getDevices();
  }, [isMeetingActive]);

  const getDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      setDevices(allDevices);
      const videoDevs = allDevices.filter(d => d.kind === 'videoinput');
      const audioDevs = allDevices.filter(d => d.kind === 'audioinput');
      if (videoDevs.length > 0 && !selectedCamera) setSelectedCamera(videoDevs[0].deviceId);
      if (audioDevs.length > 0 && !selectedMic) setSelectedMic(audioDevs[0].deviceId);
    } catch (err) {
      console.error(err);
    }
  };

  const startMeeting = async () => {
    setIsRequestingPermission(true);
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      const constraints = {
        video: { 
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60 }
        },
        audio: { 
          deviceId: selectedMic ? { exact: selectedMic } : undefined,
          echoCancellation: true,
          noiseSuppression: true
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      if (capabilities.zoom) {
        setZoomCapabilities(capabilities.zoom);
        const settings = track.getSettings() as any;
        setZoomLevel(settings.zoom || capabilities.zoom.min);
      }

      setIsMeetingActive(true);
      if (aiCaptionsEnabled) initLiveTranscription(stream);
    } catch (err) {
      console.error(err);
      alert("Hardware access required.");
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleZoom = async (val: number) => {
    setZoomLevel(val);
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      try {
        await track.applyConstraints({ advanced: [{ zoom: val } as any] });
      } catch (e) {
        console.error("Zoom failed", e);
      }
    }
  };

  useEffect(() => {
    let stopRendering = false;
    const runWebCodecs = async () => {
      if (isMeetingActive && isChromePerformanceMode && canvasRef.current && streamRef.current && !isVideoOff) {
        const track = streamRef.current.getVideoTracks()[0];
        if (!track || !('MediaStreamTrackProcessor' in window)) return;
        const processor = new (window as any).MediaStreamTrackProcessor({ track });
        const reader = processor.readable.getReader();
        const ctx = canvasRef.current.getContext('2d', { desynchronized: true });
        while (!stopRendering && isComponentActiveRef.current && !isVideoOff) {
          const { done, value } = await reader.read();
          if (done) break;
          if (ctx && value && canvasRef.current) {
            if (canvasRef.current.width !== value.displayWidth || canvasRef.current.height !== value.displayHeight) {
                canvasRef.current.width = value.displayWidth;
                canvasRef.current.height = value.displayHeight;
            }
            ctx.drawImage(value, 0, 0);
            value.close();
          }
        }
        reader.releaseLock();
      }
    };
    runWebCodecs();
    return () => { stopRendering = true; };
  }, [isMeetingActive, isChromePerformanceMode, isVideoOff]);

  const initLiveTranscription = async (stream: MediaStream) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        // Add mandatory callbacks for SDK compliance
        callbacks: {
          onopen: () => console.log('Transcription live connected'),
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.inputTranscription) {
              setLiveTranscript(prev => [...prev.slice(-4), msg.serverContent!.inputTranscription!.text]);
            }
          },
          onerror: (e: ErrorEvent) => console.error('Transcription live error', e),
          onclose: (e: CloseEvent) => console.log('Transcription live closed', e),
        },
        config: { responseModalities: [Modality.AUDIO], inputAudioTranscription: {} }
      });
    } catch (e) { console.error(e); }
  };

  const endMeeting = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setIsMeetingActive(false);
    setLiveTranscript([]);
    setActiveControlMenu(null);
  };

  if (isMeetingActive) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#050819] flex animate-fade-in italic select-none" onClick={() => setActiveControlMenu(null)}>
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 pointer-events-none">
            <div className="flex items-center gap-3 pointer-events-auto">
              <CloudHopLogo size={28} variant="neon" />
              <div className="bg-[#0E1430]/80 backdrop-blur-xl border border-white/5 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="flex h-1.5 w-1.5 rounded-full bg-[#3DD68C] animate-pulse"></span>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/80 italic">Secure Stream Active</span>
              </div>
            </div>
            <button onClick={endMeeting} className="pointer-events-auto px-5 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 shadow-lg shadow-red-900/20 transition-all active:scale-95 italic">End Hop</button>
          </div>

          <div className="flex-1 relative bg-black flex flex-col items-center justify-center overflow-hidden p-4 pt-20 pb-24">
             <div className="w-full h-full relative z-10 flex flex-col md:flex-row gap-4 overflow-hidden max-w-[1400px]">
                <div className={`flex-1 relative rounded-[32px] overflow-hidden border border-white/10 bg-[#080C22] shadow-[0_0_80px_rgba(0,0,0,0.8)] ${isChromePerformanceMode ? 'ring-2 ring-[#53C8FF]/20' : ''}`}>
                   {!isVideoOff ? (
                     <canvas ref={canvasRef} className="w-full h-full object-cover" style={{ transform: mirrorVideo ? 'scaleX(-1)' : '' }} />
                   ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center bg-[#080C22]">
                        <CloudHopLogo size={100} variant="neon" className="opacity-10" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-6 italic">Optics Disconnected</p>
                     </div>
                   )}
                   <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-2xl px-5 py-2.5 rounded-2xl border border-white/10 z-20">
                     <span className="text-[10px] font-black text-white uppercase tracking-widest">Matthew (Me)</span>
                   </div>
                   {aiCaptionsEnabled && liveTranscript.length > 0 && (
                     <div className="absolute bottom-24 left-1/2 -translate-x-1/2 max-w-lg w-[90%] px-6 py-4 bg-black/80 backdrop-blur-3xl rounded-2xl border border-[#53C8FF]/20 text-center text-[11px] font-medium text-[#53C8FF] italic z-20">
                        {liveTranscript[liveTranscript.length - 1]}
                     </div>
                   )}
                </div>
                <div className="hidden lg:flex flex-col gap-3 w-52 overflow-y-auto custom-scrollbar pr-2">
                   {participants.slice(1).map((p) => (
                     <div key={p.id} className="relative aspect-video rounded-2xl border border-white/5 bg-[#0A0F1F] flex items-center justify-center overflow-hidden shrink-0 group">
                        <img src={p.avatar} className="w-12 h-12 rounded-full border border-white/10 group-hover:scale-110 transition-transform" alt="" />
                        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded-lg text-[7px] font-black uppercase text-white/60 tracking-widest">{p.name}</div>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 pb-8 flex justify-center z-50 pointer-events-none">
             <div className="bg-[#0E1430]/90 backdrop-blur-3xl border border-white/10 rounded-[36px] p-2 flex items-center gap-2 shadow-[0_30px_90px_rgba(0,0,0,0.8)] pointer-events-auto">
                <div className="relative">
                  <ControlButton 
                    onClick={() => setIsMuted(!isMuted)} 
                    active={!isMuted} 
                    danger={isMuted} 
                    icon={<span className="text-xl">{isMuted ? '🔇' : '🎙️'}</span>} 
                    label="Mic"
                    menuTrigger={true}
                    onMenuClick={(e) => { e.stopPropagation(); setActiveControlMenu(activeControlMenu === 'mic' ? null : 'mic'); }}
                  />
                  {activeControlMenu === 'mic' && (
                    <DeviceMenu items={devices.filter(d => d.kind === 'audioinput')} title="Microphone" onClose={() => setActiveControlMenu(null)} />
                  )}
                </div>
                <div className="relative">
                  <ControlButton 
                    onClick={() => setIsVideoOff(!isVideoOff)} 
                    active={!isVideoOff} 
                    danger={isVideoOff} 
                    icon={<span className="text-xl">{isVideoOff ? '🚫' : '🎥'}</span>} 
                    label="Cam"
                    menuTrigger={true}
                    onMenuClick={(e) => { e.stopPropagation(); setActiveControlMenu(activeControlMenu === 'cam' ? null : 'cam'); }}
                  />
                  {activeControlMenu === 'cam' && (
                    <DeviceMenu 
                      items={devices.filter(d => d.kind === 'videoinput')} 
                      title="Optics" 
                      onClose={() => setActiveControlMenu(null)}
                      extraContent={
                        zoomCapabilities && (
                          <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
                            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/40">
                              <span>Lens Zoom</span>
                              <span>{zoomLevel.toFixed(1)}x</span>
                            </div>
                            <input 
                              type="range" 
                              min={zoomCapabilities.min} 
                              max={zoomCapabilities.max} 
                              step={zoomCapabilities.step} 
                              value={zoomLevel} 
                              onChange={(e) => handleZoom(parseFloat(e.target.value))}
                              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#53C8FF]"
                            />
                          </div>
                        )
                      }
                    />
                  )}
                </div>
                <div className="w-[1px] h-10 bg-white/5 mx-2"></div>
                <ControlButton onClick={() => setIsHandRaised(!isHandRaised)} active={isHandRaised} icon={<span className="text-xl">✋</span>} label="Raise" />
                <ControlButton onClick={() => setActiveSidePanel(activeSidePanel === 'settings' ? null : 'settings')} active={activeSidePanel === 'settings'} icon={<span className="text-xl">⚙️</span>} label="Setup" />
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 italic animate-fade-in">
      <div className="flex justify-center">
        <div className="bg-[#0E1430] p-1.5 rounded-2xl flex border border-white/5 shadow-2xl">
          <button onClick={() => setTab('manage')} className={`px-12 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'manage' ? 'bg-[#53C8FF] text-[#0A0F1F] shadow-lg shadow-[#53C8FF]/20' : 'text-white/40 hover:text-white'}`}>Schedules</button>
          <button onClick={() => setTab('instant')} className={`px-12 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'instant' ? 'bg-[#53C8FF] text-[#0A0F1F] shadow-lg shadow-[#53C8FF]/20' : 'text-white/40 hover:text-white'}`}>Instant</button>
        </div>
      </div>

      {tab === 'manage' ? (
        <div className="grid gap-6">
          {[
            { title: 'CloudHop Architecture Sync', time: 'Today, 2:00 PM', date: '20' },
            { title: 'Project Q4 Planning', time: 'Tomorrow, 11:00 AM', date: '21' }
          ].map((mtg, i) => (
            <div key={i} className="bg-[#0E1430] border border-white/5 rounded-[40px] p-8 flex items-center justify-between hover:border-[#53C8FF]/40 transition-all group shadow-2xl overflow-hidden italic">
              <div className="flex gap-10 items-center">
                <div className="w-16 h-16 rounded-2xl bg-[#53C8FF]/10 flex flex-col items-center justify-center text-[#53C8FF] border border-[#53C8FF]/20 font-black">
                  <span className="text-[10px] uppercase opacity-60">NOV</span>
                  <span className="text-2xl leading-none">{mtg.date}</span>
                </div>
                <div>
                  <h4 className="font-black text-2xl text-white uppercase tracking-tighter italic">{mtg.title}</h4>
                  <div className="text-[11px] text-white/30 font-black uppercase tracking-widest mt-1">{mtg.time}</div>
                </div>
              </div>
              <button onClick={startMeeting} className="px-10 py-5 bg-[#53C8FF]/5 text-[#53C8FF] border border-[#53C8FF]/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#53C8FF] hover:text-[#0A0F1F] transition-all italic shadow-lg">Hop In</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-sm mx-auto bg-[#0E1430] border border-white/5 rounded-[48px] p-8 pb-10 shadow-[0_40px_120px_rgba(0,0,0,0.6)] relative overflow-hidden text-center italic animate-fade-in group">
          <div className="relative mb-6 pt-4">
             <CloudHopLogo size={60} variant="neon" className="mx-auto group-hover:scale-110 transition-transform duration-700" />
          </div>
          <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Instant Huddle</h3>
          <p className="text-white/30 text-[10px] font-medium mb-10 leading-relaxed px-4">Jump into a secure session.</p>
          <button onClick={startMeeting} className="w-full py-4 bg-[#53C8FF] text-[#0A0F1F] text-base font-black uppercase tracking-[0.2em] rounded-[24px] hover:shadow-[0_20px_60px_rgba(83,200,255,0.3)] hover:scale-[1.03] transition-all italic shadow-2xl shadow-[#53C8FF]/10">Hop In Now</button>
        </div>
      )}
    </div>
  );
};

const ControlButton: React.FC<{ icon: React.ReactNode, label: string, onClick?: () => void, active?: boolean, danger?: boolean, menuTrigger?: boolean, onMenuClick?: (e: React.MouseEvent) => void }> = ({ icon, label, onClick, active, danger, menuTrigger, onMenuClick }) => (
  <div className="flex flex-col items-center gap-1.5 group">
    <div className={`flex items-center rounded-2xl transition-all shadow-lg overflow-hidden border ${active ? (danger ? 'bg-red-600 text-white border-red-500' : 'bg-[#53C8FF] text-[#0A0F1F] border-[#53C8FF] scale-105') : 'text-white/30 bg-white/5 border-white/5 hover:bg-white/10 hover:text-white'}`}>
      <button onClick={onClick} className="p-2.5 px-4 flex items-center justify-center transition-all hover:brightness-110">
        {icon}
      </button>
      {menuTrigger && (
        <button onClick={onMenuClick} className={`p-2.5 px-2 border-l transition-all hover:brightness-110 ${active ? (danger ? 'border-white/20' : 'border-[#0A0F1F]/10') : 'border-white/5'}`}>
          <Icons.CaretUp className="w-4 h-4" />
        </button>
      )}
    </div>
    <span className={`text-[7px] font-black uppercase tracking-widest ${active ? (danger ? 'text-white/60' : 'text-[#0A0F1F]/60') : 'text-white/20'} italic`}>{label}</span>
  </div>
);

const DeviceMenu: React.FC<{ items: MediaDeviceInfo[], title: string, onClose: () => void, extraContent?: React.ReactNode }> = ({ items, title, onClose, extraContent }) => (
  <div className="absolute bottom-full mb-4 left-0 w-64 bg-[#0E1430] border border-white/10 rounded-2xl p-4 shadow-2xl animate-slide-in italic z-[200]">
     <div className="flex justify-between items-center mb-4 px-2">
        <h5 className="text-[10px] font-black uppercase tracking-widest text-[#53C8FF]">Select {title}</h5>
        <button onClick={onClose} className="text-white/20 hover:text-white">✕</button>
     </div>
     <div className="space-y-1">
        {items.length > 0 ? items.map(d => (
          <button key={d.deviceId} className="w-full text-left px-3 py-2.5 rounded-xl text-[10px] font-bold hover:bg-white/5 transition-all truncate italic border border-transparent hover:border-white/5">
            {d.label || `${title} Unit`}
          </button>
        )) : (
          <p className="px-3 py-2 text-[9px] text-white/30 font-bold italic">No devices detected.</p>
        )}
        {extraContent}
        <hr className="my-2 border-white/5" />
        <button className="w-full text-left px-3 py-2.5 rounded-xl text-[10px] font-black uppercase text-[#53C8FF] italic hover:bg-[#53C8FF]/5 transition-all">Setup & Calibration...</button>
     </div>
  </div>
);

export default Meetings;