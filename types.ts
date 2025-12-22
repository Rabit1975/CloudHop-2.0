Update your hooks or API calls to filter by
export enum View {
  SPECTRUM = 'spectrum', // Landing / Overview
  DASHBOARD = 'dashboard',
  CHAT = 'chat',
  MEETINGS = 'meetings',
  WORLD = 'world', // Hop World - Public Discovery
  CORE = 'core',   // Hop Core - Private Hybrid Hub
  ARCADE = 'arcade',
  PROFILE = 'profile',
  SETTINGS = 'settings',
  AI_TOOLS = 'ai_tools'
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt?: string;
}

export interface ActivityItem {
  id: string;
  type: 'message' | 'file' | 'event' | 'join';
  user: {
    name: string;
    avatar: string;
    role?: 'Admin' | 'Member' | 'Guest';
  };
  content: string;
  timestamp: string;
  channel?: string;
}

export interface Meeting {
  id: string;
  title: string;
  time: string;
  participants: string[];
  type: 'video' | 'audio';
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'Online' | 'Away' | 'Busy' | 'Invisible';
  email: string;
  xp: number;
  level: number;
  badges: string[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe?: boolean;
}
