import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { CloudHopLogo } from '../constants';

// --- Types & Mocks ---

interface Participant {
  id: string;
  name: string;
  isSpeaking?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
}

const MOCK_PARTICIPANTS: Participant[] = [
  { id: '1', name: 'Sarah Chen', isSpeaking: true },
  { id: '2', name: 'Mike Johnson' },
  { id: '3', name: 'Emily Rodriguez', isVideoOff: true },
  { id: '4', name: 'David Kim' },
  { id: '5', name: 'Lisa Wang' },
];

// --- Helper Functions ---

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

type MeetingStep = 'input' | 'prejoin' | 'active';

const Meetings: React.FC = () => {
  const [step, setStep] = useState<MeetingStep>('input');
  const [meetingId, setMeetingId] = useState('');
  
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<string[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);

  // Initialize Media for Pre-join
  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }, 
        audio: true 
      });
      streamRef.current = stream;
      setStep('prejoin');
    } catch (err) {
      console.error(err);
      alert("Hardware access required for CloudHop Mesh.");
    }
  };

  const handleStartInstant = () => {
    setMeetingId(`HOP-${Math.floor(Math.random() * 9000) + 1000}`);
    initializeMedia();
  };

  const handleJoinWithCode = () => {
    if (!meetingId.trim()) return;
    initializeMedia();
  };

  const joinMeeting = () => {
    if (streamRef.current) {
      initLive(streamRef.current);
    }
    setStep('active');
  };

  const initLive = async (stream: MediaStream) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = inputAudioContext;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              if (isMuted) return;
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.inputTranscription) {
              setLiveTranscript(prev => [...prev.slice(-4), msg.serverContent!.inputTranscription!.text]);
            }
          },
          onerror: (e: ErrorEvent) => console.error('Live Error', e),
          onclose: () => console.log('Live Closed'),
        },
        config: { 
          responseModalities: [Modality.AUDIO], 
          inputAudioTranscription: {},
          systemInstruction: "You are a helpful assistant listening to a meeting. Transcribe accurately."
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error("Failed to connect to AI:", e);
    }
  };

  const endMeeting = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) audioContextRef.current.close();
    if (sessionRef.current) sessionRef.current.close();
    
    setStep('input');
    setLiveTranscript([]);
    setMeetingId('');
    setIsMuted(false);
    setIsVideoOff(false);
    setShowParticipants(false);
    setShowChat(false);
  };

  useEffect(() => {
    let stopRendering = false;
    const runVideo = async () => {
      if ((step === 'prejoin' || step === 'active') && canvasRef.current && streamRef.current && !isVideoOff) {
        const videoTracks = streamRef.current.getVideoTracks();
        if (videoTracks.length === 0) return;
        
        const track = videoTracks[0];
        if (!('MediaStreamTrackProcessor' in window)) return;

        const processor = new (window as any).MediaStreamTrackProcessor({ track });
        const reader = processor.readable.getReader();
        const ctx = canvasRef.current.getContext('2d', { desynchronized: true });
        
        while (!stopRendering && !isVideoOff) {
          const { done, value } = await reader.read();
          if (done) break;
          if (ctx && value && canvasRef.current) {
            canvasRef.current.width = value.displayWidth;
            canvasRef.current.height = value.displayHeight;
            ctx.drawImage(value, 0, 0);
            value.close();
          }
        }
        reader.releaseLock();
      }
    };
    runVideo();
    return () => { stopRendering = true; };
  }, [step, isVideoOff]);

  // --- Render Helpers ---

  const renderActiveMeeting = () => (
    <div className="fixed inset-0 bg-[#0A0A0A] text-white flex flex-col z-[100] animate-fade-in font-sans">
      
      {/* Top Bar (Zoom style) */}
      <div className="h-12 flex items-center justify-between px-4 bg-[#1A1A1A]">
        {/* Meeting Info */}
        <div className="flex items-center gap-2">
           <div className="text-green-500">
             <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
           </div>
           <div className="flex flex-col">
             <span className="text-xs font-bold flex items-center gap-2">
               Zoom Meeting
               <svg className="w-3 h-3 text-white/50" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
             </span>
           </div>
        </div>

        {/* View Switcher */}
        <button className="flex items-center gap-1.5 bg-[#242424] hover:bg-[#333] px-3 py-1 rounded text-xs transition-colors">
           <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/></svg>
           View
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
         {/* Video Grid */}
         <div className="flex-1 bg-black flex items-center justify-center p-4 relative">
            <div className="grid grid-cols-3 gap-4 w-full max-w-6xl aspect-video">
               {/* Self Video (Large) */}
               <div className="col-span-2 row-span-2 bg-[#1A1A1A] relative rounded overflow-hidden border border-white/10 group">
                  {!isVideoOff ? (
                     <canvas ref={canvasRef} className="w-full h-full object-cover scale-x-[-1]" />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center">
                        <div className="w-24 h-24 bg-gray-500 rounded-full flex items-center justify-center text-3xl font-bold">YO</div>
                     </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[11px] font-medium">You</div>
                  <div className="absolute top-2 right-2 bg-black/60 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                     <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                  </div>
               </div>

               {/* Other Participants */}
               {MOCK_PARTICIPANTS.map((p, i) => (
                  <div key={i} className={`bg-[#1A1A1A] relative rounded overflow-hidden border border-white/10 ${p.isSpeaking ? 'ring-2 ring-green-500' : ''}`}>
                     {p.isVideoOff ? (
                        <div className="w-full h-full flex items-center justify-center">
                           <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-xl font-bold">{p.name.charAt(0)}</div>
                        </div>
                     ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                           {/* Placeholder for others' video */}
                           <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold">{p.name.charAt(0)}</div>
                        </div>
                     )}
                     <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1">
                        {p.isSpeaking && <svg className="w-3 h-3 text-green-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.66 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>}
                        {p.name}
                     </div>
                  </div>
               ))}
            </div>
            
            {/* Live Transcript Overlay */}
            {liveTranscript.length > 0 && (
              <div className="absolute bottom-4 left-4 bg-black/70 px-4 py-2 rounded text-sm text-white/90 max-w-2xl">
                {liveTranscript[liveTranscript.length - 1]}
              </div>
            )}
         </div>

         {/* Right Sidebar (Participants/Chat) */}
         {(showParticipants || showChat) && (
            <div className="w-80 bg-white border-l border-gray-200 flex flex-col text-black">
               <div className="h-12 border-b border-gray-200 flex items-center justify-center font-bold text-sm">
                  {showParticipants ? `Participants (${MOCK_PARTICIPANTS.length + 1})` : 'Meeting Chat'}
               </div>
               <div className="flex-1 overflow-y-auto p-2">
                  {showParticipants && (
                     <div className="space-y-1">
                        <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded">
                           <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs">YO</div>
                              <div className="text-sm">You (Host, me)</div>
                           </div>
                           <div className="flex items-center gap-1 text-gray-500">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.66 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15 8v8H5l-5-6 5-6h10zm1 0h2v8h-2V8zm4 0h2v8h-2V8z"/></svg>
                           </div>
                        </div>
                        {MOCK_PARTICIPANTS.map((p, i) => (
                           <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-100 rounded">
                              <div className="flex items-center gap-2">
                                 <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">{p.name.charAt(0)}</div>
                                 <div className="text-sm">{p.name}</div>
                              </div>
                              <div className="flex items-center gap-1 text-gray-500">
                                 <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.66 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l2.97 2.97c-.85.35-1.76.57-2.71.5V21h2v-3.28c3.28-.48 5.69-3.18 5.69-6.6v-1.73l1.89 1.89 1.27-1.27L4.27 3z"/></svg>
                                 {p.isVideoOff && <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"/></svg>}
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>
         )}
      </div>

      {/* Bottom Toolbar (Zoom style) */}
      <div className="h-20 bg-[#1A1A1A] flex items-center justify-between px-4 shrink-0">
        
        {/* Left Controls */}
        <div className="flex items-center gap-4">
           <button onClick={() => setIsMuted(!isMuted)} className="flex flex-col items-center gap-1 min-w-[60px] text-white/90 hover:bg-[#2A2A2A] rounded p-2">
              <div className="relative">
                 {isMuted ? (
                    <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.66 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l2.97 2.97c-.85.35-1.76.57-2.71.5V21h2v-3.28c3.28-.48 5.69-3.18 5.69-6.6v-1.73l1.89 1.89 1.27-1.27L4.27 3z"/></svg>
                 ) : (
                    <div className="w-6 h-6 flex items-center justify-center">
                       <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.66 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                       <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                 )}
              </div>
              <span className="text-[10px]">{isMuted ? 'Unmute' : 'Mute'}</span>
              <div className="absolute top-2 right-1 text-xs text-gray-500">^</div>
           </button>

           <button onClick={() => setIsVideoOff(!isVideoOff)} className="flex flex-col items-center gap-1 min-w-[60px] text-white/90 hover:bg-[#2A2A2A] rounded p-2">
              <div className="relative">
                 {isVideoOff ? (
                    <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"/></svg>
                 ) : (
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                 )}
              </div>
              <span className="text-[10px]">{isVideoOff ? 'Start Video' : 'Stop Video'}</span>
              <div className="absolute top-2 right-1 text-xs text-gray-500">^</div>
           </button>
        </div>

        {/* Center Controls */}
        <div className="flex items-center gap-2">
           {[
             { label: 'Security', icon: (props: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg> },
             { label: 'Participants', count: MOCK_PARTICIPANTS.length + 1, onClick: () => setShowParticipants(!showParticipants), active: showParticipants, icon: (props: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg> },
             { label: 'Chat', onClick: () => setShowChat(!showChat), active: showChat, icon: (props: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg> },
             { label: 'Share Screen', color: 'text-green-500', icon: (props: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.11-.9-2-2-2H4c-1.11 0-2 .89-2 2v10c0 1.1.89 2 2 2H0v2h24v-2h-4zM4 16V6h16v10.01L4 16zm9-6.88V13h-2V9.12l-2.83 2.83-1.41-1.41L12 5.29l5.24 5.25-1.41 1.41L13 9.12z"/></svg> },
             { label: 'Record', icon: (props: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg> },
             { label: 'Reactions', icon: (props: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg> },
           ].map((btn, i) => (
              <button 
                key={i} 
                onClick={btn.onClick}
                className={`flex flex-col items-center gap-1 min-w-[60px] rounded p-2 ${btn.active ? 'bg-[#2A2A2A] text-[#53C8FF]' : 'text-white/90 hover:bg-[#2A2A2A]'}`}
              >
                 <btn.icon className={`w-5 h-5 ${btn.color || ''}`} />
                 <span className="text-[10px]">{btn.label}</span>
                 {btn.count && <span className="absolute top-2 ml-4 bg-red-500 text-white text-[9px] px-1 rounded-full">{btn.count}</span>}
              </button>
           ))}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
           <button onClick={endMeeting} className="bg-[#E01E5A] hover:bg-[#C21648] text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-colors">
              End
           </button>
        </div>
      </div>
    </div>
  );

  // --- Main Render Switch ---

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in italic">
      {/* Header (Always Visible in Meetings View) */}
      <div className="flex items-center justify-between shrink-0">
         <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Meetings</h1>
            <p className="text-xs font-medium text-white/40">Video calls and conferences</p>
         </div>
         {step === 'input' && (
             <button onClick={handleStartInstant} className="px-6 py-2.5 bg-[#53C8FF] text-[#0A0F1F] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-[#53C8FF]/20 hover:scale-105 transition-all text-xs flex items-center gap-2">
                <span>+</span> New Meeting
             </button>
         )}
      </div>

      {step === 'input' && (
         <div className="flex-1 flex flex-col items-center justify-center space-y-12 pb-20">
            <div className="space-y-6 text-center">
               <CloudHopLogo size={100} variant="neon" className="mx-auto" />
               <h1 className="text-4xl font-black uppercase tracking-tighter">Hop Meets</h1>
               <p className="text-white/40 font-medium">Connect with low-latency hardware acceleration.</p>
            </div>

            <div className="bg-[#080C22] p-8 rounded-[32px] border border-white/5 shadow-2xl space-y-6 w-full max-w-md">
               <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Enter Meeting Code</label>
                  <div className="flex gap-2">
                     <input 
                       type="text" 
                       value={meetingId}
                       onChange={(e) => setMeetingId(e.target.value)}
                       placeholder="e.g. HOP-8392"
                       className="flex-1 bg-[#050819] border border-white/10 rounded-2xl px-6 py-4 text-white font-medium focus:outline-none focus:border-[#53C8FF]/50 transition-all placeholder:text-white/10"
                     />
                     <button 
                       onClick={handleJoinWithCode}
                       disabled={!meetingId.trim()}
                       className="px-6 bg-white/5 rounded-2xl text-white/60 font-black uppercase tracking-widest hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                     >
                        →
                     </button>
                  </div>
               </div>
               
               <div className="flex items-center gap-4 text-white/10">
                  <div className="h-px bg-current flex-1"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">OR</span>
                  <div className="h-px bg-current flex-1"></div>
               </div>

               <button 
                 onClick={handleStartInstant} 
                 className="w-full py-5 bg-[#53C8FF] text-[#0A0F1F] font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-[#53C8FF]/20 hover:scale-[1.02] active:scale-95 transition-all"
               >
                  Start Instant Huddle
               </button>
            </div>
         </div>
      )}

      {step === 'prejoin' && (
         <div className="flex-1 flex items-center justify-center pb-20">
            <div className="w-full max-w-4xl p-8 flex flex-col items-center gap-8">
               <div className="text-center space-y-2">
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-white">System Check</h2>
                  <p className="text-white/40 text-sm">Meeting ID: <span className="text-[#53C8FF]">{meetingId}</span></p>
               </div>

               <div className="w-full aspect-video bg-[#080C22] rounded-[32px] overflow-hidden border border-white/10 relative shadow-2xl">
                  {!isVideoOff ? (
                     <canvas ref={canvasRef} className="w-full h-full object-cover scale-x-[-1]" />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center">
                        <CloudHopLogo size={60} variant="neon" className="opacity-20" />
                     </div>
                  )}
                  
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                    <button onClick={() => setIsMuted(!isMuted)} className={`p-4 rounded-full transition-all border ${!isMuted ? 'bg-black/50 border-white/10 hover:bg-white/10' : 'bg-red-600 border-red-500'}`}>
                       {isMuted ? '🔇' : '🎙️'}
                    </button>
                    <button onClick={() => setIsVideoOff(!isVideoOff)} className={`p-4 rounded-full transition-all border ${!isVideoOff ? 'bg-black/50 border-white/10 hover:bg-white/10' : 'bg-red-600 border-red-500'}`}>
                       {isVideoOff ? '🚫' : '🎥'}
                    </button>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <button onClick={endMeeting} className="px-8 py-3 bg-white/5 text-white/60 font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all text-xs">Cancel</button>
                  <button onClick={joinMeeting} className="px-12 py-3 bg-[#53C8FF] text-[#0A0F1F] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-[#53C8FF]/20 hover:scale-105 transition-all text-xs">Join Now</button>
               </div>
            </div>
         </div>
      )}

      {step === 'active' && renderActiveMeeting()}
    </div>
  );
};

export default Meetings;
