
// CloudHop 2.0 - Main Entry
import React, { useState } from 'react';
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

import { SpaceProvider } from './src/contexts/SpaceContext';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.SPECTRUM);
  const [user, setUser] = useState<User | null>(null);

  const handleStart = () => {
    setUser({
      id: 'u1',
      name: 'Matthew Seales',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Matthew',
      level: 5,
      xp: 1250
    });
    setView(View.DASHBOARD);
  };

  const handleLogout = () => {
    setUser(null);
    setView(View.SPECTRUM);
  };

  const content = (() => {
    switch (view) {
      case View.DASHBOARD: return <Dashboard onNavigate={setView} />;
      case View.CHAT: return <Chat />;
      case View.WORLD: return <Communities />;
      case View.MEETINGS: return <Meetings user={user} onNavigate={setView} />;
      case View.CORE: return <Spaces onNavigate={setView} />;
      case View.ARCADE: return <GameHub />;
      case View.PROFILE: return <Profile />;
      case View.SETTINGS: return <Settings />;
      default: return <Dashboard onNavigate={setView} />;
    }
  })();

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
