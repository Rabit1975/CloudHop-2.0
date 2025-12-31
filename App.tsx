// CloudHop 2.0 - Main Entry
import React, { useState, useEffect } from 'react';
import { View, User } from './src/types';
import LandingPage from './src/components/LandingPage';
import Dashboard from './src/components/Dashboard';
import Chat from './src/components/Chat';
import Meetings from './src/components/Meetings';
import Spaces from './src/components/Spaces';
import Communities from './src/components/Communities';
import GameHub from './src/components/GameHub';
import Profile from './src/components/Profile';
import Settings from './src/components/Settings';
import AITools from './src/components/AITools';
import Layout from './src/components/Layout';
import Auth from './src/components/Auth';
import { supabase } from './src/lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

import { SpaceProvider } from './src/contexts/SpaceContext';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.SPECTRUM);
  const [session, setSession] = useState<Session | null>(null);
  // Removed showAuth state, Auth component will manage its own visibility
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
          // If already logged in, go to dashboard
          setView(View.DASHBOARD);
          // Fetch user profile from public.users to populate local user state if needed
          // For now, we rely on components fetching their own data, but we can set a basic user object
          setUser({
              id: session.user.id,
              name: session.user.email?.split('@')[0] || 'Rabbit',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
              level: 1,
              xp: 0
          });
          registerServiceWorker(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
          setUser({
              id: session.user.id,
              name: session.user.email?.split('@')[0] || 'Rabbit',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
              level: 1,
              xp: 0
          });
          setView(View.DASHBOARD);
          registerServiceWorker(session.user.id);
      } else {
          setUser(null);
          setView(View.SPECTRUM);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const registerServiceWorker = async (userId: string) => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered with scope:', registration.scope);

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY 
          });

          // Save subscription to Supabase
          const { error } = await supabase.from('push_subscriptions').upsert({
            user_id: userId,
            endpoint: subscription.endpoint,
            p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh') as ArrayBuffer) as any)),
            auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth') as ArrayBuffer) as any))
          }, { onConflict: 'endpoint' });

          if (error) console.error('Error saving push subscription:', error);
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  };

  const handleStart = () => {
    if (session) {
        setView(View.DASHBOARD);
    } else {
        // If no session, show Auth component directly
        setView(View.AUTH); // Assuming a new View.AUTH for the Auth component
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView(View.SPECTRUM);
  };

  const content = (() => {
    switch (view) {
      case View.DASHBOARD: return <Dashboard onNavigate={setView} />;
      case View.CHAT: return <Chat userId={session?.user.id} />; // Pass userId to Chat
      case View.WORLD: return <Communities />;
      case View.MEETINGS: return <Meetings user={user} onNavigate={setView} />;
      case View.CORE: return <Spaces onNavigate={setView} />;
      case View.ARCADE: return <GameHub />;
      case View.PROFILE: return <Profile user={user} />;
      case View.SETTINGS: return <Settings userId={session?.user.id} />;
      case View.AUTH: return <Auth onAuthSuccess={() => setView(View.DASHBOARD)} />; // Render Auth component
      default: return <Dashboard onNavigate={setView} />;
    }
  })();

  if (!session && view !== View.SPECTRUM && view !== View.AUTH) {
      // If no session and not on landing or auth page, redirect to auth
      return <Auth onAuthSuccess={() => setView(View.DASHBOARD)} />;
  }

  if (view === View.SPECTRUM) {
    return <LandingPage onStart={handleStart} />;
  }

  return (
    <SpaceProvider>
      <Layout 
        currentView={view} 
        onNavigate={setView}
        user={user}
        onLogout={handleLogout}
      >
        {content}
      </Layout>
    </SpaceProvider>
  );
};

export default App;