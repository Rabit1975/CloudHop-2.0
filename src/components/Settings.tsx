import React, { useState, useEffect, useRef } from 'react';
import { Icons, CloudHopLogo } from '../constants';
import { useSettings } from '../contexts/SettingsContext';

interface SettingsProps {
  userId?: string;
}

const Settings: React.FC<SettingsProps> = ({ userId }) => {
  const [tab, setTab] = useState('General');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inputLevel, setInputLevel] = useState(0);
  const [isTestingMic, setIsTestingMic] = useState(false);

  const { settings, profile, updateSetting, updateProfile, loading } = useSettings();

  const menu = [
    { id: 'General', icon: '⚙️' },
    { id: 'Video & effects', icon: '🎥' },
    { id: 'Audio', icon: '🔊' },
    { id: 'Notifications & sounds', icon: '🔔' },
    { id: 'Meetings', icon: '📅' },
    { id: 'Recording', icon: '⏺️' },
    { id: 'Share Screen', icon: '🖥️' },
    { id: 'Team Chat', icon: '💬' },
    { id: 'Accessibility', icon: '♿' },
    { id: 'Profile', icon: '👤' },
    { id: 'Plans', icon: '💳' },
  ];

  useEffect(() => {
    let interval: any;
    if (isTestingMic) {
      interval = setInterval(() => {
        setInputLevel(Math.random() * 80 + 10);
      }, 100);
    } else {
      setInputLevel(0);
    }
    return () => clearInterval(interval);
  }, [isTestingMic]);

  const toggleCamera = async () => {
    if (isCameraOn) {
      if (stream) stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraOn(false);
    } else {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(newStream);
        setIsCameraOn(true);
      } catch (err) {
        alert("Camera permission required.");
      }
    }
  };

  useEffect(() => {
    if (videoRef.current && stream && tab === 'Video & effects') {
      videoRef.current.srcObject = stream;
    }
  }, [stream, tab]);

  if (loading) return <div className="text-white p-10">Loading settings...</div>;

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row bg-[#0E1430] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl min-h-[700px] animate-fade-in italic">
      {/* Settings Navigation */}
      <div className="w-full md:w-72 bg-[#080C22] p-4 flex flex-row md:flex-col gap-1 border-r border-white/5 overflow-x-auto md:overflow-visible">
        <div className="hidden md:flex items-center gap-3 px-6 py-8 mb-4 border-b border-white/5">
           <CloudHopLogo size={28} variant="neon" />
           <h3 className="text-xl font-black italic tracking-tighter text-[#53C8FF]">SETUP</h3>
        </div>
        {menu.map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all italic whitespace-nowrap ${
              tab === item.id 
                ? 'bg-[#1A2348] text-[#53C8FF] border border-[#53C8FF]/20 shadow-lg shadow-[#53C8FF]/5' 
                : 'text-white/30 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-xl opacity-70">{item.icon}</span>
            {item.id}
          </button>
        ))}
      </div>

      {/* Settings Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-12 bg-[#0E1430] relative">
        <div className="mb-12 border-b border-white/5 pb-8">
          <h2 className="text-4xl font-black mb-2 uppercase italic tracking-tighter">{tab}</h2>
          <p className="text-white/30 text-base font-medium italic">Configure your CloudHop experience.</p>
        </div>
        
        {tab === 'General' && (
          <div className="space-y-12 animate-fade-in">
            <SettingGroup title="Appearance">
               <SettingItem title="Color Mode" desc="Change the background color of the CloudHop desktop app.">
                  <select 
                    value={settings.colorMode || 'Deep Space (Dark)'}
                    onChange={(e) => updateSetting('colorMode', e.target.value)}
                    className="bg-[#050819] border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase italic w-64 text-[#53C8FF]"
                  >
                    <option>Deep Space (Dark)</option>
                    <option>Light Mode</option>
                    <option>System Default</option>
                  </select>
               </SettingItem>
               <SettingItem title="Theme" desc="Change the accent color when using light mode.">
                  <select 
                    value={settings.theme || 'CloudHop Blue'}
                    onChange={(e) => updateSetting('theme', e.target.value)}
                    className="bg-[#050819] border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase italic w-64 text-[#53C8FF]"
                  >
                    <option>CloudHop Blue</option>
                    <option>Neon Green</option>
                    <option>Cyber Pink</option>
                  </select>
               </SettingItem>
               <SettingItem title="Emoji Skin Tone" desc="Change your default reaction skin tone.">
                  <div className="flex gap-2">
                     {['👋', '👋🏻', '👋🏼', '👋🏽', '👋🏾', '👋🏿'].map(e => (
                        <button 
                            key={e} 
                            onClick={() => updateSetting('emojiSkinTone', e)}
                            className={`text-xl hover:scale-125 transition-transform ${settings.emojiSkinTone === e ? 'scale-125 border-b-2 border-[#53C8FF]' : ''}`}
                        >
                            {e}
                        </button>
                     ))}
                  </div>
               </SettingItem>
            </SettingGroup>
            <SettingGroup title="System">
               <SettingItem title="Start CloudHop when I start Windows" desc="Launch automatically on startup.">
                  <Toggle active={settings.startOnBoot} onToggle={() => updateSetting('startOnBoot', !settings.startOnBoot)} />
               </SettingItem>
               <SettingItem title="When closed, minimize window to notification area" desc="Keep CloudHop running in the background.">
                  <Toggle active={settings.minimizeToTray} onToggle={() => updateSetting('minimizeToTray', !settings.minimizeToTray)} />
               </SettingItem>
               <SettingItem title="Use dual monitors" desc="Show participants and content on separate screens.">
                  <Toggle active={settings.dualMonitors} onToggle={() => updateSetting('dualMonitors', !settings.dualMonitors)} />
               </SettingItem>
               <SettingItem title="Enter full screen automatically when starting or joining a meeting">
                  <Toggle active={settings.autoFullScreen} onToggle={() => updateSetting('autoFullScreen', !settings.autoFullScreen)} />
               </SettingItem>
            </SettingGroup>
          </div>
        )}

        {tab === 'Video & effects' && (
          <div className="space-y-12 animate-fade-in">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Live Lens Preview</h4>
              <div className="relative aspect-video w-full max-w-xl bg-black rounded-[40px] overflow-hidden border-4 border-white/5 shadow-2xl group">
                 <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-transform duration-700 ${settings.mirrorVideo ? 'scaleX(-1)' : ''}`} />
                 {!isCameraOn && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080C22] space-y-4">
                      <CloudHopLogo size={64} variant="neon" className="opacity-10 animate-pulse" />
                      <button onClick={toggleCamera} className="px-8 py-3 bg-[#53C8FF] text-[#0A0F1F] rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl italic hover:scale-105 transition-all">Enable Optics</button>
                   </div>
                 )}
              </div>
            </div>
            <SettingGroup title="Camera">
               <SettingItem title="Camera Source">
                  <select 
                    value={settings.cameraSource || 'FaceTime HD Camera'}
                    onChange={(e) => updateSetting('cameraSource', e.target.value)}
                    className="bg-[#050819] border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase italic w-64 text-[#53C8FF]"
                  >
                    <option>FaceTime HD Camera</option>
                    <option>OBS Virtual Camera</option>
                  </select>
               </SettingItem>
               <SettingItem title="Original Ratio" desc="Maintain aspect ratio.">
                  <Toggle active={settings.originalRatio} onToggle={() => updateSetting('originalRatio', !settings.originalRatio)} />
               </SettingItem>
               <SettingItem title="HD Video" desc="Enable 1080p streaming.">
                  <Toggle active={settings.hdVideo} onToggle={() => updateSetting('hdVideo', !settings.hdVideo)} />
               </SettingItem>
               <SettingItem title="Mirror Video" desc="Flip your video preview.">
                  <Toggle active={settings.mirrorVideo} onToggle={() => updateSetting('mirrorVideo', !settings.mirrorVideo)} />
               </SettingItem>
            </SettingGroup>
            <SettingGroup title="My Video">
               <SettingItem title="Touch up my appearance">
                  <div className="w-48">
                    <input 
                        type="range" 
                        value={settings.touchUpAppearance || 0}
                        onChange={(e) => updateSetting('touchUpAppearance', parseInt(e.target.value))}
                        className="w-full accent-[#53C8FF]" 
                    />
                  </div>
               </SettingItem>
               <SettingItem title="Adjust for low light">
                  <select 
                    value={settings.lowLightAdjustment || 'Auto'}
                    onChange={(e) => updateSetting('lowLightAdjustment', e.target.value)}
                    className="bg-[#050819] border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase italic w-32 text-[#53C8FF]"
                  >
                    <option>Auto</option>
                    <option>Manual</option>
                  </select>
               </SettingItem>
               <SettingItem title="Always display participant names">
                  <Toggle active={settings.alwaysShowNames} onToggle={() => updateSetting('alwaysShowNames', !settings.alwaysShowNames)} />
               </SettingItem>
               <SettingItem title="Stop my video when joining">
                  <Toggle active={settings.stopVideoOnJoin} onToggle={() => updateSetting('stopVideoOnJoin', !settings.stopVideoOnJoin)} />
               </SettingItem>
               <SettingItem title="Always show video preview dialog when joining">
                  <Toggle active={settings.showPreviewOnJoin} onToggle={() => updateSetting('showPreviewOnJoin', !settings.showPreviewOnJoin)} />
               </SettingItem>
               <SettingItem title="Hide non-video participants">
                  <Toggle active={settings.hideNonVideo} onToggle={() => updateSetting('hideNonVideo', !settings.hideNonVideo)} />
               </SettingItem>
            </SettingGroup>
          </div>
        )}

        {tab === 'Audio' && (
          <div className="space-y-12 animate-fade-in">
            <SettingGroup title="Speaker">
               <div className="flex gap-4">
                  <button className="px-6 py-3 bg-[#1A2348] border border-[#53C8FF]/20 text-[#53C8FF] rounded-xl text-xs font-bold uppercase tracking-wider">Test Speaker</button>
                  <select 
                    value={settings.speakerDevice || 'System Default'}
                    onChange={(e) => updateSetting('speakerDevice', e.target.value)}
                    className="bg-[#050819] border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase italic w-64 text-[#53C8FF]"
                  >
                    <option>MacBook Pro Speakers</option>
                    <option>System Default</option>
                  </select>
               </div>
               <SettingItem title="Output Volume">
                  <input 
                    type="range" 
                    value={settings.speakerVolume || 50}
                    onChange={(e) => updateSetting('speakerVolume', parseInt(e.target.value))}
                    className="w-64 accent-[#53C8FF]" 
                  />
               </SettingItem>
            </SettingGroup>

            <SettingGroup title="Microphone">
               <div className="flex gap-4">
                  <button onClick={() => setIsTestingMic(!isTestingMic)} className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border ${isTestingMic ? 'bg-[#53C8FF] text-[#0A0F1F]' : 'bg-[#1A2348] border-[#53C8FF]/20 text-[#53C8FF]'}`}>
                    {isTestingMic ? 'Stop Test' : 'Test Mic'}
                  </button>
                  <select 
                    value={settings.micDevice || 'System Default'}
                    onChange={(e) => updateSetting('micDevice', e.target.value)}
                    className="bg-[#050819] border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase italic w-64 text-[#53C8FF]"
                  >
                    <option>MacBook Pro Microphone</option>
                    <option>System Default</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">Input Level</div>
                  <div className="h-2 w-full max-w-md bg-white/5 rounded-full overflow-hidden flex gap-1 px-0.5 items-center">
                     {Array.from({length: 20}).map((_, i) => (
                       <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-100 ${inputLevel > (i*5) ? 'bg-[#53C8FF]' : 'bg-white/5'}`}></div>
                     ))}
                  </div>
               </div>
               <SettingItem title="Automatically adjust microphone volume">
                  <Toggle active={settings.autoMicVolume} onToggle={() => updateSetting('autoMicVolume', !settings.autoMicVolume)} />
               </SettingItem>
            </SettingGroup>

            <SettingGroup title="Audio Profile">
               <SettingItem title="Suppress background noise">
                  <div className="flex gap-2">
                     {['Auto', 'Low', 'Medium', 'High'].map(l => (
                        <button 
                            key={l} 
                            onClick={() => updateSetting('suppressNoise', l)}
                            className={`px-4 py-2 rounded-lg text-xs transition-colors ${settings.suppressNoise === l ? 'bg-[#53C8FF] text-[#0A0F1F]' : 'bg-[#1A2348] text-white hover:bg-[#53C8FF] hover:text-[#0A0F1F]'}`}
                        >
                            {l}
                        </button>
                     ))}
                  </div>
               </SettingItem>
               <SettingItem title="Show in-meeting option to 'Enable Original Sound'">
                  <Toggle active={settings.originalSound} onToggle={() => updateSetting('originalSound', !settings.originalSound)} />
               </SettingItem>
               <SettingItem title="Echo Cancellation">
                  <Toggle active={settings.echoCancellation} onToggle={() => updateSetting('echoCancellation', !settings.echoCancellation)} />
               </SettingItem>
            </SettingGroup>
          </div>
        )}

        {tab === 'Notifications & sounds' && (
           <div className="space-y-12 animate-fade-in">
              <SettingGroup title="Notifications">
                 <SettingItem title="Show notification banner" desc="Display a popup when you receive a message.">
                    <Toggle active={settings.showNotificationBanner} onToggle={() => updateSetting('showNotificationBanner', !settings.showNotificationBanner)} />
                 </SettingItem>
                 <SettingItem title="Bounce dock icon" desc="Animate the dock icon on new activity.">
                    <Toggle active={settings.bounceDockIcon} onToggle={() => updateSetting('bounceDockIcon', !settings.bounceDockIcon)} />
                 </SettingItem>
              </SettingGroup>
              <SettingGroup title="Sounds">
                 <SettingItem title="Play sound for incoming message">
                    <Toggle active={settings.playSoundMessage} onToggle={() => updateSetting('playSoundMessage', !settings.playSoundMessage)} />
                 </SettingItem>
                 <SettingItem title="Play sound when someone joins or leaves">
                    <Toggle active={settings.playSoundJoin} onToggle={() => updateSetting('playSoundJoin', !settings.playSoundJoin)} />
                 </SettingItem>
              </SettingGroup>
           </div>
        )}

        {tab === 'Meetings' && (
           <div className="space-y-12 animate-fade-in">
              <SettingGroup title="General">
                 <SettingItem title="Copy invite link when starting a meeting">
                    <Toggle active={settings.copyInviteLinkOnStart} onToggle={() => updateSetting('copyInviteLinkOnStart', !settings.copyInviteLinkOnStart)} />
                 </SettingItem>
                 <SettingItem title="Always show meeting controls">
                    <Toggle active={settings.alwaysShowControls} onToggle={() => updateSetting('alwaysShowControls', !settings.alwaysShowControls)} />
                 </SettingItem>
                 <SettingItem title="Ask me to confirm when I leave a meeting">
                    <Toggle active={settings.confirmLeave} onToggle={() => updateSetting('confirmLeave', !settings.confirmLeave)} />
                 </SettingItem>
                 <SettingItem title="Show meeting timer">
                    <Toggle active={settings.showMeetingTimer} onToggle={() => updateSetting('showMeetingTimer', !settings.showMeetingTimer)} />
                 </SettingItem>
              </SettingGroup>
           </div>
        )}

        {tab === 'Share Screen' && (
           <div className="space-y-12 animate-fade-in">
              <SettingGroup title="Window Size">
                 <SettingItem title="Window size when sharing screen">
                    <select 
                        value={settings.shareWindowSize || 'Maintain current size'}
                        onChange={(e) => updateSetting('shareWindowSize', e.target.value)}
                        className="bg-[#050819] border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase italic w-64 text-[#53C8FF]"
                    >
                       <option>Maintain current size</option>
                       <option>Enter fullscreen</option>
                       <option>Maximize window</option>
                    </select>
                 </SettingItem>
                 <SettingItem title="Scale to fit shared content">
                    <Toggle active={settings.scaleToFit} onToggle={() => updateSetting('scaleToFit', !settings.scaleToFit)} />
                 </SettingItem>
                 <SettingItem title="See shared content in side-by-side mode">
                    <Toggle active={settings.sideBySide} onToggle={() => updateSetting('sideBySide', !settings.sideBySide)} />
                 </SettingItem>
              </SettingGroup>
              <SettingGroup title="When I Share">
                 <SettingItem title="Silence system notifications when sharing desktop">
                    <Toggle active={settings.silenceNotifications} onToggle={() => updateSetting('silenceNotifications', !settings.silenceNotifications)} />
                 </SettingItem>
                 <SettingItem title="Share applications">
                    <select 
                        value={settings.shareApplications || 'Share individual windows'}
                        onChange={(e) => updateSetting('shareApplications', e.target.value)}
                        className="bg-[#050819] border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase italic w-64 text-[#53C8FF]"
                    >
                       <option>Share individual windows</option>
                       <option>Share all windows from app</option>
                    </select>
                 </SettingItem>
              </SettingGroup>
           </div>
        )}

        {tab === 'Recording' && (
           <div className="space-y-12 animate-fade-in">
              <SettingGroup title="Local Recording">
                 <SettingItem title="Store recordings at:" desc={settings.recordingPath || "C:\\Users\\CloudHop\\Documents\\Zoom"}>
                    <button className="px-4 py-2 bg-[#1A2348] rounded text-xs text-[#53C8FF]">Change</button>
                 </SettingItem>
                 <SettingItem title="Choose a location for recorded files when the meeting ends">
                    <Toggle active={settings.chooseLocationOnEnd} onToggle={() => updateSetting('chooseLocationOnEnd', !settings.chooseLocationOnEnd)} />
                 </SettingItem>
                 <SettingItem title="Record separate audio file for each participant">
                    <Toggle active={settings.separateAudio} onToggle={() => updateSetting('separateAudio', !settings.separateAudio)} />
                 </SettingItem>
                 <SettingItem title="Optimize for 3rd party video editor">
                    <Toggle active={settings.optimizeForEditor} onToggle={() => updateSetting('optimizeForEditor', !settings.optimizeForEditor)} />
                 </SettingItem>
                 <SettingItem title="Add a timestamp to the recording">
                    <Toggle active={settings.addTimestamp} onToggle={() => updateSetting('addTimestamp', !settings.addTimestamp)} />
                 </SettingItem>
                 <SettingItem title="Record video during screen sharing">
                    <Toggle active={settings.recordVideoDuringShare} onToggle={() => updateSetting('recordVideoDuringShare', !settings.recordVideoDuringShare)} />
                 </SettingItem>
              </SettingGroup>
           </div>
        )}

        {tab === 'Team Chat' && (
           <div className="space-y-12 animate-fade-in">
              <SettingGroup title="General">
                 <SettingItem title="Link Preview" desc="Show preview for links shared in chat.">
                    <Toggle active={settings.linkPreview} onToggle={() => updateSetting('linkPreview', !settings.linkPreview)} />
                 </SettingItem>
                 <SettingItem title="File Transfer" desc="Allow sending files in chat.">
                    <Toggle active={settings.fileTransfer} onToggle={() => updateSetting('fileTransfer', !settings.fileTransfer)} />
                 </SettingItem>
                 <SettingItem title="Play Animated GIFs" desc="Automatically play GIFs.">
                    <Toggle active={settings.animatedGifs} onToggle={() => updateSetting('animatedGifs', !settings.animatedGifs)} />
                 </SettingItem>
                 <SettingItem title="Code Snippet Mode" desc="Enable syntax highlighting for code blocks.">
                    <Toggle active={settings.codeSnippet} onToggle={() => updateSetting('codeSnippet', !settings.codeSnippet)} />
                 </SettingItem>
              </SettingGroup>
           </div>
        )}

        {tab === 'Plans' && (
           <div className="space-y-12 animate-fade-in">
              <div className="text-center mb-8">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter text-[#53C8FF]">Choose Your Plan</h3>
                  <p className="text-white/60 mt-2">Flexible plans for casual users, creators, and teams.</p>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                 {/* Free Plan */}
                 <div className="bg-[#050819] border border-white/5 rounded-2xl p-6 flex flex-col">
                     <h3 className="text-lg font-bold text-[#53C8FF]">Free Plan</h3>
                     <div className="text-3xl font-bold my-4">$0<span className="text-sm text-white/40 font-normal"> / forever</span></div>
                     <ul className="space-y-2 text-xs text-white/70 flex-1 mb-6">
                         <li>✓ Unlimited messaging & 1:1 chats</li>
                         <li>✓ Up to 45-minute meetings</li>
                         <li>✓ 1 Hop Space</li>
                         <li>✓ 720p video</li>
                         <li>✓ 1GB cloud storage</li>
                     </ul>
                     <button className="w-full py-3 bg-white/10 rounded-xl font-bold text-xs uppercase tracking-wider">Current Plan</button>
                 </div>

                 {/* Plus Plan */}
                 <div className="bg-[#050819] border border-white/5 rounded-2xl p-6 flex flex-col">
                     <h3 className="text-lg font-bold text-[#53C8FF]">Plus Plan</h3>
                     <div className="text-3xl font-bold my-4">$5.99<span className="text-sm text-white/40 font-normal"> / mo</span></div>
                     <ul className="space-y-2 text-xs text-white/70 flex-1 mb-6">
                         <li>✓ Unlimited meeting length</li>
                         <li>✓ 1080p HD video</li>
                         <li>✓ 5 Hop Spaces</li>
                         <li>✓ 25GB cloud storage</li>
                         <li>✓ 300 AI actions/month</li>
                     </ul>
                     <button className="w-full py-3 bg-[#53C8FF] text-[#0A0F1F] rounded-xl font-bold text-xs uppercase tracking-wider">Upgrade</button>
                 </div>

                 {/* Pro Plan */}
                 <div className="bg-[#050819] border-2 border-[#53C8FF] rounded-2xl p-6 flex flex-col relative overflow-hidden">
                     <div className="absolute top-0 right-0 bg-[#53C8FF] text-[#0A0F1F] text-[9px] font-bold px-2 py-1 rounded-bl-lg uppercase">Popular</div>
                     <h3 className="text-lg font-bold text-[#53C8FF]">Pro Plan</h3>
                     <div className="text-3xl font-bold my-4">$14.99<span className="text-sm text-white/40 font-normal"> / mo</span></div>
                     <ul className="space-y-2 text-xs text-white/70 flex-1 mb-6">
                         <li>✓ Unlimited Hop Spaces</li>
                         <li>✓ 4K video support</li>
                         <li>✓ 100GB cloud storage</li>
                         <li>✓ Advanced AI Assistant</li>
                         <li>✓ Real-time translation</li>
                     </ul>
                     <button className="w-full py-3 bg-[#53C8FF] text-[#0A0F1F] rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#53C8FF]/20">Get Pro</button>
                 </div>

                 {/* Teams Plan */}
                 <div className="bg-[#050819] border border-white/5 rounded-2xl p-6 flex flex-col">
                     <h3 className="text-lg font-bold text-[#53C8FF]">Teams Plan</h3>
                     <div className="text-3xl font-bold my-4">$8.99<span className="text-sm text-white/40 font-normal"> / user / mo</span></div>
                     <ul className="space-y-2 text-xs text-white/70 flex-1 mb-6">
                         <li>✓ Admin dashboard</li>
                         <li>✓ Team spaces</li>
                         <li>✓ Unlimited storage per team</li>
                         <li>✓ Meeting transcripts</li>
                         <li>✓ Compliance mode</li>
                     </ul>
                     <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-xs uppercase tracking-wider">Contact Sales</button>
                 </div>
              </div>
           </div>
        )}

        {tab === 'Accessibility' && (
           <div className="space-y-12 animate-fade-in">
              <SettingGroup title="Captions">
                 <SettingItem title="Closed Caption Font Size">
                    <input 
                        type="range" 
                        min="12" 
                        max="32" 
                        value={settings.captionFontSize || 16}
                        onChange={(e) => updateSetting('captionFontSize', parseInt(e.target.value))}
                        className="w-48 accent-[#53C8FF]" 
                    />
                 </SettingItem>
                 <SettingItem title="Always show captions">
                    <Toggle active={settings.alwaysShowCaptions} onToggle={() => updateSetting('alwaysShowCaptions', !settings.alwaysShowCaptions)} />
                 </SettingItem>
              </SettingGroup>
              <SettingGroup title="Screen Reader">
                 <SettingItem title="Screen reader alerts">
                    <button className="text-[#53C8FF] text-sm underline">Manage Alerts</button>
                 </SettingItem>
              </SettingGroup>
           </div>
        )}

        {tab === 'Profile' && (
          <div className="space-y-12 animate-fade-in">
            <div className="flex flex-col items-center justify-center p-8 bg-[#050819] border border-white/5 rounded-2xl mb-8">
               <div className="relative group mb-6">
                  <img src={profile.avatar_url || 'https://via.placeholder.com/150'} className="w-32 h-32 rounded-full object-cover border-4 border-[#53C8FF] shadow-[0_0_40px_rgba(83,200,255,0.3)]" />
                  <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-2xl">📷</span>
                  </div>
               </div>
               <h3 className="text-2xl font-black text-white italic tracking-tight">{profile.display_name || 'Cloud Hopper'}</h3>
               <p className="text-[#53C8FF] font-medium">@{profile.username || 'username'}</p>
            </div>

            <SettingGroup title="My Profile">
               <SettingItem title="Display Name" desc="How your name appears to other users.">
                  <input 
                    value={profile.display_name || ''}
                    onChange={(e) => updateProfile({ display_name: e.target.value })}
                    className="bg-[#050819] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white w-full md:w-80 focus:border-[#53C8FF] outline-none"
                    placeholder="Enter your name"
                  />
               </SettingItem>
               <SettingItem title="Phone Number">
                  <input 
                    value={profile.phone || ''}
                    onChange={(e) => updateProfile({ phone: e.target.value })}
                    className="bg-[#050819] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white w-full md:w-80 focus:border-[#53C8FF] outline-none"
                    placeholder="+1 234 567 8900"
                  />
               </SettingItem>
               <SettingItem title="Bio">
                  <textarea 
                    value={profile.bio || ''}
                    onChange={(e) => updateProfile({ bio: e.target.value })}
                    className="bg-[#050819] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white w-full md:w-80 focus:border-[#53C8FF] outline-none resize-none h-24"
                    placeholder="Tell us about yourself..."
                  />
               </SettingItem>
            </SettingGroup>
          </div>
        )}
      </div>
    </div>
  );
};

const SettingGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-8">
    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#53C8FF] pb-4 border-b border-white/5 italic">{title}</h3>
    <div className="space-y-10">{children}</div>
  </div>
);

const SettingItem: React.FC<{ title: string; desc?: string; children: React.ReactNode }> = ({ title, desc, children }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 group">
    <div className="max-w-xl text-left">
      <h4 className="text-lg font-black text-white italic group-hover:text-[#53C8FF] transition-colors uppercase tracking-tight">{title}</h4>
      {desc && <p className="text-sm text-white/30 mt-1 italic font-medium leading-relaxed">{desc}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const Toggle: React.FC<{ active?: boolean; onToggle?: () => void }> = ({ active = false, onToggle }) => {
  return (
    <button onClick={onToggle} className={`w-14 h-7 rounded-full transition-all relative flex items-center px-1.5 ${active ? 'bg-[#53C8FF]' : 'bg-[#1B2D45]'}`}>
      <span className={`w-4.5 h-4.5 bg-white rounded-full transition-all shadow-xl ${active ? 'translate-x-7' : 'translate-x-0'}`}></span>
    </button>
  );
};

export default Settings;
