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

export type FeedEventType = 'message' | 'file' | 'event' | 'join' | 'leave' | 'stream_start' | 'stream_end' | 'reaction';

export interface ActivityItem {
  id: string;
  type: FeedEventType;
  user: {
    name: string;
    avatar: string;
    role?: 'Admin' | 'Member' | 'Guest';
  };
  content: string;
  timestamp: string;
  channel?: string;
  meta?: any; // For reactions, stream details, etc.
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
  status?: 'Online' | 'Away' | 'Busy' | 'Invisible';
  email?: string;
  xp: number;
  level: number;
  badges?: string[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe?: boolean;
}

// --- New Types for Real Data ---

export type StreamType = 'youtube' | 'twitch' | 'vimeo' | 'custom' | 'none';

export interface SpaceInfo {
  id: string;
  name: string;
  category: string;
  participants: number;
  desc: string;
  image: string;
  type: string;
  tags: string[];
  visibility: 'Public' | 'Private';
  streamLink?: string;
  streamType?: StreamType;
}

export interface Channel {
  id: string;
  name: string;
  type: 'Flow' | 'Mesh' | 'Beam';
}

export interface CommunityInfo {
  id: string;
  name: string;
  icon: string;
  sub: string; // e.g. "Broadcast Only (Beam)"
  role: 'Admin' | 'Member' | 'Guest';
  channels: Channel[];
}
