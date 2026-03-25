import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, X, Plus } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const SOCIAL_PLATFORMS = ['Instagram', 'YouTube', 'TikTok'] as const;

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { user, setUser, addInfluencerProfile, addCampaign } = useStore();

  // Influencer fields
  const [niches, setNiches] = useState<string[]>([]);
  const [nicheInput, setNicheInput] = useState('');
  const [followers, setFollowers] = useState('');
  const [engagement, setEngagement] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('');
  const [stateName, setStateName] = useState('');
  const [city, setCity] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhoneCode, setContactPhoneCode] = useState('+91');
  const [contactPhoneNumber, setContactPhoneNumber] = useState('');
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([
    { platform: 'Instagram', url: '' },
  ]);
  const [storyMin, setStoryMin] = useState('');
  const [storyMax, setStoryMax] = useState('');
  const [shortVideoMin, setShortVideoMin] = useState('');
  const [shortVideoMax, setShortVideoMax] = useState('');
  const [longVideoMin, setLongVideoMin] = useState('');
  const [longVideoMax, setLongVideoMax] = useState('');
  const [postMin, setPostMin] = useState('');
  const [postMax, setPostMax] = useState('');

  // Brand fields
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignDesc, setCampaignDesc] = useState('');
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [brandContactEmail, setBrandContactEmail] = useState('');
  const [brandContactPhoneCode, setBrandContactPhoneCode] = useState('+91');
  const [brandContactPhoneNumber, setBrandContactPhoneNumber] = useState('');
  const [productLink, setProductLink] = useState('');
  const [campaignCountry, setCampaignCountry] = useState('');
  const [campaignState, setCampaignState] = useState('');
  const [campaignCity, setCampaignCity] = useState('');

  if (!user) { navigate('/auth?mode=signup'); return null; }

  const addNiche = () => {
    const trimmed = nicheInput.trim();
    if (trimmed && !niches.includes(trimmed)) {
      setNiches([...niches, trimmed]);
      setNicheInput('');
    }
  };

  const removeNiche = (n: string) => setNiches(niches.filter(x => x !== n));

  const updateSocialLink = (i: number, value: string) => {
    const updated = [...socialLinks];
    updated[i] = { ...updated[i], url: value };
    setSocialLinks(updated);
  };

  const availablePlatforms = SOCIAL_PLATFORMS.filter(
    p => !socialLinks.some(l => l.platform === p)
  );

  const addSocialLink = () => {
    if (availablePlatforms.length > 0) {
      setSocialLinks([...socialLinks, { platform: availablePlatforms[0], url: '' }]);
    }
  };

  const removeSocialLink = (i: number) => setSocialLinks(socialLinks.filter((_, idx) => idx !== i));

  const changePlatform = (i: number, platform: string) => {
    const updated = [...socialLinks];
    updated[i] = { ...updated[i], platform };
    setSocialLinks(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigitsRegex = /^\d{10}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (user.role === 'influencer') {
      if (niches.length === 0) { toast.error('Add at least one niche'); return; }
      if (!emailRegex.test(contactEmail)) { toast.error('Please enter a valid contact email'); return; }
      const cleanPhone = contactPhoneNumber.replace(/\s+/g, '');
      if (!phoneDigitsRegex.test(cleanPhone)) { toast.error('Please enter exactly 10 digits for the phone number'); return; }
      const fullContactPhone = `${contactPhoneCode} ${cleanPhone}`;

      if (Number(followers) < 0 || Number(engagement) < 0 || 
          Number(storyMin) < 0 || Number(storyMax) < 0 || 
          Number(shortVideoMin) < 0 || Number(shortVideoMax) < 0 ||
          Number(longVideoMin) < 0 || Number(longVideoMax) < 0 ||
          Number(postMin) < 0 || Number(postMax) < 0) {
          toast.error('Values cannot be negative'); return;
      }
      addInfluencerProfile({
        userId: user.id, niches, followers: Number(followers), engagementRate: Number(engagement),
        priceStory: { min: Number(storyMin), max: Number(storyMax) },
        priceShortVideo: { min: Number(shortVideoMin), max: Number(shortVideoMax) },
        priceLongVideo: { min: Number(longVideoMin), max: Number(longVideoMax) },
        pricePost: { min: Number(postMin), max: Number(postMax) },
        bio, platforms: socialLinks.map(l => l.platform),
        contactEmail, contactPhone: fullContactPhone,
        socialLinks: socialLinks.filter(l => l.url.trim()),
        country: country.trim() || undefined,
        state: stateName.trim() || undefined,
        city: city.trim() || undefined,
      });
    } else {
      if (!emailRegex.test(brandContactEmail)) { toast.error('Please enter a valid contact email'); return; }
      const cleanBrandPhone = brandContactPhoneNumber.replace(/\s+/g, '');
      if (cleanBrandPhone && !phoneDigitsRegex.test(cleanBrandPhone)) { toast.error('Please enter exactly 10 digits for the phone number'); return; }
      if (Number(budget) < 0) { toast.error('Budget cannot be negative'); return; }
      
      const fullBrandPhone = cleanBrandPhone ? `${brandContactPhoneCode} ${cleanBrandPhone}` : '';

      addCampaign({
        id: crypto.randomUUID(), brandId: user.id, brandName: user.name,
        title: campaignTitle, description: campaignDesc, budget: Number(budget),
        category, deliverables: deliverables.split(',').map((d) => d.trim()), status: 'active',
        contactEmail: brandContactEmail, contactPhone: fullBrandPhone, productLink,
        country: campaignCountry.trim() || undefined,
        state: campaignState.trim() || undefined,
        city: campaignCity.trim() || undefined,
      });
    }
    setUser({ ...user, profileComplete: true });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container max-w-lg py-16 flex-1">
        <div className="bg-card rounded-2xl p-8 border animate-fade-in">
          <h1 className="text-2xl font-extrabold mb-2">
            {user.role === 'influencer' ? 'Set Up Your Creator Profile' : 'Create Your First Campaign'}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {user.role === 'influencer' ? 'Tell brands about yourself so they can find you.' : 'Describe what you\'re looking for in creators.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {user.role === 'influencer' ? (
              <>
                <div>
                  <Label>Niches</Label>
                  <div className="flex gap-2">
                    <Input value={nicheInput} onChange={(e) => setNicheInput(e.target.value)} placeholder="e.g. Lifestyle" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNiche(); } }} />
                    <Button type="button" variant="outline" size="icon" onClick={addNiche}><Plus className="h-4 w-4" /></Button>
                  </div>
                  {niches.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {niches.map(n => (
                        <span key={n} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                          {n} <button type="button" onClick={() => removeNiche(n)}><X className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                  {niches.length === 0 && <p className="text-xs text-muted-foreground mt-1">Add at least one niche</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Followers <span className="text-destructive">*</span></Label><Input type="number" min="0" value={followers} onChange={(e) => setFollowers(e.target.value)} placeholder="125000" required /></div>
                  <div><Label>Engagement Rate (%) <span className="text-destructive">*</span></Label><Input type="number" min="0" step="0.1" value={engagement} onChange={(e) => setEngagement(e.target.value)} placeholder="4.2" required /></div>
                </div>
                <div><Label>Bio <span className="text-destructive">*</span></Label><Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell brands about your content..." required /></div>

                <h3 className="font-semibold text-sm pt-2">Charges (₹ Range)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Story Min <span className="text-destructive">*</span></Label><Input type="number" min="0" value={storyMin} onChange={(e) => setStoryMin(e.target.value)} placeholder="200" required /></div>
                  <div><Label className="text-xs">Story Max <span className="text-destructive">*</span></Label><Input type="number" min="0" value={storyMax} onChange={(e) => setStoryMax(e.target.value)} placeholder="500" required /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Short Video Min <span className="text-destructive">*</span></Label><Input type="number" min="0" value={shortVideoMin} onChange={(e) => setShortVideoMin(e.target.value)} placeholder="500" required /></div>
                  <div><Label className="text-xs">Short Video Max <span className="text-destructive">*</span></Label><Input type="number" min="0" value={shortVideoMax} onChange={(e) => setShortVideoMax(e.target.value)} placeholder="1000" required /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Long Video Min <span className="text-destructive">*</span></Label><Input type="number" min="0" value={longVideoMin} onChange={(e) => setLongVideoMin(e.target.value)} placeholder="1500" required /></div>
                  <div><Label className="text-xs">Long Video Max <span className="text-destructive">*</span></Label><Input type="number" min="0" value={longVideoMax} onChange={(e) => setLongVideoMax(e.target.value)} placeholder="3000" required /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Post Min <span className="text-destructive">*</span></Label><Input type="number" min="0" value={postMin} onChange={(e) => setPostMin(e.target.value)} placeholder="400" required /></div>
                  <div><Label className="text-xs">Post Max <span className="text-destructive">*</span></Label><Input type="number" min="0" value={postMax} onChange={(e) => setPostMax(e.target.value)} placeholder="800" required /></div>
                </div>

                <h3 className="font-semibold text-sm pt-2">Location</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label className="text-xs">Country</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="India" /></div>
                  <div><Label className="text-xs">State / Region</Label><Input value={stateName} onChange={(e) => setStateName(e.target.value)} placeholder="Maharashtra" /></div>
                  <div><Label className="text-xs">City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai" /></div>
                </div>

                <h3 className="font-semibold text-sm pt-2">Contact Details</h3>
                <div><Label>Email <span className="text-destructive">*</span></Label><Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="you@email.com" pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" title="Please enter a valid email address" required /></div>
                <div>
                  <Label>Phone <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <select value={contactPhoneCode} onChange={(e) => setContactPhoneCode(e.target.value)} className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="+91">+91 (IN)</option>
                      <option value="+1">+1 (US/CA)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+61">+61 (AU)</option>
                      <option value="+971">+971 (UAE)</option>
                    </select>
                    <Input className="flex-1" type="tel" value={contactPhoneNumber} onChange={(e) => setContactPhoneNumber(e.target.value)} placeholder="9876543210" pattern="\d{10}" title="Must be exactly 10 digits" required />
                  </div>
                </div>

                <h3 className="font-semibold text-sm pt-2">Social Media Links</h3>
                {socialLinks.map((link, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <div className="w-32">
                      <Label className="text-xs">Platform</Label>
                      <select
                        value={link.platform}
                        onChange={(e) => changePlatform(i, e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {SOCIAL_PLATFORMS.filter(p => p === link.platform || !socialLinks.some(l => l.platform === p)).map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1"><Label className="text-xs">URL</Label><Input type="url" value={link.url} onChange={(e) => updateSocialLink(i, e.target.value)} placeholder={`https://${link.platform.toLowerCase()}.com/handle`} /></div>
                    {socialLinks.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeSocialLink(i)}><X className="h-4 w-4" /></Button>}
                  </div>
                ))}
                {socialLinks.length < 3 && (
                  <Button type="button" variant="outline" size="sm" onClick={addSocialLink}><Plus className="h-3 w-3 mr-1" /> Add Platform</Button>
                )}
              </>
            ) : (
              <>
                <div><Label>Campaign Title <span className="text-destructive">*</span></Label><Input value={campaignTitle} onChange={(e) => setCampaignTitle(e.target.value)} placeholder="Summer Launch Campaign" required /></div>
                <div><Label>Description <span className="text-destructive">*</span></Label><Input value={campaignDesc} onChange={(e) => setCampaignDesc(e.target.value)} placeholder="What are you looking for?" required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Budget (₹) <span className="text-destructive">*</span></Label><Input type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="50000" required /></div>
                  <div><Label>Category <span className="text-destructive">*</span></Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Beauty, Tech..." required /></div>
                </div>
                <div><Label>Deliverables (comma-separated) <span className="text-destructive">*</span></Label><Input value={deliverables} onChange={(e) => setDeliverables(e.target.value)} placeholder="3 Posts, 2 Stories, 1 Reel" required /></div>

                <h3 className="font-semibold text-sm pt-2">Target Region</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label className="text-xs">Country</Label><Input value={campaignCountry} onChange={(e) => setCampaignCountry(e.target.value)} placeholder="India" /></div>
                  <div><Label className="text-xs">State / Region</Label><Input value={campaignState} onChange={(e) => setCampaignState(e.target.value)} placeholder="Karnataka" /></div>
                  <div><Label className="text-xs">City</Label><Input value={campaignCity} onChange={(e) => setCampaignCity(e.target.value)} placeholder="Bengaluru" /></div>
                </div>

                <h3 className="font-semibold text-sm pt-2">Contact Details</h3>
                <div><Label>Contact Email <span className="text-destructive">*</span></Label><Input type="email" value={brandContactEmail} onChange={(e) => setBrandContactEmail(e.target.value)} placeholder="marketing@brand.com" pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" title="Please enter a valid email address" required /></div>
                <div>
                  <Label>Contact Phone</Label>
                  <div className="flex gap-2">
                    <select value={brandContactPhoneCode} onChange={(e) => setBrandContactPhoneCode(e.target.value)} className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="+91">+91 (IN)</option>
                      <option value="+1">+1 (US/CA)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+61">+61 (AU)</option>
                      <option value="+971">+971 (UAE)</option>
                    </select>
                    <Input className="flex-1" type="tel" value={brandContactPhoneNumber} onChange={(e) => setBrandContactPhoneNumber(e.target.value)} placeholder="9876543210" pattern="\d{10}" title="Must be exactly 10 digits" />
                  </div>
                </div>
                <div><Label>Product / Website Link</Label><Input type="url" value={productLink} onChange={(e) => setProductLink(e.target.value)} placeholder="https://yourbrand.com/product" /></div>
              </>
            )}
            <Button type="submit" className="w-full rounded-pill" size="lg">
              Complete Setup <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfileSetup;
