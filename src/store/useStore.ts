import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export type UserRole = 'influencer' | 'brand' | 'admin';
export type DealStatus = 'requested' | 'negotiating' | 'locked' | 'approved' | 'rejected' | 'failed';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  profileComplete: boolean;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
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
  country?: string;
  state?: string;
  city?: string;
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
  country?: string;
  state?: string;
  city?: string;
}

export interface DealTerms {
  stories: number;
  shortVideos: number;
  longVideos: number;
  posts: number;
  totalAmount: number;
  termsNotes: string;
  brandApproved?: boolean;
  influencerApproved?: boolean;
}

export interface Deal {
  id: string;
  influencerId: string;
  influencerName: string;
  brandId: string;
  brandName: string;
  campaignId?: string;
  campaignTitle: string;
  status: DealStatus;
  amount: number;
  terms?: DealTerms;
  createdAt: string;
}

export interface DealMessage {
  id: string;
  dealId: string;
  senderId: string;
  content: string;
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
  dealMessages: DealMessage[];
  notifications: Notification[];
  isLoading: boolean;
  
  // Initialization / Fetching
  initializeUser: () => Promise<void>;
  fetchInfluencerProfiles: () => Promise<void>;
  fetchCampaigns: () => Promise<void>;
  fetchDeals: () => Promise<void>;
  fetchDealMessages: (dealId: string) => Promise<void>;
  subscribeToDealMessages: (dealId: string) => void;
  unsubscribeFromDealMessages: () => void;
  fetchNotifications: () => Promise<void>;
  
  // Mutations
  setUser: (user: User | null) => void;
  addInfluencerProfile: (p: InfluencerProfile) => Promise<void>;
  updateInfluencerProfile: (userId: string, data: Partial<InfluencerProfile>) => Promise<void>;

  addCampaign: (c: Campaign) => Promise<void>;
  addDeal: (d: Deal) => Promise<void>;
  updateDealStatus: (dealId: string, status: DealStatus) => Promise<void>;
  updateDealTerms: (dealId: string, terms: DealTerms) => Promise<void>;
  approveDeal: (dealId: string) => Promise<void>;
  declineDeal: (dealId: string) => Promise<void>;
  sendDealMessage: (dealId: string, content: string) => Promise<void>;
  runAiNegotiation: (deal: Deal) => Promise<void>;
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
  dealMessages: [],
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
    if (error) toast.error(error.message);
    else if (data) set({ influencerProfiles: data as InfluencerProfile[] });
  },

  fetchCampaigns: async () => {
    const { data, error } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    else if (data) set({ campaigns: data as Campaign[] });
  },

  fetchDeals: async () => {
    const { data, error } = await supabase.from('deals').select('*').order('createdAt', { ascending: false });
    if (error) toast.error(error.message);
    else if (data) set({ deals: data as Deal[] });
  },

  fetchDealMessages: async (dealId) => {
    const { data, error } = await supabase.from('deal_messages').select('*').eq('dealId', dealId).order('createdAt', { ascending: true });
    if (!error && data) set({ dealMessages: data as DealMessage[] });
  },

  subscribeToDealMessages: (dealId) => {
    const prevChannel = (window as any)._activeDealChannel;
    if (prevChannel) supabase.removeChannel(prevChannel);

    const channel = supabase.channel(`public:deal_updates:${dealId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'deal_messages', filter: `dealId=eq.${dealId}` }, (payload) => {
        const newMsg = payload.new as DealMessage;
        set((s) => {
          if (s.dealMessages.some(m => m.id === newMsg.id)) return s;
          return { dealMessages: [...s.dealMessages, newMsg] };
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'deals', filter: `id=eq.${dealId}` }, (payload) => {
        const updatedDeal = payload.new as Deal;
        set((s) => ({
          deals: s.deals.map((d) => d.id === updatedDeal.id ? { ...d, ...updatedDeal } : d)
        }));
      })
      .subscribe();
    
    // Store channel instance in a non-state variable or just attach to window for cleanup
    (window as any)._activeDealChannel = channel;
  },

  unsubscribeFromDealMessages: () => {
    const channel = (window as any)._activeDealChannel;
    if (channel) {
      supabase.removeChannel(channel);
      (window as any)._activeDealChannel = null;
    }
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
    const newTerms = { ...terms, brandApproved: false, influencerApproved: false };
    const { error } = await supabase.from('deals').update({ terms: newTerms, amount: newTerms.totalAmount }).eq('id', dealId);
    if (!error) set((s) => ({ deals: s.deals.map((d) => d.id === dealId ? { ...d, terms: newTerms, amount: newTerms.totalAmount } : d) }));
  },

  approveDeal: async (dealId) => {
    const state = get();
    const deal = state.deals.find(d => d.id === dealId);
    if (!deal || !deal.terms || !state.user) return;

    let newTerms = { ...deal.terms };
    if (state.user.role === 'brand') newTerms.brandApproved = true;
    if (state.user.role === 'influencer') newTerms.influencerApproved = true;

    const bothApproved = newTerms.brandApproved && newTerms.influencerApproved;
    const newStatus = bothApproved ? 'approved' : 'locked';

    const { error } = await supabase.from('deals').update({ terms: newTerms, status: newStatus }).eq('id', dealId);
    if (!error) {
      set((s) => ({ deals: s.deals.map((d) => d.id === dealId ? { ...d, terms: newTerms, status: newStatus } : d) }));
      if (bothApproved) {
         state.addNotification(`Deal approved for ${deal.campaignTitle}`, deal.influencerId !== state.user.id ? deal.influencerId : deal.brandId);
      }
    }
  },

  declineDeal: async (dealId) => {
    const state = get();
    const deal = state.deals.find(d => d.id === dealId);
    if (!deal || !deal.terms) return;
    
    let newTerms = { ...deal.terms, brandApproved: false, influencerApproved: false };
    const { error } = await supabase.from('deals').update({ terms: newTerms, status: 'negotiating' }).eq('id', dealId);
    if (!error) {
       set((s) => ({ deals: s.deals.map((d) => d.id === dealId ? { ...d, terms: newTerms, status: 'negotiating' } : d) }));
    }
  },

  runAiNegotiation: async (deal) => {
    const state = get();
    const influencer = state.influencerProfiles.find((p) => p.userId === deal.influencerId);
    const campaign = state.campaigns.find((c) => c.id === deal.campaignId) || {
      id: deal.campaignId,
      brandId: deal.brandId,
      brandName: deal.brandName,
      title: deal.campaignTitle,
      description: 'Direct Collaboration',
      budget: 0,
      category: 'General',
      deliverables: [],
      status: 'active'
    };

    if (!influencer) return;

    try {
      const webhookUrl = import.meta.env.VITE_NEGOTIATION_WEBHOOK_URL;
      if (!webhookUrl) {
        toast.error('VITE_NEGOTIATION_WEBHOOK_URL is strictly required for negotiations.');
        return;
      }
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ influencer, campaign })
      });
      const data = await res.json();
      const aiResponse = Array.isArray(data) ? data[0] : data;

      if (!aiResponse) return;

      const generatedMessages = [];
      for (let i = 1; i <= 10; i++) {
        const msgInfo = aiResponse[`message${i}`];
        if (msgInfo && msgInfo.role && msgInfo.message) {
          generatedMessages.push({
            id: crypto.randomUUID(),
            dealId: deal.id,
            senderId: msgInfo.role === 'brand' ? deal.brandId : deal.influencerId,
            content: msgInfo.message,
            createdAt: new Date(Date.now() + i * 1000).toISOString()
          });
        }
      }

      if (generatedMessages.length > 0) {
        const { error: msgError } = await supabase.from('deal_messages').insert(generatedMessages);
        if (!msgError) {
          set((s) => ({ dealMessages: [...s.dealMessages, ...generatedMessages] }));
        }
      }

      const statusStr = String(aiResponse.status || '').trim().toLowerCase();
      const newStatus = statusStr === 'accept' ? 'locked' : (statusStr === 'reject' ? 'rejected' : 'failed');
      const terms = {
        stories: aiResponse.deliverables?.stories || 0,
        shortVideos: aiResponse.deliverables?.shortVideos || 0,
        longVideos: aiResponse.deliverables?.longVideos || 0,
        posts: aiResponse.deliverables?.posts || 0,
        totalAmount: aiResponse.budget || 0,
        termsNotes: 'AI Negotiated Terms'
      };

      const { error: updateError } = await supabase.from('deals').update({
        terms,
        amount: terms.totalAmount,
        status: newStatus
      }).eq('id', deal.id);

      if (!updateError) {
        set((s) => ({
          deals: s.deals.map((d) =>
            d.id === deal.id ? { ...d, terms, amount: terms.totalAmount, status: newStatus } : d
          )
        }));
      }
    } catch (err) {
      console.error('AI Negotiation failed', err);
    }
  },

  sendDealMessage: async (dealId, content) => {
    const user = get().user;
    if (!user) return;
    const msg = { 
      id: crypto.randomUUID(),
      dealId, 
      senderId: user.id, 
      content,
      createdAt: new Date().toISOString()
    };
    const { data, error } = await supabase.from('deal_messages').insert(msg).select().single();
    if (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message: ' + error.message);
    } else if (data) {
      set((s) => ({ dealMessages: [...s.dealMessages, data as DealMessage] }));
    }
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
