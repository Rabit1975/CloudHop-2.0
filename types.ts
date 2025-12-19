
export enum View {
  LANDING = 'landing',
  DASHBOARD = 'dashboard',
  CHAT = 'chat',
  MEETINGS = 'meetings',
  COMMUNITIES = 'communities',
  PROFILE = 'profile',
  SETTINGS = 'settings',
  BILLING = 'billing'
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
