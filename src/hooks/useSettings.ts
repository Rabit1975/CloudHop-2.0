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

export const useSettings = (userId?: string) => {
  const [settings, setSettings] = useState<UserSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('settings')
        .eq('id', userId)
        .single();
      
      if (data?.settings) {
        setSettings(data.settings);
      }
      setLoading(false);
    };

    fetchSettings();
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
      // Revert? For now, we trust it works or next fetch will fix
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

  return { settings, updateSetting, updateSettings, loading };
};
