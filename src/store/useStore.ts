import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type UserRole = 'influencer' | 'brand' | 'admin';
export type DealStatus = 'requested' | 'negotiating' | 'locked' | 'approved' | 'rejected' | 'failed';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  profileComplete: boolean;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface InfluencerProfile {
  userId: string;
  niches: string[];
  followers: number;
  engagementRate: number;
  priceStory: PriceRange;
  priceShortVideo: PriceRange;
  priceLongVideo: PriceRange;
  pricePost: PriceRange;
  bio: string;
  platforms: string[];
  contactEmail: string;
  contactPhone: string;
  socialLinks: { platform: string; url: string }[];
}

export interface Campaign {
  id: string;
  brandId: string;
  brandName: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  deliverables: string[];
  status: 'active' | 'paused' | 'completed';
  contactEmail?: string;
  contactPhone?: string;
  productLink?: string;
}

export interface DealTerms {
  stories: number;
  shortVideos: number;
  longVideos: number;
  posts: number;
  totalAmount: number;
  termsNotes: string;
}

export interface Deal {
  id: string;
  influencerId: string;
  influencerName: string;
  brandId: string;
  brandName: string;
  campaignId: string;
  campaignTitle: string;
  status: DealStatus;
  amount: number;
  terms?: DealTerms;
  createdAt: string;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  userId?: string;
}

interface AppState {
  user: User | null;
  influencerProfiles: InfluencerProfile[];
  campaigns: Campaign[];
  deals: Deal[];
  notifications: Notification[];
  isLoading: boolean;
  
  // Initialization / Fetching
  initializeUser: () => Promise<void>;
  fetchInfluencerProfiles: () => Promise<void>;
  fetchCampaigns: () => Promise<void>;
  fetchDeals: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  
  // Mutations
  setUser: (user: User | null) => void;
  addInfluencerProfile: (p: InfluencerProfile) => Promise<void>;
  updateInfluencerProfile: (userId: string, data: Partial<InfluencerProfile>) => Promise<void>;

  addCampaign: (c: Campaign) => Promise<void>;
  addDeal: (d: Deal) => Promise<void>;
  updateDealStatus: (dealId: string, status: DealStatus) => Promise<void>;
  updateDealTerms: (dealId: string, terms: DealTerms) => Promise<void>;
  updateCampaign: (id: string, data: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  
  addNotification: (msg: string, userId?: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  
  // Utils
  hasDealForCampaign: (userId: string, campaignId: string) => boolean;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  influencerProfiles: [],
  campaigns: [],
  deals: [],
  notifications: [],
  isLoading: true,

  // Initialize from Supabase Auth session
  initializeUser: async () => {
    set({ isLoading: true });
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: userData } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      if (userData) {
        set({ user: userData as User });
      }
    }
    set({ isLoading: false });
  },

  fetchInfluencerProfiles: async () => {
    const { data, error } = await supabase.from('influencer_profiles').select('*');
    if (!error && data) set({ influencerProfiles: data as InfluencerProfile[] });
  },

  fetchCampaigns: async () => {
    const { data, error } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
    if (!error && data) set({ campaigns: data as Campaign[] });
  },

  fetchDeals: async () => {
    const { data, error } = await supabase.from('deals').select('*').order('createdAt', { ascending: false });
    if (!error && data) set({ deals: data as Deal[] });
  },

  fetchNotifications: async () => {
    const user = get().user;
    if (!user) return;
    const { data, error } = await supabase.from('notifications').select('*').eq('userId', user.id).order('createdAt', { ascending: false });
    if (!error && data) set({ notifications: data as Notification[] });
  },

  // State Updates
  setUser: (user) => set({ user }),

  addInfluencerProfile: async (p) => {
    const { error } = await supabase.from('influencer_profiles').insert(p);
    if (!error) set((s) => ({ influencerProfiles: [...s.influencerProfiles, p] }));
  },

  updateInfluencerProfile: async (userId, data) => {
    const { error } = await supabase.from('influencer_profiles').update(data).eq('userId', userId);
    if (!error) set((s) => ({ influencerProfiles: s.influencerProfiles.map((p) => p.userId === userId ? { ...p, ...data } : p) }));
  },

  addCampaign: async (c) => {
    // Generate UUID if not provided by UI
    const campaignData = { ...c, id: c.id || crypto.randomUUID() };
    const { error } = await supabase.from('campaigns').insert(campaignData);
    if (!error) set((s) => ({ campaigns: [campaignData, ...s.campaigns] }));
  },

  addDeal: async (d) => {
    const dealData = { ...d, id: d.id || crypto.randomUUID() };
    const { error } = await supabase.from('deals').insert(dealData);
    if (!error) set((s) => ({ deals: [dealData, ...s.deals] }));
  },

  updateDealStatus: async (dealId, status) => {
    const { error } = await supabase.from('deals').update({ status }).eq('id', dealId);
    if (!error) set((s) => ({ deals: s.deals.map((d) => d.id === dealId ? { ...d, status } : d) }));
  },

  updateDealTerms: async (dealId, terms) => {
    const { error } = await supabase.from('deals').update({ terms, amount: terms.totalAmount }).eq('id', dealId);
    if (!error) set((s) => ({ deals: s.deals.map((d) => d.id === dealId ? { ...d, terms, amount: terms.totalAmount } : d) }));
  },

  updateCampaign: async (id, data) => {
    const { error } = await supabase.from('campaigns').update(data).eq('id', id);
    if (!error) set((s) => ({ campaigns: s.campaigns.map((c) => c.id === id ? { ...c, ...data } : c) }));
  },

  deleteCampaign: async (id) => {
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (!error) set((s) => ({ campaigns: s.campaigns.filter((c) => c.id !== id) }));
  },

  addNotification: async (message, userId) => {
    const notif = { id: crypto.randomUUID(), message, read: false, createdAt: new Date().toISOString(), userId };
    const { error } = await supabase.from('notifications').insert(notif);
    if (!error) set((s) => ({ notifications: [notif, ...s.notifications] }));
  },

  markNotificationRead: async (id) => {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (!error) set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) }));
  },

  hasDealForCampaign: (userId, campaignId) => {
    const state = get();
    return state.deals.some((d) => (d.influencerId === userId || d.brandId === userId) && d.campaignId === campaignId);
  },
}));
