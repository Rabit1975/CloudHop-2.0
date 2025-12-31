import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Icons } from '../constants';
import RabbitSettings from './RabbitSettings';
import CallOverlay from './CallOverlay';
import { useWebRTC } from '../hooks/useWebRTC';
import { supabase } from '../lib/supabaseClient';
import { CallHistory, Message, ReactionSummary } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatProps {
    userId?: string;
}

interface ChatInputProps {
    onSendMessage: (content: string) => void;
    onTyping: () => void;
    placeholder: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onTyping, placeholder }) => {
    const [message, setMessage] = useState('');
    
    const handleSend = () => {
        if (!message.trim()) return;
        onSendMessage(message);
        setMessage('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="p-6 bg-[#080C22]/80 backdrop-blur-lg border-t border-white/5">
            <div className="flex items-end gap-3 bg-[#0D1A2A] border border-[#1E3A5F] rounded-3xl p-3">
                <textarea 
                    rows={1} 
                    value={message} 
                    onChange={(e) => {
                        setMessage(e.target.value);
                        onTyping();
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder} 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-3 resize-none h-10 custom-scrollbar" 
                />
                <button onClick={handleSend} className="p-3 bg-[#53C8FF] text-[#0A0F1F] rounded-2xl transition-all">
                    <Icons.Chat className="w-5 h-5"/>
                </button>
            </div>
        </div>
    );
};

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

const Chat: React.FC<ChatProps> = ({ userId = '' }) => {
  const [activeTab, setActiveTab] = useState<'messages' | 'ai'>('messages');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [callHistory, setCallHistory] = useState<CallHistory[]>([]); 
  
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

  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<any>(null);
  const chatChannelRef = useRef<any>(null);

  const [userProfile, setUserProfile] = useState<any>(null);
  const [showReactionPickerFor, setShowReactionPickerFor] = useState<string | null>(null);
  const [hoveredReaction, setHoveredReaction] = useState<{ messageId: string; emoji: string; text: string } | null>(null);

  // Long press state
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const LONG_PRESS_DURATION = 500; // milliseconds

  const handlePressStart = (messageId: string) => {
    longPressTimer.current = setTimeout(() => {
      setShowReactionPickerFor(messageId);
    }, LONG_PRESS_DURATION);
  };

  const handlePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Fetch Call History
  useEffect(() => {
      const fetchHistory = async () => {
          const { data: historyData, error: historyError } = await supabase
            .from('call_history')
            .select(`
                *,
                caller:users!caller_id (display_name, avatar_url),
                receiver:users!receiver_id (display_name, avatar_url)
            `)
            .or(`caller_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('started_at', { ascending: false })
            .limit(10);

          if (historyError) console.error('Error fetching call history:', historyError);
          else setCallHistory(historyData || []);
      };
      if (showCallHistory || userId) fetchHistory();
  }, [showCallHistory, userId]);

  // Load Chats and User Profile on Mount
  useEffect(() => {
      const fetchInitialData = async () => {
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

          let { data: existingChats } = await supabase.from('chats').select('*');
          
          if (!existingChats || existingChats.length === 0) {
              const { data: newChat } = await supabase.from('chats').insert({ title: 'General Lobby', is_group: true }).select().single();
              if (newChat) existingChats = [newChat];
          }
          
          if (existingChats) {
              setChats(existingChats);
              setSelectedChatId(existingChats[0].id);
          }
      };
      fetchInitialData();
  }, [userId]);

  // Load Messages & Subscribe to Realtime
  useEffect(() => {
      if (!selectedChatId || !userId) return;

      let reactionsChannel: any;

      const fetchMessagesAndReactions = async () => {
          const { data: fetchedMessages, error: messagesError } = await supabase
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
          
          if (messagesError) {
              console.error('Error fetching messages:', messagesError);
              return;
          }

          const messageIds = fetchedMessages?.map(m => m.id) || [];
          const { data: fetchedReactions, error: reactionsError } = await supabase
              .from('message_reactions')
              .select('*')
              .in('message_id', messageIds);

          if (reactionsError) {
              console.error('Error fetching reactions:', reactionsError);
              return;
          }

          const messagesWithReactions = fetchedMessages?.map(msg => {
              const reactionsForMessage = fetchedReactions?.filter(r => r.message_id === msg.id) || [];
              const reactionSummary: ReactionSummary[] = [];
              
              const emojiMap = new Map<string, { count: number; reactedByCurrentUser: boolean }>();
              reactionsForMessage.forEach(r => {
                  const current = emojiMap.get(r.emoji) || { count: 0, reactedByCurrentUser: false };
                  emojiMap.set(r.emoji, {
                      count: current.count + 1,
                      reactedByCurrentUser: current.reactedByCurrentUser || (r.user_id === userId)
                  });
              });

              emojiMap.forEach((value, emoji) => {
                  reactionSummary.push({ emoji, count: value.count, reactedByCurrentUser: value.reactedByCurrentUser });
              });

              return { ...msg, reactions: reactionSummary };
          }) || [];
          
          setMessages(messagesWithReactions);

          if (messageIds.length > 0) {
            reactionsChannel = supabase
                .channel(`message_reactions:${selectedChatId}`)
                .on('postgres_changes', { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'message_reactions', 
                    filter: `message_id=in.(${messageIds.join(',')})`
                }, (payload) => {
                    const newReaction = payload.new as any;
                    setMessages(prevMessages => prevMessages.map(msg => {
                        if (msg.id === newReaction.message_id) {
                            const existingReactions = msg.reactions || [];
                            const reactionIndex = existingReactions.findIndex(r => r.emoji === newReaction.emoji);
                            
                            if (reactionIndex > -1) {
                                const updatedReactions = [...existingReactions];
                                updatedReactions[reactionIndex] = {
                                    ...updatedReactions[reactionIndex],
                                    count: updatedReactions[reactionIndex].count + 1,
                                    reactedByCurrentUser: updatedReactions[reactionIndex].reactedByCurrentUser || (newReaction.user_id === userId)
                                };
                                return { ...msg, reactions: updatedReactions };
                            } else {
                                return { 
                                    ...msg, 
                                    reactions: [...existingReactions, { 
                                        emoji: newReaction.emoji, 
                                        count: 1, 
                                        reactedByCurrentUser: (newReaction.user_id === userId) 
                                    }] 
                                };
                            }
                        }
                        return msg;
                    }));
                })
                .on('postgres_changes', { 
                    event: 'DELETE', 
                    schema: 'public', 
                    table: 'message_reactions', 
                    filter: `message_id=in.(${messageIds.join(',')})` 
                }, (payload) => {
                    const deletedReaction = payload.old as any;
                    setMessages(prevMessages => prevMessages.map(msg => {
                        if (msg.id === deletedReaction.message_id) {
                            const existingReactions = msg.reactions || [];
                            const reactionIndex = existingReactions.findIndex(r => r.emoji === deletedReaction.emoji);
                            
                            if (reactionIndex > -1) {
                                const updatedReactions = [...existingReactions];
                                updatedReactions[reactionIndex] = {
                                    ...updatedReactions[reactionIndex],
                                    count: updatedReactions[reactionIndex].count - 1,
                                    reactedByCurrentUser: updatedReactions[reactionIndex].reactedByCurrentUser && (deletedReaction.user_id !== userId)
                                };
                                return { ...msg, reactions: updatedReactions.filter(r => r.count > 0) };
                            }
                        }
                        return msg;
                    }));
                })
                .subscribe();
          }
      };

      fetchMessagesAndReactions();

      chatChannelRef.current = supabase.channel(`chat:${selectedChatId}`);
      const chatChannel = chatChannelRef.current
          .on('postgres_changes', { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'messages', 
              filter: `chat_id=eq.${selectedChatId}` 
          }, async (payload) => {
              const { data: userData } = await supabase.from('users').select('username, avatar_url').eq('id', payload.new.sender_id).single();
              const newMessage = { ...payload.new, users: userData, reactions: [] };
              setMessages(prev => [...prev, newMessage]);
          })
          .on('postgres_changes', { 
              event: 'UPDATE', 
              schema: 'public', 
              table: 'messages', 
              filter: `chat_id=eq.${selectedChatId}` 
          }, (payload) => {
              setMessages(prev => prev.map(msg => msg.id === payload.new.id ? { ...msg, ...payload.new } : msg));
          })
          .on('postgres_changes', { 
              event: 'DELETE', 
              schema: 'public', 
              table: 'messages', 
              filter: `chat_id=eq.${selectedChatId}` 
          }, (payload) => {
              setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
          })
          .on('presence', { event: 'sync' }, () => {
              const newState = chatChannel.presenceState();
              const users = new Set<string>();
              
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
                  chatChannelRef.current = chatChannel;
                  await chatChannel.track({ 
                      user_id: userId, 
                      online_at: new Date().toISOString(),
                      username: userProfile?.username || 'Anonymous' 
                  });
              }
          });


      return () => {
          if (chatChannelRef.current) chatChannelRef.current = null;
          supabase.removeChannel(chatChannel);
          if (reactionsChannel) supabase.removeChannel(reactionsChannel);
      };
  }, [selectedChatId, userId, userProfile]); 

  const [aiIsTyping, setAiIsTyping] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [remoteIdInput, setRemoteIdInput] = useState(''); 
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // --- Message Editing & Deletion State ---
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);

  const handleTyping = async () => {
    if (!selectedChatId) return;
    
    if (typingTimeoutRef.current) return;
    
    typingTimeoutRef.current = setTimeout(() => {
        typingTimeoutRef.current = null;
    }, 2000);

    const channel = chatChannelRef.current || supabase.channel(`chat:${selectedChatId}`);
    await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, username: userProfile?.username || 'Anonymous' } 
    });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !selectedChatId || !userId) return;
    
    const { error } = await supabase.from('messages').insert({
        chat_id: selectedChatId,
        sender_id: userId,
        content: content
    });

    if (error) console.error('Error sending message:', error);
  };
  
  const currentUser = userProfile ? {
    name: userProfile.display_name || 'Anonymous Rabbit',
    phone: '+1 555 0199', 
    username: userProfile.username,
    bio: 'Ready to hop!', 
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

  useEffect(() => {
    if (callState === 'connected') {
        setIsCalling(true);
    } else if (callState === 'idle') {
        setIsCalling(false);
    } else if (callState === 'incoming') {
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

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    if (!userId) return;

    // Optimistic Update
    setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
            const existingReactions = msg.reactions || [];
            const reactionIndex = existingReactions.findIndex(r => r.emoji === emoji);
            const hasReacted = existingReactions[reactionIndex]?.reactedByCurrentUser;

            let updatedReactions;
            if (reactionIndex > -1) {
                updatedReactions = [...existingReactions];
                if (hasReacted) {
                    // Remove reaction
                    updatedReactions[reactionIndex] = {
                        ...updatedReactions[reactionIndex],
                        count: updatedReactions[reactionIndex].count - 1,
                        reactedByCurrentUser: false
                    };
                    updatedReactions = updatedReactions.filter(r => r.count > 0);
                } else {
                    // Add reaction (existing emoji)
                    updatedReactions[reactionIndex] = {
                        ...updatedReactions[reactionIndex],
                        count: updatedReactions[reactionIndex].count + 1,
                        reactedByCurrentUser: true
                    };
                }
            } else {
                // Add new reaction
                updatedReactions = [...existingReactions, {
                    emoji,
                    count: 1,
                    reactedByCurrentUser: true
                }];
            }
            return { ...msg, reactions: updatedReactions };
        }
        return msg;
    }));
    setShowReactionPickerFor(null);

    const message = messages.find(m => m.id === messageId);
    const hasReacted = message?.reactions?.some(r => r.emoji === emoji && r.reactedByCurrentUser);

    if (hasReacted) {
        const { error } = await supabase
            .from('message_reactions')
            .delete()
            .eq('message_id', messageId)
            .eq('user_id', userId)
            .eq('emoji', emoji);
        if (error) console.error('Error deleting reaction:', error);
    } else {
        const { error } = await supabase
            .from('message_reactions')
            .insert({ message_id: messageId, user_id: userId, emoji });
        if (error) console.error('Error inserting reaction:', error);
    }
  };

  // --- Edit & Delete Handlers ---
  const handleEditStart = (msg: Message) => {
      setEditingMessageId(msg.id);
      setEditContent(msg.content);
      setShowReactionPickerFor(null);
  };

  const handleEditCancel = () => {
      setEditingMessageId(null);
      setEditContent('');
  };

  const handleEditSave = async () => {
      if (!editingMessageId || !editContent.trim()) return;
      
      const { error } = await supabase
          .from('messages')
          .update({ content: editContent, edited_at: new Date().toISOString() })
          .eq('id', editingMessageId);

      if (error) {
          console.error('Error updating message:', error);
      } else {
          setEditingMessageId(null);
          setEditContent('');
      }
  };

  const handleDeleteStart = (messageId: string) => {
      setDeletingMessageId(messageId);
      setShowReactionPickerFor(null);
  };

  const handleDeleteConfirm = async () => {
      if (!deletingMessageId) return;

      const { error } = await supabase
          .from('messages')
          .delete()
          .eq('id', deletingMessageId);

      if (error) {
          console.error('Error deleting message:', error);
      }
      setDeletingMessageId(null);
  };

  const getReactionTooltipText = (reaction: ReactionSummary) => {
    if (reaction.reactedByCurrentUser) {
      return reaction.count > 1 
        ? `You and ${reaction.count - 1} others reacted with ${reaction.emoji}`
        : `You reacted with ${reaction.emoji}`;
    } else {
      return `${reaction.count} people reacted with ${reaction.emoji}`;
    }
  };

  const currentChat = chats.find(c => c.id === selectedChatId) || { title: 'General Lobby', avatar: '' };

  return (
    <div className="h-full flex gap-6 overflow-hidden animate-fade-in italic">
      <AnimatePresence>
      {deletingMessageId && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
            <div className="bg-[#0E1430] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
                <h3 className="text-lg font-bold text-white mb-2">Delete Message?</h3>
                <p className="text-sm text-white/60 mb-6">Are you sure you want to delete this message? This action cannot be undone.</p>
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setDeletingMessageId(null)}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleDeleteConfirm}
                        className="px-4 py-2 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </motion.div>
      )}
      </AnimatePresence>

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
          callerName={incomingCallFrom || 'Unknown'} 
          callerAvatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${incomingCallFrom}`}
        />
      )}

      <div className="w-80 flex flex-col bg-[#0E1430] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
        <RabbitSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={currentUser} onChatCreated={() => {}} />

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
                  {callHistory.map(call => (
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
                  {callHistory.length === 0 && <p className="text-center text-white/20 text-xs mt-10">No recent calls</p>}
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
              <input 
                  type="text" 
                  value={remoteIdInput} 
                  onChange={(e) => setRemoteIdInput(e.target.value)} 
                  placeholder="Remote ID" 
                  className="bg-white/5 text-white px-2 py-1 rounded-md text-xs w-24"
              />
              <button onClick={() => startCall(remoteIdInput, selectedChatId || undefined)} className="p-2 hover:bg-white/10 rounded-full text-[#53C8FF] transition-all hover:scale-110">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </button>
              <button className="p-2 hover:bg-white/10 rounded-full text-white/40 transition-all">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {activeTab === 'messages' ? (
            <>
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'} group animate-fade-in relative`}
                  onMouseDown={() => handlePressStart(msg.id)}
                  onMouseUp={handlePressEnd}
                  onMouseLeave={handlePressEnd}
                  onTouchStart={() => handlePressStart(msg.id)}
                  onTouchEnd={handlePressEnd}
                >
                  <div className={`flex flex-col ${msg.sender_id === userId ? 'items-end' : 'items-start'} max-w-[80%]`}>
                      {msg.sender_id !== userId && (
                          <span className="text-[9px] text-white/40 mb-1 ml-2">{msg.users?.username || 'Unknown'}</span>
                      )}
                      
                      <div 
                        className={`p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-xl relative ${msg.sender_id === userId ? 'bg-[#1A2348] border border-[#53C8FF]/30' : 'bg-white/5 border border-white/5'}`}
                        onClick={() => {
                            if (editingMessageId !== msg.id) {
                                setShowReactionPickerFor(msg.id === showReactionPickerFor ? null : msg.id);
                            }
                        }}
                      >
                        {editingMessageId === msg.id ? (
                            <div className="flex flex-col gap-2 min-w-[200px]" onClick={e => e.stopPropagation()}>
                                <textarea
                                    value={editContent}
                                    onChange={e => setEditContent(e.target.value)}
                                    className="w-full bg-black/20 text-white rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#53C8FF] resize-none"
                                    rows={2}
                                    autoFocus
                                />
                                <div className="flex justify-end gap-2">
                                    <button onClick={handleEditCancel} className="text-[10px] text-white/50 hover:text-white">Cancel</button>
                                    <button onClick={handleEditSave} className="text-[10px] bg-[#53C8FF] text-[#0A0F1F] px-2 py-1 rounded font-bold">Save</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {msg.content}
                                {msg.edited_at && <span className="text-[8px] text-white/30 ml-1 italic">(edited)</span>}
                                
                                <AnimatePresence>
                                {showReactionPickerFor === msg.id && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className={`absolute z-10 flex flex-col gap-2 p-2 bg-[#080C22] border border-[#53C8FF]/20 rounded-xl shadow-lg ${msg.sender_id === userId ? 'right-0 -top-24' : 'left-0 -top-24'}`}
                                    >
                                        <div className="flex gap-1">
                                            {REACTION_EMOJIS.map(emoji => (
                                                <motion.button 
                                                    key={emoji} 
                                                    whileHover={{ scale: 1.2 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="text-lg p-1"
                                                    onClick={(e) => { e.stopPropagation(); handleToggleReaction(msg.id, emoji); }}
                                                >
                                                    {emoji}
                                                </motion.button>
                                            ))}
                                        </div>
                                        {msg.sender_id === userId && (
                                            <div className="flex gap-2 border-t border-white/10 pt-2 justify-end px-1">
                                                <button onClick={(e) => { e.stopPropagation(); handleEditStart(msg); }} className="flex items-center gap-1 text-[10px] text-white/60 hover:text-[#53C8FF]">
                                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                    Edit
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteStart(msg.id); }} className="flex items-center gap-1 text-[10px] text-white/60 hover:text-red-500">
                                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                                </AnimatePresence>

                                {msg.reactions && msg.reactions.length > 0 && (
                            <div className={`flex gap-1 mt-2 ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                                {msg.reactions.map(reaction => (
                                    <motion.button 
                                        key={reaction.emoji}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        onClick={(e) => { e.stopPropagation(); handleToggleReaction(msg.id, reaction.emoji); }}
                                        onMouseEnter={() => setHoveredReaction({ messageId: msg.id, emoji: reaction.emoji, text: getReactionTooltipText(reaction) })}
                                        onMouseLeave={() => setHoveredReaction(null)}
                                        className={`relative flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all ${reaction.reactedByCurrentUser ? 'bg-[#53C8FF] text-[#0A0F1F] border border-[#53C8FF]' : 'bg-white/10 text-white/70 border border-white/10 hover:bg-white/20'}`}
                                    >
                                        {reaction.emoji} {reaction.count}
                                        <AnimatePresence>
                                            {hoveredReaction?.messageId === msg.id && hoveredReaction.emoji === reaction.emoji && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: -25 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-md text-white text-[9px] whitespace-nowrap pointer-events-none"
                                                >
                                                    {hoveredReaction.text}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>
                                ))}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setShowReactionPickerFor(msg.id === showReactionPickerFor ? null : msg.id); }}
                                    className="flex items-center justify-center w-6 h-6 rounded-full bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-colors text-xs font-bold"
                                >
                                    +
                                </button>
                            </div>
                        )}
                            </>
                        )}
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
          <ChatInput 
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            placeholder={`Message ${currentChat.title || 'chat'}...`}
          />
        )}
      </div>
    </div>
  );
};

export default Chat;
