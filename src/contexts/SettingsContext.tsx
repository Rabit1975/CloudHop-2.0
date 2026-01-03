import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface UserSettings {
  // Appearance
  colorMode?: 'Deep Space (Dark)' | 'Light Mode' | 'System Default';
  theme?: 'CloudHop Blue' | 'Neon Green' | 'Cyber Pink';
  emojiSkinTone?: string;
  
  // System
  startOnBoot?: boolean;
  minimizeToTray?: boolean;
  dualMonitors?: boolean;
  autoFullScreen?: boolean;
  
  // Camera
  cameraSource?: string;
  originalRatio?: boolean;
  hdVideo?: boolean;
  mirrorVideo?: boolean;
  touchUpAppearance?: number; // 0-100
  lowLightAdjustment?: 'Auto' | 'Manual';
  alwaysShowNames?: boolean;
  stopVideoOnJoin?: boolean;
  showPreviewOnJoin?: boolean;
  hideNonVideo?: boolean;

  // Audio
  speakerDevice?: string;
  speakerVolume?: number;
  micDevice?: string;
  micVolume?: number;
  autoMicVolume?: boolean;
  suppressNoise?: 'Auto' | 'Low' | 'Medium' | 'High';
  originalSound?: boolean;
  echoCancellation?: boolean;

  // Share Screen
  shareWindowSize?: 'Maintain current size' | 'Enter fullscreen' | 'Maximize window';
  scaleToFit?: boolean;
  sideBySide?: boolean;
  silenceNotifications?: boolean;
  shareApplications?: 'Share individual windows' | 'Share all windows from app';

  // Recording
  recordingPath?: string;
  chooseLocationOnEnd?: boolean;
  separateAudio?: boolean;
  optimizeForEditor?: boolean;
  addTimestamp?: boolean;
  recordVideoDuringShare?: boolean;

  // Accessibility
  captionFontSize?: number;
  alwaysShowCaptions?: boolean;

  // Notifications & Sounds
  playSoundMessage?: boolean;
  playSoundJoin?: boolean;
  showNotificationBanner?: boolean;
  bounceDockIcon?: boolean;

  // Meetings
  copyInviteLinkOnStart?: boolean;
  confirmLeave?: boolean;
  showMeetingTimer?: boolean;
  alwaysShowControls?: boolean;

  // Team Chat
  linkPreview?: boolean;
  fileTransfer?: boolean;
  animatedGifs?: boolean;
  codeSnippet?: boolean;

  // Privacy & Others
  [key: string]: any;
}

export interface UserProfile {
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  username?: string;
}

interface SettingsContextType {
  settings: UserSettings;
  profile: UserProfile;
  updateSetting: (key: keyof UserSettings, value: any) => Promise<void>;
  updateSettings: (newValues: Partial<UserSettings>) => Promise<void>;
  updateProfile: (newValues: Partial<UserProfile>) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode; userId?: string }> = ({ children, userId }) => {
  const [settings, setSettings] = useState<UserSettings>({});
  const [profile, setProfile] = useState<UserProfile>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
        setLoading(false);
        return;
    }

    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('settings, display_name, avatar_url, bio, phone, username')
        .eq('id', userId)
        .single();
      
      if (data) {
        if (data.settings) setSettings(data.settings);
        setProfile({
          display_name: data.display_name,
          avatar_url: data.avatar_url,
          bio: data.bio,
          phone: data.phone,
          username: data.username
        });
      }
      setLoading(false);
    };

    fetchSettings();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`user_settings:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          const newUser = payload.new as any;
          if (newUser.settings) setSettings(newUser.settings);
          setProfile(prev => ({
            ...prev,
            display_name: newUser.display_name,
            avatar_url: newUser.avatar_url,
            bio: newUser.bio,
            phone: newUser.phone,
            username: newUser.username
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    if (!userId) return;
    
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings); // Optimistic update

    const { error } = await supabase
      .from('users')
      .update({ settings: newSettings })
      .eq('id', userId);

    if (error) {
      console.error('Error updating settings:', error);
      // Revert optimistic update on error if needed, but for now we keep it simple
    }
  };

  const updateSettings = async (newValues: Partial<UserSettings>) => {
      if (!userId) return;

      const newSettings = { ...settings, ...newValues };
      setSettings(newSettings);

      const { error } = await supabase
        .from('users')
        .update({ settings: newSettings })
        .eq('id', userId);
        
      if (error) {
          console.error('Error updating settings:', error);
      }
  }

  const updateProfile = async (newValues: Partial<UserProfile>) => {
    if (!userId) return;
    
    const newProfile = { ...profile, ...newValues };
    setProfile(newProfile); // Optimistic update

    const { error } = await supabase
      .from('users')
      .update(newValues)
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, profile, updateSetting, updateSettings, updateProfile, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
