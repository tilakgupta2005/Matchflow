import { useParams, useNavigate } from 'react-router-dom';
import { useStore, DealStatus } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle2, Lock, XCircle, FileText, Mail, Phone, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { formatIndianCurrency } from '@/lib/format';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

const Negotiation = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { user, deals, updateDealStatus, updateDealTerms, influencerProfiles, campaigns } = useStore();

  const deal = deals.find((d) => d.id === dealId);

  const [stories, setStories] = useState(String(deal?.terms?.stories || 0));
  const [shortVideos, setShortVideos] = useState(String(deal?.terms?.shortVideos || 0));
  const [longVideos, setLongVideos] = useState(String(deal?.terms?.longVideos || 0));
  const [posts, setPosts] = useState(String(deal?.terms?.posts || 0));
  const [totalAmount, setTotalAmount] = useState(String(deal?.terms?.totalAmount || 0));
  const [termsNotes, setTermsNotes] = useState(deal?.terms?.termsNotes || '');

  if (!deal || !user) { navigate('/dashboard'); return null; }

  const influencerProfile = influencerProfiles.find(p => p.userId === deal.influencerId);
  const campaign = campaigns.find(c => c.id === deal.campaignId);

  const saveTerms = () => {
    if (Number(totalAmount) < 0) { toast.error('Amount cannot be negative'); return; }
    if (Number(stories) < 0 || Number(shortVideos) < 0 || Number(longVideos) < 0 || Number(posts) < 0) {
      toast.error('Deliverables cannot be negative'); return; 
    }

    updateDealTerms(deal.id, {
      stories: Number(stories),
      shortVideos: Number(shortVideos),
      longVideos: Number(longVideos),
      posts: Number(posts),
      totalAmount: Number(totalAmount),
      termsNotes,
    });
    toast.success('Deal terms saved!');
  };

  const isApproved = deal.status === 'approved';

  const buildSummaryParagraph = () => {
    const t = deal.terms;
    if (!t) return 'No terms finalized yet.';
    const parts: string[] = [];
    if (t.stories > 0) parts.push(`${t.stories} ${t.stories === 1 ? 'story' : 'stories'}`);
    if (t.shortVideos > 0) parts.push(`${t.shortVideos} short ${t.shortVideos === 1 ? 'video' : 'videos'}`);
    if (t.longVideos > 0) parts.push(`${t.longVideos} long ${t.longVideos === 1 ? 'video' : 'videos'}`);
    if (t.posts > 0) parts.push(`${t.posts} ${t.posts === 1 ? 'post' : 'posts'}`);
    const deliverables = parts.length > 0 ? parts.join(', ') : 'no deliverables';
    let summary = `This sponsorship involves ${deliverables} for a total payment of ${formatIndianCurrency(t.totalAmount)}.`;
    if (t.termsNotes) summary += ` Terms: ${t.termsNotes}`;
    return summary;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container flex-1 py-8 max-w-4xl">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Deal Terms / Negotiation Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-lg">Deal Terms</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-5">{deal.campaignTitle} — {deal.influencerName} ↔ {deal.brandName}</p>

              {deal.status === 'negotiating' || deal.status === 'requested' ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Deliverables Count</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div><Label className="text-xs">Stories</Label><Input type="number" min="0" value={stories} onChange={e => setStories(e.target.value)} /></div>
                    <div><Label className="text-xs">Short Videos</Label><Input type="number" min="0" value={shortVideos} onChange={e => setShortVideos(e.target.value)} /></div>
                    <div><Label className="text-xs">Long Videos</Label><Input type="number" min="0" value={longVideos} onChange={e => setLongVideos(e.target.value)} /></div>
                    <div><Label className="text-xs">Posts</Label><Input type="number" min="0" value={posts} onChange={e => setPosts(e.target.value)} /></div>
                  </div>
                  <div>
                    <Label className="text-xs">Total Amount (₹)</Label>
                    <Input type="number" min="0" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="Enter total amount" />
                  </div>
                  <div>
                    <Label className="text-xs">Terms & Notes</Label>
                    <Textarea value={termsNotes} onChange={e => setTermsNotes(e.target.value)} placeholder="Content requirements, posting schedule, brand guidelines..." rows={4} />
                  </div>
                  <Button className="rounded-pill" onClick={saveTerms}>Save Terms</Button>
                </div>
              ) : (
                /* Summary paragraph for locked/approved/etc */
                <div className="bg-muted rounded-xl p-5">
                  <p className="text-sm leading-relaxed">{buildSummaryParagraph()}</p>
                </div>
              )}
            </div>

            {/* Contact details - shown only when approved */}
            {isApproved && (
              <div className="bg-card border rounded-2xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> Contact Details (Shared)</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {influencerProfile && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">{deal.influencerName}</h4>
                      <div className="flex items-center gap-2 text-sm"><Mail className="h-3 w-3" /> {influencerProfile.contactEmail}</div>
                      <div className="flex items-center gap-2 text-sm"><Phone className="h-3 w-3" /> {influencerProfile.contactPhone}</div>
                      {influencerProfile.socialLinks.map((l, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm"><ExternalLink className="h-3 w-3" /> <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{l.platform || l.url}</a></div>
                      ))}
                    </div>
                  )}
                  {campaign && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">{deal.brandName}</h4>
                      {campaign.contactEmail && <div className="flex items-center gap-2 text-sm"><Mail className="h-3 w-3" /> {campaign.contactEmail}</div>}
                      {campaign.contactPhone && <div className="flex items-center gap-2 text-sm"><Phone className="h-3 w-3" /> {campaign.contactPhone}</div>}
                      {campaign.productLink && <div className="flex items-center gap-2 text-sm"><ExternalLink className="h-3 w-3" /> <a href={campaign.productLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{campaign.productLink}</a></div>}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-card border rounded-2xl p-5">
              <h3 className="font-bold mb-3">Deal Summary</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd className="font-medium capitalize">{deal.status}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Amount</dt><dd className="font-medium">{deal.terms?.totalAmount ? formatIndianCurrency(deal.terms.totalAmount) : 'TBD'}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Creator</dt><dd className="font-medium">{deal.influencerName}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Brand</dt><dd className="font-medium">{deal.brandName}</dd></div>
              </dl>
              {!isApproved && (
                <p className="text-xs text-muted-foreground mt-3 p-2 bg-muted rounded-lg">
                  Contact details will be shared after the deal is approved.
                </p>
              )}
            </div>

            <div className="space-y-2">
              {(deal.status === 'negotiating') && (
                <>
                  <Button className="w-full rounded-pill" onClick={() => updateDealStatus(deal.id, 'locked')}>
                    <Lock className="mr-2 h-4 w-4" /> Lock Deal
                  </Button>
                  <Button variant="destructive" className="w-full rounded-pill" onClick={() => updateDealStatus(deal.id, 'failed')}>
                    <XCircle className="mr-2 h-4 w-4" /> Mark as Failed
                  </Button>
                </>
              )}
              {deal.status === 'locked' && (
                <Button className="w-full rounded-pill" onClick={() => updateDealStatus(deal.id, 'approved')}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Approve Deal
                </Button>
              )}
              {deal.status === 'requested' && (
                <>
                  <Button className="w-full rounded-pill" onClick={() => updateDealStatus(deal.id, 'negotiating')}>
                    Start Negotiation <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                  </Button>
                  <Button variant="destructive" className="w-full rounded-pill" onClick={() => updateDealStatus(deal.id, 'failed')}>
                    <XCircle className="mr-2 h-4 w-4" /> Decline
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Negotiation;
