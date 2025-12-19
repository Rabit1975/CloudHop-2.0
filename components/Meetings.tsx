
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { CloudHopLogo } from '../constants';

// Helper for Base64 encoding as per Gemini instructions
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const Meetings: React.FC = () => {
  const [tab, setTab] = useState<'manage' | 'instant'>('manage');
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [activeSidePanel, setActiveSidePanel] = useState<'ai' | 'chat' | 'effects' | 'settings' | null>(null);
  
  // Advanced Meeting States
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [videoFilter, setVideoFilter] = useState<'none' | 'blur' | 'grayscale' | 'sepia' | 'invert'>('none');
  const [activeFX, setActiveFX] = useState<string | null>(null);

  // Resolution & Bandwidth
  const [resolution, setResolution] = useState<'720p' | '1080p' | '4K'>('1080p');
  const [bandwidth, setBandwidth] = useState<'Low' | 'Balanced' | 'High' | 'Auto'>('Auto');
  const [aiCaptionsEnabled, setAiCaptionsEnabled] = useState(true);

  // Cinematic Framing & Hardware Zoom Engine
  const [videoZoom, setVideoZoom] = useState(1.0);
  const [zoomRange, setZoomRange] = useState({ min: 1, max: 3 });
  const [hasHardwareZoom, setHasHardwareZoom] = useState(false);
  const [videoFit, setVideoFit] = useState<'cover' | 'contain'>('cover');
  const [videoOffsetY, setVideoOffsetY] = useState(0); 
  const [videoOffsetX, setVideoOffsetX] = useState(0); 

  // Device Management
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedMic, setSelectedMic] = useState<string>('');
  const [showDeviceMenu, setShowDeviceMenu] = useState<'audio' | 'video' | null>(null);

  const [mirrorVideo, setMirrorVideo] = useState(true);

  // Transcription
  const [liveTranscript, setLiveTranscript] = useState<string[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const participants = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: `p-${i}`,
      name: i === 0 ? 'Matthew (Me)' : `Cloud Hopper ${i + 1}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=User${i}`
    }));
  }, []);

  const getDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      setDevices(allDevices);
      const videoDevs = allDevices.filter(d => d.kind === 'videoinput');
      const audioDevs = allDevices.filter(d => d.kind === 'audioinput');
      if (videoDevs.length > 0 && !selectedCamera) setSelectedCamera(videoDevs[0].deviceId);
      if (audioDevs.length > 0 && !selectedMic) setSelectedMic(audioDevs[0].deviceId);
    } catch (err) {
      console.error("Device error:", err);
    }
  };

  const startMeeting = async () => {
    setIsRequestingPermission(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true,
        audio: selectedMic ? { deviceId: { exact: selectedMic } } : true
      });
      streamRef.current = stream;
      
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = (track as any).getCapabilities?.() || {};
        if (capabilities.zoom) {
          setHasHardwareZoom(true);
          setZoomRange({ min: capabilities.zoom.min, max: capabilities.zoom.max });
          // Set initial zoom to min to avoid the "too zoomed in" feel on start
          setVideoZoom(capabilities.zoom.min);
        }
      }

      setIsMeetingActive(true);
      if (aiCaptionsEnabled) initLiveTranscription(stream);
      getDevices();
    } catch (err) {
      alert("Hardware access required for CloudHop.");
    } finally {
      setIsRequestingPermission(false);
    }
  };

  // Sync zoom state with track constraints
  useEffect(() => {
    const updateZoom = async () => {
      if (hasHardwareZoom && streamRef.current) {
        const track = streamRef.current.getVideoTracks()[0];
        try {
          await track.applyConstraints({ 
             advanced: [{ zoom: videoZoom }] as any 
          });
        } catch (e) {
          console.error("Hardware zoom failed:", e);
        }
      }
    };
    updateZoom();
  }, [videoZoom, hasHardwareZoom]);

  const applyPreset = (preset: 'wide' | 'medium' | 'closeup') => {
    switch (preset) {
      case 'wide':
        setVideoZoom(zoomRange.min);
        setVideoOffsetY(0);
        setVideoOffsetX(0);
        setVideoFit('cover');
        break;
      case 'medium':
        setVideoZoom(zoomRange.min + (zoomRange.max - zoomRange.min) * 0.25);
        setVideoOffsetY(-5);
        setVideoFit('cover');
        break;
      case 'closeup':
        setVideoZoom(zoomRange.min + (zoomRange.max - zoomRange.min) * 0.6);
        setVideoOffsetY(-10);
        setVideoFit('cover');
        break;
    }
  };

  const initLiveTranscription = async (stream: MediaStream) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    audioContextRef.current = audioContext;

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          const source = audioContext.createMediaStreamSource(stream);
          const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
            const base64Data = encode(new Uint8Array(int16.buffer));
            sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' } }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(audioContext.destination);
        },
        onmessage: async (msg: LiveServerMessage) => {
          if (msg.serverContent?.inputTranscription) {
            setLiveTranscript(prev => [...prev, msg.serverContent!.inputTranscription!.text]);
          }
        },
      },
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
      }
    });
  };

  useEffect(() => {
    if (isMeetingActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isMeetingActive, isVideoOff]);

  const endMeeting = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setIsMeetingActive(false);
    setLiveTranscript([]);
    setVideoZoom(1.0);
    setHasHardwareZoom(false);
  };

  if (isRequestingPermission) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#050819]/95 backdrop-blur-3xl flex flex-col items-center justify-center animate-fade-in p-8 text-center italic">
        <div className="max-w-md space-y-8">
           <CloudHopLogo size={96} variant="neon" className="mx-auto animate-pulse" />
           <h2 className="text-3xl font-black uppercase tracking-tighter italic">Initializing Hardware</h2>
           <p className="text-white/40 text-sm font-medium leading-relaxed italic">CloudHop is preparing your high-fidelity stream...</p>
        </div>
      </div>
    );
  }

  if (isMeetingActive) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#050819] flex animate-fade-in italic select-none">
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 pointer-events-none">
            <div className="flex items-center gap-3 pointer-events-auto">
              <CloudHopLogo size={28} variant="neon" />
              <div className="bg-[#0E1430]/80 backdrop-blur-xl border border-white/5 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="flex h-1.5 w-1.5 rounded-full bg-[#3DD68C] animate-pulse"></span>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Active</span>
              </div>
              <div className="hidden sm:flex bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 items-center gap-2 text-[8px] font-black uppercase tracking-widest">
                 <span className="text-[#53C8FF]">🔒 AES-256</span>
                 <span className="text-white/20">|</span>
                 <span>00:14:23</span>
              </div>
            </div>
            <button onClick={endMeeting} className="pointer-events-auto px-5 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 shadow-lg shadow-red-900/20 transition-all active:scale-95">End Meeting</button>
          </div>

          {/* Main Stage */}
          <div className="flex-1 relative bg-black flex flex-col items-center justify-center overflow-hidden p-4 pt-20 pb-20">
             <div className="w-full h-full relative z-10 flex flex-col md:flex-row gap-4 overflow-hidden">
                <div className="flex-1 relative rounded-[28px] overflow-hidden border border-white/10 bg-[#080C22] shadow-[0_0_60px_rgba(0,0,0,0.8)]">
                   <div className="w-full h-full overflow-hidden flex items-center justify-center relative z-10">
                      {!isVideoOff ? (
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted={isMuted}
                          style={{ 
                            objectFit: videoFit, 
                            transform: `${!hasHardwareZoom ? `scale(${videoZoom})` : ''} translate(${videoOffsetX}%, ${videoOffsetY}%) ${mirrorVideo ? 'scaleX(-1)' : ''}`,
                            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                          }}
                          className={`w-full h-full transition-all duration-700 
                            ${videoFilter === 'blur' ? 'blur-2xl' : 
                              videoFilter === 'grayscale' ? 'grayscale' : 
                              videoFilter === 'sepia' ? 'sepia contrast-125' : 
                              videoFilter === 'invert' ? 'invert' : ''}`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#080C22] to-[#0A0F1F]">
                           <div className="text-center space-y-4">
                             <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                               <CloudHopLogo size={64} variant="monochrome" className="opacity-10" />
                             </div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Camera Disabled</p>
                           </div>
                        </div>
                      )}
                   </div>
                   
                   <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 z-20">
                     <span className="text-[10px] font-black text-white uppercase tracking-widest">Matthew</span>
                     {isHandRaised && <span className="text-sm animate-bounce">✋</span>}
                     {isMuted && <span className="text-[8px] font-black text-red-500 uppercase ml-2 tracking-tighter">Muted</span>}
                   </div>

                   {aiCaptionsEnabled && liveTranscript.length > 0 && (
                     <div className="absolute bottom-16 left-1/2 -translate-x-1/2 max-w-lg w-full px-6 py-3 bg-black/80 backdrop-blur-2xl rounded-2xl border border-white/10 text-center text-[11px] font-medium text-[#53C8FF] animate-fade-in shadow-2xl z-20">
                        {liveTranscript[liveTranscript.length - 1]}
                     </div>
                   )}
                </div>

                {/* Participant Grid (Scrollable) */}
                <div className="hidden lg:flex flex-col gap-3 w-48 overflow-y-auto custom-scrollbar pr-2">
                   {participants.slice(1).map((p) => (
                     <div key={p.id} className="relative aspect-video rounded-2xl border border-white/5 bg-[#0A0F1F] flex items-center justify-center overflow-hidden shrink-0 group">
                        <img src={p.avatar} className="w-10 h-10 rounded-full border border-white/10 group-hover:scale-110 transition-transform" alt="" />
                        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded-lg text-[7px] font-black uppercase text-white/60">{p.name}</div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     </div>
                   ))}
                   <div className="aspect-video rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-[8px] font-black text-white/10 uppercase tracking-widest cursor-pointer hover:bg-white/5 transition-all">
                      + Add Squad
                   </div>
                </div>
             </div>
          </div>

          {/* Controls Dock - Floating centered */}
          <div className="absolute bottom-0 left-0 right-0 pb-6 flex justify-center z-50 pointer-events-none">
             <div className="bg-[#0E1430]/90 backdrop-blur-3xl border border-white/10 rounded-[32px] p-1.5 flex items-center gap-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.7)] pointer-events-auto">
                <div className="relative group/control">
                  <ControlButton onClick={() => setIsMuted(!isMuted)} active={!isMuted} icon={<span className="text-xl">{isMuted ? '🔇' : '🎙️'}</span>} label="Mic" />
                  <button onClick={() => setShowDeviceMenu(showDeviceMenu === 'audio' ? null : 'audio')} className="absolute -top-1 -right-1 bg-[#53C8FF] text-[#0A0F1F] w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-black hover:scale-110 transition-all border-2 border-[#0E1430]">▴</button>
                  {showDeviceMenu === 'audio' && (
                    <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 bg-[#0E1430] border border-white/10 rounded-2xl p-4 shadow-2xl animate-fade-in italic">
                       <h5 className="text-[10px] font-black uppercase tracking-widest text-[#53C8FF] mb-3">Audio Source</h5>
                       <select value={selectedMic} onChange={(e) => setSelectedMic(e.target.value)} className="w-full bg-[#050819] border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold mb-2 italic focus:border-[#53C8FF] outline-none">
                          {devices.filter(d => d.kind === 'audioinput').map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Default Microphone'}</option>)}
                       </select>
                       <div className="h-1 bg-white/5 rounded-full overflow-hidden mt-4">
                          <div className="h-full bg-green-500 w-[60%] animate-pulse"></div>
                       </div>
                    </div>
                  )}
                </div>

                <div className="relative group/control">
                  <ControlButton onClick={() => setIsVideoOff(!isVideoOff)} active={!isVideoOff} icon={<span className="text-xl">{isVideoOff ? '🚫' : '🎥'}</span>} label="Cam" />
                  <button onClick={() => setShowDeviceMenu(showDeviceMenu === 'video' ? null : 'video')} className="absolute -top-1 -right-1 bg-[#53C8FF] text-[#0A0F1F] w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-black hover:scale-110 transition-all border-2 border-[#0E1430]">▴</button>
                  {showDeviceMenu === 'video' && (
                    <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 bg-[#0E1430] border border-white/10 rounded-2xl p-4 shadow-2xl animate-fade-in italic">
                       <h5 className="text-[10px] font-black uppercase tracking-widest text-[#53C8FF] mb-3">Video Source</h5>
                       <select value={selectedCamera} onChange={(e) => setSelectedCamera(e.target.value)} className="w-full bg-[#050819] border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold mb-2 italic focus:border-[#53C8FF] outline-none">
                          {devices.filter(d => d.kind === 'videoinput').map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Default Camera'}</option>)}
                       </select>
                    </div>
                  )}
                </div>

                <div className="w-[1px] h-8 bg-white/5 mx-1"></div>
                
                <ControlButton onClick={() => setIsHandRaised(!isHandRaised)} active={isHandRaised} icon={<span className="text-xl">✋</span>} label="Raise" />
                <ControlButton onClick={() => setActiveSidePanel(activeSidePanel === 'effects' ? null : 'effects')} active={activeSidePanel === 'effects'} icon={<span className="text-xl">✨</span>} label="FX" />
                <ControlButton onClick={() => setActiveSidePanel(activeSidePanel === 'ai' ? null : 'ai')} active={activeSidePanel === 'ai'} icon={<span className="text-xl">🧠</span>} label="AI" />
                <ControlButton onClick={() => setActiveSidePanel(activeSidePanel === 'settings' ? null : 'settings')} active={activeSidePanel === 'settings'} icon={<span className="text-xl">⚙️</span>} label="Setup" />
             </div>
          </div>
        </div>

        {/* Side Panels - Updated for Settings/FX/AI */}
        {activeSidePanel && (
          <div className="w-80 bg-[#080C22]/98 backdrop-blur-3xl border-l border-white/10 flex flex-col animate-slide-in h-screen z-[100] italic shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#050819]">
              <div className="flex items-center gap-3">
                <CloudHopLogo size={20} variant="neon" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#53C8FF]">{activeSidePanel} Engine</h4>
              </div>
              <button onClick={() => setActiveSidePanel(null)} className="text-white/20 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
              {activeSidePanel === 'settings' && (
                <div className="space-y-10 animate-fade-in">
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-[#53C8FF] pb-2 border-b border-white/5">Framing Engine</h5>
                    <div className="space-y-6 bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-white/20 italic">Presets</label>
                           <div className="grid grid-cols-1 gap-2">
                              <button onClick={() => applyPreset('wide')} className="py-3 rounded-xl text-[9px] font-black uppercase border border-white/5 bg-[#050819] hover:border-[#53C8FF] hover:bg-[#53C8FF]/5 transition-all italic">Wide Angle</button>
                              <button onClick={() => applyPreset('medium')} className="py-3 rounded-xl text-[9px] font-black uppercase border border-white/5 bg-[#050819] hover:border-[#53C8FF] hover:bg-[#53C8FF]/5 transition-all italic">Mid Frame</button>
                              <button onClick={() => applyPreset('closeup')} className="py-3 rounded-xl text-[9px] font-black uppercase border border-white/5 bg-[#050819] hover:border-[#53C8FF] hover:bg-[#53C8FF]/5 transition-all italic">Close-Up</button>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <div className="flex justify-between text-[9px] font-black uppercase text-white/20 italic">Manual Zoom <span>{videoZoom.toFixed(1)}x</span></div>
                           <input 
                              type="range" 
                              min={zoomRange.min} 
                              max={zoomRange.max} 
                              step="0.1" 
                              value={videoZoom} 
                              onChange={(e) => setVideoZoom(parseFloat(e.target.value))} 
                              className="w-full h-1.5 bg-[#050819] rounded-full appearance-none accent-[#53C8FF]" 
                           />
                           <p className="text-[7px] font-black text-white/10 uppercase tracking-widest text-center mt-2">Hardware-Accelerated Zoom Enabled</p>
                        </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-[#53C8FF] pb-2 border-b border-white/5">Streaming Quality</h5>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <span className="text-[10px] font-black uppercase text-white/40 italic">Resolution</span>
                          <select value={resolution} onChange={(e) => setResolution(e.target.value as any)} className="bg-[#050819] border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold italic text-[#53C8FF] outline-none">
                             <option value="720p">720p</option>
                             <option value="1080p">1080p</option>
                             <option value="4K">4K Ultra</option>
                          </select>
                       </div>
                       <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <span className="text-[10px] font-black uppercase text-white/40 italic">Mirror Video</span>
                          <Toggle active={mirrorVideo} onToggle={() => setMirrorVideo(!mirrorVideo)} />
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSidePanel === 'effects' && (
                <div className="space-y-8 animate-fade-in italic">
                   <div className="space-y-4">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-[#53C8FF] pb-2 border-b border-white/5">Visual Filters</h5>
                      <div className="grid grid-cols-2 gap-3">
                         {(['none', 'blur', 'grayscale', 'sepia', 'invert'] as const).map(f => (
                           <button 
                             key={f} 
                             onClick={() => setVideoFilter(f)}
                             className={`py-3 rounded-xl text-[9px] font-black uppercase border transition-all ${videoFilter === f ? 'border-[#53C8FF] bg-[#53C8FF]/5 text-[#53C8FF]' : 'border-white/5 bg-white/5 text-white/30 hover:text-white'}`}
                           >
                             {f}
                           </button>
                         ))}
                      </div>
                   </div>
                   <div className="space-y-4">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-[#53C8FF] pb-2 border-b border-white/5">Cinematic FX</h5>
                      <div className="grid grid-cols-1 gap-2">
                         <button className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all">
                            <span className="text-[10px] font-black uppercase">Low Light Mode</span>
                            <span className="text-[8px] bg-[#53C8FF] text-black px-1.5 py-0.5 rounded font-black">AI</span>
                         </button>
                         <button className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all opacity-40">
                            <span className="text-[10px] font-black uppercase">Background Removal</span>
                            <span className="text-[8px] bg-white/20 text-white/40 px-1.5 py-0.5 rounded font-black">PRO</span>
                         </button>
                      </div>
                   </div>
                </div>
              )}

              {activeSidePanel === 'ai' && (
                <div className="h-full flex flex-col space-y-6 animate-fade-in italic">
                  <div className="p-4 bg-[#53C8FF]/5 border border-[#53C8FF]/20 rounded-2xl shadow-xl">
                    <p className="text-[9px] font-black text-[#53C8FF] uppercase tracking-widest mb-2 flex items-center gap-2 italic">
                      <span className="w-2 h-2 bg-[#53C8FF] rounded-full animate-pulse"></span> Intelligent Capture
                    </p>
                    <p className="text-[10px] text-white/60 italic leading-relaxed">Gemini 2.5 is transcribing and indexing live audio for searchability and summaries.</p>
                  </div>
                  <div className="flex-1 bg-[#050819] border border-white/5 rounded-2xl p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3">
                     {liveTranscript.length === 0 ? (
                       <div className="h-full flex flex-col items-center justify-center text-center opacity-10 italic">
                          <span className="text-3xl mb-3">🎙️</span>
                          <span className="text-[10px] font-black uppercase tracking-widest italic">Monitoring Audio...</span>
                       </div>
                     ) : (
                       liveTranscript.map((line, idx) => (
                         <div key={idx} className="text-[11px] text-white/80 leading-relaxed border-l-2 border-[#53C8FF]/40 pl-3 py-1 bg-white/5 rounded-r-lg animate-slide-in italic">
                            {line}
                         </div>
                       ))
                     )}
                  </div>
                  <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-[#53C8FF] transition-all italic">Generate Live Summary</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 italic">
      <div className="flex justify-center">
        <div className="bg-[#0E1430] p-1.5 rounded-2xl flex border border-white/5 shadow-2xl">
          <button onClick={() => setTab('manage')} className={`px-12 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'manage' ? 'bg-[#53C8FF] text-[#0A0F1F] shadow-lg shadow-[#53C8FF]/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>Manage</button>
          <button onClick={() => setTab('instant')} className={`px-12 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'instant' ? 'bg-[#53C8FF] text-[#0A0F1F] shadow-lg shadow-[#53C8FF]/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>Instant</button>
        </div>
      </div>

      {tab === 'manage' ? (
        <div className="grid gap-4 animate-fade-in">
          {[
            { title: 'CloudHop Architecture Sync', time: 'Today, 2:00 PM', date: '20' },
            { title: 'Project Q4 Planning', time: 'Tomorrow, 11:00 AM', date: '21' }
          ].map((mtg, i) => (
            <div key={i} className="bg-[#0E1430] border border-white/5 rounded-[32px] p-8 flex items-center justify-between hover:border-[#53C8FF]/40 transition-all group shadow-2xl">
              <div className="flex gap-8 items-center">
                <div className="w-16 h-16 rounded-2xl bg-[#53C8FF]/10 flex flex-col items-center justify-center text-[#53C8FF] group-hover:bg-[#53C8FF] group-hover:text-[#0A0F1F] transition-all border border-[#53C8FF]/20">
                  <span className="text-[10px] font-black uppercase opacity-60">NOV</span>
                  <span className="text-2xl font-black italic leading-none">{mtg.date}</span>
                </div>
                <div>
                  <h4 className="font-black text-xl text-white group-hover:text-[#53C8FF] transition-all uppercase tracking-tighter italic">{mtg.title}</h4>
                  <div className="text-[11px] text-white/30 font-black uppercase tracking-widest mt-1 italic">{mtg.time}</div>
                </div>
              </div>
              <button onClick={startMeeting} className="px-10 py-4 bg-[#53C8FF]/10 text-[#53C8FF] border border-[#53C8FF]/30 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#53C8FF] hover:text-[#0A0F1F] transition-all italic">Start Session</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-xl mx-auto bg-[#0E1430] border border-white/5 rounded-[48px] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden group animate-fade-in text-center italic">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <CloudHopLogo size={120} variant="neon" />
          </div>
          <CloudHopLogo size={80} variant="neon" className="mx-auto mb-8 drop-shadow-[0_0_20px_rgba(83,200,255,0.4)]" />
          <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Instant Huddle</h3>
          <p className="text-white/30 text-sm font-medium mb-10 italic">Start a secure 4K session with one click.</p>
          <button onClick={startMeeting} className="w-full py-6 bg-[#53C8FF] text-[#0A0F1F] text-lg font-black uppercase tracking-[0.3em] rounded-3xl hover:shadow-[0_20px_40px_rgba(83,200,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all italic">Hop In</button>
        </div>
      )}
    </div>
  );
};

const ControlButton: React.FC<{ icon: React.ReactNode, label: string, onClick?: () => void, active?: boolean }> = ({ icon, label, onClick, active }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 p-2 min-w-[56px] rounded-2xl transition-all ${active ? 'bg-[#53C8FF] text-[#0A0F1F] shadow-lg shadow-[#53C8FF]/20 scale-105' : 'text-white/30 hover:bg-white/5 hover:text-white'}`}>
    <div className="transition-transform duration-300">{icon}</div>
    <span className={`text-[7px] font-black uppercase tracking-widest ${active ? 'text-[#0A0F1F]/60' : 'text-white/20'} italic`}>{label}</span>
  </button>
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
      className={`w-12 h-6 rounded-full transition-all relative flex items-center px-1 ${active ? 'bg-[#53C8FF]' : 'bg-[#050819] border border-white/10'}`}
    >
      <span className={`w-4 h-4 bg-white rounded-full transition-all shadow-md ${active ? 'translate-x-6' : 'translate-x-0'}`}></span>
    </button>
  );
};

export default Meetings;
