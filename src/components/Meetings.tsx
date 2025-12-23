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

// Start empty to let user be alone, or add bots via "Invite"
const MOCK_PARTICIPANTS: Participant[] = []; 

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
type ViewMode = 'grid' | 'speaker';

const Meetings: React.FC = () => {
  const [step, setStep] = useState<MeetingStep>('input');
  const [meetingId, setMeetingId] = useState('');
  
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<string[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{sender: string, text: string}[]>([]);
  
  const [showSecurityMenu, setShowSecurityMenu] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [waitingRoom, setWaitingRoom] = useState(false);
  
  const [showReactionsMenu, setShowReactionsMenu] = useState(false);
  
  // Manage participants state so we can add/remove them
  const [participants, setParticipants] = useState<Participant[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const meetingContainerRef = useRef<HTMLDivElement>(null);

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

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        meetingContainerRef.current?.requestFullscreen();
        setIsFullScreen(true);
    } else {
        document.exitFullscreen();
        setIsFullScreen(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, this would show a toast
    if (!isRecording) {
        setChatHistory(prev => [...prev, { sender: 'System', text: 'Recording Started' }]);
    } else {
        setChatHistory(prev => [...prev, { sender: 'System', text: 'Recording Stopped' }]);
    }
  };

  const triggerReaction = (emoji: string) => {
    setReaction(emoji);
    setShowReactionsMenu(false);
    setTimeout(() => setReaction(null), 2000);
  };
  
  const handleShareScreen = async () => {
      try {
          if (!isSharingScreen) {
              const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
              // Replace video track
              if (streamRef.current) {
                  const videoTrack = streamRef.current.getVideoTracks()[0];
                  streamRef.current.removeTrack(videoTrack);
                  streamRef.current.addTrack(displayStream.getVideoTracks()[0]);
                  
                  // Handle stream end (user clicks stop sharing in browser UI)
                  displayStream.getVideoTracks()[0].onended = () => {
                      setIsSharingScreen(false);
                      // Ideally we would switch back to camera here, but for now we just stop
                      endMeeting(); // Or prompt to restart camera
                  };
              }
              setIsSharingScreen(true);
          } else {
              // Switch back to camera
              const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
               if (streamRef.current) {
                  const videoTrack = streamRef.current.getVideoTracks()[0];
                  videoTrack.stop();
                  streamRef.current.removeTrack(videoTrack);
                  streamRef.current.addTrack(cameraStream.getVideoTracks()[0]);
              }
              setIsSharingScreen(false);
          }
      } catch (err) {
          console.error("Error sharing screen:", err);
      }
  };
  
  const sendChatMessage = () => {
      if (!chatMessage.trim()) return;
      setChatHistory([...chatHistory, { sender: 'You', text: chatMessage }]);
      setChatMessage('');
  };

  const initLive = async (stream: MediaStream) => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("No VITE_GEMINI_API_KEY found in environment");
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
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
    
    if (document.fullscreenElement) document.exitFullscreen();

    setStep('input');
    setLiveTranscript([]);
    setMeetingId('');
    setIsMuted(false);
    setIsVideoOff(false);
    setShowParticipants(false);
    setShowChat(false);
    setIsRecording(false);
    setParticipants([]); // Clear participants
    setIsSharingScreen(false);
    setChatHistory([]);
  };

  // Video Rendering Effect
  useEffect(() => {
    let stopRendering = false;
    let animationFrameId: number;

    const renderFrame = async (reader: ReadableStreamDefaultReader<VideoFrame>, ctx: CanvasRenderingContext2D) => {
       try {
         const { done, value } = await reader.read();
         if (done || stopRendering) return;
         
         if (canvasRef.current && value) {
             canvasRef.current.width = value.displayWidth;
             canvasRef.current.height = value.displayHeight;
             ctx.drawImage(value, 0, 0);
             value.close();
         }
         
         if (!stopRendering) {
            // Continue reading
            renderFrame(reader, ctx);
         }
       } catch (e) {
         console.error("Frame render error", e);
       }
    };

    const runVideo = async () => {
      if ((step === 'prejoin' || step === 'active') && canvasRef.current && streamRef.current && !isVideoOff) {
        const videoTracks = streamRef.current.getVideoTracks();
        if (videoTracks.length === 0) return;
        
        const track = videoTracks[0];
        if (!('MediaStreamTrackProcessor' in window)) return;

        const processor = new (window as any).MediaStreamTrackProcessor({ track });
        const reader = processor.readable.getReader();
        const ctx = canvasRef.current.getContext('2d', { desynchronized: true });
        
        if (ctx) {
            renderFrame(reader, ctx);
        }
      }
    };
    
    // Small delay to ensure canvas is mounted in new view
    const timer = setTimeout(runVideo, 100);
    
    return () => { 
        stopRendering = true; 
        clearTimeout(timer);
    };
  }, [step, isVideoOff, viewMode, isSharingScreen]); // Re-run when view mode changes to re-attach to new canvas instance

  // --- Render Helpers ---

  const renderActiveMeeting = () => (
    <div ref={meetingContainerRef} className="fixed inset-0 bg-[#0A0A0A] text-white flex flex-col z-[100] animate-fade-in font-sans">
      
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
             {isRecording && <span className="text-[10px] text-red-500 flex items-center gap-1 animate-pulse">● Recording...</span>}
           </div>
        </div>

        <div className="flex items-center gap-2">
            {/* View Switcher */}
            <button 
                onClick={() => setViewMode(viewMode === 'grid' ? 'speaker' : 'grid')}
                className="flex items-center gap-1.5 bg-[#242424] hover:bg-[#333] px-3 py-1 rounded text-xs transition-colors"
            >
               <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/></svg>
               {viewMode === 'grid' ? 'Speaker View' : 'Gallery View'}
            </button>
            
            {/* Full Screen Toggle */}
            <button onClick={toggleFullScreen} className="p-1.5 hover:bg-[#333] rounded">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
         
         {/* Reaction Overlay */}
         {reaction && (
             <div className="absolute inset-0 z-50 pointer-events-none flex items-end justify-center pb-32 animate-bounce">
                 <span className="text-9xl filter drop-shadow-lg">{reaction}</span>
             </div>
         )}

         {/* Video Layout */}
         <div className="flex-1 bg-black flex items-center justify-center p-4 relative">
            
            {/* Speaker View Layout */}
            {viewMode === 'speaker' && (
                <div className="w-full h-full flex flex-col">
                    {/* Main Speaker (You for now) */}
                    <div className="flex-1 bg-[#1A1A1A] relative rounded overflow-hidden border border-white/10 mb-4">
                        {!isVideoOff ? (
                           <canvas ref={canvasRef} className={`w-full h-full object-contain ${!isSharingScreen ? 'scale-x-[-1]' : ''}`} />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center">
                              <div className="w-32 h-32 bg-gray-500 rounded-full flex items-center justify-center text-4xl font-bold">YO</div>
                           </div>
                        )}
                        <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-sm font-medium">You (Speaker)</div>
                    </div>
                    {/* Filmstrip (Other participants if any) */}
                    {participants.length > 0 && (
                        <div className="h-32 flex gap-4 overflow-x-auto">
                            {participants.map((p, i) => (
                                <div key={i} className="aspect-video bg-[#1A1A1A] rounded border border-white/10 relative flex-shrink-0">
                                    <div className="w-full h-full flex items-center justify-center text-white/50">{p.name}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Grid View Layout */}
            {viewMode === 'grid' && (
                <div className={`grid gap-4 w-full max-w-7xl ${participants.length === 0 ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'} aspect-video`}>
                   {/* Self Video */}
                   <div className="bg-[#1A1A1A] relative rounded overflow-hidden border border-white/10 group">
                      {!isVideoOff ? (
                         <canvas ref={canvasRef} className={`w-full h-full object-cover ${!isSharingScreen ? 'scale-x-[-1]' : ''}`} />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center">
                            <div className="w-24 h-24 bg-gray-500 rounded-full flex items-center justify-center text-3xl font-bold">YO</div>
                         </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[11px] font-medium">You {isSharingScreen ? '(Sharing)' : ''}</div>
                   </div>

                   {/* Other Participants */}
                   {participants.map((p, i) => (
                      <div key={i} className={`bg-[#1A1A1A] relative rounded overflow-hidden border border-white/10 ${p.isSpeaking ? 'ring-2 ring-green-500' : ''}`}>
                         {p.isVideoOff ? (
                            <div className="w-full h-full flex items-center justify-center">
                               <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-xl font-bold">{p.name.charAt(0)}</div>
                            </div>
                         ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                               <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold">{p.name.charAt(0)}</div>
                            </div>
                         )}
                         <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1">
                            {p.isSpeaking && <svg className="w-3 h-3 text-green-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.66 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>}
                            {p.name}
                         </div>
                      </div>
                   ))}
                   
                   {/* Add Bot Button (For Testing) */}
                   <button 
                     onClick={() => setParticipants([...participants, { id: Date.now().toString(), name: `Bot ${participants.length + 1}` }])}
                     className="bg-[#1A1A1A] border border-white/10 border-dashed rounded flex flex-col items-center justify-center text-white/20 hover:text-white/50 hover:border-white/30 transition-all"
                   >
                       <span className="text-4xl">+</span>
                       <span className="text-xs">Add Participant</span>
                   </button>
                </div>
            )}
            
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
               <div className="h-12 border-b border-gray-200 flex items-center justify-center font-bold text-sm relative">
                  {showParticipants ? `Participants (${participants.length + 1})` : 'Meeting Chat'}
                  <button onClick={() => { setShowParticipants(false); setShowChat(false); }} className="absolute right-3 text-gray-400 hover:text-black">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-2">
                  {/* Participants List */}
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
                        {participants.map((p, i) => (
                           <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-100 rounded">
                              <div className="flex items-center gap-2">
                                 <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">{p.name.charAt(0)}</div>
                                 <div className="text-sm">{p.name}</div>
                              </div>
                              <div className="flex items-center gap-1 text-gray-500">
                                 <button onClick={() => setParticipants(participants.filter(pt => pt.id !== p.id))} className="text-red-500 hover:bg-red-50 p-1 rounded">Remove</button>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}

                  {/* Chat Area */}
                  {showChat && (
                      <div className="flex flex-col h-full">
                          <div className="flex-1 space-y-4 p-2">
                              {chatHistory.length === 0 && <div className="text-center text-gray-400 text-sm mt-10">No messages yet</div>}
                              {chatHistory.map((msg, i) => (
                                  <div key={i} className="flex flex-col">
                                      <span className="text-[10px] font-bold text-gray-500">{msg.sender}</span>
                                      <div className="bg-gray-100 p-2 rounded-lg text-sm">{msg.text}</div>
                                  </div>
                              ))}
                          </div>
                          <div className="border-t border-gray-200 p-2">
                              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                                  <input 
                                    type="text" 
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                                    placeholder="Type a message..."
                                    className="bg-transparent border-none focus:outline-none text-sm flex-1"
                                  />
                                  <button onClick={() => setChatMessage(chatMessage + " 🎤 (Voice)")} className="text-gray-400 hover:text-blue-500">
                                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.66 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                                  </button>
                                  <button onClick={sendChatMessage} className="text-blue-500 hover:text-blue-700 font-bold text-sm">Send</button>
                              </div>
                          </div>
                      </div>
                  )}
               </div>
            </div>
         )}
      </div>

      {/* Bottom Toolbar (Zoom style) */}
      <div className="h-20 bg-[#1A1A1A] flex items-center justify-between px-4 shrink-0 overflow-x-auto custom-scrollbar gap-4">
        
        {/* Left Controls */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
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
             { 
                 label: 'Security', 
                 active: showSecurityMenu,
                 onClick: () => setShowSecurityMenu(!showSecurityMenu),
                 icon: (props: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>,
                 menu: (
                     <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-[#242424] rounded-lg shadow-xl border border-white/10 p-2 w-48 z-50">
                         <div className="text-xs font-bold text-gray-400 px-2 py-1 uppercase">Security</div>
                         <button onClick={() => setIsLocked(!isLocked)} className="w-full text-left px-2 py-2 hover:bg-white/10 rounded text-sm flex items-center justify-between">
                             Lock Meeting {isLocked && '✓'}
                         </button>
                         <button onClick={() => setWaitingRoom(!waitingRoom)} className="w-full text-left px-2 py-2 hover:bg-white/10 rounded text-sm flex items-center justify-between">
                             Enable Waiting Room {waitingRoom && '✓'}
                         </button>
                     </div>
                 )
             },
             { label: 'Participants', count: participants.length + 1, onClick: () => setShowParticipants(!showParticipants), active: showParticipants, icon: (props: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg> },
             { label: 'Chat', onClick: () => setShowChat(!showChat), active: showChat, icon: (props: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg> },
             { label: 'Share Screen', onClick: handleShareScreen, active: isSharingScreen, color: isSharingScreen ? 'text-green-500' : '', icon: (props: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.11-.9-2-2-2H4c-1.11 0-2 .89-2 2v10c0 1.1.89 2 2 2H0v2h24v-2h-4zM4 16V6h16v10.01L4 16zm9-6.88V13h-2V9.12l-2.83 2.83-1.41-1.41L12 5.29l5.24 5.25-1.41 1.41L13 9.12z"/></svg> },
             { label: 'Record', onClick: toggleRecording, color: isRecording ? 'text-red-500' : '', icon: (props: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg> },
             { 
                 label: 'Reactions', 
                 active: showReactionsMenu,
                 onClick: () => setShowReactionsMenu(!showReactionsMenu),
                 icon: (props: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>,
                 menu: (
                     <div className="absolute bottom-20 left-1/2 translate-x-12 bg-[#242424] rounded-full shadow-xl border border-white/10 p-2 flex gap-2 z-50">
                         {['👏', '👍', '❤️', '😂', '😮', '🎉'].map(emoji => (
                             <button key={emoji} onClick={() => triggerReaction(emoji)} className="text-2xl hover:scale-125 transition-transform p-1">
                                 {emoji}
                             </button>
                         ))}
                     </div>
                 )
             },
           ].map((btn, i) => (
              <div key={i} className="relative">
                  {btn.active && btn.menu}
                  <button 
                    onClick={btn.onClick}
                    className={`flex flex-col items-center gap-1 min-w-[60px] rounded p-2 ${btn.active ? 'bg-[#2A2A2A] text-[#53C8FF]' : 'text-white/90 hover:bg-[#2A2A2A]'}`}
                  >
                     <btn.icon className={`w-5 h-5 ${btn.color || ''}`} />
                     <span className="text-[10px]">{btn.label}</span>
                     {btn.count && <span className="absolute top-2 ml-4 bg-red-500 text-white text-[9px] px-1 rounded-full">{btn.count}</span>}
                  </button>
              </div>
           ))}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4 shrink-0">
           <button onClick={endMeeting} className="bg-[#E01E5A] hover:bg-[#C21648] text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-colors">
              End
           </button>
        </div>
      </div>
    </div>
  );
};

export default Meetings;
