import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, ArrowLeft, Tag, Eye, Play, Pause } from 'lucide-react';
import { formatIndianCurrency } from '@/lib/format';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const Campaigns = () => {
  const navigate = useNavigate();
  const { user, campaigns, addCampaign } = useStore();
  const updateCampaign = useStore((s) => s.updateCampaign);
  const deleteCampaign = useStore((s) => s.deleteCampaign);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhoneCode, setContactPhoneCode] = useState('+91');
  const [contactPhoneNumber, setContactPhoneNumber] = useState('');
  const [productLink, setProductLink] = useState('');
  const [viewCampaign, setViewCampaign] = useState<string | null>(null);

  if (!user || user.role !== 'brand') { navigate('/dashboard'); return null; }

  const myCampaigns = campaigns.filter((c) => c.brandId === user.id);
  const viewing = viewCampaign ? campaigns.find((c) => c.id === viewCampaign) : null;

  const resetForm = () => { setTitle(''); setDescription(''); setBudget(''); setCategory('');    setDeliverables('');
    setContactEmail('');
    setContactPhoneCode('+91');
    setContactPhoneNumber('');
    setProductLink(''); setEditingId(null); };

  const openCreate = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (id: string) => {
    const c = campaigns.find((c) => c.id === id);
    if (!c) return;
    setTitle(c.title); setDescription(c.description); setBudget(String(c.budget)); setCategory(c.category);      setDeliverables(c.deliverables.join(', '));
      setContactEmail(c.contactEmail || '');
      
      const phone = c.contactPhone || '';
      const match = phone.match(/^(\+\d{1,3})\s*(.*)$/);
      if (match) {
        setContactPhoneCode(match[1]);
        setContactPhoneNumber(match[2].replace(/\s+/g, ''));
      } else {
        setContactPhoneCode('+91'); // Default if no code found
        setContactPhoneNumber(phone.replace(/\s+/g, ''));
      }
      
      setProductLink(c.productLink || '');
    setEditingId(id); setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (Number(budget) < 0) { toast.error('Budget cannot be negative'); return; }
    
    if (contactEmail) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(contactEmail)) { toast.error('Please enter a valid email address'); return; }
    }

    const cleanPhone = contactPhoneNumber.replace(/\s+/g, '');
    if (cleanPhone) {
      const phoneDigitsRegex = /^\d{10}$/;
      if (!phoneDigitsRegex.test(cleanPhone)) { toast.error('Please enter exactly 10 digits for the phone number'); return; }
    }
    const fullContactPhone = cleanPhone ? `${contactPhoneCode} ${cleanPhone}` : '';

    if (editingId) {
      updateCampaign(editingId, { title, description, budget: Number(budget), category, deliverables: deliverables.split(',').map((d) => d.trim()), contactEmail, contactPhone: fullContactPhone, productLink });
      toast.success('Campaign updated!');
    } else {
      addCampaign({
        id: crypto.randomUUID(), brandId: user.id, brandName: user.name,
        title, description, budget: Number(budget), category, deliverables: deliverables.split(',').map((d) => d.trim()),
        status: 'active', contactEmail, contactPhone: fullContactPhone, productLink
      });
      toast.success('Campaign created!');
    }
    setDialogOpen(false); resetForm();
  };

  const handleDelete = (id: string) => { deleteCampaign(id); toast.success('Campaign deleted'); };

  const toggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    updateCampaign(id, { status: newStatus as any });
    toast.success(`Campaign ${newStatus}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container py-12 flex-1">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold">My Campaigns</h1>
            <p className="text-sm text-muted-foreground">Create, manage, and track your campaigns</p>
          </div>
          <Button className="rounded-pill" onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> New Campaign</Button>
        </div>

        {myCampaigns.length === 0 ? (
          <div className="bg-card border rounded-2xl p-12 text-center">
            <Tag className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-bold mb-2">No campaigns yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first campaign to start finding creators.</p>
            <Button className="rounded-pill" onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Create Campaign</Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCampaigns.map((c) => (
              <div key={c.id} className="bg-card rounded-2xl border p-6 hover:shadow-lg transition-shadow flex flex-col h-full overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-pill bg-primary/10 text-primary text-xs font-medium">{c.category}</span>
                  <span className={`px-2 py-0.5 rounded-pill text-xs font-medium ${c.status === 'active' ? 'bg-secondary/20 text-secondary' : c.status === 'paused' ? 'bg-mustard-light text-foreground' : 'bg-muted text-muted-foreground'}`}>{c.status}</span>
                </div>
                <h3 className="font-bold mb-1">{c.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{c.description}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {c.deliverables.slice(0, 3).map((d) => (<span key={d} className="text-xs bg-muted rounded-lg px-2 py-1 truncate max-w-[120px]">{d}</span>))}
                  {c.deliverables.length > 3 && <span className="text-xs bg-muted rounded-lg px-2 py-1 flex-shrink-0">+{c.deliverables.length - 3}</span>}
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 w-full">
                  <span className="text-sm font-semibold">{formatIndianCurrency(c.budget)}</span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => toggleStatus(c.id, c.status)} title={c.status === 'active' ? 'Pause Campaign' : 'Activate Campaign'}>
                      {c.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => setViewCampaign(c.id)} title="View"><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => openEdit(c.id)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive flex-shrink-0" onClick={() => handleDelete(c.id)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>{editingId ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div><Label>Campaign Title <span className="text-destructive">*</span></Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summer Launch Campaign" required /></div>
              <div><Label>Description <span className="text-destructive">*</span></Label><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What are you looking for?" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Budget (₹) <span className="text-destructive">*</span></Label><Input type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="50000" required /></div>
                <div><Label>Category <span className="text-destructive">*</span></Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Beauty, Tech..." required /></div>
              </div>
              <div><Label>Deliverables (comma-separated) <span className="text-destructive">*</span></Label><Input value={deliverables} onChange={(e) => setDeliverables(e.target.value)} placeholder="3 Posts, 2 Stories, 1 Reel" required /></div>
              <div><Label>Contact Email</Label><Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="marketing@brand.com" pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" title="Please enter a valid email address" /></div>
              <div>
                <Label>Contact Phone</Label>
                <div className="flex gap-2">
                  <select value={contactPhoneCode} onChange={(e) => setContactPhoneCode(e.target.value)} className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US/CA)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+61">+61 (AU)</option>
                    <option value="+971">+971 (UAE)</option>
                  </select>
                  <Input className="flex-1" type="tel" value={contactPhoneNumber} onChange={(e) => setContactPhoneNumber(e.target.value)} placeholder="9876543210" pattern="\d{10}" title="Must be exactly 10 digits" />
                </div>
              </div>
              <div><Label>Product / Website Link</Label><Input type="url" value={productLink} onChange={(e) => setProductLink(e.target.value)} placeholder="https://yourbrand.com/product" /></div>
              <Button type="submit" className="w-full rounded-pill">{editingId ? 'Update Campaign' : 'Create Campaign'}</Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={!!viewCampaign} onOpenChange={() => setViewCampaign(null)}>
          <DialogContent className="sm:max-w-lg">
            {viewing && (
              <>
                <DialogHeader><DialogTitle>{viewing.title}</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded-pill bg-primary/10 text-primary text-xs font-medium">{viewing.category}</span>
                    <span className="px-2 py-0.5 rounded-pill bg-secondary/20 text-secondary text-xs font-medium capitalize">{viewing.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{viewing.description}</p>
                  <div><Label className="text-xs text-muted-foreground">Budget</Label><p className="font-bold text-lg">{formatIndianCurrency(viewing.budget)}</p></div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Deliverables</Label>
                    <div className="flex flex-wrap gap-1 mt-1">{viewing.deliverables.map((d) => (<span key={d} className="text-xs bg-muted rounded-lg px-2 py-1">{d}</span>))}</div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  );
};

export default Campaigns;
