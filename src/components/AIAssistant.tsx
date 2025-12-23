import React, { useState, useEffect, useRef } from 'react';
import { View } from '../types';
import { GoogleGenAI } from '@google/genai';
import { Icons } from '../constants';

interface AIAssistantProps {
  currentView: View;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ currentView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [input, setInput] = useState('');
  
  // Auto-scroll to bottom of response
  const responseRef = useRef<HTMLDivElement>(null);

  const getContextActions = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return [
          { label: 'Daily Briefing', prompt: 'Generate a daily briefing based on my recent activity and upcoming meetings.' },
          { label: 'Suggest Focus', prompt: 'Analyze my schedule and suggest a key focus area for today.' },
          { label: 'Review Activity', prompt: 'Summarize my recent XP gains and community interactions.' }
        ];
      case View.MEETINGS:
        return [
          { label: 'Start Transcription', prompt: 'Initialize transcription service for this meeting.' },
          { label: 'Summarize Discussion', prompt: 'Provide a summary of the current meeting conversation.' },
          { label: 'Extract Action Items', prompt: 'List all action items and assigned tasks from this meeting.' }
        ];
      case View.WORLD: // HopHub
        return [
          { label: 'Summarize Channel', prompt: 'Summarize the last 50 messages in this channel.' },
          { label: 'Draft Post', prompt: 'Help me draft an engaging announcement for this community.' },
          { label: 'Moderation Scan', prompt: 'Scan recent messages for community guideline violations.' }
        ];
      case View.CHAT:
        return [
          { label: 'Suggest Reply', prompt: 'Suggest a professional yet friendly reply to the last message.' },
          { label: 'Translate Chat', prompt: 'Translate the recent messages into English.' },
          { label: 'Tone Check', prompt: 'Analyze the tone of my current draft message.' }
        ];
      case View.ARCADE:
        return [
          { label: 'Game Strategy', prompt: 'Give me tips for the currently selected game.' },
          { label: 'Find Players', prompt: 'Help me find active players looking for a match.' }
        ];
      default:
        return [
          { label: 'General Help', prompt: 'How can CloudHop help me be more productive?' },
          { label: 'System Status', prompt: 'Check system health and connectivity.' }
        ];
    }
  };

  const handleAction = async (prompt: string) => {
    setIsThinking(true);
    setResponse(null);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setResponse("Error: API Key not found. Please check your .env file.");
        setIsThinking(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const model = 'gemini-2.0-flash-exp'; // Use a valid model name

      // Construct a context-aware system prompt
      const systemContext = `You are CloudHop AI, an intelligent assistant embedded in a collaboration platform.
      Current Context: User is in the "${currentView}" view.
      
      View Descriptions:
      - DASHBOARD: Personal overview, schedule, XP.
      - MEETINGS: Video conferencing, transcription, action items.
      - WORLD (HopHub): Community channels, announcements, moderation.
      - CHAT (RabbitChat): Direct messages, team chat.
      - ARCADE (GameHub): Gaming, matchmaking.
      
      Your goal is to be helpful, concise, and professional. Use markdown for formatting.`;

      const response = await ai.models.generateContent({
        model: model,
        contents: [
          { role: 'user', parts: [{ text: systemContext + "\n\nUser Request: " + prompt }] }
        ]
      });

      const text = response.text || "I couldn't generate a response.";
      setResponse(text);
    } catch (error) {
      console.error("AI Error:", error);
      setResponse("I'm having trouble connecting to the neural core. Please try again later.");
    } finally {
      setIsThinking(false);
    }
  };

  /* Removed generateMockResponse */

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-[9000] w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(83,200,255,0.3)] transition-all hover:scale-110 active:scale-95 group ${isOpen ? 'bg-[#0A0F1F] border border-[#53C8FF]' : 'bg-[#53C8FF]'}`}
      >
        {isOpen ? (
          <span className="text-[#53C8FF] text-xl font-black">✕</span>
        ) : (
          <div className="relative">
             <Icons.AI className="w-7 h-7 text-[#0A0F1F] animate-pulse-slow" />
             <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping" />
          </div>
        )}
      </button>

      {/* AI Panel */}
      {isOpen && (
        <div className="fixed bottom-28 right-8 z-[9000] w-96 bg-[#080C22]/95 backdrop-blur-xl border border-[#53C8FF]/20 rounded-[32px] shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[600px]">
          
          {/* Header */}
          <div className="p-6 border-b border-white/5 bg-gradient-to-r from-[#53C8FF]/10 to-transparent">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#53C8FF]/20 flex items-center justify-center">
                   <Icons.AI className="w-6 h-6 text-[#53C8FF]" />
                </div>
                <div>
                   <h3 className="text-sm font-black uppercase italic tracking-widest text-white">Hop AI</h3>
                   <div className="text-[10px] text-[#53C8FF] font-bold uppercase tracking-wider opacity-80">
                      {currentView === View.WORLD ? 'Community Intelligence' : 
                       currentView === View.MEETINGS ? 'Meeting Assistant' : 
                       currentView === View.DASHBOARD ? 'Personal Executive' : 
                       'System Assistant'}
                   </div>
                </div>
             </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
             {/* Welcome / Context */}
             {!response && !isThinking && (
               <div className="space-y-4">
                  <p className="text-xs text-white/60 font-medium italic leading-relaxed">
                     I'm active in <span className="text-[#53C8FF] font-bold">{currentView}</span> mode. 
                     How can I assist you with your current task?
                  </p>
                  
                  <div className="grid grid-cols-1 gap-2">
                     {getContextActions().map((action, i) => (
                        <button 
                          key={i}
                          onClick={() => handleAction(action.label)}
                          className="text-left px-4 py-3 bg-white/5 hover:bg-[#53C8FF]/10 border border-white/5 hover:border-[#53C8FF]/30 rounded-xl transition-all group"
                        >
                           <div className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-[#53C8FF] mb-1">{action.label}</div>
                           <div className="text-[10px] text-white/30 truncate">{action.prompt}</div>
                        </button>
                     ))}
                  </div>
               </div>
             )}

             {/* Thinking State */}
             {isThinking && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                   <div className="relative w-16 h-16">
                      <div className="absolute inset-0 border-4 border-[#53C8FF]/20 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-[#53C8FF] border-t-transparent rounded-full animate-spin"></div>
                      <Icons.AI className="absolute inset-0 m-auto w-6 h-6 text-[#53C8FF] animate-pulse" />
                   </div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-[#53C8FF] animate-pulse">Processing Context...</div>
                </div>
             )}

             {/* Response Area */}
             {response && (
                <div className="animate-fade-in space-y-4">
                   <div className="bg-[#1A2348] border border-[#53C8FF]/20 rounded-2xl p-4 shadow-inner">
                      <div className="text-xs leading-relaxed whitespace-pre-wrap font-medium text-white/90">{response}</div>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => setResponse(null)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors">New Request</button>
                      <button className="flex-1 py-2 bg-[#53C8FF] text-[#0A0F1F] rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-[#3DB8EF] transition-colors">Action</button>
                   </div>
                </div>
             )}
          </div>

          {/* Input Bar */}
          <div className="p-4 border-t border-white/5 bg-[#050819]/50">
             <div className="flex gap-2">
                <input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white focus:border-[#53C8FF] outline-none"
                  onKeyDown={e => e.key === 'Enter' && input && handleAction(input)}
                />
                <button 
                  onClick={() => input && handleAction(input)}
                  className="p-2 bg-[#53C8FF] text-[#0A0F1F] rounded-xl hover:scale-105 transition-transform"
                >
                   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
             </div>
          </div>

        </div>
      )}
    </>
  );
};

export default AIAssistant;
