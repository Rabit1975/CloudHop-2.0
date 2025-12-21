
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { CloudHopLogo, Icons } from '../constants';

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const Meetings: React.FC = () => {
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<string[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);

  const startMeeting = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }, 
        audio: true 
      });
      streamRef.current = stream;
      setIsMeetingActive(true);
      initLive(stream);
    } catch (err) {
      console.error(err);
      alert("Hardware access required.");
    }
  };

  const initLive = async (stream: MediaStream) => {
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
  };

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

  const endMeeting = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    if (sessionRef.current) sessionRef.current.close();
    setIsMeetingActive(false);
    setLiveTranscript([]);
  };

  useEffect(() => {
    let stopRendering = false;
    const runVideo = async () => {
      if (isMeetingActive && canvasRef.current && streamRef.current && !isVideoOff) {
        const track = streamRef.current.getVideoTracks()[0];
        if (!track || !('MediaStreamTrackProcessor' in window)) return;
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
  }, [isMeetingActive, isVideoOff]);

  if (isMeetingActive) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#050819] flex animate-fade-in italic select-none">
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <header className="h-16 shrink-0 bg-[#080C22]/80 backdrop-blur-xl flex items-center justify-between px-6 border-b border-white/5 z-20">
             <div className="flex items-center gap-3">
                <CloudHopLogo size={28} variant="neon" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#53C8FF]">Secure Hop Stream</span>
             </div>
             <button onClick={endMeeting} className="px-6 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 italic transition-all">End Session</button>
          </header>

          <div className="flex-1 bg-black relative flex items-center justify-center p-4">
             <div className="w-full h-full max-w-5xl aspect-video rounded-[32px] overflow-hidden border border-white/10 bg-[#080C22] shadow-2xl relative">
                {!isVideoOff ? (
                  <canvas ref={canvasRef} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#080C22]">
                     <CloudHopLogo size={80} variant="neon" className="opacity-10" />
                  </div>
                )}
                {liveTranscript.length > 0 && (
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 max-w-xl w-[90%] bg-black/60 backdrop-blur-3xl p-4 rounded-2xl border border-white/10 text-center text-xs font-medium text-[#53C8FF]">
                    {liveTranscript[liveTranscript.length - 1]}
                  </div>
                )}
             </div>
          </div>

          <div className="h-24 shrink-0 bg-[#080C22]/90 backdrop-blur-3xl border-t border-white/5 flex items-center justify-center gap-4 z-20">
             <button onClick={() => setIsMuted(!isMuted)} className={`p-4 rounded-2xl transition-all border ${!isMuted ? 'bg-white/5 border-white/10' : 'bg-red-600 border-red-500'}`}>
                {isMuted ? '🔇' : '🎙️'}
             </button>
             <button onClick={() => setIsVideoOff(!isVideoOff)} className={`p-4 rounded-2xl transition-all border ${!isVideoOff ? 'bg-white/5 border-white/10' : 'bg-red-600 border-red-500'}`}>
                {isVideoOff ? '🚫' : '🎥'}
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-20 text-center space-y-8 animate-fade-in italic">
       <CloudHopLogo size={100} variant="neon" className="mx-auto" />
       <h1 className="text-4xl font-black uppercase tracking-tighter">Ready for Mesh?</h1>
       <p className="text-white/40 font-medium">Connect with low-latency hardware acceleration.</p>
       <button onClick={startMeeting} className="px-16 py-5 bg-[#53C8FF] text-[#0A0F1F] font-black uppercase tracking-widest rounded-3xl shadow-2xl shadow-[#53C8FF]/20 hover:scale-105 active:scale-95 transition-all">Start Instant Huddle</button>
    </div>
  );
};

export default Meetings;
