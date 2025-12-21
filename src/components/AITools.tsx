
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
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
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
      setError('Microphone access denied.');
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
        setOutputText(response.text || 'No transcription.');
        setIsLoading(false);
      };
    } catch (err) {
      setError('Transcription failed.');
      setIsLoading(false);
    }
  };

  const handleAction = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError('');
    setOutputText('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let prompt = '';
      let model = 'gemini-3-flash-preview';
      let config: any = {};

      switch(activeTab) {
        case 'Summarize': prompt = `Summarize: ${inputText}`; break;
        case 'Rewrite': prompt = `Professional rewrite: ${inputText}`; break;
        case 'Translate': prompt = `Translate to Spanish, French, Japanese: ${inputText}`; break;
        case 'Extract Actions': prompt = `Extract tasks: ${inputText}`; break;
        case 'Thinking Mode':
          prompt = `Analyze: ${inputText}`;
          model = 'gemini-3-pro-preview';
          config = { thinkingConfig: { thinkingBudget: 32768 } };
          break;
      }

      const response = await ai.models.generateContent({ model, contents: prompt, config });
      setOutputText(response.text || 'No response.');
    } catch (err) {
      setError('AI Error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in italic">
      <div className="bg-gradient-to-r from-[#1A2348] to-[#0E1430] p-8 rounded-[32px] border border-[#53C8FF]/20 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Intelligence Suite</h2>
          <div className="flex flex-wrap gap-2">
            {['Summarize', 'Rewrite', 'Translate', 'Extract Actions', 'Thinking Mode', 'Transcribe'].map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab as any); setOutputText(''); setInputText(''); }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-[#53C8FF] text-[#0A0F1F]' : 'text-white/40 hover:bg-white/10'}`}
              >
                {tab === 'Thinking Mode' ? '🧠 Thinking' : tab === 'Transcribe' ? '🎙️ Transcribe' : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[500px]">
        <div className="bg-[#0E1430] border border-white/5 rounded-[24px] flex flex-col overflow-hidden shadow-xl">
           {activeTab === 'Transcribe' ? (
             <div className="flex-1 flex flex-col items-center justify-center p-10 space-y-6">
                <button onClick={isRecording ? () => mediaRecorderRef.current?.stop() : startRecording} className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isRecording ? 'bg-red-500 text-white' : 'bg-[#53C8FF] text-[#0A0F1F]'}`}>
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
             </div>
           ) : (
             <textarea className="flex-1 bg-transparent p-6 text-sm text-white/80 focus:outline-none resize-none custom-scrollbar italic font-medium" value={inputText} onChange={e => setInputText(e.target.value)} />
           )}
           {activeTab !== 'Transcribe' && (
             <div className="p-6 bg-[#080C22]/40">
                <button onClick={handleAction} disabled={isLoading || !inputText} className="w-full py-4 rounded-2xl text-xs font-black uppercase bg-[#53C8FF] text-[#0A0F1F]">
                  {isLoading ? 'Processing...' : `Execute ${activeTab}`}
                </button>
             </div>
           )}
        </div>
        <div className="bg-[#0E1430] border border-white/5 rounded-[24px] flex flex-col overflow-hidden shadow-xl p-6 overflow-y-auto custom-scrollbar">
           {isLoading ? <div className="animate-pulse text-[#53C8FF] uppercase font-black text-xs">Thinking...</div> : <div className="text-sm leading-relaxed whitespace-pre-wrap">{outputText}</div>}
           {error && <div className="text-red-400 font-bold">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default AITools;
