"use client";

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Icons } from '../constants';
import RabbitSettings from './RabbitSettings';
import { useWebRTC } from '../hooks/useWebRTC';
import { supabase } from '../lib/supabaseClient';
import CallOverlay from './CallOverlay'; // Import the refactored CallOverlay
import { CallHistory } from '../types'; // Import CallHistory type

interface ChatProps {
    userId?: string;
}

const Chat: React.FC<ChatProps> = ({ userId = '' }) => {
  const [activeTab, setActiveTab] = useState<'messages' | 'ai'>('messages');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const { 
    callState, 
    localStream, 
    remoteStream, 
    startCall, 
    acceptCall, 
    rejectCall, // Added rejectCall
    endCall, 
    incomingCallFrom,
    toggleMic,
    toggleCamera,
    switchCamera, // Added switchCamera
    toggleSpeaker, // Added toggleSpeaker
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
  const [callHistory, setCallHistory] = useState<CallHistory[]>([]); // State for call history

  const [userProfile, setUserProfile] = useState<any>(null);

  // Load Chats and User Profile on Mount
  useEffect(() => {
      const fetchInitialData = async () => {
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

          // Fetch call history
          const { data: historyData, error: historyError } = await supabase
            .from('call_history')
            .select(`
                *,
                caller:users!caller_id (display_name, avatar_url),
                receiver:users!receiver_id (display_name, avatar_url)
            `)
            .or(`caller_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('started_at', { ascending: false })
            .limit(5);

          if (historyError) console.error('Error fetching call history:', historyError);
          else setCallHistory(historyData || []);
      };
      fetchInitialData();
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
                      username: userProfile?.username || 'Anonymous' // Use userProfile
                  });
              }
          });

      return () => {
          supabase.removeChannel(channel);
      };
  }, [selectedChatId, userId, userProfile]); // Added userProfile to dependencies

  const [message, setMessage] = useState('');
  const [aiIsTyping, setAiIsTyping] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [remoteIdInput, setRemoteIdInput] = useState(''); // For testing calls

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
        payload: { userId, username: userProfile?.username || 'Anonymous' } // Use userProfile
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

  return (
    <div className="h-full flex gap-6 overflow-hidden animate-fade-in italic">
      {/* Call Overlay - Renders when callState is not 'idle' */}
      {callState !== 'idle' && (
        <CallOverlay
          callState={callState}
          localStream={localStream}
          remoteStream={remoteStream}
          incomingCallFrom={incomingCallFrom}
          onAccept={acceptCall}
          onReject={rejectCall}
          onEnd={endCall}
          toggleMic={toggleMic}
          toggleCamera={toggleCamera}
          switchCamera={switchCamera}
          toggleSpeaker={toggleSpeaker}
          isMicOn={isMicOn}
          isCameraOn={isCameraOn}
          callerName={incomingCallFrom || 'Unknown'} // Use incomingCallFrom for caller name
          callerAvatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${incomingCallFrom}`}
          currentUserId={userId}
        />
      )}

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

          {/* Call History Section */}
          {callHistory.length > 0 && (
            <div className="mt-6 p-4 border-t border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#53C8FF] mb-4">Recent Calls</h4>
              <div className="space-y-2">
                {callHistory.map((call) => {
                  const otherUser = call.caller_id === userId ? call.receiver : call.caller;
                  const isOutgoing = call.caller_id === userId;
                  const callIcon = call.status === 'ended' ? '📞' : call.status === 'rejected' ? '🚫' : '⏳';
                  const callColor = call.status === 'ended' ? 'text-[#3DD68C]' : call.status === 'rejected' ? 'text-red-400' : 'text-yellow-400';
                  const callStatusText = call.status === 'ended' ? 'Ended' : call.status === 'rejected' ? 'Rejected' : 'Missed';

                  return (
                    <div key={call.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${callColor}`}>
                        {callIcon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-white truncate">{otherUser?.display_name || 'Unknown User'}</span>
                        <p className="text-[10px] text-white/40 truncate">
                          {isOutgoing ? 'Outgoing' : 'Incoming'} • {callStatusText}
                        </p>
                      </div>
                      <span className="text-[10px] text-white/30">
                        {new Date(call.started_at).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#0E1430] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
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
              {/* Test Call Button */}
              <input 
                  type="text" 
                  value={remoteIdInput} 
                  onChange={(e) => setRemoteIdInput(e.target.value)} 
                  placeholder="Remote ID" 
                  className="bg-white/5 text-white px-2 py-1 rounded-md text-xs w-24"
              />
              <button onClick={() => startCall(remoteIdInput)} className="p-2 hover:bg-white/10 rounded-full text-[#53C8FF] transition-all hover:scale-110">
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