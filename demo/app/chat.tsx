'use client'

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function Chat() {
  const { messages, sendMessage, status } = useChat();

  const [input, setInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <div>
      <ul>
        {messages.map((m) => (
          <li key={m.id}>
            {m.role === 'user' ? 'User: ' : 'AI: '}
            {m.parts.map((part, i) => {
                if (part.type === 'text') return <span key={i}>{part.text}</span>;
                return null;
            })}
          </li>
        ))}
      </ul>
    
      <form onSubmit={handleSubmit}>
        <label>
          Say something...
          <input value={input} onChange={handleInputChange} disabled={status !== 'ready' && status !== 'error'} />
        </label>
        <button type="submit" disabled={status !== 'ready' && status !== 'error'}>Send</button>
      </form>
    </div>
  )
}
