import { SpaceInfo, CommunityInfo, ActivityItem, Meeting, StreamType } from '../types';

// Initial Mock Data
let spaces: SpaceInfo[] = [
  { 
    id: 'creative-alliance', 
    name: 'Neon Social', 
    category: 'Voice Lounges', 
    participants: 42, 
    desc: 'Public discovery lounge with active high-energy vibes.', 
    image: 'https://picsum.photos/seed/neon/400/225', 
    type: 'Public Social',
    tags: ['Music', 'Vibe', 'Live'],
    visibility: 'Public',
    streamType: 'youtube',
    streamLink: 'jfKfPfyJRdk' // Lofi Girl ID
  },
  { 
    id: 'engineering-group', 
    name: 'Arcade Squad 1', 
    category: 'Gaming Squads', 
    participants: 12, 
    desc: 'Sandbox building and competitive strategy.', 
    image: 'https://picsum.photos/seed/mine/400/225', 
    type: 'Gaming Squad',
    tags: ['Minecraft', 'Strategy'],
    visibility: 'Public',
    streamType: 'twitch',
    streamLink: 'monstercat'
  },
  { 
    id: 'founders-circle', 
    name: 'Quiet Huddle', 
    category: 'Study Halls', 
    participants: 28, 
    desc: 'Silent focus with shared intelligence streams.', 
    image: 'https://picsum.photos/seed/lofi/400/225', 
    type: 'Mesh Hub',
    tags: ['Study', 'Lofi', 'Focus'],
    visibility: 'Public'
  },
  { 
    id: 'avatar', 
    name: 'Coffee Avatars', 
    category: 'Avatar Rooms', 
    participants: 8, 
    desc: 'Private avatar-only casual meeting space.', 
    image: 'https://picsum.photos/seed/code/400/225', 
    type: 'Avatar Hub',
    tags: ['Social', 'VR'],
    visibility: 'Public'
  },
  { 
    id: 'global-space', 
    name: 'The Void', 
    category: 'Trending', 
    participants: 15, 
    desc: 'Ambient discovery zone with light chat.', 
    image: 'https://picsum.photos/seed/void/400/225', 
    type: 'Casual Discovery',
    tags: ['Ambient', 'Chill'],
    visibility: 'Public'
  },
  { 
    id: 'friends', 
    name: 'Inner Circle', 
    category: 'Friends', 
    participants: 6, 
    desc: 'Your closest squad members are currently here.', 
    image: 'https://picsum.photos/seed/art/400/225', 
    type: 'Private Flow',
    tags: ['Private', 'Squad'],
    visibility: 'Private'
  },
];

let communities: CommunityInfo[] = [
  { 
    id: 'founders-circle', 
    name: 'Founders Circle', 
    icon: '🚀', 
    sub: 'Broadcast Only (Beam)', 
    role: 'Admin',
    channels: [
      { id: 'c1', name: 'general', type: 'Flow' },
      { id: 'c2', name: 'investor-updates', type: 'Beam' }
    ]
  },
  { 
    id: 'engineering-group', 
    name: 'Engineering Group', 
    icon: '💻', 
    sub: 'Standard Hybrid (Flow+Mesh)', 
    role: 'Member',
    channels: [
      { id: 'c3', name: 'dev-chat', type: 'Flow' },
      { id: 'c4', name: 'git-sync', type: 'Mesh' },
      { id: 'c5', name: 'deployments', type: 'Beam' }
    ]
  },
  { 
    id: 'creative-alliance', 
    name: 'Creative Alliance', 
    icon: '🎨', 
    sub: 'Strategy Hub (Mesh)', 
    role: 'Member',
    channels: [
      { id: 'c6', name: 'design-critique', type: 'Mesh' },
      { id: 'c7', name: 'assets', type: 'Mesh' }
    ]
  },
  { 
    id: 'global-space', 
    name: 'Global Squad', 
    icon: '🌍', 
    sub: 'Social (Flow)', 
    role: 'Guest',
    channels: [
      { id: 'c8', name: 'lobby', type: 'Flow' }
    ]
  },
];

// Mock Feeds Store
const feeds: Record<string, ActivityItem[]> = {
  'creative-alliance': [
      { id: '1', type: 'message', user: { name: 'DJ_Neon', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neon', role: 'Admin' }, content: 'Welcome to the lounge! Requests open.', timestamp: 'Now', channel: 'Lounge' },
      { id: '2', type: 'join', user: { name: 'VibeCheck', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vibe', role: 'Guest' }, content: 'hopped in.', timestamp: '1m ago' }
  ],
  'engineering-group': [
      { id: '3', type: 'file', user: { name: 'Alex Code', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', role: 'Member' }, content: 'pushed to main: fix(auth): token refresh', timestamp: '5m ago', channel: 'git-updates' }
  ],
  'global-space': [
      { id: '4', type: 'message', user: { name: 'System', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sys', role: 'Admin' }, content: 'Welcome to CloudHop Global.', timestamp: '1h ago', channel: 'Announcements' }
  ]
};

// Simple Event Emitter for Real-time updates
type Listener = (event?: any) => void;
const listeners: Listener[] = [];

const notify = (event?: any) => {
  listeners.forEach(l => l(event));
};

export const subscribe = (listener: Listener) => {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx > -1) listeners.splice(idx, 1);
  };
};

// API Methods
export const api = {
  getPublicSpaces: async (): Promise<SpaceInfo[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...spaces]), 300));
  },

  createSpace: async (space: Omit<SpaceInfo, 'id' | 'participants'>): Promise<SpaceInfo> => {
    const newSpace: SpaceInfo = {
      ...space,
      id: `space-${Date.now()}`,
      participants: 1, // You just joined
    };
    spaces = [newSpace, ...spaces];
    feeds[newSpace.id] = []; // Init empty feed
    notify({ type: 'space_created', space: newSpace });
    return newSpace;
  },

  getCommunities: async (): Promise<CommunityInfo[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...communities]), 300));
  },

  createCommunity: async (comm: Omit<CommunityInfo, 'id' | 'channels'>): Promise<CommunityInfo> => {
    const newComm: CommunityInfo = {
      ...comm,
      id: `comm-${Date.now()}`,
      channels: [{ id: `ch-${Date.now()}`, name: 'general', type: 'Flow' }]
    };
    communities = [newComm, ...communities];
    feeds[newComm.id] = [];
    notify({ type: 'community_created', community: newComm });
    return newComm;
  },

  createChannel: async (communityId: string, channel: Omit<Channel, 'id'>) => {
    const comm = communities.find(c => c.id === communityId);
    if (comm) {
      comm.channels.push({ ...channel, id: `ch-${Date.now()}` });
      notify({ type: 'channel_created', channel });
    }
  },

  joinSpace: async (spaceId: string) => {
     // Simulate joining logic (e.g. incrementing participant count)
     const space = spaces.find(s => s.id === spaceId);
     if (space) {
        // In a real app we'd check if user is already in
        // space.participants += 1; 
        notify({ type: 'user_join', spaceId });
     }
  },

  // Feed Methods
  getSpaceFeed: async (spaceId: string): Promise<ActivityItem[]> => {
      return new Promise(resolve => setTimeout(() => resolve(feeds[spaceId] || []), 200));
  },

  getSpaceStream: async (spaceId: string): Promise<{type: StreamType, link?: string} | null> => {
      const space = spaces.find(s => s.id === spaceId);
      if (space && space.streamType && space.streamLink) {
          return { type: space.streamType, link: space.streamLink };
      }
      return null;
  }
};
