import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore, UserRole } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Users, Building2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const isLogin = searchParams.get('mode') !== 'signup';
  const preRole = searchParams.get('role') as UserRole | null;
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const initializeUser = useStore((s) => s.initializeUser);

  const [mode, setMode] = useState<'login' | 'signup'>(isLogin ? 'login' : 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(preRole || 'influencer');
  const [loading, setLoading] = useState(false);

  // If already logged in, must logout first
  if (user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container max-w-md py-20 flex-1">
          <div className="bg-card rounded-2xl p-8 border text-center">
            <h1 className="text-2xl font-extrabold mb-2">Already Logged In</h1>
            <p className="text-sm text-muted-foreground mb-6">
              You are logged in as <strong>{user.name}</strong>. Please logout first to switch accounts.
            </p>
            <Button className="rounded-pill" onClick={async () => { 
              await supabase.auth.signOut();
              setUser(null); 
              toast.success('Logged out!'); 
            }}>
              Logout & Continue
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address (e.g. yourname@gmail.com)');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        await initializeUser();
        navigate('/dashboard');
        toast.success('Welcome back!');
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        const userId = data.user?.id;
        if (userId) {
          const newUser = { id: userId, email, name, role, profileComplete: false };
          const { error: insertError } = await supabase.from('users').insert(newUser);
          if (insertError) throw insertError;
          
          setUser(newUser as import('@/store/useStore').User);
          navigate('/profile-setup');
          toast.success('Account created!');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container max-w-md py-20 flex-1">
        <div className="bg-card rounded-2xl p-8 border animate-fade-in">
          <h1 className="text-2xl font-extrabold mb-2">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === 'login' ? 'Sign in to your Matchflow account.' : 'Join the marketplace and start matching.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <Label>Full Name <span className="text-destructive">*</span></Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
                </div>
                <div>
                  <Label className="mb-2 block">I am a...</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setRole('influencer')}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${role === 'influencer' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'}`}>
                      <Users className="h-5 w-5" /> Creator
                    </button>
                    <button type="button" onClick={() => setRole('brand')}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${role === 'brand' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'}`}>
                      <Building2 className="h-5 w-5" /> Brand
                    </button>
                  </div>
                </div>
              </>
            )}
            <div><Label>Email <span className="text-destructive">*</span></Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" title="Please enter a valid email address (e.g. user@domain.com)" required /></div>
            <div><Label>Password <span className="text-destructive">*</span></Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required /></div>
            <Button type="submit" className="w-full rounded-pill" size="lg">
              {mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button className="text-primary font-medium hover:underline" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>

          {mode === 'login' && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Demo admin: admin@matchflow.com
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
