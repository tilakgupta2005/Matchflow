import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const SOCIAL_PLATFORMS = ['Instagram', 'YouTube', 'TikTok'] as const;

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user, influencerProfiles, updateInfluencerProfile } = useStore();
  const profile = influencerProfiles.find(p => p.userId === user?.id);

  const [niches, setNiches] = useState<string[]>([]);
  const [nicheInput, setNicheInput] = useState('');
  const [followers, setFollowers] = useState('');
  const [engagement, setEngagement] = useState('');
  const [bio, setBio] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhoneCode, setContactPhoneCode] = useState('+91');
  const [contactPhoneNumber, setContactPhoneNumber] = useState('');
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([]);
  const [storyMin, setStoryMin] = useState('');
  const [storyMax, setStoryMax] = useState('');
  const [shortVideoMin, setShortVideoMin] = useState('');
  const [shortVideoMax, setShortVideoMax] = useState('');
  const [longVideoMin, setLongVideoMin] = useState('');
  const [longVideoMax, setLongVideoMax] = useState('');
  const [postMin, setPostMin] = useState('');
  const [postMax, setPostMax] = useState('');

  useEffect(() => {
    if (profile) {
      setNiches(profile.niches);
      setFollowers(String(profile.followers));
      setEngagement(String(profile.engagementRate));
      setBio(profile.bio);
      setContactEmail(profile.contactEmail);
      
      const phone = profile.contactPhone || '';
      const match = phone.match(/^(\+\d{1,3})\s*(.*)$/);
      if (match) {
        setContactPhoneCode(match[1]);
        setContactPhoneNumber(match[2].replace(/\s+/g, ''));
      } else {
        setContactPhoneNumber(phone.replace(/\s+/g, ''));
      }
      setSocialLinks(profile.socialLinks.length > 0 ? profile.socialLinks : [{ platform: 'Instagram', url: '' }]);
      setStoryMin(String(profile.priceStory.min));
      setStoryMax(String(profile.priceStory.max));
      setShortVideoMin(String(profile.priceShortVideo.min));
      setShortVideoMax(String(profile.priceShortVideo.max));
      setLongVideoMin(String(profile.priceLongVideo.min));
      setLongVideoMax(String(profile.priceLongVideo.max));
      setPostMin(String(profile.pricePost.min));
      setPostMax(String(profile.pricePost.max));
    }
  }, [profile]);

  if (!user || user.role !== 'influencer') { navigate('/dashboard'); return null; }
  if (!profile) { navigate('/profile-setup'); return null; }

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

  const changePlatform = (i: number, platform: string) => {
    const updated = [...socialLinks];
    updated[i] = { ...updated[i], platform };
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (niches.length === 0) { toast.error('Add at least one niche'); return; }
    
    const cleanPhone = contactPhoneNumber.replace(/\s+/g, '');
    const phoneDigitsRegex = /^\d{10}$/;
    if (!phoneDigitsRegex.test(cleanPhone)) { toast.error('Please enter exactly 10 digits for the phone number'); return; }
    const fullContactPhone = `${contactPhoneCode} ${cleanPhone}`;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(contactEmail)) { toast.error('Please enter a valid email address'); return; }
    if (Number(followers) < 0 || Number(engagement) < 0 || 
        Number(storyMin) < 0 || Number(storyMax) < 0 || 
        Number(shortVideoMin) < 0 || Number(shortVideoMax) < 0 ||
        Number(longVideoMin) < 0 || Number(longVideoMax) < 0 ||
        Number(postMin) < 0 || Number(postMax) < 0) {
        toast.error('Values cannot be negative'); return;
    }
    updateInfluencerProfile(user.id, {
      niches, followers: Number(followers), engagementRate: Number(engagement),
      priceStory: { min: Number(storyMin), max: Number(storyMax) },
      priceShortVideo: { min: Number(shortVideoMin), max: Number(shortVideoMax) },
      priceLongVideo: { min: Number(longVideoMin), max: Number(longVideoMax) },
      pricePost: { min: Number(postMin), max: Number(postMax) },
      bio, contactEmail, contactPhone: fullContactPhone,
      socialLinks: socialLinks.filter(l => l.url.trim()),
    });
    toast.success('Profile updated!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <div className="container max-w-lg py-16 flex-1">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>
        <div className="bg-card rounded-2xl p-8 border animate-fade-in">
          <h1 className="text-2xl font-extrabold mb-2 text-card-foreground">Edit Your Profile</h1>
          <p className="text-sm text-muted-foreground mb-6">Update your creator details and pricing.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-card-foreground">Niches</Label>
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-card-foreground">Followers <span className="text-destructive">*</span></Label><Input type="number" min="0" value={followers} onChange={(e) => setFollowers(e.target.value)} required /></div>
              <div><Label className="text-card-foreground">Engagement Rate (%) <span className="text-destructive">*</span></Label><Input type="number" min="0" step="0.1" value={engagement} onChange={(e) => setEngagement(e.target.value)} required /></div>
            </div>
            <div><Label className="text-card-foreground">Bio <span className="text-destructive">*</span></Label><Input value={bio} onChange={(e) => setBio(e.target.value)} required /></div>

            <h3 className="font-semibold text-sm pt-2 text-card-foreground">Charges (₹ Range)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs text-card-foreground">Story Min <span className="text-destructive">*</span></Label><Input type="number" min="0" value={storyMin} onChange={(e) => setStoryMin(e.target.value)} required /></div>
              <div><Label className="text-xs text-card-foreground">Story Max <span className="text-destructive">*</span></Label><Input type="number" min="0" value={storyMax} onChange={(e) => setStoryMax(e.target.value)} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs text-card-foreground">Short Video Min <span className="text-destructive">*</span></Label><Input type="number" min="0" value={shortVideoMin} onChange={(e) => setShortVideoMin(e.target.value)} required /></div>
              <div><Label className="text-xs text-card-foreground">Short Video Max <span className="text-destructive">*</span></Label><Input type="number" min="0" value={shortVideoMax} onChange={(e) => setShortVideoMax(e.target.value)} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs text-card-foreground">Long Video Min <span className="text-destructive">*</span></Label><Input type="number" min="0" value={longVideoMin} onChange={(e) => setLongVideoMin(e.target.value)} required /></div>
              <div><Label className="text-xs text-card-foreground">Long Video Max <span className="text-destructive">*</span></Label><Input type="number" min="0" value={longVideoMax} onChange={(e) => setLongVideoMax(e.target.value)} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs text-card-foreground">Post Min <span className="text-destructive">*</span></Label><Input type="number" min="0" value={postMin} onChange={(e) => setPostMin(e.target.value)} required /></div>
              <div><Label className="text-xs text-card-foreground">Post Max <span className="text-destructive">*</span></Label><Input type="number" min="0" value={postMax} onChange={(e) => setPostMax(e.target.value)} required /></div>
            </div>

            <h3 className="font-semibold text-sm pt-2 text-card-foreground">Contact Details</h3>
            <div><Label className="text-card-foreground">Email <span className="text-destructive">*</span></Label><Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" title="Please enter a valid email address" required /></div>
            <div>
              <Label className="text-card-foreground">Phone <span className="text-destructive">*</span></Label>
              <div className="flex gap-2">
                <select value={contactPhoneCode} onChange={(e) => setContactPhoneCode(e.target.value)} className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground">
                  <option value="+91">+91 (IN)</option>
                  <option value="+1">+1 (US/CA)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+61">+61 (AU)</option>
                  <option value="+971">+971 (UAE)</option>
                </select>
                <Input className="flex-1" type="tel" value={contactPhoneNumber} onChange={(e) => setContactPhoneNumber(e.target.value)} placeholder="9876543210" pattern="\d{10}" title="Must be exactly 10 digits" required />
              </div>
            </div>

            <h3 className="font-semibold text-sm pt-2 text-card-foreground">Social Media Links</h3>
            {socialLinks.map((link, i) => (
              <div key={i} className="flex gap-2 items-end">
                <div className="w-32">
                  <Label className="text-xs text-card-foreground">Platform</Label>
                  <select
                    value={link.platform}
                    onChange={(e) => changePlatform(i, e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  >
                    {SOCIAL_PLATFORMS.filter(p => p === link.platform || !socialLinks.some(l => l.platform === p)).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1"><Label className="text-xs text-card-foreground">URL</Label><Input type="url" value={link.url} onChange={(e) => updateSocialLink(i, e.target.value)} placeholder={`https://${link.platform.toLowerCase()}.com/handle`} /></div>
                {socialLinks.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeSocialLink(i)}><X className="h-4 w-4" /></Button>}
              </div>
            ))}
            {socialLinks.length < 3 && (
              <Button type="button" variant="outline" size="sm" onClick={addSocialLink}><Plus className="h-3 w-3 mr-1" /> Add Platform</Button>
            )}

            <Button type="submit" className="w-full rounded-pill" size="lg">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfileEdit;
