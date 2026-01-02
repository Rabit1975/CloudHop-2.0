import { useState, useEffect } from 'react';
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
  micVolume?: number; // Input level is read-only usually, but volume gain can be set
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
  recordingPath?: string; // This might be restricted in browser, but we can store preference
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

  // Rabbit/Chat Settings
  nightMode?: boolean; // Overlaps with colorMode?
  activeTheme?: string;
  activeColor?: string;
  largeEmoji?: boolean;
  replaceEmoji?: boolean;
  suggestEmoji?: boolean;
  suggestStickers?: boolean;
  loopStickers?: boolean;
  sendWithEnter?: boolean;
  sendWithCtrlEnter?: boolean;
  replyDoubleClick?: boolean;
  reactionDoubleClick?: boolean;
  reactionButton?: boolean;
  showSensitiveContent?: boolean;
  
  // Privacy
  phoneNumberPrivacy?: string;
  lastSeenPrivacy?: string;
  profilePhotoPrivacy?: string;
  forwardedMessagePrivacy?: string;
  callsPrivacy?: string;
  voiceMessagePrivacy?: string;
  messagePrivacy?: string;
  groupPrivacy?: string;
  twoStepVerification?: boolean;
  autoDeleteMessages?: boolean;
  localPasscode?: boolean;
}

export interface UserProfile {
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  username?: string;
}

export const useSettings = (userId?: string) => {
  const [settings, setSettings] = useState<UserSettings>({});
  const [profile, setProfile] = useState<UserProfile>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

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

  return { settings, profile, updateSetting, updateSettings, updateProfile, loading };
};
