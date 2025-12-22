
import React, { useState } from 'react';
import { View, User } from './types';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import Meetings from './components/Meetings';
import Spaces from './components/Spaces';
import Communities from './components/Communities';
import GameHub from './components/GameHub';
import Profile from './components/Profile';
import Settings from './components/Settings';
import AITools from './components/AITools';
import Layout from './components/Layout';

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
      case View.MEETINGS: return <Meetings />;
      case View.CORE: return <Spaces />;
      case View.ARCADE: return <GameHub />;
      case View.PROFILE: return <div className="text-center text-white/50 py-20">Profile View</div>;
      case View.SETTINGS: return <div className="text-center text-white/50 py-20">Settings View</div>;
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
