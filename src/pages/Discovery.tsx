import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, TrendingUp, Tag, ExternalLink } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { formatIndianCurrency, formatFollowers } from '@/lib/format';

const PAGE_SIZE = 20;

const Discovery = () => {
  const { user, influencerProfiles, campaigns, deals, addDeal, addNotification, hasDealForCampaign } = useStore();
  const [infVisible, setInfVisible] = useState(PAGE_SIZE);
  const [campVisible, setCampVisible] = useState(PAGE_SIZE);

  const sendRequest = (type: 'to-influencer' | 'to-brand', targetId: string, targetName: string, campaignId?: string) => {
    if (campaignId && user && hasDealForCampaign(user.id, campaignId)) {
      toast.error('You already have a request for this campaign.');
      return;
    }
    addDeal({
      id: crypto.randomUUID(),
      influencerId: type === 'to-influencer' ? targetId : user?.id || '',
      influencerName: type === 'to-influencer' ? targetName : user?.name || '',
      brandId: type === 'to-brand' ? targetId : user?.id || '',
      brandName: type === 'to-brand' ? targetName : user?.name || '',
      campaignId: campaignId || '',
      campaignTitle: campaigns.find((c) => c.id === campaignId)?.title || 'Direct Collaboration',
      status: 'requested',
      amount: 0,
      createdAt: new Date().toISOString(),
    });
    addNotification(`New request sent to ${targetName}`);
    toast.success(`Request sent to ${targetName}!`);
  };

  const showInfluencers = !user || user.role === 'brand' || user.role === 'admin';
  const showCampaigns = !user || user.role === 'influencer' || user.role === 'admin';

  const getInfluencerName = (userId: string) => {
    const deal = useStore.getState().deals.find((d) => d.influencerId === userId);
    return deal?.influencerName || `${useStore.getState().influencerProfiles.find((p) => p.userId === userId)?.niches[0] || ''} Creator`;
  };

  const visibleInfluencers = useMemo(() => influencerProfiles.slice(0, infVisible), [influencerProfiles, infVisible]);
  const visibleCampaigns = useMemo(() => campaigns.filter(c => c.status === 'active').slice(0, campVisible), [campaigns, campVisible]);

  // Compute overall price range across all categories for an influencer
  const getOverallRange = (inf: typeof influencerProfiles[0]) => {
    const allMins = [inf.priceStory.min, inf.priceShortVideo.min, inf.priceLongVideo.min, inf.pricePost.min];
    const allMaxs = [inf.priceStory.max, inf.priceShortVideo.max, inf.priceLongVideo.max, inf.pricePost.max];
    return { min: Math.min(...allMins), max: Math.max(...allMaxs) };
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container py-16 flex-1">
        <h1 className="text-3xl font-extrabold mb-2">Discover</h1>
        <p className="text-muted-foreground mb-10">Find your perfect match on the marketplace.</p>

        {showInfluencers && (
          <div className="mb-16">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Users className="h-5 w-5 text-secondary" /> Featured Creators</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleInfluencers.map((inf) => {
                const name = getInfluencerName(inf.userId);
                const range = getOverallRange(inf);
                const alreadyRequested = user ? deals.some(d => d.brandId === user.id && d.influencerId === inf.userId) : false;
                
                return (
                  <div key={inf.userId} className="bg-card rounded-2xl border p-6 hover:shadow-lg transition-shadow flex flex-col h-full overflow-hidden">
                    <div className="w-12 h-12 rounded-full bg-teal-light flex items-center justify-center text-lg font-bold mb-4 flex-shrink-0">
                      {name.charAt(0)}
                    </div>
                    <h3 className="font-bold mb-0.5">{name}</h3>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {inf.niches.map(n => (
                        <span key={n} className="text-xs bg-primary/10 text-primary font-medium px-1.5 py-0.5 rounded-full">{n}</span>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">{inf.bio}</p>
                    
                    <div className="flex flex-col w-full">
                      <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                        <div className="bg-muted rounded-lg p-2 text-center">
                          <TrendingUp className="h-3 w-3 mx-auto mb-1" />
                          {inf.engagementRate}% ER
                        </div>
                        <div className="bg-muted rounded-lg p-2 text-center">
                          <Users className="h-3 w-3 mx-auto mb-1" />
                          {formatFollowers(inf.followers)}
                        </div>
                      </div>
                      {/* Single price range */}
                      <div className="text-sm font-semibold text-primary mb-3">
                        {formatIndianCurrency(range.min)} – {formatIndianCurrency(range.max)}
                      </div>
                      {/* Social links */}
                      <div className="flex flex-wrap gap-2 mb-4 min-h-[24px]">
                        {inf.socialLinks.length > 0 && inf.socialLinks.map((l, i) => (
                          <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline break-all">
                            <ExternalLink className="h-3 w-3 flex-shrink-0" /> {l.platform || 'Link'}
                          </a>
                        ))}
                      </div>
                      <div className="mt-auto pt-2 w-full">
                        {user && user.role === 'brand' && (
                          <Button size="sm" className="w-full rounded-pill" disabled={alreadyRequested} onClick={() => sendRequest('to-influencer', inf.userId, name)}>
                            {alreadyRequested ? 'Requested' : 'Request'} <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {infVisible < influencerProfiles.length && (
              <div className="text-center mt-8">
                <Button variant="outline" className="rounded-pill" onClick={() => setInfVisible((v) => v + PAGE_SIZE)}>
                  Load More Creators
                </Button>
              </div>
            )}
          </div>
        )}

        {showCampaigns && (
          <div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Tag className="h-5 w-5 text-accent" /> Active Campaigns</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleCampaigns.map((c) => {
                const alreadyApplied = user ? hasDealForCampaign(user.id, c.id) : false;
                return (
                  <div key={c.id} className="bg-card rounded-2xl border p-6 hover:shadow-lg transition-shadow flex flex-col h-full overflow-hidden">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded-pill bg-primary/10 text-primary text-xs font-medium">{c.category}</span>
                    </div>
                    <h3 className="font-bold mb-1">{c.title}</h3>
                    <p className="text-sm text-muted-foreground mb-1">by {c.brandName}</p>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{c.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {c.deliverables.map((d) => (
                        <span key={d} className="text-xs bg-muted rounded-lg px-2 py-1">{d}</span>
                      ))}
                    </div>
                    {c.productLink && (
                      <a href={c.productLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mb-3 break-all">
                        <ExternalLink className="h-3 w-3 flex-shrink-0" /> Product Link
                      </a>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-4 w-full">
                      <span className="text-sm font-semibold">{formatIndianCurrency(c.budget)}</span>
                      {user && user.role === 'influencer' && (
                        <Button size="sm" className="rounded-pill" disabled={alreadyApplied}
                          onClick={() => sendRequest('to-brand', c.brandId, c.brandName, c.id)}>
                          {alreadyApplied ? 'Applied' : 'Apply'} <ArrowRight className="ml-1 h-3 w-3 flex-shrink-0" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {campVisible < campaigns.length && (
              <div className="text-center mt-8">
                <Button variant="outline" className="rounded-pill" onClick={() => setCampVisible((v) => v + PAGE_SIZE)}>
                  Load More Campaigns
                </Button>
              </div>
            )}
          </div>
        )}

        {!user && (
          <div className="text-center mt-12 p-8 bg-primary/10 rounded-2xl">
            <p className="text-muted-foreground mb-4">Sign up to send requests and start collaborating!</p>
            <Button className="rounded-pill" asChild><a href="/auth?mode=signup">Get Started <ArrowRight className="ml-2 h-4 w-4" /></a></Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Discovery;
