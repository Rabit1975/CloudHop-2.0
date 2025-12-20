
export enum View {
  SPECTRUM = 'spectrum', // Landing / Overview
  DASHBOARD = 'dashboard',
  CHAT = 'chat',
  MEETINGS = 'meetings',
  WORLD = 'world', // Hop World - Public Discovery
  CORE = 'core',   // Hop Core - Private Hybrid Hub
  ARCADE = 'arcade',
  PROFILE = 'profile',
  SETTINGS = 'settings'
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt?: string;
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
