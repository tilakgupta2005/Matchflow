import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const BrandProfileEdit = () => {
  const navigate = useNavigate();
  const { user, setUser } = useStore();

  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhoneCode, setContactPhoneCode] = useState('+91');
  const [contactPhoneNumber, setContactPhoneNumber] = useState('');
  const [website, setWebsite] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setContactEmail(user.email || '');
      
      const phone = user.contactPhone || '';
      const match = phone.match(/^(\+\d{1,3})\s*(.*)$/);
      if (match) {
        setContactPhoneCode(match[1]);
        setContactPhoneNumber(match[2].replace(/\s+/g, ''));
      } else {
        setContactPhoneNumber(phone.replace(/\s+/g, ''));
      }

      setWebsite(user.website || '');
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'brand') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'brand') return null;

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name cannot be empty'); return; }

    const cleanPhone = contactPhoneNumber.replace(/\s+/g, '');
    if (cleanPhone && !/^\d{10}$/.test(cleanPhone)) { 
      toast.error('Please enter exactly 10 digits for the phone number'); 
      return; 
    }
    const fullContactPhone = cleanPhone ? `${contactPhoneCode} ${cleanPhone}` : '';

    try {
      const { error } = await supabase.from('users').update({ 
        name, 
        contactEmail, 
        contactPhone: fullContactPhone, 
        website 
      }).eq('id', user.id);
      if (error) throw error;
      
      setUser({ ...user, name, contactEmail, contactPhone: fullContactPhone, website });
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Error updating profile');
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword) { toast.error('Please enter your current password'); return; }
    if (!newPassword) return;
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmNewPassword) { toast.error('Passwords do not match'); return; }

    try {
      if (!user?.email) return;

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        toast.error('Incorrect current password');
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Error updating password');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <div className="container max-w-lg py-16 flex-1">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>
        
        <div className="bg-card rounded-2xl p-8 border animate-fade-in shadow-xl">
          <h1 className="text-2xl font-extrabold mb-2 text-card-foreground">Edit Brand Profile</h1>
          <p className="text-sm text-muted-foreground mb-6">Update your company details.</p>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <Label className="text-card-foreground">Brand / Company Name <span className="text-destructive">*</span></Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Corp" required />
            </div>
            <h3 className="font-semibold text-sm pt-2 text-card-foreground">Contact Details</h3>
            <div>
              <Label className="text-card-foreground">Email</Label>
              <Input type="email" value={contactEmail} disabled className="bg-muted/50 cursor-not-allowed" />
            </div>
            <div>
              <Label className="text-card-foreground">Phone</Label>
              <div className="flex gap-2">
                <select value={contactPhoneCode} onChange={(e) => setContactPhoneCode(e.target.value)} className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground">
                  <option value="+91">+91 (IN)</option>
                  <option value="+1">+1 (US/CA)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+61">+61 (AU)</option>
                  <option value="+971">+971 (UAE)</option>
                </select>
                <Input className="flex-1" type="tel" value={contactPhoneNumber} onChange={(e) => setContactPhoneNumber(e.target.value)} placeholder="9876543210" pattern="\d{10}" title="Must be exactly 10 digits" />
              </div>
            </div>
            <div>
              <Label className="text-card-foreground">Brand Website</Label>
              <Input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://acmecorp.com" />
            </div>

            <Button type="submit" className="w-full rounded-pill hover:-translate-y-0.5 transition-transform" size="lg">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </form>

          <hr className="my-8" />
          
          <h2 className="text-xl font-bold mb-4 text-card-foreground">Change Password</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-card-foreground">Current Password</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div>
              <Label className="text-card-foreground">New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div>
              <Label className="text-card-foreground">Confirm New Password</Label>
              <Input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="button" variant="outline" onClick={handlePasswordUpdate}>
              Update Password
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BrandProfileEdit;
