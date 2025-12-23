import React, { useState, useEffect } from 'react';
import { Icons, CloudHopLogo } from '../constants';
import { useSpace } from '../contexts/SpaceContext';
import Modal from './Modal';

// --- Types for Telegram-style HopHub ---
type ChatType = 'group' | 'channel' | 'dm';

interface Chat {
  id: string;
  name: string;
  type: ChatType;
  icon?: string;
  avatar?: string;
  description?: string;
  membersCount: number;
  lastMessage?: {
    text: string;
    sender: string;
    time: string;
  };
  unreadCount?: number;
  isPrivate?: boolean;
  folder?: 'Personal' | 'Work' | 'Crypto' | 'Gaming';
  topics?: string[]; // For supergroups
}

interface Message {
  id: string;
  text: string;
  sender: string;
  time: string;
  isMe: boolean;
  views?: number; // For channels
}

const MOCK_CHATS: Chat[] = [
  {
    id: '1',
    name: 'CloudHop Updates',
    type: 'channel',
    icon: '📢',
    membersCount: 45200,
    description: 'Official announcements and feature drops.',
    lastMessage: { text: 'HopHub 2.0 is live! Check out the new groups.', sender: 'Admin', time: '12:00 PM' },
    unreadCount: 2,
    folder: 'Work'
  },
  {
    id: '2',
    name: 'Dev Team Alpha',
    type: 'group',
    icon: '👨‍💻',
    membersCount: 12,
    description: 'Core dev team discussion.',
    lastMessage: { text: 'Did we fix the zoom bug?', sender: 'Alex', time: '12:05 PM' },
    unreadCount: 5,
    folder: 'Work'
  },
  {
    id: '3',
    name: 'Crypto Degens',
    type: 'group',
    icon: '🚀',
    membersCount: 15400,
    description: 'To the moon only.',
    lastMessage: { text: 'BTC hitting 100k soon?', sender: 'Whale', time: '11:58 AM' },
    folder: 'Crypto'
  },
  {
    id: '4',
    name: 'Sarah Connor',
    type: 'dm',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    membersCount: 2,
    lastMessage: { text: 'Are you free for a call?', sender: 'Sarah', time: 'Yesterday' },
    folder: 'Personal'
  }
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: '1', text: 'Welcome to the official CloudHop channel!', sender: 'Admin', time: '10:00 AM', isMe: false, views: 1200 },
    { id: '2', text: 'HopHub 2.0 is live! Check out the new groups.', sender: 'Admin', time: '12:00 PM', isMe: false, views: 450 }
  ],
  '2': [
    { id: '1', text: 'Hey guys, status update?', sender: 'Lead', time: '11:00 AM', isMe: false },
    { id: '2', text: 'Working on the rendering engine.', sender: 'Me', time: '11:05 AM', isMe: true },
    { id: '3', text: 'Did we fix the zoom bug?', sender: 'Alex', time: '12:05 PM', isMe: false }
  ]
};

const Communities: React.FC = () => {
  const { setCurrentSpace } = useSpace();
  const [activeChatId, setActiveChatId] = useState<string>('1');
  const [activeFolder, setActiveFolder] = useState<string>('All');
  
  // Creation Modal State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [createType, setCreateType] = useState<'group' | 'channel'>('group');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const activeChat = MOCK_CHATS.find(c => c.id === activeChatId) || MOCK_CHATS[0];
  const messages = MOCK_MESSAGES[activeChatId] || [];

  // Filter chats by folder
  const filteredChats = MOCK_CHATS.filter(chat => {
    if (activeFolder === 'All') return true;
    return chat.folder === activeFolder;
  });

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    // Add to mock messages for the active chat
    const newMessage = { 
        id: Date.now().toString(), 
        text: messageInput, 
        sender: 'You', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        isMe: true 
    };
    
    // In a real app, this would be an API call
    // For local state update, we need to lift state up or use a context, 
    // but for this demo we'll just update the local constant temporarily 
    // or better yet, use a local state for messages if we want it to be interactive in the session
    
    // Updating local state map
    const chatId = activeChatId;
    if (!MOCK_MESSAGES[chatId]) MOCK_MESSAGES[chatId] = [];
    MOCK_MESSAGES[chatId].push(newMessage);
    
    setMessageInput('');
  };

  const [messageInput, setMessageInput] = useState('');

  // Force re-render when mock messages update
  const [, setTick] = useState(0);
  useEffect(() => {
      const interval = setInterval(() => setTick(t => t + 1), 1000);
      return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex gap-1 rounded-[32px] overflow-hidden border border-white/5 bg-[#080C22] shadow-2xl animate-fade-in font-sans">
      
      {/* Compose Modal */}
      <Modal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} title={`New ${createType === 'group' ? 'Group' : 'Channel'}`}>
         <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
             <button onClick={() => setCreateType('group')} className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${createType === 'group' ? 'bg-[#53C8FF] text-[#0A0F1F]' : 'bg-white/5 text-white/40'}`}>New Group</button>
             <button onClick={() => setCreateType('channel')} className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${createType === 'channel' ? 'bg-[#53C8FF] text-[#0A0F1F]' : 'bg-white/5 text-white/40'}`}>New Channel</button>
         </div>
         
         <form onSubmit={handleCreate} className="space-y-6">
            <div className="flex items-center gap-4 justify-center py-4">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-3xl border-2 border-dashed border-white/20 hover:border-[#53C8FF] cursor-pointer transition-colors">
                    📷
                </div>
            </div>
            
            <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-[#53C8FF]">{createType} Name</label>
                <input 
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full bg-[#050819] border border-white/10 rounded-xl p-4 text-white focus:border-[#53C8FF] outline-none font-bold"
                    placeholder={`e.g. ${createType === 'group' ? 'Crypto Talk' : 'Daily News'}`}
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-[#53C8FF]">Description (Optional)</label>
                <input 
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    className="w-full bg-[#050819] border border-white/10 rounded-xl p-4 text-white focus:border-[#53C8FF] outline-none text-sm"
                    placeholder="What is this community about?"
                />
            </div>

            <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
                <div>
                    <div className="text-xs font-bold text-white">Private {createType === 'group' ? 'Group' : 'Channel'}</div>
                    <div className="text-[10px] text-white/40">Only via invite link</div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isPrivate ? 'bg-[#53C8FF]' : 'bg-white/10'}`}
                >
                   <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isPrivate ? 'translate-x-6' : ''}`} />
                </button>
            </div>

            <button type="submit" className="w-full py-4 bg-[#53C8FF] text-[#0A0F1F] rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg shadow-[#53C8FF]/20">Create</button>
         </form>
      </Modal>

      {/* LEFT SIDEBAR: HopHub (Telegram Style) */}
      <div className="w-80 bg-[#050819] flex flex-col border-r border-white/5">
         {/* Header */}
         <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
             <div className="flex items-center gap-2">
                 <button className="w-8 h-8 rounded-lg bg-[#53C8FF]/10 flex items-center justify-center text-[#53C8FF]">
                     <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h7"/></svg>
                 </button>
                 <span className="font-black italic tracking-tighter text-lg">HopHub</span>
             </div>
             <button 
                onClick={() => setIsComposeOpen(true)}
                className="w-10 h-10 rounded-full bg-[#53C8FF] text-[#0A0F1F] flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-[#53C8FF]/20"
             >
                 <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
             </button>
         </div>

         {/* Folders Bar */}
         <div className="flex gap-1 p-2 overflow-x-auto custom-scrollbar border-b border-white/5 shrink-0">
             {['All', 'Personal', 'Work', 'Crypto', 'Gaming'].map(folder => (
                 <button 
                    key={folder}
                    onClick={() => setActiveFolder(folder)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${activeFolder === folder ? 'bg-[#53C8FF]/10 text-[#53C8FF]' : 'text-white/30 hover:bg-white/5 hover:text-white'}`}
                 >
                     {folder}
                 </button>
             ))}
         </div>

         {/* Chat List */}
         <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
             {filteredChats.map(chat => (
                 <button 
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeChatId === chat.id ? 'bg-[#53C8FF]/10 border border-[#53C8FF]/20' : 'hover:bg-white/5 border border-transparent'}`}
                 >
                     <div className="relative shrink-0">
                         {chat.avatar ? (
                             <img src={chat.avatar} className="w-12 h-12 rounded-full object-cover" alt={chat.name} />
                         ) : (
                             <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${activeChatId === chat.id ? 'bg-[#53C8FF] text-[#0A0F1F]' : 'bg-white/10 text-white'}`}>
                                 {chat.icon || chat.name.charAt(0)}
                             </div>
                         )}
                         {chat.type !== 'dm' && (
                             <div className="absolute -bottom-1 -right-1 bg-[#050819] rounded-full p-0.5">
                                 <div className="w-4 h-4 bg-white/10 rounded-full flex items-center justify-center text-[8px]">
                                     {chat.type === 'channel' ? '📢' : '👥'}
                                 </div>
                             </div>
                         )}
                     </div>
                     <div className="flex-1 min-w-0 text-left">
                         <div className="flex items-center justify-between mb-0.5">
                             <span className={`text-sm font-bold truncate ${activeChatId === chat.id ? 'text-[#53C8FF]' : 'text-white'}`}>{chat.name}</span>
                             {chat.lastMessage && <span className="text-[10px] text-white/30">{chat.lastMessage.time}</span>}
                         </div>
                         <div className="flex items-center justify-between">
                             <p className="text-xs text-white/40 truncate max-w-[140px]">
                                 {chat.lastMessage?.sender === 'You' ? 'You: ' : ''}{chat.lastMessage?.text}
                             </p>
                             {chat.unreadCount && (
                                 <span className="bg-[#53C8FF] text-[#0A0F1F] text-[10px] font-black px-1.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                                     {chat.unreadCount}
                                 </span>
                             )}
                         </div>
                     </div>
                 </button>
             ))}
         </div>
      </div>

      {/* RIGHT MAIN AREA: Chat View */}
      <div className="flex-1 flex flex-col bg-[#0A0F1F] relative">
          {/* Chat Header */}
          <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#080C22]/80 backdrop-blur-md">
              <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#53C8FF] to-purple-500 flex items-center justify-center text-lg shadow-lg">
                      {activeChat.icon || activeChat.name.charAt(0)}
                  </div>
                  <div>
                      <h3 className="font-bold text-white flex items-center gap-2">
                          {activeChat.name}
                          {activeChat.type === 'channel' && <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-black uppercase text-white/50 tracking-wider">Channel</span>}
                      </h3>
                      <p className="text-xs text-white/40">
                          {activeChat.membersCount.toLocaleString()} {activeChat.type === 'channel' ? 'subscribers' : 'members'}
                          {activeChat.type === 'group' && ' • 24 online'}
                      </p>
                  </div>
              </div>
              <div className="flex items-center gap-4">
                  <button className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                  </button>
              </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
              {/* Date Separator */}
              <div className="flex justify-center">
                  <span className="bg-[#050819]/60 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-white/40 uppercase tracking-widest">Today</span>
              </div>

              {messages.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} animate-fade-in-up`}>
                      {/* Message Bubble */}
                      <div className={`max-w-[70%] rounded-2xl p-4 shadow-lg relative group ${
                          activeChat.type === 'channel' 
                            ? 'w-full max-w-[85%] bg-[#1A2348] border-l-4 border-[#53C8FF] rounded-r-2xl rounded-l-none mx-auto' 
                            : msg.isMe 
                                ? 'bg-[#53C8FF] text-[#0A0F1F] rounded-tr-sm' 
                                : 'bg-[#1A2348] text-white rounded-tl-sm'
                      }`}>
                          {!msg.isMe && activeChat.type !== 'dm' && activeChat.type !== 'channel' && (
                              <div className="text-[10px] font-bold text-[#53C8FF] mb-1">{msg.sender}</div>
                          )}
                          
                          <p className={`text-sm leading-relaxed ${activeChat.type === 'channel' ? 'text-lg font-medium' : ''}`}>
                              {msg.text}
                          </p>

                          <div className={`flex items-center justify-end gap-1 mt-1 ${msg.isMe ? 'text-[#0A0F1F]/50' : 'text-white/30'}`}>
                              <span className="text-[10px] font-medium">{msg.time}</span>
                              {msg.isMe && <span>✓✓</span>}
                              {activeChat.type === 'channel' && (
                                  <span className="flex items-center gap-1 ml-2 text-white/40">
                                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                      {msg.views}
                                  </span>
                              )}
                          </div>
                      </div>
                  </div>
              ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-[#080C22] border-t border-white/5">
              {activeChat.type === 'channel' ? (
                  <div className="flex items-center justify-center p-4 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-xs text-white/30 font-bold uppercase tracking-widest">Broadcast Only • <span className="text-[#53C8FF] cursor-pointer hover:underline">Discuss</span></p>
                  </div>
              ) : (
                  <div className="flex items-center gap-4 bg-[#050819] p-2 rounded-2xl border border-white/10 focus-within:border-[#53C8FF]/50 transition-colors shadow-lg">
                      <button className="p-2 text-white/30 hover:text-white transition-colors">
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                      </button>
                      <input 
                          className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/20 text-sm h-10"
                          placeholder="Write a message..."
                          value={messageInput}
                          onChange={e => setMessageInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      />
                      <button className="p-2 text-white/30 hover:text-white transition-colors">
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                      </button>
                      <button className="p-2 text-white/30 hover:text-white transition-colors">
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                      </button>
                      <button onClick={handleSendMessage} className="p-3 bg-[#53C8FF] rounded-xl text-[#0A0F1F] hover:scale-105 transition-transform shadow-lg shadow-[#53C8FF]/20">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      </button>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default Communities;
