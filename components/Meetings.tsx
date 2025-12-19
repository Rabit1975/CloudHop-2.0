
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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeSidePanel, setActiveSidePanel] = useState<'ai' | 'chat' | 'effects' | 'settings' | null>(null);
  
  // Advanced Meeting States
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [videoFilter, setVideoFilter] = useState<'none' | 'blur' | 'grayscale' | 'sepia' | 'invert'>('none');
  const [virtualBg, setVirtualBg] = useState<string | null>(null);

  // Resolution & Bandwidth (Previous Request Integration)
  const [resolution, setResolution] = useState<'720p' | '1080p' | '4K'>('1080p');
  const [bandwidth, setBandwidth] = useState<'Low' | 'Balanced' | 'High' | 'Auto'>('Auto');
  const [aiCaptionsEnabled, setAiCaptionsEnabled] = useState(true);

  // Cinematic Framing & Zoom Engine
  const [videoZoom, setVideoZoom] = useState(1.0);
  const [videoFit, setVideoFit] = useState<'cover' | 'contain'>('cover');
  const [videoOffsetY, setVideoOffsetY] = useState(0); // Vertical Tilt
  const [videoOffsetX, setVideoOffsetX] = useState(0); // Horizontal Pan

  // Device Management
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedMic, setSelectedMic] = useState<string>('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('');
  const [showDeviceMenu, setShowDeviceMenu] = useState<'audio' | 'video' | null>(null);

  // Audio Modes
  const [noiseRemoval, setNoiseRemoval] = useState<'Auto' | 'Low' | 'Medium' | 'High'>('Auto');
  const [originalSound, setOriginalSound] = useState(false);
  const [mirrorVideo, setMirrorVideo] = useState(true);

  // Transcription
  const [liveTranscript, setLiveTranscript] = useState<string[]>([]);
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

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
      setIsMeetingActive(true);
      if (aiCaptionsEnabled) initLiveTranscription(stream);
      getDevices();
    } catch (err) {
      alert("Hardware access required for CloudHop.");
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const applyPreset = (preset: 'wide' | 'medium' | 'closeup') => {
    switch (preset) {
      case 'wide':
        setVideoZoom(1.0);
        setVideoOffsetY(0);
        setVideoOffsetX(0);
        setVideoFit('contain');
        break;
      case 'medium':
        setVideoZoom(1.4);
        setVideoOffsetY(-5);
        setVideoFit('cover');
        break;
      case 'closeup':
        setVideoZoom(2.2);
        setVideoOffsetY(-15);
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
    liveSessionRef.current = sessionPromise;
  };

  useEffect(() => {
    if (isMeetingActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isMeetingActive]);

  const endMeeting = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setIsMeetingActive(false);
    setLiveTranscript([]);
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
      <div className="fixed inset-0 z-[100] bg-[#050819] flex animate-fade-in italic">
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Header - Logo Placement 1 */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 pointer-events-none">
            <div className="flex items-center gap-4 pointer-events-auto">
              <CloudHopLogo size={32} variant="neon" />
              <div className="bg-[#0E1430]/80 backdrop-blur-xl border border-white/5 px-4 py-2 rounded-2xl flex items-center gap-3">
                <span className="flex h-2 w-2 rounded-full bg-[#3DD68C] animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Active Meeting</span>
              </div>
            </div>
            <button onClick={endMeeting} className="pointer-events-auto px-6 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-red-500/20 transition-all">End Meeting</button>
          </div>

          {/* Main Stage */}
          <div className="flex-1 relative bg-black flex flex-col items-center justify-center overflow-hidden p-6 pt-24 pb-32">
             <div className="w-full h-full relative z-10 flex flex-col md:flex-row gap-4 overflow-hidden">
                <div className="flex-1 relative rounded-[32px] overflow-hidden border border-white/10 bg-[#080C22]/60 backdrop-blur-sm shadow-2xl">
                   {virtualBg && (
                      <div className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700" style={{ backgroundImage: `url(${virtualBg})` }} />
                   )}
                   <div className="w-full h-full overflow-hidden flex items-center justify-center relative z-10">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted={isMuted}
                        style={{ 
                          objectFit: videoFit, 
                          transform: `scale(${videoZoom}) translate(${videoOffsetX}%, ${videoOffsetY}%) ${mirrorVideo ? 'scaleX(-1)' : ''}`,
                          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                        className={`w-full h-full transition-all duration-700 
                          ${videoFilter === 'blur' ? 'blur-2xl' : 
                            videoFilter === 'grayscale' ? 'grayscale' : 
                            videoFilter === 'sepia' ? 'sepia contrast-125' : 
                            videoFilter === 'invert' ? 'invert' : ''}`}
                      />
                   </div>
                   
                   <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 z-20">
                     <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">Matthew (Me)</span>
                     {isHandRaised && <span className="text-sm animate-bounce">✋</span>}
                   </div>

                   {aiCaptionsEnabled && liveTranscript.length > 0 && (
                     <div className="absolute bottom-20 left-1/2 -translate-x-1/2 max-w-lg w-full px-6 py-3 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 text-center text-xs font-medium text-[#53C8FF] animate-fade-in shadow-2xl z-20">
                        {liveTranscript[liveTranscript.length - 1]}
                     </div>
                   )}
                </div>

                {/* Participant Grid */}
                <div className="hidden lg:grid grid-cols-1 gap-4 w-48 overflow-y-auto custom-scrollbar pr-2">
                   {participants.slice(1).map((p) => (
                     <div key={p.id} className="relative aspect-video rounded-2xl border border-white/5 bg-[#0A0F1F] flex items-center justify-center overflow-hidden shrink-0">
                        <img src={p.avatar} className="w-10 h-10 rounded-full border border-white/10" alt="" />
                        <div className="absolute bottom-1.5 left-1.5 bg-black/40 px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase text-white/30">{p.name}</div>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Controls Dock */}
          <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center z-50">
             <div className="bg-[#0E1430]/90 backdrop-blur-3xl border border-white/10 rounded-[40px] p-5 flex items-center gap-4 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
                <div className="relative">
                  <ControlButton onClick={() => setIsMuted(!isMuted)} active={!isMuted} icon={<span className="text-xl">{isMuted ? '🔇' : '🎙️'}</span>} label="Mic" />
                  <button onClick={() => setShowDeviceMenu(showDeviceMenu === 'audio' ? null : 'audio')} className="absolute -top-1 -right-1 bg-[#53C8FF] text-[#0A0F1F] p-1 rounded-full text-[10px] hover:scale-110 transition-all">▴</button>
                  {showDeviceMenu === 'audio' && (
                    <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 bg-[#0E1430] border border-white/10 rounded-2xl p-4 shadow-2xl animate-fade-in italic">
                       <h5 className="text-[9px] font-black uppercase tracking-widest text-[#53C8FF] mb-3">Audio Options</h5>
                       <select value={selectedMic} onChange={(e) => setSelectedMic(e.target.value)} className="w-full bg-[#050819] border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold mb-3 italic">
                          {devices.filter(d => d.kind === 'audioinput').map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Microphone'}</option>)}
                       </select>
                       <button className="w-full py-2 bg-white/5 rounded-xl text-[9px] font-black uppercase hover:bg-white/10 transition-all italic">Test Speaker</button>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <ControlButton onClick={() => setIsVideoOff(!isVideoOff)} active={!isVideoOff} icon={<span className="text-xl">{isVideoOff ? '🚫' : '🎥'}</span>} label="Video" />
                  <button onClick={() => setShowDeviceMenu(showDeviceMenu === 'video' ? null : 'video')} className="absolute -top-1 -right-1 bg-[#53C8FF] text-[#0A0F1F] p-1 rounded-full text-[10px] hover:scale-110 transition-all">▴</button>
                  {showDeviceMenu === 'video' && (
                    <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 bg-[#0E1430] border border-white/10 rounded-2xl p-4 shadow-2xl animate-fade-in italic">
                       <h5 className="text-[9px] font-black uppercase tracking-widest text-[#53C8FF] mb-3">Video Options</h5>
                       <select value={selectedCamera} onChange={(e) => setSelectedCamera(e.target.value)} className="w-full bg-[#050819] border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold mb-3 italic">
                          {devices.filter(d => d.kind === 'videoinput').map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Camera'}</option>)}
                       </select>
                       <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-white/60 mb-2 italic">
                         <input type="checkbox" checked={mirrorVideo} onChange={() => setMirrorVideo(!mirrorVideo)} className="accent-[#53C8FF]" /> Mirror Video
                       </label>
                    </div>
                  )}
                </div>

                <div className="w-px h-8 bg-white/5 mx-2"></div>
                <ControlButton onClick={() => setActiveSidePanel(activeSidePanel === 'effects' ? null : 'effects')} active={activeSidePanel === 'effects'} icon={<span className="text-xl">✨</span>} label="FX" />
                <ControlButton onClick={() => setActiveSidePanel(activeSidePanel === 'ai' ? null : 'ai')} active={activeSidePanel === 'ai'} icon={<span className="text-xl">🧠</span>} label="AI" />
                <ControlButton onClick={() => setActiveSidePanel(activeSidePanel === 'settings' ? null : 'settings')} active={activeSidePanel === 'settings'} icon={<span className="text-xl">⚙️</span>} label="Setup" />
             </div>
          </div>
        </div>

        {/* Side Panels - Logo Placement 2 */}
        {activeSidePanel && (
          <div className="w-80 bg-[#080C22]/98 backdrop-blur-3xl border-l border-white/5 flex flex-col animate-slide-in h-screen z-[100] italic">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#050819]">
              <div className="flex items-center gap-2">
                <CloudHopLogo size={18} variant="neon" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#53C8FF]">{activeSidePanel} Panel</h4>
              </div>
              <button onClick={() => setActiveSidePanel(null)} className="text-white/20 hover:text-white transition-colors">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {activeSidePanel === 'settings' && (
                <div className="space-y-10 animate-fade-in">
                  <div className="space-y-6">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-[#53C8FF] pb-2 border-b border-white/5">Cinematic Framing Engine</h5>
                    <div className="space-y-6 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-white/30 italic">Camera Presets</label>
                           <div className="grid grid-cols-1 gap-2">
                              <button onClick={() => applyPreset('wide')} className="py-2.5 rounded-xl text-[9px] font-black uppercase border border-white/10 bg-[#050819] hover:border-[#53C8FF] transition-all italic">Wide Shot (1.0x)</button>
                              <button onClick={() => applyPreset('medium')} className="py-2.5 rounded-xl text-[9px] font-black uppercase border border-white/10 bg-[#050819] hover:border-[#53C8FF] transition-all italic">Medium Shot (1.4x)</button>
                              <button onClick={() => applyPreset('closeup')} className="py-2.5 rounded-xl text-[9px] font-black uppercase border border-white/10 bg-[#050819] hover:border-[#53C8FF] transition-all italic">Close-up (2.2x)</button>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <div className="flex justify-between text-[9px] font-black uppercase text-white/30 italic">Zoom Level <span>{videoZoom.toFixed(1)}x</span></div>
                           <input type="range" min="0.1" max="3" step="0.1" value={videoZoom} onChange={(e) => setVideoZoom(parseFloat(e.target.value))} className="w-full accent-[#53C8FF]" />
                        </div>
                        
                        <div className="space-y-3">
                           <div className="flex justify-between text-[9px] font-black uppercase text-white/30 italic">Vertical Tilt <span>{videoOffsetY}%</span></div>
                           <input type="range" min="-100" max="100" step="1" value={videoOffsetY} onChange={(e) => setVideoOffsetY(parseInt(e.target.value))} className="w-full accent-[#53C8FF]" />
                        </div>

                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-white/30 italic">Framing Mode</label>
                           <div className="grid grid-cols-2 gap-2">
                              <button onClick={() => setVideoFit('cover')} className={`py-2 rounded-lg text-[9px] font-black uppercase border transition-all italic ${videoFit === 'cover' ? 'border-[#53C8FF] text-[#53C8FF] bg-[#53C8FF]/10' : 'border-white/5 text-white/20'}`}>Cover</button>
                              <button onClick={() => setVideoFit('contain')} className={`py-2 rounded-lg text-[9px] font-black uppercase border transition-all italic ${videoFit === 'contain' ? 'border-[#53C8FF] text-[#53C8FF] bg-[#53C8FF]/10' : 'border-white/5 text-white/20'}`}>Contain</button>
                           </div>
                        </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-[#53C8FF] pb-2 border-b border-white/5">Video Quality & Network</h5>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-white/60 italic">Resolution</span>
                          <select value={resolution} onChange={(e) => setResolution(e.target.value as any)} className="bg-[#0D1A2A] border border-white/10 rounded-xl px-3 py-1.5 text-[10px] font-bold italic">
                             <option value="720p">720p</option>
                             <option value="1080p">1080p</option>
                             <option value="4K">4K</option>
                          </select>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-white/60 italic">Bandwidth</span>
                          <select value={bandwidth} onChange={(e) => setBandwidth(e.target.value as any)} className="bg-[#0D1A2A] border border-white/10 rounded-xl px-3 py-1.5 text-[10px] font-bold italic">
                             <option value="Low">Low</option>
                             <option value="Balanced">Balanced</option>
                             <option value="High">High</option>
                             <option value="Auto">Auto</option>
                          </select>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSidePanel === 'ai' && (
                <div className="h-full flex flex-col space-y-6 animate-fade-in italic">
                  <div className="p-4 bg-[#53C8FF]/5 border border-[#53C8FF]/20 rounded-2xl">
                    <p className="text-[9px] font-black text-[#53C8FF] uppercase tracking-widest mb-2 flex items-center gap-2 italic">
                      <span className="w-1.5 h-1.5 bg-[#53C8FF] rounded-full animate-pulse"></span> Gemini 3 Live Recap
                    </p>
                    <p className="text-[10px] text-white/60 italic leading-relaxed">Processing audio for automated meeting minutes and high-speed search grounding.</p>
                  </div>
                  <div className="flex-1 bg-[#0E1430] border border-white/5 rounded-2xl p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3">
                     {liveTranscript.length === 0 ? (
                       <div className="h-full flex flex-col items-center justify-center text-center opacity-20 italic">
                          <span className="text-3xl mb-3">🎙️</span>
                          <span className="text-[8px] font-black uppercase tracking-widest italic">Listening for speech...</span>
                       </div>
                     ) : (
                       liveTranscript.map((line, idx) => (
                         <div key={idx} className="text-[11px] text-white/60 leading-relaxed border-l border-[#53C8FF]/20 pl-3 py-1 italic animate-slide-in">
                            {line}
                         </div>
                       ))
                     )}
                  </div>
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
        <div className="bg-[#0E1430] p-1 rounded-2xl flex border border-white/5 shadow-2xl">
          <button onClick={() => setTab('manage')} className={`px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'manage' ? 'bg-[#53C8FF] text-[#0A0F1F]' : 'text-white/40 hover:text-white'}`}>Manage</button>
          <button onClick={() => setTab('instant')} className={`px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'instant' ? 'bg-[#53C8FF] text-[#0A0F1F]' : 'text-white/40 hover:text-white'}`}>Instant</button>
        </div>
      </div>

      {tab === 'manage' ? (
        <div className="grid gap-3 animate-fade-in">
          {[
            { title: 'CloudHop Architecture Sync', time: 'Today, 2:00 PM', date: '20' },
            { title: 'Project Q4 Planning', time: 'Tomorrow, 11:00 AM', date: '21' }
          ].map((mtg, i) => (
            <div key={i} className="bg-[#0E1430] border border-white/5 rounded-3xl p-6 flex items-center justify-between hover:border-[#53C8FF]/40 transition-all group shadow-xl">
              <div className="flex gap-6 items-center">
                <div className="w-14 h-14 rounded-2xl bg-[#53C8FF]/10 flex flex-col items-center justify-center text-[#53C8FF] group-hover:bg-[#53C8FF] group-hover:text-[#0A0F1F] transition-all border border-[#53C8FF]/20">
                  <span className="text-[10px] font-black uppercase">NOV</span>
                  <span className="text-2xl font-black italic leading-none">{mtg.date}</span>
                </div>
                <div>
                  <h4 className="font-black text-lg text-white group-hover:text-[#53C8FF] transition-all uppercase">{mtg.title}</h4>
                  <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">{mtg.time}</div>
                </div>
              </div>
              <button onClick={startMeeting} className="px-8 py-3 bg-[#53C8FF]/10 text-[#53C8FF] border border-[#53C8FF]/30 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#53C8FF] hover:text-[#0A0F1F] transition-all italic">Start</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-lg mx-auto bg-[#0E1430] border border-white/5 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group animate-fade-in text-center italic">
          <CloudHopLogo size={64} variant="neon" className="mx-auto mb-6" />
          <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-6">Instant Huddle</h3>
          <button onClick={startMeeting} className="w-full py-5 bg-[#53C8FF] text-[#0A0F1F] text-base font-black uppercase tracking-[0.3em] rounded-2xl hover:shadow-2xl transition-all italic">Hop In</button>
        </div>
      )}
    </div>
  );
};

const ControlButton: React.FC<{ icon: React.ReactNode, label: string, onClick?: () => void, active?: boolean }> = ({ icon, label, onClick, active }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-2 p-4 min-w-[70px] rounded-3xl transition-all ${active ? 'bg-[#53C8FF] text-[#0A0F1F]' : 'text-white/30 hover:bg-white/5 hover:text-white'}`}>
    <div className="transition-transform duration-300">{icon}</div>
    <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-[#0A0F1F]/60' : 'text-white/20'} italic`}>{label}</span>
  </button>
);

export default Meetings;
