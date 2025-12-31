
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
// Import Icons from constants to fix the "Cannot find name 'Icons'" error
import { Icons } from '../constants';
import RabbitSettings from './RabbitSettings';
import { useWebRTC } from '../hooks/useWebRTC';
import { supabase } from '../lib/supabaseClient';

const Chat: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'messages' | 'ai'>('messages');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Create a stable user ID for WebRTC testing and Supabase
  const [userId] = useState(() => {
    const stored = sessionStorage.getItem('cloudhop_userid');
    if (stored) return stored;
    const newId = crypto.randomUUID(); // Use UUID for Supabase compatibility
    sessionStorage.setItem('cloudhop_userid', newId);
    return newId;
  });

  const { callState, localStream, remoteStream, startCall, acceptCall, endCall, incomingCallFrom } = useWebRTC(userId);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // --- Real-time Chat State ---
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // Load Chats on Mount
  useEffect(() => {
      const fetchChats = async () => {
          // Check if user exists, if not create one
          const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
          if (!user) {
              await supabase.from('users').insert({ 
                  id: userId, 
                  username: `user_${userId.substr(0,8)}`, 
                  display_name: 'New Rabbit',
                  avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`
              });
          }

          // Fetch chats (for now, fetch all public chats or create a default one)
          let { data: existingChats } = await supabase.from('chats').select('*');
          
          if (!existingChats || existingChats.length === 0) {
              // Create a default public chat
              const { data: newChat } = await supabase.from('chats').insert({ title: 'General Lobby', is_group: true }).select().single();
              if (newChat) existingChats = [newChat];
          }
          
          if (existingChats) {
              setChats(existingChats);
              setSelectedChatId(existingChats[0].id);
          }
      };
      fetchChats();
  }, [userId]);

  // Load Messages & Subscribe to Realtime
  useEffect(() => {
      if (!selectedChatId) return;

      const fetchMessages = async () => {
          const { data } = await supabase
              .from('messages')
              .select(`
                  *,
                  users (
                      username,
                      avatar_url
                  )
              `)
              .eq('chat_id', selectedChatId)
              .order('created_at', { ascending: true });
          
          if (data) setMessages(data);
      };

      fetchMessages();

      // Subscribe to new messages
      const channel = supabase
          .channel(`chat:${selectedChatId}`)
          .on('postgres_changes', { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'messages', 
              filter: `chat_id=eq.${selectedChatId}` 
          }, async (payload) => {
              // Fetch the user details for the new message
              const { data: userData } = await supabase.from('users').select('username, avatar_url').eq('id', payload.new.sender_id).single();
              const newMessage = { ...payload.new, users: userData };
              setMessages(prev => [...prev, newMessage]);
          })
          .subscribe();

      return () => {
          supabase.removeChannel(channel);
      };
  }, [selectedChatId]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChatId) return;
    
    const { error } = await supabase.from('messages').insert({
        chat_id: selectedChatId,
        sender_id: userId,
        content: message
    });

    if (error) console.error('Error sending message:', error);
    setMessage('');
  };

  useEffect(() => {
    if (localStream && localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);
  
  const currentUser = {
    name: 'Mr. Rabbit',
    phone: '+1 904 203 0390',
    username: 'rebelrabbit75',
    bio: '23 y.o. designer from San Francisco',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rabbit'
  };

  const [message, setMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(0);
  const [aiIsTyping, setAiIsTyping] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [remoteIdInput, setRemoteIdInput] = useState('');

  useEffect(() => {
    if (callState === 'connected') {
        setIsCalling(true);
    } else if (callState === 'idle') {
        setIsCalling(false);
    } else if (callState === 'incoming') {
        // Show incoming call UI
        setIsCalling(true); 
    }
  }, [callState]);

  useEffect(() => {
    let interval: any;
    if (callState === 'connected') {
      interval = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const [chats] = useState([
    { id: '1', name: 'Sarah Chen', status: 'Online', lastMsg: 'mockups are ready.', time: '10:45 AM', avatar: 'https://picsum.photos/seed/sarah/50' },
    { id: '2', name: 'Product Board', status: 'Offline', lastMsg: 'Sync updated.', time: 'Yesterday', avatar: 'https://picsum.photos/seed/game/50' },
    { id: '3', name: 'Mike Ross', status: 'Away', lastMsg: 'Thanks!', time: 'Monday', avatar: 'https://picsum.photos/seed/mike/50' },
  ]);

  const [chatMessages, setChatMessages] = useState<{ [key: string]: any[] }>({
    '1': [
      { text: "Did you see the latest designs?", sender: "Sarah Chen", time: "10:42 AM", isMe: false },
      { text: "Just checking them out now. Neon look is fire.", sender: "Me", time: "10:43 AM", isMe: true },
    ]
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatMessages, selectedChat, aiIsTyping, activeTab]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    const currentChat = chats[selectedChat];
    const chatId = currentChat.id;
    const newMessage = { text: message, sender: "Me", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: true };
    
    setChatMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMessage]
    }));
    setMessage('');
  };

  const handleGenerateSummary = async () => {
    setAiIsTyping(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const history = chatMessages[chats[selectedChat].id]?.map(m => `${m.sender}: ${m.text}`).join('\n') || "No messages yet.";
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Summarize this conversation into a few concise bullet points:\n\n${history}`,
      });
      setAiSummary(response.text || "No summary available.");
    } catch (err) { console.error(err); }
    finally { setAiIsTyping(false); }
  };

  const currentChat = chats.find(c => c.id === selectedChatId) || { name: 'Loading...', avatar: '' };
  // const messages is now state

  return (
    <div className="h-full flex gap-6 overflow-hidden animate-fade-in italic">
      <div className="w-80 flex flex-col bg-[#0E1430] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Telegram Settings Drawer */}
        <RabbitSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={currentUser} />

        <div className="p-4 border-b border-white/5 flex gap-2">
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
             <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <input type="text" placeholder="Search" className="flex-1 bg-[#080C22] border border-white/5 rounded-full py-2 pl-4 text-xs focus:outline-none focus:border-[#53C8FF]/30 font-bold" />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {chats.map((chat) => (
            <div key={chat.id} onClick={() => setSelectedChatId(chat.id)} className={`p-4 flex items-center gap-3 cursor-pointer border-l-2 ${selectedChatId === chat.id ? 'bg-[#53C8FF]/5 border-[#53C8FF]' : 'border-transparent hover:bg-white/5'}`}>
              <img src={chat.is_group ? 'https://picsum.photos/seed/group/50' : 'https://picsum.photos/seed/user/50'} className="w-10 h-10 rounded-xl" alt="" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center"><span className="font-black text-xs uppercase truncate tracking-widest">{chat.title || 'Untitled Chat'}</span></div>
                <p className="text-[10px] text-white/40 truncate italic font-bold">Tap to chat</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#0E1430] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
        
        {/* Call Overlay */}
        {isCalling && (
          <div className="absolute inset-0 z-50 bg-[#0E1430] flex flex-col items-center justify-center animate-fade-in">
             
             {/* Testing ID Display */}
             {callState === 'idle' && (
                <div className="absolute top-4 left-4 bg-white/10 p-2 rounded text-xs">
                    <p className="text-white/50">Your ID: <span className="text-white font-bold select-all">{userId}</span></p>
                    <div className="flex gap-2 mt-2">
                        <input 
                            value={remoteIdInput}
                            onChange={e => setRemoteIdInput(e.target.value)}
                            placeholder="Enter Remote ID"
                            className="bg-black/20 text-white px-2 py-1 rounded"
                        />
                        <button onClick={() => startCall(remoteIdInput)} className="bg-[#53C8FF] text-black px-2 py-1 rounded font-bold">Call</button>
                    </div>
                </div>
             )}

             <div className="relative mb-8 w-full max-w-2xl aspect-video bg-black/50 rounded-2xl overflow-hidden flex items-center justify-center">
                {remoteStream ? (
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                ) : (
                    <>
                        <img src={currentChat.avatar} className="w-32 h-32 rounded-full border-4 border-[#53C8FF] shadow-[0_0_50px_rgba(83,200,255,0.3)] relative z-10" />
                        <div className="absolute inset-0 border-4 border-[#53C8FF] rounded-full animate-ping opacity-20 w-32 h-32 m-auto"></div>
                    </>
                )}
                
                {/* Local Video Picture-in-Picture */}
                {localStream && (
                    <div className="absolute bottom-4 right-4 w-48 aspect-video bg-black rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl">
                        <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                    </div>
                )}
             </div>

             <h2 className="text-2xl font-black text-white mb-2">
                 {callState === 'incoming' ? 'Incoming Call...' : 
                  callState === 'calling' ? 'Calling...' : 
                  callState === 'connected' ? currentChat.name : 'Ready'}
             </h2>
             
             {callState === 'incoming' && incomingCallFrom && (
                 <p className="text-[#53C8FF] text-sm font-bold uppercase tracking-widest mb-12">From: {incomingCallFrom}</p>
             )}

             <p className="text-[#53C8FF] text-sm font-bold uppercase tracking-widest mb-12">
                {callDuration > 0 ? formatTime(callDuration) : ''}
             </p>
             
             <div className="flex items-center gap-6">
                {callState === 'incoming' ? (
                    <>
                        <button onClick={acceptCall} className="p-6 rounded-full bg-green-500 hover:bg-green-600 transition-all text-white shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:scale-110">
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        </button>
                        <button onClick={endCall} className="p-6 rounded-full bg-red-500 hover:bg-red-600 transition-all text-white shadow-lg hover:scale-110">
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/></svg>
                        </button>
                    </>
                ) : (
                    <>
                        <button className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 11l-4-4-4 4"/></svg>
                        </button>
                        <button className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                        </button>
                        <button className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                        </button>
                        <button onClick={() => { endCall(); setIsCalling(false); }} className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-all text-white shadow-lg hover:scale-110">
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/></svg>
                        </button>
                    </>
                )}
             </div>
          </div>
        )}

        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#080C22]/40 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <h3 className="font-black text-xs uppercase tracking-[0.2em]">{currentChat.name}</h3>
            <div className="flex bg-[#050819] p-1 rounded-lg">
              <button onClick={() => setActiveTab('messages')} className={`px-4 py-1 text-[8px] font-black uppercase tracking-widest rounded-md ${activeTab === 'messages' ? 'bg-[#1A2348] text-[#53C8FF]' : 'text-white/20'}`}>Messages</button>
              <button onClick={() => setActiveTab('ai')} className={`px-4 py-1 text-[8px] font-black uppercase tracking-widest rounded-md ${activeTab === 'ai' ? 'bg-[#1A2348] text-[#53C8FF]' : 'text-white/20'}`}>AI Intelligence</button>
            </div>
          </div>
          <div className="flex items-center gap-2">
              <button onClick={() => setIsCalling(true)} className="p-2 hover:bg-white/10 rounded-full text-[#53C8FF] transition-all hover:scale-110">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </button>
              <button className="p-2 hover:bg-white/10 rounded-full text-white/40 transition-all">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {activeTab === 'messages' ? (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'} group animate-fade-in`}>
                  <div className={`flex flex-col ${msg.sender_id === userId ? 'items-end' : 'items-start'} max-w-[80%]`}>
                      {msg.sender_id !== userId && (
                          <span className="text-[9px] text-white/40 mb-1 ml-2">{msg.users?.username || 'Unknown'}</span>
                      )}
                      <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-xl ${msg.sender_id === userId ? 'bg-[#1A2348] border border-[#53C8FF]/30' : 'bg-white/5 border border-white/5'}`}>
                        {msg.content}
                      </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 bg-[#53C8FF]/5 border border-[#53C8FF]/20 rounded-3xl">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#53C8FF] mb-4">Chat Context Analysis</h4>
                <div className="text-xs text-white/70 italic leading-relaxed whitespace-pre-wrap">
                  {aiIsTyping ? "Gemini is analyzing thread history..." : aiSummary || "Click below to generate a smart summary of this thread."}
                </div>
                {!aiIsTyping && (
                  <button onClick={handleGenerateSummary} className="mt-6 px-6 py-2 bg-[#53C8FF] text-[#0A0F1F] text-[9px] font-black uppercase tracking-widest rounded-xl">Summarize Discussion</button>
                )}
              </div>
            </div>
          )}
        </div>

        {activeTab === 'messages' && (
          <div className="p-6 bg-[#080C22]/80 backdrop-blur-lg border-t border-white/5">
            <div className="flex items-end gap-3 bg-[#0D1A2A] border border-[#1E3A5F] rounded-3xl p-3">
              <textarea rows={1} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={`Message ${currentChat.name}...`} className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-3 resize-none h-10 custom-scrollbar" />
              <button onClick={handleSendMessage} className="p-3 bg-[#53C8FF] text-[#0A0F1F] rounded-2xl transition-all"><Icons.Chat className="w-5 h-5"/></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
