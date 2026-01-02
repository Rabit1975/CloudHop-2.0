export enum View {
  SPECTRUM = 'spectrum', // Landing / Overview
  DASHBOARD = 'dashboard',
  CHAT = 'chat', // Unified HopHub (RabbitChat + Communities)
  MEETINGS = 'meetings',
  CORE = 'core',   // Hop Core - Private Hybrid Hub
  ARCADE = 'arcade',
  PROFILE = 'profile',
  SETTINGS = 'settings',
  AI_TOOLS = 'ai_tools',
  AUTH = 'auth' // Added for authentication view
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

export interface ReactionSummary {
  emoji: string;
  count: number;
  reactedByCurrentUser: boolean;
}

export interface Message {
  id: string;
  sender_id: string; // Changed from senderId to sender_id to match DB
  content: string; // Changed from text to content to match DB
  created_at: string; // Added created_at
  edited_at?: string; // Added edited_at
  chat_id: string; // Added chat_id
  users?: { username: string; avatar_url: string; }; // User data for sender
  reactions?: ReactionSummary[]; // Added for reactions
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

export interface CallHistory {
  id: string;
  caller_id: string;
  receiver_id: string;
  chat_id?: string;
  started_at: string;
  ended_at: string | null;
  duration: number | null; // in seconds
  status: 'missed' | 'ended' | 'rejected' | 'active';
  caller?: { display_name: string; avatar_url: string; }; // Joined user data
  receiver?: { display_name: string; avatar_url: string; }; // Joined user data
}