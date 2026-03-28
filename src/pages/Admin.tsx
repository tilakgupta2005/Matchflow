import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { Users, Tag, Handshake, ArrowLeft, CheckCircle2, Building2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { formatIndianCurrency } from '@/lib/format';

const Admin = () => {
  const navigate = useNavigate();
  const { user, influencerProfiles, campaigns, deals } = useStore();

  const approvedDeals = useMemo(() => deals.filter(d => d.status === 'approved'), [deals]);
  const activeCampaigns = useMemo(() => campaigns.filter(c => c.status === 'active'), [campaigns]);

  // Count unique brand IDs from campaigns
  const brandCount = useMemo(() => {
    const ids = new Set(campaigns.map(c => c.brandId));
    return ids.size;
  }, [campaigns]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <div className="container py-12 flex-1">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-2xl font-extrabold mb-8">Admin Panel</h1>

        {/* Stats overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <div className="bg-teal-light rounded-2xl p-6">
            <div className="text-3xl font-extrabold">{influencerProfiles.length}</div>
            <div className="text-sm flex items-center gap-1 mt-1"><Users className="h-4 w-4" /> Influencers</div>
          </div>
          <div className="bg-mustard-light rounded-2xl p-6">
            <div className="text-3xl font-extrabold">{brandCount}</div>
            <div className="text-sm flex items-center gap-1 mt-1"><Building2 className="h-4 w-4" /> Brands</div>
          </div>
          <div className="bg-coral-light rounded-2xl p-6">
            <div className="text-3xl font-extrabold">{activeCampaigns.length}</div>
            <div className="text-sm flex items-center gap-1 mt-1"><Tag className="h-4 w-4" /> Active Campaigns</div>
          </div>
          <div className="bg-secondary/30 rounded-2xl p-6">
            <div className="text-3xl font-extrabold">{approvedDeals.length}</div>
            <div className="text-sm flex items-center gap-1 mt-1"><CheckCircle2 className="h-4 w-4" /> Deals Approved</div>
          </div>
          <div className="bg-primary/15 rounded-2xl p-6">
            <div className="text-3xl font-extrabold">{deals.length}</div>
            <div className="text-sm flex items-center gap-1 mt-1"><Handshake className="h-4 w-4" /> Total Deals</div>
          </div>
        </div>

        {/* Approved Deals section */}
        <div className="mb-10">
          <h2 className="font-bold text-lg mb-4">Approved Deals</h2>
          {approvedDeals.length === 0 ? (
            <div className="bg-card border rounded-2xl p-8 text-center text-muted-foreground">No approved deals yet.</div>
          ) : (
            <div className="space-y-4">
              {approvedDeals.map((d) => (
                <div key={d.id} className="bg-card border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{d.campaignTitle}</h3>
                    <span className="text-sm font-bold text-primary">
                      {d.terms?.totalAmount ? formatIndianCurrency(d.terms.totalAmount) : '—'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {d.influencerName} × {d.brandName}
                  </div>
                  {d.terms && (
                    <p className="text-sm text-muted-foreground">
                      {d.terms.stories > 0 && `${d.terms.stories} ${d.terms.stories === 1 ? 'story' : 'stories'}, `}
                      {d.terms.shortVideos > 0 && `${d.terms.shortVideos} short ${d.terms.shortVideos === 1 ? 'video' : 'videos'}, `}
                      {d.terms.longVideos > 0 && `${d.terms.longVideos} long ${d.terms.longVideos === 1 ? 'video' : 'videos'}, `}
                      {d.terms.posts > 0 && `${d.terms.posts} ${d.terms.posts === 1 ? 'post' : 'posts'}`}
                      {d.terms.termsNotes ? ` — ${d.terms.termsNotes}` : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Campaigns */}
        <div className="mb-10">
          <h2 className="font-bold text-lg mb-4">Campaigns</h2>
          <div className="bg-card border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/30"><th className="text-left p-3">Title</th><th className="text-left p-3">Brand</th><th className="text-left p-3">Budget</th><th className="text-left p-3">Status</th></tr></thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20"><td className="p-3 font-medium">{c.title}</td><td className="p-3">{c.brandName}</td><td className="p-3">{formatIndianCurrency(c.budget)}</td><td className="p-3 capitalize">{c.status}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Deals */}
        <div>
          <h2 className="font-bold text-lg mb-4">All Deals</h2>
          <div className="bg-card border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/30"><th className="text-left p-3">Campaign</th><th className="text-left p-3">Creator</th><th className="text-left p-3">Brand</th><th className="text-left p-3">Status</th><th className="text-left p-3">Amount</th></tr></thead>
              <tbody>
                {deals.map((d) => (
                  <tr key={d.id} className="border-b last:border-0 hover:bg-muted/20"><td className="p-3 font-medium">{d.campaignTitle}</td><td className="p-3">{d.influencerName}</td><td className="p-3">{d.brandName}</td><td className="p-3 capitalize">{d.status}</td><td className="p-3">{d.terms?.totalAmount ? formatIndianCurrency(d.terms.totalAmount) : '—'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
