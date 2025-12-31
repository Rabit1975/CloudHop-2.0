
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Icons } from '../constants';
import RabbitSettings from './RabbitSettings';
import CallOverlay from './CallOverlay';
import { useWebRTC } from '../hooks/useWebRTC';
import { supabase } from '../lib/supabaseClient';

interface ChatProps {
    userId?: string;
}

const Chat: React.FC<ChatProps> = ({ userId = '' }) => {
  const [activeTab, setActiveTab] = useState<'messages' | 'ai'>('messages');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [recentCalls, setRecentCalls] = useState<any[]>([]);

  const { 
    callState, 
    localStream, 
    remoteStream, 
    startCall, 
    acceptCall, 
    rejectCall,
    endCall, 
    incomingCallFrom,
    toggleMic,
    toggleCamera,
    switchCamera,
    toggleSpeaker,
    isMicOn,
    isCameraOn
  } = useWebRTC(userId);

  // --- Real-time Chat State ---
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<any>(null);

  const [userProfile, setUserProfile] = useState<any>(null);

  // Fetch Call History
  useEffect(() => {
      const fetchHistory = async () => {
          const { data } = await supabase
              .from('call_history')
              .select('*')
              .or(`caller_id.eq.${userId},receiver_id.eq.${userId}`)
              .order('started_at', { ascending: false })
              .limit(10);
          if (data) setRecentCalls(data);
      };
      if (showCallHistory) fetchHistory();
  }, [showCallHistory, userId]);

  // Load Chats on Mount
  useEffect(() => {
      const fetchChats = async () => {
          // Check if user exists, if not create one
          let { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
          if (!user) {
              const { data: newUser } = await supabase.from('users').insert({ 
                  id: userId, 
                  username: `user_${userId.substr(0,8)}`, 
                  display_name: 'New Rabbit',
                  avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`
              }).select().single();
              user = newUser;
          }
          setUserProfile(user);

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

      // Subscribe to new messages & Presence
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
          .on('presence', { event: 'sync' }, () => {
              const newState = channel.presenceState();
              const users = new Set<string>();
              
              // Map presence state to a unique set of user IDs
              for (const id in newState) {
                  // @ts-ignore
                  newState[id].forEach((presence: any) => {
                      if (presence.user_id) users.add(presence.user_id);
                  });
              }
              setOnlineUsers(users);
          })
          .on('presence', { event: 'join' }, ({ key, newPresences }) => {
              console.log('User joined:', newPresences);
          })
          .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
              console.log('User left:', leftPresences);
          })
          .on('broadcast', { event: 'typing' }, ({ payload }) => {
              if (payload.userId !== userId) {
                  setTypingUsers(prev => {
                      const newSet = new Set(prev);
                      newSet.add(payload.username);
                      return newSet;
                  });
                  
                  // Clear typing status after 3 seconds
                  setTimeout(() => {
                      setTypingUsers(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(payload.username);
                          return newSet;
                      });
                  }, 3000);
              }
          })
          .subscribe(async (status) => {
              if (status === 'SUBSCRIBED') {
                  // Track user presence with their ID
                  await channel.track({ 
                      user_id: userId, 
                      online_at: new Date().toISOString(),
                      username: currentUser.username 
                  });
              }
          });

      return () => {
          supabase.removeChannel(channel);
      };
  }, [selectedChatId, userId]);

  const [message, setMessage] = useState('');
  const [aiIsTyping, setAiIsTyping] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [remoteIdInput, setRemoteIdInput] = useState('');

  const handleTyping = async () => {
    if (!selectedChatId) return;
    
    // Throttle typing events
    if (typingTimeoutRef.current) return;
    
    typingTimeoutRef.current = setTimeout(() => {
        typingTimeoutRef.current = null;
    }, 2000);

    const channel = supabase.channel(`chat:${selectedChatId}`);
    await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, username: currentUser.username }
    });
  };

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
  
  const currentUser = userProfile ? {
    name: userProfile.display_name || 'Anonymous Rabbit',
    phone: '+1 555 0199', // Placeholder as DB doesn't have phone
    username: userProfile.username,
    bio: 'Ready to hop!', // Placeholder
    avatar: userProfile.avatar_url
  } : {
    name: 'Loading...',
    phone: '',
    username: '',
    bio: '',
    avatar: ''
  };

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

  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, selectedChatId, aiIsTyping, activeTab]);

  const handleGenerateSummary = async () => {
    if (!selectedChatId) return;
    setAiIsTyping(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing");
      const ai = new GoogleGenAI({ apiKey });
      
      const history = messages.map(m => `${m.sender_id === userId ? 'Me' : m.users?.username}: ${m.content}`).join('\n') || "No messages yet.";
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
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
          <div className="flex-1 flex gap-2">
             <button onClick={() => setShowCallHistory(!showCallHistory)} className={`p-2 rounded-lg transition-colors ${showCallHistory ? 'bg-[#53C8FF] text-[#0A0F1F]' : 'bg-[#080C22] text-white/60 hover:text-white'}`}>
                 <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/></svg>
             </button>
             <input type="text" placeholder="Search" className="flex-1 bg-[#080C22] border border-white/5 rounded-full py-2 pl-4 text-xs focus:outline-none focus:border-[#53C8FF]/30 font-bold" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {showCallHistory ? (
              <div className="p-4 space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#53C8FF] mb-4">Recent Calls</h3>
                  {recentCalls.map(call => (
                      <div key={call.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${call.status === 'missed' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/></svg>
                          </div>
                          <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white truncate">{call.caller_id === userId ? 'Outgoing' : 'Incoming'}</p>
                              <p className="text-[10px] text-white/40">{new Date(call.started_at).toLocaleTimeString()}</p>
                          </div>
                          <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${call.status === 'missed' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>{call.status}</span>
                      </div>
                  ))}
                  {recentCalls.length === 0 && <p className="text-center text-white/20 text-xs mt-10">No recent calls</p>}
              </div>
          ) : (
            chats.map((chat) => (
            <div key={chat.id} onClick={() => setSelectedChatId(chat.id)} className={`p-4 flex items-center gap-3 cursor-pointer border-l-2 ${selectedChatId === chat.id ? 'bg-[#53C8FF]/5 border-[#53C8FF]' : 'border-transparent hover:bg-white/5'}`}>
              <img src={chat.is_group ? 'https://picsum.photos/seed/group/50' : 'https://picsum.photos/seed/user/50'} className="w-10 h-10 rounded-xl" alt="" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center"><span className="font-black text-xs uppercase truncate tracking-widest">{chat.title || 'Untitled Chat'}</span></div>
                <p className="text-[10px] text-white/40 truncate italic font-bold">Tap to chat</p>
              </div>
            </div>
          )))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#0E1430] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
        
        {/* Call Overlay */}
        <CallOverlay 
            callState={callState}
            localStream={localStream}
            remoteStream={remoteStream}
            incomingCallFrom={incomingCallFrom}
            onAccept={acceptCall}
            onReject={rejectCall}
            onEnd={() => { endCall(); setIsCalling(false); }}
            toggleMic={toggleMic}
            toggleCamera={toggleCamera}
            switchCamera={switchCamera}
            toggleSpeaker={toggleSpeaker}
            isMicOn={isMicOn}
            isCameraOn={isCameraOn}
            callerName={incomingCallFrom || 'Unknown Caller'}
        />

        {/* --- Testing ID Display (Keep for dev, hide when overlay active) --- */}
        {!['incoming', 'connected', 'calling'].includes(callState) && isCalling && (
          <div className="absolute inset-0 z-50 bg-[#0E1430] flex flex-col items-center justify-center animate-fade-in">
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
                <div className="text-center">
                    <h2 className="text-xl font-bold text-white mb-4">Start a Call</h2>
                    <p className="text-white/40 text-sm">Enter a User ID to begin.</p>
                </div>
          </div>
        )}

        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#080C22]/40 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div>
                <h3 className="font-black text-xs uppercase tracking-[0.2em]">{currentChat.title || 'General Lobby'}</h3>
                {selectedChatId && (
                    <p className="text-[9px] text-[#53C8FF] font-bold uppercase tracking-widest mt-0.5 animate-pulse">
                        {onlineUsers.size} Online {typingUsers.size > 0 && `• ${Array.from(typingUsers).join(', ')} is typing...`}
                    </p>
                )}
            </div>
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
              <textarea 
                  rows={1} 
                  value={message} 
                  onChange={(e) => {
                      setMessage(e.target.value);
                      handleTyping();
                  }} 
                  placeholder={`Message ${currentChat.title || 'chat'}...`} 
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-3 resize-none h-10 custom-scrollbar" 
              />
              <button onClick={handleSendMessage} className="p-3 bg-[#53C8FF] text-[#0A0F1F] rounded-2xl transition-all"><Icons.Chat className="w-5 h-5"/></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
