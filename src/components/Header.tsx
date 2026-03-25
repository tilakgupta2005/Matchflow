import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { ArrowRight, Menu, X, LogOut, UserCog } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => {
    setUser(null);
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="text-xl font-bold tracking-tight text-foreground">
          <span className="text-primary">Match</span>flow
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link to="/discover" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Discover</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
              {user.role === 'admin' && <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Admin</Link>}
            </>
          ) : null}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="default" size="sm" className="rounded-pill">
                  {user.name} <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              {user.role === 'influencer' && (
                <Link to="/profile-edit">
                  <Button variant="ghost" size="sm" title="Edit Profile">
                    <UserCog className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={logout} title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth?mode=login"><Button variant="ghost" size="sm">Log in</Button></Link>
              <Link to="/auth?mode=signup"><Button size="sm" className="rounded-pill">Get Started <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t bg-background p-4 flex flex-col gap-3">
          <Link to="/" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/discover" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>Discover</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              {user.role === 'influencer' && <Link to="/profile-edit" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>Edit Profile</Link>}
              <button className="text-sm font-medium text-left text-destructive" onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/auth?mode=login" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>Log in</Link>
              <Link to="/auth?mode=signup" onClick={() => setMenuOpen(false)}>
                <Button size="sm" className="w-full rounded-pill">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
