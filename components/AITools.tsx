
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';

const AITools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Summarize' | 'Rewrite' | 'Translate' | 'Extract Actions' | 'Thinking Mode' | 'Transcribe'>('Summarize');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        handleTranscription(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscription = async (blob: Blob) => {
    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              { inlineData: { data: base64Audio, mimeType: 'audio/wav' } },
              { text: "Please transcribe this audio accurately." }
            ]
          }
        });
        
        setOutputText(response.text || 'No transcription generated.');
        setIsLoading(false);
      };
    } catch (err) {
      console.error(err);
      setError('Transcription failed. Try again.');
      setIsLoading(false);
    }
  };

  const handleAction = async () => {
    if (!inputText.trim() && activeTab !== 'Transcribe') return;
    setIsLoading(true);
    setError('');
    setOutputText('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let prompt = '';
      let model = 'gemini-3-flash-preview';
      let config: any = {};

      switch(activeTab) {
        case 'Summarize':
          prompt = `Summarize the following chat/text into a few concise bullet points:\n\n${inputText}`;
          break;
        case 'Rewrite':
          prompt = `Rewrite the following text to be more professional, clear, and well-toned:\n\n${inputText}`;
          break;
        case 'Translate':
          prompt = `Translate the following text into Spanish, French, and Japanese:\n\n${inputText}`;
          break;
        case 'Extract Actions':
          prompt = `Extract a list of actionable tasks or next steps from this text:\n\n${inputText}`;
          break;
        case 'Thinking Mode':
          prompt = `Perform deep reasoning and analysis on this complex query:\n\n${inputText}`;
          model = 'gemini-3-pro-preview';
          config = {
            thinkingConfig: { thinkingBudget: 32768 }
          };
          break;
      }

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config
      });

      setOutputText(response.text || 'No response generated.');
    } catch (err) {
      console.error(err);
      setError('An error occurred while communicating with CloudHop AI.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-[#10233A] border border-[#1E3A5F] p-4 rounded-2xl text-center">
        <p className="text-sm font-medium text-[#53C8FF]">CloudHop Intelligence: Powered by Gemini 3.</p>
      </div>

      <div className="bg-gradient-to-r from-[#1A2348] to-[#0E1430] p-8 rounded-[32px] border border-[#53C8FF]/20 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-[#53C8FF] text-[#0A0F1F] rounded-xl">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
               </div>
               <h2 className="text-3xl font-black italic tracking-tighter uppercase">AI Intelligence Suite</h2>
             </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['Summarize', 'Rewrite', 'Translate', 'Extract Actions', 'Thinking Mode', 'Transcribe'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setOutputText(''); setInputText(''); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab 
                    ? 'bg-[#53C8FF] text-[#0A0F1F] shadow-lg shadow-[#53C8FF]/20' 
                    : 'text-white/40 hover:bg-white/10'
                }`}
              >
                {tab === 'Thinking Mode' ? '🧠 Thinking' : tab === 'Transcribe' ? '🎙️ Transcribe' : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[550px]">
        {/* Left: Input */}
        <div className="bg-[#0E1430] border border-white/5 rounded-[24px] flex flex-col overflow-hidden shadow-xl">
           <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                {activeTab === 'Transcribe' ? 'Microphone Input' : 'Input Content'}
              </span>
              <button 
                onClick={() => setInputText('')}
                className="text-xs text-[#53C8FF]/50 hover:text-[#53C8FF] font-bold"
              >
                Clear
              </button>
           </div>
           
           {activeTab === 'Transcribe' ? (
             <div className="flex-1 flex flex-col items-center justify-center p-10 space-y-6">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${isRecording ? 'bg-red-500/10 border-red-500 animate-pulse' : 'bg-[#53C8FF]/10 border-[#53C8FF]/30'}`}>
                   <svg className={`w-12 h-12 ${isRecording ? 'text-red-500' : 'text-[#53C8FF]'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                </div>
                <div className="text-center">
                   <h3 className="font-bold text-lg">{isRecording ? 'Recording Live Audio...' : 'Ready to Transcribe'}</h3>
                   <p className="text-xs text-white/30 mt-1 uppercase tracking-widest font-black">Powered by Gemini 3 Flash</p>
                </div>
                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${isRecording ? 'bg-red-500 text-white shadow-red-500/20 shadow-xl' : 'bg-[#53C8FF] text-[#0A0F1F] shadow-[#53C8FF]/20 shadow-xl'}`}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
             </div>
           ) : (
             <textarea 
               className="flex-1 bg-transparent p-6 text-sm text-white/80 focus:outline-none resize-none custom-scrollbar leading-relaxed"
               placeholder={activeTab === 'Thinking Mode' ? "Ask a complex question that requires deep thought..." : "Paste a message, conversation, or meeting notes here..."}
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
             />
           )}
           
           {activeTab !== 'Transcribe' && (
             <div className="p-6 bg-[#080C22]/40">
                <button 
                  onClick={handleAction}
                  disabled={isLoading || !inputText}
                  className={`w-full py-4 rounded-2xl text-base font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                    isLoading || !inputText 
                      ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                      : 'bg-[#53C8FF] text-[#0A0F1F] hover:brightness-110 shadow-xl shadow-[#53C8FF]/20'
                  }`}
                >
                  {isLoading ? 'Processing...' : `Execute ${activeTab}`}
                </button>
             </div>
           )}
        </div>

        {/* Right: Output */}
        <div className="bg-[#0E1430] border border-white/5 rounded-[24px] flex flex-col overflow-hidden shadow-xl relative">
           <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Intelligence Output</span>
              {outputText && (
                <button 
                  onClick={() => navigator.clipboard.writeText(outputText)}
                  className="text-xs text-[#53C8FF]/50 hover:text-[#53C8FF] font-bold flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2" /></svg>
                  Copy
                </button>
              )}
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar p-6 text-sm text-white/90 leading-relaxed whitespace-pre-wrap italic">
              {error && <div className="text-red-400 font-bold mb-4">{error}</div>}
              {!outputText && !isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 space-y-4">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  <p className="font-bold italic">Gemini is waiting to process your request.</p>
                </div>
              )}
              {isLoading ? (
                 <div className="h-full flex items-center justify-center flex-col gap-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-[#53C8FF] rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-[#53C8FF] rounded-full animate-bounce delay-75"></div>
                      <div className="w-3 h-3 bg-[#53C8FF] rounded-full animate-bounce delay-150"></div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#53C8FF]">CloudHop AI is Thinking...</span>
                 </div>
              ) : outputText}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AITools;
