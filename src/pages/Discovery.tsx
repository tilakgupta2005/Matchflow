import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowRight, Users, TrendingUp, Tag, ExternalLink, Eye, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { formatIndianCurrency, formatFollowers } from '@/lib/format';

const PAGE_SIZE = 20;

const Discovery = () => {
  const { user, influencerProfiles, campaigns, deals, addDeal, addNotification, hasDealForCampaign } = useStore();
  const [infVisible, setInfVisible] = useState(PAGE_SIZE);
  const [campVisible, setCampVisible] = useState(PAGE_SIZE);
  const [viewInfluencer, setViewInfluencer] = useState<string | null>(null);
  const [viewCampaign, setViewCampaign] = useState<string | null>(null);

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

  const visibleInfluencers = useMemo(() => {
    let sliced = influencerProfiles.slice(0, infVisible);
    if (!user) sliced = sliced.slice(0, 8); // 2 rows of 4 columns (lg:grid-cols-4)
    return sliced;
  }, [influencerProfiles, infVisible, user]);

  const visibleCampaigns = useMemo(() => {
    let sliced = campaigns.filter(c => c.status === 'active').slice(0, campVisible);
    if (!user) sliced = sliced.slice(0, 6); // 2 rows of 3 columns (lg:grid-cols-3)
    return sliced;
  }, [campaigns, campVisible, user]);

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
                    <h3 className="font-bold mb-0.5 truncate" title={name}>{name}</h3>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {inf.niches.slice(0, 3).map(n => (
                        <span key={n} title={n} className="text-xs bg-primary/10 text-primary font-medium px-1.5 py-0.5 rounded-full truncate max-w-[120px]">{n}</span>
                      ))}
                      {inf.niches.length > 3 && <span className="text-xs bg-primary/10 text-primary font-medium px-1.5 py-0.5 rounded-full shrink-0">+{inf.niches.length - 3}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow break-words">{inf.bio}</p>
                    
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
                        {inf.socialLinks.length > 0 && inf.socialLinks.slice(0, 3).map((l, i) => (
                          <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline truncate max-w-[120px]" title={l.platform || 'Link'}>
                            <ExternalLink className="h-3 w-3 shrink-0" /> <span className="truncate">{l.platform || 'Link'}</span>
                          </a>
                        ))}
                      </div>
                      <div className="mt-auto pt-2 w-full">
                        <div className="flex gap-2 w-full">
                          <Button variant="outline" size="sm" className="flex-1 rounded-pill" onClick={() => setViewInfluencer(inf.userId)}>
                            <Eye className="mr-1 h-3 w-3" /> View
                          </Button>
                          {user && user.role === 'brand' && (
                            <Button size="sm" className="flex-1 rounded-pill" disabled={alreadyRequested} onClick={() => sendRequest('to-influencer', inf.userId, name)}>
                              {alreadyRequested ? 'Requested' : 'Request'} <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {infVisible < influencerProfiles.length && user && (
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
                    <h3 className="font-bold mb-1 truncate" title={c.title}>{c.title}</h3>
                    <p className="text-sm text-muted-foreground mb-1 truncate" title={`by ${c.brandName}`}>by {c.brandName}</p>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 break-words">{c.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {c.deliverables.slice(0, 3).map((d) => (
                        <span key={d} title={d} className="text-xs bg-muted rounded-lg px-2 py-1 truncate max-w-[120px]">{d}</span>
                      ))}
                      {c.deliverables.length > 3 && <span className="text-xs bg-muted rounded-lg px-2 py-1 shrink-0">+{c.deliverables.length - 3}</span>}
                    </div>
                    {c.productLink && (
                      <a href={c.productLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mb-3 truncate max-w-full">
                        <ExternalLink className="h-3 w-3 shrink-0" /> <span className="truncate">Product Link</span>
                      </a>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-4 w-full">
                      <span className="text-sm font-semibold">{formatIndianCurrency(c.budget)}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-pill" onClick={() => setViewCampaign(c.id)}>
                          <Eye className="mr-1 h-3 w-3" /> View
                        </Button>
                        {user && user.role === 'influencer' && (
                          <Button size="sm" className="rounded-pill" disabled={alreadyApplied}
                            onClick={() => sendRequest('to-brand', c.brandId, c.brandName, c.id)}>
                            {alreadyApplied ? 'Applied' : 'Apply'} <ArrowRight className="ml-1 h-3 w-3 flex-shrink-0" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {campVisible < campaigns.length && user && (
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
            <h2 className="text-2xl font-bold mb-2">View the Full Marketplace</h2>
            <p className="text-muted-foreground mb-6">Sign up to view all creators and campaigns, send direct requests, and start collaborating!</p>
            <Button className="rounded-pill" size="lg" asChild><a href="/auth?mode=signup">Create Free Account <ArrowRight className="ml-2 h-4 w-4" /></a></Button>
          </div>
        )}

        {/* View Influencer Dialog */}
        <Dialog open={!!viewInfluencer} onOpenChange={() => setViewInfluencer(null)}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {viewInfluencer && (() => {
              const inf = influencerProfiles.find(p => p.userId === viewInfluencer);
              if (!inf) return null;
              const name = getInfluencerName(inf.userId);
              const alreadyRequested = user ? deals.some(d => d.brandId === user.id && d.influencerId === inf.userId) : false;
              const hasLocation = inf.country || inf.state || inf.city;
              return (
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-teal-light flex items-center justify-center text-2xl font-bold flex-shrink-0">
                        {name.charAt(0)}
                      </div>
                      <div>
                        <DialogTitle className="text-2xl">{name}</DialogTitle>
                        {hasLocation && (
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {[inf.city, inf.state, inf.country].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="space-y-6 mt-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Niches</h4>
                      <div className="flex flex-wrap gap-1">
                        {inf.niches.map(n => <span key={n} className="text-xs bg-primary/10 text-primary font-medium px-2 py-1 rounded-full">{n}</span>)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted rounded-xl p-4 text-center">
                        <Users className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                        <div className="font-bold text-lg">{formatFollowers(inf.followers)}</div>
                        <div className="text-xs text-muted-foreground">Followers</div>
                      </div>
                      <div className="bg-muted rounded-xl p-4 text-center">
                        <TrendingUp className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                        <div className="font-bold text-lg">{inf.engagementRate}%</div>
                        <div className="text-xs text-muted-foreground">Engagement Rate</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2">About</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap break-all">{inf.bio}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2">Pricing</h4>
                      <div className="flex flex-col gap-2 text-sm">
                        <div className="flex justify-between border-b pb-2"><span>Story:</span> <span className="font-medium">{formatIndianCurrency(inf.priceStory.min)} - {formatIndianCurrency(inf.priceStory.max)}</span></div>
                        <div className="flex justify-between border-b pb-2"><span>Post:</span> <span className="font-medium">{formatIndianCurrency(inf.pricePost.min)} - {formatIndianCurrency(inf.pricePost.max)}</span></div>
                        <div className="flex justify-between border-b pb-2"><span>Reel/Shorts:</span> <span className="font-medium">{formatIndianCurrency(inf.priceShortVideo.min)} - {formatIndianCurrency(inf.priceShortVideo.max)}</span></div>
                        <div className="flex justify-between border-b pb-2 border-transparent"><span>YT/Long Video:</span> <span className="font-medium">{formatIndianCurrency(inf.priceLongVideo.min)} - {formatIndianCurrency(inf.priceLongVideo.max)}</span></div>
                      </div>
                    </div>

                    {inf.socialLinks.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Platforms</h4>
                        <div className="flex flex-wrap gap-2">
                          {inf.socialLinks.map((l, i) => (
                            <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                              <ExternalLink className="h-4 w-4 flex-shrink-0" /> <span className="truncate max-w-[150px]">{l.platform || 'Link'}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {user && user.role === 'brand' && (
                      <Button className="w-full rounded-pill hover:-translate-y-0.5 transition-transform" size="lg" disabled={alreadyRequested} onClick={() => {
                        sendRequest('to-influencer', inf.userId, name);
                        setViewInfluencer(null);
                      }}>
                        {alreadyRequested ? 'Request Sent' : 'Request Collaboration'} <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* View Campaign Dialog */}
        <Dialog open={!!viewCampaign} onOpenChange={() => setViewCampaign(null)}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {viewCampaign && (() => {
              const c = campaigns.find(camp => camp.id === viewCampaign);
              if (!c) return null;
              const alreadyApplied = user ? hasDealForCampaign(user.id, c.id) : false;
              const hasLocation = c.country || c.state || c.city;
              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-2xl pr-4">{c.title}</DialogTitle>
                    <div className="text-sm text-muted-foreground mt-1">by <span className="font-semibold">{c.brandName}</span></div>
                  </DialogHeader>
                  <div className="space-y-6 mt-4">
                    <div className="flex gap-2">
                      <span className="px-3 py-1 rounded-pill bg-primary/10 text-primary text-sm font-medium">{c.category}</span>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Budget</Label>
                      <p className="font-bold text-2xl text-primary">{formatIndianCurrency(c.budget)}</p>
                    </div>

                    {hasLocation && (
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Target Region</Label>
                        <p className="text-sm font-medium flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                          {[c.city, c.state, c.country].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    )}

                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Requirements / Description</Label>
                      <p className="text-sm whitespace-pre-wrap mt-1 break-all">{c.description}</p>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Required Deliverables</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {c.deliverables.map((d) => (
                          <span key={d} className="text-xs bg-secondary/10 text-secondary border border-secondary/20 rounded-lg px-2.5 py-1.5">{d}</span>
                        ))}
                      </div>
                    </div>

                    {c.productLink && (
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Product Link</Label>
                        <a href={c.productLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline mt-1 break-all">
                          <ExternalLink className="h-4 w-4 flex-shrink-0" /> {c.productLink}
                        </a>
                      </div>
                    )}

                    {user && user.role === 'influencer' && (
                      <Button className="w-full rounded-pill hover:-translate-y-0.5 transition-transform" size="lg" disabled={alreadyApplied} onClick={() => {
                        sendRequest('to-brand', c.brandId, c.brandName, c.id);
                        setViewCampaign(null);
                      }}>
                        {alreadyApplied ? 'Already Applied' : 'Apply for Campaign'} <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  );
};

export default Discovery;
