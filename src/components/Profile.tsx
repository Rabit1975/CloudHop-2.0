
import React, { useState } from 'react';
import { User } from '../types';

interface ProfileProps {
  user: User | null;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('Account');
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar);
  const [accentColor, setAccentColor] = useState('#53C8FF');
  const [themeMode, setThemeMode] = useState('Dark');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = ['Account', 'Notifications', 'Appearance', 'Privacy'];

  return (
    <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-10 animate-fade-in">
      {/* Left: Profile Card (Source: Page 29/50) */}
      <div className="w-full lg:w-[320px] shrink-0 space-y-6">
        <div className="bg-[#0E1430] border border-white/5 rounded-[32px] p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#1A2348] to-transparent"></div>
          <div className="relative z-10 w-full">
            <div className="relative mb-8 inline-block">
              <img src={avatar || user?.avatar} className="w-40 h-40 rounded-[32px] border-4 border-[#0E1430] shadow-2xl relative z-10 group-hover:scale-105 transition-transform duration-500 object-cover" alt="" />
              <button onClick={handleAvatarClick} className="absolute -bottom-3 -right-3 bg-[#53C8FF] text-[#0A0F1F] p-3 rounded-2xl shadow-[0_10px_20px_rgba(83,200,255,0.3)] hover:scale-110 transition-all z-20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
            <h3 className="text-3xl font-black mb-1">{user?.name}</h3>
            <p className="text-sm text-[#53C8FF] font-bold mb-4 uppercase tracking-[0.2em]">@{user?.name.toLowerCase().replace(' ', '')}</p>
            <div className="p-4 bg-white/5 rounded-2xl text-xs font-medium text-white/50 italic mb-8 border border-white/5 leading-relaxed">
              "Building the future of communication, one cloud at a time. ☁️⚡"
            </div>
            <div className="flex flex-col gap-3 w-full">
              <button onClick={() => setIsEditing(!isEditing)} className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all border ${isEditing ? 'bg-[#53C8FF] text-[#0A0F1F] border-[#53C8FF]' : 'bg-white/5 hover:bg-white/10 border-white/5'}`}>
                {isEditing ? 'Save Profile' : 'Edit Profile'}
              </button>
              <button onClick={handleAvatarClick} className="w-full py-4 bg-[#53C8FF]/10 text-[#53C8FF] hover:bg-[#53C8FF]/20 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all border border-[#53C8FF]/10">Change Avatar</button>
            </div>
          </div>
        </div>

        <div className="bg-[#0E1430] border border-white/5 rounded-[24px] p-6 shadow-xl">
           <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Account Badges</h4>
           <div className="flex flex-wrap gap-4">
             <Badge icon="🚀" label="Early Adopter" />
             <Badge icon="☁️" label="Cloud Pro" />
             <Badge icon="⚡" label="AI Explorer" />
           </div>
        </div>
      </div>

      {/* Right: Preferences (Source: Page 30/50) */}
      <div className="flex-1 space-y-8">
        <div className="bg-[#0E1430] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
          <div className="flex bg-[#080C22] p-2 border-b border-white/5 overflow-x-auto custom-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab 
                    ? 'bg-[#1A2348] text-[#53C8FF] shadow-[0_10px_20px_rgba(83,200,255,0.1)]' 
                    : 'text-white/20 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-10 space-y-10">
            {activeTab === 'Account' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <InputGroup label="Email Address" value={user?.email || ''} readOnly={!isEditing} />
                   <InputGroup label="Display Name" value={user?.name || ''} readOnly={!isEditing} />
                   <InputGroup label="Status Message" value="Building the cloud..." readOnly={!isEditing} />
                   <InputGroup label="Joined Date" value="Nov 20, 2025" readOnly />
                </div>
                <div className="pt-10 border-t border-white/5">
                   <h4 className="text-sm font-black uppercase tracking-widest mb-6">Connected Providers</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ConnectedProvider name="Google" icon="G" status="Connected" />
                      <ConnectedProvider name="Microsoft" icon="M" status="Disconnected" />
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'Appearance' && (
              <div className="space-y-12">
                <div className="space-y-6">
                   <h4 className="text-sm font-black uppercase tracking-widest">Theme Mode</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {['Light', 'Dark', 'Auto'].map(mode => (
                        <ThemeOption 
                          key={mode} 
                          label={mode} 
                          icon={mode === 'Light' ? '☀️' : mode === 'Dark' ? '🌙' : '🖥️'} 
                          active={themeMode === mode} 
                          onClick={() => setThemeMode(mode)}
                        />
                      ))}
                   </div>
                </div>
                <div className="space-y-6">
                   <h4 className="text-sm font-black uppercase tracking-widest">Primary Accent</h4>
                   <div className="flex flex-wrap gap-5">
                      {['#53C8FF', '#8B5CF6', '#F43F5E', '#3DD68C'].map(color => (
                        <div 
                          key={color}
                          onClick={() => setAccentColor(color)}
                          className={`w-12 h-12 rounded-2xl cursor-pointer hover:scale-110 transition-all ${accentColor === color ? 'ring-4 ring-white/50 opacity-100 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'opacity-40 hover:opacity-100'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'Notifications' && (
              <div className="space-y-8">
                <ToggleRow label="Mentions" active />
                <ToggleRow label="Direct Messages" active />
                <ToggleRow label="Meeting Reminders" active />
                <ToggleRow label="AI Suggestions" />
                <ToggleRow label="Sound Effects" active />
              </div>
            )}

            {activeTab === 'Privacy' && (
              <div className="space-y-8">
                <div className="bg-[#1A2348] border border-white/5 rounded-2xl p-6">
                   <h4 className="text-sm font-black uppercase tracking-widest mb-4">Profile Visibility</h4>
                   <div className="space-y-4">
                      <ToggleRow label="Show online status" active />
                      <ToggleRow label="Show badges publicly" active />
                      <ToggleRow label="Allow search by email" />
                   </div>
                </div>
                <div className="bg-[#1A2348] border border-white/5 rounded-2xl p-6">
                   <h4 className="text-sm font-black uppercase tracking-widest mb-4">Data</h4>
                   <button className="w-full text-left py-3 px-4 bg-[#080C22] hover:bg-[#53C8FF]/10 rounded-xl text-xs font-bold transition-all border border-white/5 hover:border-[#53C8FF]/30 text-white/80 hover:text-[#53C8FF]">Download my data</button>
                   <button className="w-full text-left py-3 px-4 mt-3 bg-[#080C22] hover:bg-red-500/10 rounded-xl text-xs font-bold transition-all border border-white/5 hover:border-red-500/30 text-red-400">Delete account</button>
                </div>
              </div>
            )}

            <div className="pt-10 border-t border-white/5 flex justify-end">
               <button className="px-12 py-4 bg-[#53C8FF] text-[#0A0F1F] font-black uppercase tracking-[0.2em] rounded-2xl hover:shadow-[0_15px_30px_rgba(83,200,255,0.3)] hover:scale-105 transition-all active:scale-95">
                 Save Settings
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Badge: React.FC<{ icon: string, label: string }> = ({ icon, label }) => (
  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl shadow-inner border border-white/5 relative group cursor-default" title={label}>
    {icon}
    <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[9px] font-black uppercase tracking-widest text-[#53C8FF] pointer-events-none">{label}</div>
  </div>
);

const InputGroup: React.FC<{ label: string; value: string; readOnly?: boolean }> = ({ label, value: initialValue, readOnly }) => {
  const [value, setValue] = useState(initialValue);
  
  // Update local state if initialValue changes (e.g. from parent prop)
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">{label}</label>
      <input 
        type="text" 
        value={value}
        onChange={(e) => setValue(e.target.value)}
        readOnly={readOnly}
        className={`w-full bg-[#080C22] border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white/80 focus:outline-none transition-all ${readOnly ? 'opacity-40 cursor-not-allowed' : 'focus:border-[#53C8FF]/50 focus:bg-[#0D1A2A]'}`}
      />
    </div>
  );
};

const ConnectedProvider: React.FC<{ name: string, icon: string, status: string }> = ({ name, icon, status }) => (
  <button className="w-full flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-[#080C22] flex items-center justify-center font-black text-lg group-hover:text-[#53C8FF] transition-colors">{icon}</div>
      <div className="text-left">
        <div className="text-sm font-black">{name}</div>
        <div className={`text-[9px] font-black uppercase tracking-widest ${status === 'Connected' ? 'text-green-500' : 'text-white/20'}`}>{status}</div>
      </div>
    </div>
    {status === 'Connected' ? (
      <span className="text-[10px] font-black uppercase tracking-widest text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">Disconnect</span>
    ) : (
      <span className="text-[10px] font-black uppercase tracking-widest text-[#53C8FF]">Connect</span>
    )}
  </button>
);

const ThemeOption: React.FC<{ label: string; icon: string; active?: boolean; onClick?: () => void }> = ({ label, icon, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-4 p-8 rounded-[24px] border-2 transition-all group ${
    active ? 'bg-[#1A2348] border-[#53C8FF]/50 text-[#53C8FF] shadow-[0_20px_40px_rgba(0,0,0,0.4)]' : 'bg-[#080C22] border-white/5 text-white/30 hover:border-white/20'
  }`}>
    <span className={`text-4xl transition-transform group-hover:scale-110 ${active ? '' : 'grayscale'}`}>{icon}</span>
    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
  </button>
);

const ToggleRow: React.FC<{ label: string; active?: boolean }> = ({ label, active: initialActive }) => {
  const [active, setActive] = useState(initialActive);
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors">
      <span className="text-sm font-bold text-white/60 tracking-tight">{label}</span>
      <button 
        onClick={() => setActive(!active)}
        className={`w-14 h-7 rounded-full transition-all relative flex items-center px-1.5 ${active ? 'bg-[#53C8FF]' : 'bg-[#1B2D45]'}`}
      >
        <span className={`w-4.5 h-4.5 bg-white rounded-full transition-all shadow-md ${active ? 'translate-x-7' : 'translate-x-0'}`}></span>
      </button>
    </div>
  );
};

export default Profile;
