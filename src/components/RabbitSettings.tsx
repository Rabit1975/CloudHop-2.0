import React, { useState } from 'react';
import { Icons, CloudHopLogo } from '../constants';
import Modal from './Modal';

// --- Types ---
type SettingsView = 'main' | 'chat_settings' | 'privacy' | 'security' | 'profile' | 'folders' | 'data' | 'power' | 'calls' | 'advanced';

interface RabbitSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    phone: string;
    username: string;
    bio: string;
    avatar: string;
  };
}

const RabbitSettings: React.FC<RabbitSettingsProps> = ({ isOpen, onClose, user }) => {
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [nightMode, setNightMode] = useState(true);

  // --- Sub-Components for each view ---

  const MainMenu = () => (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Profile Header */}
      <div className="p-6 pb-4 flex items-center gap-4 border-b border-white/5 bg-[#1A2348]/50">
        <div className="relative">
            <img src={user.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-[#53C8FF]" alt="Profile" />
            <button className="absolute bottom-0 right-0 bg-[#53C8FF] text-[#0A0F1F] p-1.5 rounded-full hover:scale-110 transition-transform">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </button>
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white truncate">{user.name}</h3>
            <p className="text-sm text-[#53C8FF] truncate">{user.phone}</p>
            <p className="text-xs text-white/40 truncate">@{user.username}</p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        <MenuItem icon="👤" label="My Profile" onClick={() => setCurrentView('profile')} />
        <MenuItem icon="👛" label="Wallet" badge="NEW" onClick={() => {}} />
        <div className="h-2" />
        <MenuItem icon="👥" label="New Group" onClick={() => {}} />
        <MenuItem icon="📢" label="New Channel" onClick={() => {}} />
        <div className="h-2" />
        <MenuItem icon="📞" label="Calls" onClick={() => setCurrentView('calls')} />
        <MenuItem icon="🔖" label="Saved Messages" onClick={() => {}} />
        <MenuItem icon="⚙️" label="Settings" onClick={() => setCurrentView('chat_settings')} />
        
        <div className="h-2" />
        <div className="flex items-center justify-between px-4 py-3 hover:bg-white/5 rounded-xl cursor-pointer" onClick={() => setNightMode(!nightMode)}>
            <div className="flex items-center gap-4">
                <span className="text-xl w-6 text-center">🌙</span>
                <span className="text-sm font-medium text-white">Night Mode</span>
            </div>
            <Toggle active={nightMode} />
        </div>
        
        <div className="h-2" />
        <MenuItem icon="🔋" label="Power Usage" onClick={() => setCurrentView('power')} />
        <MenuItem icon="🔧" label="Advanced" onClick={() => setCurrentView('advanced')} />
      </div>
    </div>
  );

  const ChatSettings = () => (
    <div className="flex flex-col h-full animate-fade-in">
        <Header title="Chat Settings" onBack={() => setCurrentView('main')} />
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
            
            {/* Themes */}
            <Section title="Themes">
                <div className="grid grid-cols-4 gap-2 mb-4">
                    {['Classic', 'Day', 'Tinted', 'Night'].map((theme, i) => (
                        <div key={theme} className={`relative aspect-[3/4] rounded-lg border-2 cursor-pointer flex items-end justify-center pb-2 ${i===3 ? 'border-[#53C8FF] bg-[#1A2348]' : 'border-transparent bg-white/5'}`}>
                            {i===3 && <div className="absolute top-2 right-2 w-2 h-2 bg-[#53C8FF] rounded-full" />}
                            <div className={`w-8 h-8 rounded-full border-2 ${i===3 ? 'border-[#53C8FF]' : 'border-white/20'}`} />
                            <span className="text-[10px] absolute bottom-[-20px] text-white/60">{theme}</span>
                        </div>
                    ))}
                </div>
                <div className="h-6" />
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {['#53C8FF', '#8B5CF6', '#F472B6', '#FBBF24', '#34D399', '#60A5FA'].map(color => (
                        <button key={color} className="w-8 h-8 rounded-full shrink-0 border-2 border-transparent hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
                    ))}
                </div>
            </Section>

            {/* Theme Settings */}
            <Section title="Theme Settings">
                <SettingRow icon="🎨" label="Your name color" badge="NEW" value="Mr." color="#F472B6" />
                <SettingRow icon="🌙" label="Auto-night mode" value="System" />
                <SettingRow icon="🅰️" label="Font family" value="Default" />
            </Section>

            {/* Chat Wallpaper */}
            <Section title="Chat Wallpaper">
                <div className="h-24 bg-[#050819] rounded-xl border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-[#53C8FF] transition-colors">
                    <span className="text-xs text-[#53C8FF] font-bold">Choose from gallery</span>
                </div>
            </Section>

            {/* Stickers and emoji */}
            <Section title="Stickers and emoji">
                <SettingRowToggle label="Large emoji" active={true} />
                <SettingRowToggle label="Replace emoji automatically" active={true} />
                <SettingRowToggle label="Suggest emoji replacements" active={true} />
                <SettingRowToggle label="Suggest popular stickers by emoji" active={true} />
                <SettingRowToggle label="Loop animated stickers" active={true} />
                <SettingRow icon="☺" label="Manage sticker sets" />
                <SettingRow icon="🙂" label="Choose emoji set" />
            </Section>

            {/* Messages */}
            <Section title="Messages">
                <SettingRowRadio label="Send with Enter" active={true} />
                <SettingRowRadio label="Send with Ctrl+Enter" active={false} />
                <div className="h-2" />
                <SettingRowRadio label="Reply with double click" active={true} />
                <SettingRowRadio label="Send reaction with double click" active={false} value="❤️" />
                <div className="h-2" />
                <SettingRowToggle label="Reaction button on messages" active={true} />
            </Section>
            
            {/* Sensitive Content */}
            <Section title="Sensitive content">
                <SettingRowToggle label="Show 18+ Content" active={false} />
            </Section>
        </div>
    </div>
  );

  const PrivacySettings = () => (
     <div className="flex flex-col h-full animate-fade-in">
        <Header title="Privacy" onBack={() => setCurrentView('main')} />
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
            <SettingRow label="Phone number" value="My contacts" />
            <SettingRow label="Last seen & online" value="Everybody" />
            <SettingRow label="Profile photos" value="Everybody" />
            <SettingRow label="Forwarded messages" value="Everybody" />
            <SettingRow label="Calls" value="Everybody" />
            <SettingRow label="Voice messages" value="Everybody" />
            <SettingRow label="Messages" value="Everybody" />
            <div className="h-4" />
            <SettingRow label="Groups & channels" value="Everybody" />
            <div className="h-4" />
            <Section title="Security">
                <SettingRow icon="🔒" label="Two-Step Verification" value="Off" />
                <SettingRow icon="⏱️" label="Auto-Delete Messages" value="Off" />
                <SettingRow icon="🔐" label="Local passcode" value="Off" />
                <SettingRow icon="🚫" label="Blocked users" value="2" />
                <SettingRow icon="💻" label="Active sessions" value="5" />
            </Section>
        </div>
     </div>
  );

  const ProfileSettings = () => (
      <div className="flex flex-col h-full animate-fade-in">
          <Header title="Edit Profile" onBack={() => setCurrentView('main')} />
          <div className="p-6 flex flex-col items-center border-b border-white/5">
               <div className="relative group cursor-pointer">
                  <img src={user.avatar} className="w-24 h-24 rounded-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-2xl">📷</span>
                  </div>
               </div>
               <h3 className="mt-4 text-xl font-bold text-white">{user.name}</h3>
               <p className="text-sm text-[#53C8FF]">Online</p>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
              <div className="bg-white/5 rounded-xl p-4 space-y-4">
                  <div>
                      <label className="text-xs text-[#53C8FF] font-bold">Bio</label>
                      <p className="text-sm text-white">{user.bio}</p>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                       <label className="text-xs text-[#53C8FF] font-bold">Username</label>
                       <p className="text-sm text-white">@{user.username}</p>
                  </div>
              </div>
              
              <Section title="Account">
                  <SettingRow icon="📱" label="Phone number" value={user.phone} />
                  <SettingRow icon="🎂" label="Birthday" value="Feb 24, 1975" />
              </Section>
          </div>
      </div>
  );

  const PowerUsageSettings = () => (
      <div className="flex flex-col h-full animate-fade-in">
        <Header title="Power Usage" onBack={() => setCurrentView('main')} />
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
            <Section title="Power saving options">
                <SettingRowToggle label="Animated Stickers" value="2/2" active={true} />
                <SettingRowToggle label="Animated Emoji" value="4/4" active={true} />
                <SettingRowToggle label="Animations in Chats" value="3/3" active={true} />
                <SettingRowToggle label="Animations in Calls" active={true} />
                <SettingRowToggle label="Interface animations" active={true} />
            </Section>
            
            <Section title="Performance">
                <SettingRowToggle label="Save Power on Low Battery" active={true} />
                <p className="text-xs text-white/40 px-4 pb-4">Automatically disable all animations when your laptop is in a battery saving mode.</p>
            </Section>
        </div>
      </div>
  );

  const AdvancedSettings = () => (
      <div className="flex flex-col h-full animate-fade-in">
        <Header title="Advanced" onBack={() => setCurrentView('main')} />
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
            <Section title="Data and storage">
                <SettingRow icon="⇅" label="Connection type" value="Default (TCP used)" color="#53C8FF" />
                <SettingRow icon="📁" label="Download path" value="Default folder" color="#53C8FF" />
                <SettingRow icon="💾" label="Manage local storage" />
                <SettingRow icon="⬇" label="Downloads" />
                <SettingRowToggle label="Ask download path for each file" active={false} />
            </Section>
            
            <Section title="Automatic media download">
                <SettingRow icon="👤" label="In private chats" />
                <SettingRow icon="👥" label="In groups" />
                <SettingRow icon="📢" label="In channels" />
            </Section>

            <Section title="Window title bar">
                <SettingRowToggle label="Show chat name" active={true} />
                <SettingRowToggle label="Total unread count" active={true} />
                <SettingRowToggle label="Use system window frame" active={false} />
            </Section>

            <Section title="System integration">
                <SettingRowToggle label="Show tray icon" active={true} />
            </Section>
        </div>
      </div>
  );

  const CallSettings = () => (
      <div className="flex flex-col h-full animate-fade-in">
        <Header title="Speakers and Camera" onBack={() => setCurrentView('main')} />
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
            <Section title="Speakers and headphones">
                <SettingRow label="Output device" value="Default" color="#53C8FF" />
            </Section>

            <Section title="Microphone">
                <SettingRow label="Input device" value="Default" color="#53C8FF" />
                <div className="px-4 pb-4">
                     <div className="h-4 w-full bg-[#050819] rounded-full overflow-hidden flex gap-0.5 items-center p-1 border border-white/10">
                         {Array.from({length: 40}).map((_, i) => (
                           <div key={i} className={`h-2 flex-1 rounded-sm ${i < 15 ? 'bg-[#53C8FF]' : 'bg-white/10'}`}></div>
                         ))}
                     </div>
                </div>
            </Section>

            <Section title="Calls and video chats">
                <SettingRowToggle label="Use the same devices for calls" active={true} />
            </Section>

            <Section title="Camera">
                <SettingRow label="Input device" value="Default" color="#53C8FF" />
                <div className="mx-4 mb-4 aspect-video bg-black rounded-lg overflow-hidden border border-white/10 relative">
                     <img src="https://picsum.photos/seed/rabbitcam/400/225" className="w-full h-full object-cover opacity-80" />
                     <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-16 h-16 rounded-full border-4 border-[#53C8FF]/50 animate-pulse"></div>
                     </div>
                </div>
            </Section>

            <Section title="Other settings">
                <SettingRowToggle label="Accept calls on this device" active={true} />
                <SettingRow label="Open system sound preferences" />
            </Section>
        </div>
      </div>
  );

  // --- Render Content ---
  const renderContent = () => {
      switch(currentView) {
          case 'chat_settings': return <ChatSettings />;
          case 'privacy': return <PrivacySettings />;
          case 'security': return <PrivacySettings />;
          case 'profile': return <ProfileSettings />;
          case 'power': return <PowerUsageSettings />;
          case 'calls': return <CallSettings />;
          case 'advanced': return <AdvancedSettings />;
          default: return <MainMenu />;
      }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-y-0 left-0 w-80 bg-[#0E1430] border-r border-white/10 shadow-2xl z-[100] animate-slide-in-left flex flex-col font-sans">
       {renderContent()}
    </div>
  );
};

// --- Helper Components ---

const Header = ({ title, onBack }: { title: string, onBack: () => void }) => (
    <div className="h-14 flex items-center gap-4 px-4 border-b border-white/5 bg-[#080C22]/50 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h3 className="font-bold text-white">{title}</h3>
    </div>
);

const MenuItem = ({ icon, label, badge, onClick }: { icon: string, label: string, badge?: string, onClick: () => void }) => (
    <div onClick={onClick} className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 rounded-xl cursor-pointer group transition-colors">
        <span className="text-xl w-6 text-center group-hover:scale-110 transition-transform">{icon}</span>
        <span className="text-sm font-medium text-white flex-1">{label}</span>
        {badge && <span className="text-[10px] font-bold bg-[#53C8FF] text-[#0A0F1F] px-1.5 rounded-md">{badge}</span>}
    </div>
);

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-6">
        <h4 className="text-xs font-bold text-[#53C8FF] mb-3 uppercase tracking-wider px-2">{title}</h4>
        <div className="bg-white/5 rounded-xl overflow-hidden">
            {children}
        </div>
    </div>
);

const SettingRow = ({ icon, label, value, badge, color }: { icon?: string, label: string, value?: string, badge?: string, color?: string }) => (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0">
        {icon && <span className="text-lg w-6 text-center">{icon}</span>}
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
                <span className="text-sm text-white font-medium">{label}</span>
                {badge && <span className="text-[9px] font-bold bg-[#53C8FF] text-[#0A0F1F] px-1 rounded">{badge}</span>}
            </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm text-[#53C8FF]" style={color ? { color } : {}}>{value}</span>
            <svg className="w-4 h-4 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        </div>
    </div>
);

const SettingRowToggle = ({ label, value, active }: { label: string, value?: string, active: boolean }) => (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0">
        <span className="text-sm text-white font-medium">{label}</span>
        <div className="flex items-center gap-3">
             {value && <span className="text-xs text-[#53C8FF] font-bold">{value}</span>}
             <Toggle active={active} />
        </div>
    </div>
);

const SettingRowRadio = ({ label, active, value }: { label: string, active: boolean, value?: string }) => (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? 'border-[#53C8FF]' : 'border-white/20'}`}>
            {active && <div className="w-2.5 h-2.5 rounded-full bg-[#53C8FF]" />}
        </div>
        <span className="text-sm text-white font-medium flex-1">{label}</span>
        {value && <span className="text-sm">{value}</span>}
    </div>
);

const Toggle = ({ active }: { active: boolean }) => (
    <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-[#53C8FF]' : 'bg-white/20'}`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${active ? 'left-[22px]' : 'left-0.5'}`} />
    </div>
);

export default RabbitSettings;
