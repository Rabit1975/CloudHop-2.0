
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
// Import Icons from constants to fix the "Cannot find name 'Icons'" error
import { Icons } from '../constants';

const Chat: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'messages' | 'ai'>('messages');
  const [message, setMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(0);
  const [aiIsTyping, setAiIsTyping] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

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

  const currentChat = chats[selectedChat];
  const messages = chatMessages[currentChat.id] || [];

  return (
    <div className="h-full flex gap-6 overflow-hidden animate-fade-in italic">
      <div className="w-80 flex flex-col bg-[#0E1430] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/5">
          <input type="text" placeholder="Search Workspace..." className="w-full bg-[#080C22] border border-white/5 rounded-full py-2 pl-4 text-xs focus:outline-none focus:border-[#53C8FF]/30 font-bold" />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {chats.map((chat, i) => (
            <div key={i} onClick={() => setSelectedChat(i)} className={`p-4 flex items-center gap-3 cursor-pointer border-l-2 ${selectedChat === i ? 'bg-[#53C8FF]/5 border-[#53C8FF]' : 'border-transparent hover:bg-white/5'}`}>
              <img src={chat.avatar} className="w-10 h-10 rounded-xl" alt="" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center"><span className="font-black text-xs uppercase truncate tracking-widest">{chat.name}</span></div>
                <p className="text-[10px] text-white/40 truncate italic font-bold">{chat.lastMsg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#0E1430] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#080C22]/40 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <h3 className="font-black text-xs uppercase tracking-[0.2em]">{currentChat.name}</h3>
            <div className="flex bg-[#050819] p-1 rounded-lg">
              <button onClick={() => setActiveTab('messages')} className={`px-4 py-1 text-[8px] font-black uppercase tracking-widest rounded-md ${activeTab === 'messages' ? 'bg-[#1A2348] text-[#53C8FF]' : 'text-white/20'}`}>Messages</button>
              <button onClick={() => setActiveTab('ai')} className={`px-4 py-1 text-[8px] font-black uppercase tracking-widest rounded-md ${activeTab === 'ai' ? 'bg-[#1A2348] text-[#53C8FF]' : 'text-white/20'}`}>AI Intelligence</button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {activeTab === 'messages' ? (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} group animate-fade-in`}>
                  <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed max-w-[80%] shadow-xl ${msg.isMe ? 'bg-[#1A2348] border border-[#53C8FF]/30' : 'bg-white/5 border border-white/5'}`}>
                    {msg.text}
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
