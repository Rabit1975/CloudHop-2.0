
import React, { useState } from 'react';
import { View, User } from './types';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import Meetings from './components/Meetings';
import Communities from './components/Communities';
import Profile from './components/Profile';
import Settings from './components/Settings';
import Billing from './components/Billing';
import Layout from './components/Layout';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.LANDING);
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
    setView(View.LANDING);
  };

  const renderView = () => {
    if (view === View.LANDING) {
      return <LandingPage onStart={handleLogin} />;
    }

    const content = (() => {
      switch (view) {
        case View.DASHBOARD: return <Dashboard />;
        case View.CHAT: return <Chat />;
        case View.MEETINGS: return <Meetings />;
        case View.COMMUNITIES: return <Communities />;
        case View.PROFILE: return <Profile user={user} />;
        case View.SETTINGS: return <Settings />;
        case View.BILLING: return <Billing />;
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
