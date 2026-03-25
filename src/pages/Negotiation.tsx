import { useParams, useNavigate } from 'react-router-dom';
import { useStore, DealStatus } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle2, Lock, XCircle, FileText, Mail, Phone, ExternalLink, Send } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { formatIndianCurrency } from '@/lib/format';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

const Negotiation = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { user, deals, updateDealStatus, updateDealTerms, influencerProfiles, campaigns, dealMessages, fetchDealMessages, sendDealMessage, subscribeToDealMessages, unsubscribeFromDealMessages } = useStore();

  const deal = deals.find((d) => d.id === dealId);

  const [stories, setStories] = useState(String(deal?.terms?.stories || 0));
  const [shortVideos, setShortVideos] = useState(String(deal?.terms?.shortVideos || 0));
  const [longVideos, setLongVideos] = useState(String(deal?.terms?.longVideos || 0));
  const [posts, setPosts] = useState(String(deal?.terms?.posts || 0));
  const [totalAmount, setTotalAmount] = useState(String(deal?.terms?.totalAmount || 0));
  const [termsNotes, setTermsNotes] = useState(deal?.terms?.termsNotes || '');

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dealId) {
      fetchDealMessages(dealId);
      subscribeToDealMessages(dealId);
    }
    return () => {
      unsubscribeFromDealMessages();
    };
  }, [dealId, fetchDealMessages, subscribeToDealMessages, unsubscribeFromDealMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dealMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !deal) return;
    await sendDealMessage(deal.id, newMessage);
    setNewMessage('');
  };

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
      <div className="container flex-1 py-10 max-w-5xl">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Deal Terms / Negotiation Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border rounded-3xl flex flex-col h-[600px] overflow-hidden shadow-sm">
              <div className="flex flex-col border-b p-5 bg-muted/20">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="font-semibold text-base">Negotiation Chat</h2>
                </div>
                <p className="text-xs text-muted-foreground ml-10">{deal.campaignTitle} — {deal.influencerName} ↔ {deal.brandName}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-5 bg-muted/10 flex flex-col">
                {dealMessages.length === 0 ? (
                  <div className="h-full flex-1 flex items-center justify-center">
                    <p className="text-center text-muted-foreground text-sm bg-background/50 px-4 py-2 rounded-full border">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="mt-auto space-y-4">
                    {dealMessages.map((msg) => {
                      const isOwn = msg.senderId === user.id;
                      const senderName = isOwn ? 'You' : (user.role === 'brand' ? deal.influencerName : deal.brandName);
                      return (
                        <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                          <span className="text-[10px] text-muted-foreground mb-1 px-1">{senderName}</span>
                          <div className={`max-w-[75%] px-4 py-3 text-sm shadow-sm ${isOwn ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm' : 'bg-card text-card-foreground border rounded-2xl rounded-tl-sm'}`}>
                            {msg.content}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {(deal.status === 'negotiating' || deal.status === 'requested') && (
                <div className="p-4 border-t bg-background">
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <Input 
                      value={newMessage} 
                      onChange={e => setNewMessage(e.target.value)} 
                      placeholder="Type a message..." 
                      className="flex-1 rounded-full bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-transparent"
                    />
                    <Button type="submit" size="icon" className="rounded-full shrink-0 h-10 w-10 shadow-sm transition-transform active:scale-95" disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
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
          <div className="h-[600px] flex flex-col space-y-4">
            <div className="bg-card border rounded-3xl p-6 shadow-sm flex-1 flex flex-col overflow-hidden min-h-0">
              <h3 className="font-semibold text-base mb-4 shrink-0">Deal Summary</h3>
              <div className="space-y-3 text-sm mb-5 shrink-0">
                <div className="flex justify-between items-center py-1"><span className="text-muted-foreground">Status</span><span className="font-medium capitalize bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs">{deal.status}</span></div>
                <div className="flex justify-between items-center py-1"><span className="text-muted-foreground">Amount</span><span className="font-semibold text-base">{deal.terms?.totalAmount ? formatIndianCurrency(deal.terms.totalAmount) : 'TBD'}</span></div>
                <div className="flex justify-between items-center py-1"><span className="text-muted-foreground">Creator</span><span className="font-medium truncate max-w-[140px] text-right" title={deal.influencerName}>{deal.influencerName}</span></div>
                <div className="flex justify-between items-center py-1"><span className="text-muted-foreground">Brand</span><span className="font-medium truncate max-w-[140px] text-right" title={deal.brandName}>{deal.brandName}</span></div>
              </div>

              <div className="h-px bg-border/60 mb-5 shrink-0" />

              <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                {deal.status === 'negotiating' || deal.status === 'requested' ? (
                  <div className="space-y-5 pb-4">
                    <h4 className="text-sm font-semibold">Deliverables & Terms</h4>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5"><Label className="text-[11px] text-muted-foreground font-medium">Stories</Label><Input type="number" min="0" value={stories} onChange={e => setStories(e.target.value)} className="h-9 text-sm px-3 bg-muted/30 focus-visible:bg-background" /></div>
                        <div className="space-y-1.5"><Label className="text-[11px] text-muted-foreground font-medium">Short Vids</Label><Input type="number" min="0" value={shortVideos} onChange={e => setShortVideos(e.target.value)} className="h-9 text-sm px-3 bg-muted/30 focus-visible:bg-background" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5"><Label className="text-[11px] text-muted-foreground font-medium">Long Vids</Label><Input type="number" min="0" value={longVideos} onChange={e => setLongVideos(e.target.value)} className="h-9 text-sm px-3 bg-muted/30 focus-visible:bg-background" /></div>
                        <div className="space-y-1.5"><Label className="text-[11px] text-muted-foreground font-medium">Posts</Label><Input type="number" min="0" value={posts} onChange={e => setPosts(e.target.value)} className="h-9 text-sm px-3 bg-muted/30 focus-visible:bg-background" /></div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground font-medium">Total Amount (₹)</Label>
                      <Input type="number" min="0" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="0" className="h-9 text-sm px-3 bg-muted/30 focus-visible:bg-background" />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground font-medium">Notes & Requirements</Label>
                      <Textarea value={termsNotes} onChange={e => setTermsNotes(e.target.value)} placeholder="Guidelines, schedules..." outline-none rows={3} className="text-sm resize-none px-3 py-2 bg-muted/30 focus-visible:bg-background" />
                    </div>
                    
                    <Button className="w-full text-sm h-10 rounded-xl font-semibold mt-2 shrink-0 mb-4" onClick={saveTerms}>Update Terms</Button>
                  </div>
                ) : (
                  <div className="bg-muted/30 border rounded-2xl p-4">
                    <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Agreed Terms
                    </h4>
                    <p className="text-[12px] leading-relaxed text-muted-foreground">{buildSummaryParagraph()}</p>
                  </div>
                )}

                {!isApproved && (
                  <p className="text-[11px] text-muted-foreground mt-2 flex items-center justify-center gap-1.5 p-3 bg-muted/30 border rounded-xl">
                    <Lock className="h-3 w-3" /> Details shared after approval
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 shrink-0">
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
