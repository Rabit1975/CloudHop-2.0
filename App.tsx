
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

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.SPECTRUM);
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = () => {
    setUser({
      id: '1',
      name: 'Matthew',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Matthew',
      status: 'Online',
      email: 'matthew@cloudhop.app',
      xp: 1250,
      level: 5,
      badges: ['🚀', '⚡']
    });
    setView(View.DASHBOARD);
  };

  const handleLogout = () => {
    setUser(null);
    setView(View.SPECTRUM);
  };

  const renderView = () => {
    if (view === View.SPECTRUM) {
      return <LandingPage onStart={handleLogin} />;
    }

    const content = (() => {
      switch (view) {
        case View.DASHBOARD: return <Dashboard />;
        case View.CHAT: return <Chat />;
        case View.WORLD: return <Spaces />;
        case View.MEETINGS: return <Meetings />;
        case View.CORE: return <Communities />;
        case View.ARCADE: return <GameHub />;
        case View.AI_TOOLS: return <AITools />;
        case View.PROFILE: return <Profile user={user} />;
        case View.SETTINGS: return <Settings />;
        default: return <Dashboard />;
      }
    })();

    return (
      <Layout 
        currentView={view} 
        onNavigate={setView} 
        user={user} 
        onLogout={handleLogout}
      >
        {content}
      </Layout>
    );
  };

  return (
    <div className="min-h-screen">
      {renderView()}
    </div>
  );
};

export default App;
