import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface AuthProps {
  onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // For simple email/pass, we might want to auto-login or alert to check email
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050819] p-4 font-sans text-white">
      <div className="w-full max-w-md p-8 bg-[#0E1430] rounded-3xl border border-white/5 shadow-2xl animate-fade-in">
        <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-[#53C8FF] to-purple-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(83,200,255,0.3)]">
                <span className="text-3xl">🐰</span>
            </div>
        </div>
        
        <h2 className="text-2xl font-black text-center mb-2 uppercase tracking-wide">
          {isSignUp ? 'Join RabbitChat' : 'Welcome Back'}
        </h2>
        <p className="text-center text-white/40 text-sm mb-8 font-medium">
          {isSignUp ? 'Create your identity.' : 'Hop back into the conversation.'}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-[#53C8FF] ml-2 mb-2 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#050819] border border-white/10 rounded-xl p-4 text-white focus:border-[#53C8FF] outline-none font-bold transition-all"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-[#53C8FF] ml-2 mb-2 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#050819] border border-white/10 rounded-xl p-4 text-white focus:border-[#53C8FF] outline-none font-bold transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#53C8FF] text-[#0A0F1F] rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg shadow-[#53C8FF]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-white/40 hover:text-[#53C8FF] font-bold uppercase tracking-widest transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
