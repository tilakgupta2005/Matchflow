import { useState, useMemo } from 'react';
import { useStore, DealStatus } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bell, ArrowRight, Clock, CheckCircle2, XCircle, Lock, AlertTriangle, Tag, FileText } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PAGE_SIZE = 20;

const statusConfig: Record<DealStatus, { label: string; icon: typeof Clock; color: string }> = {
  requested: { label: 'Requested', icon: Clock, color: 'bg-mustard-light text-foreground' },
  negotiating: { label: 'Negotiating', icon: FileText, color: 'bg-teal-light text-foreground' },
  locked: { label: 'Locked', icon: Lock, color: 'bg-primary/20 text-foreground' },
  approved: { label: 'Approved', icon: CheckCircle2, color: 'bg-secondary/30 text-foreground' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'bg-destructive/20 text-foreground' },
  failed: { label: 'Failed', icon: AlertTriangle, color: 'bg-destructive/30 text-foreground' },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, deals, notifications } = useStore();
  const [dealsVisible, setDealsVisible] = useState(PAGE_SIZE);

  const myDeals = useMemo(() => {
    if (!user) return [];
    return deals
      .filter((d) =>
        user.role === 'influencer' ? d.influencerId === user.id : user.role === 'brand' ? d.brandId === user.id : true
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [user, deals]);

  const visibleDeals = useMemo(() => myDeals.slice(0, dealsVisible), [myDeals, dealsVisible]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container py-12 flex-1">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-extrabold">Welcome, {user.name}</h1>
            <p className="text-sm text-muted-foreground capitalize">{user.role} Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            {user.role === 'brand' && (
              <Button variant="outline" size="sm" className="rounded-pill" onClick={() => navigate('/campaigns')}>
                <Tag className="mr-1 h-3 w-3" /> My Campaigns
              </Button>
            )}
            <Button variant="outline" size="sm" className="rounded-pill" onClick={() => navigate('/discover')}>
              Discover <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {[
            { label: 'Total Deals', value: myDeals.length, bg: 'bg-teal-light' },
            { label: 'Active', value: myDeals.filter((d) => ['requested', 'negotiating'].includes(d.status)).length, bg: 'bg-mustard-light' },
            { label: 'Locked', value: myDeals.filter((d) => d.status === 'locked').length, bg: 'bg-primary/15' },
            { label: 'Approved', value: myDeals.filter((d) => d.status === 'approved').length, bg: 'bg-secondary/30' },
            { label: 'Failed', value: myDeals.filter((d) => d.status === 'failed').length, bg: 'bg-destructive/15' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-5`}>
              <div className="text-2xl font-extrabold">{s.value}</div>
              <div className="text-sm text-foreground/60">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Deals */}
          <div className="lg:col-span-2">
            <h2 className="font-bold text-lg mb-4">Your Deals</h2>
            {myDeals.length === 0 ? (
              <div className="bg-card border rounded-2xl p-8 text-center text-muted-foreground">
                <p>No deals yet. Head to Discover to get started!</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {visibleDeals.map((deal) => {
                    const sc = statusConfig[deal.status];
                    return (
                      <div key={deal.id} className="bg-card border rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/negotiation/${deal.id}`)}>
                        <div className="flex items-center gap-4">
                          <div className={`${sc.color} rounded-lg p-2`}>
                            <sc.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{deal.campaignTitle}</div>
                            <div className="text-xs text-muted-foreground">
                              {user.role === 'influencer' ? deal.brandName : deal.influencerName}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-pill ${sc.color}`}>{sc.label}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {dealsVisible < myDeals.length && (
                  <div className="text-center mt-6">
                    <Button variant="outline" className="rounded-pill" onClick={() => setDealsVisible((v) => v + PAGE_SIZE)}>
                      Load More Deals
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Notifications */}
          <div>
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications</h2>
            <div className="space-y-2">
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} className={`rounded-xl p-3 text-sm border ${n.read ? 'bg-card' : 'bg-primary/5 border-primary/20'}`}>
                  {n.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
