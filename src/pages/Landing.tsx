import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Users, TrendingUp, Shield, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-illustration.jpg';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const stats = [
  { value: '10K+', label: 'Active Creators' },
  { value: '2.5K', label: 'Brand Partners' },
  { value: '₹10Cr+', label: 'Deals Closed' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const services = [
  { icon: Sparkles, title: 'AI-Powered Matching', description: 'Our algorithm finds the perfect creator-brand pairings based on niche, audience, and performance.', color: 'bg-teal-light' },
  { icon: Shield, title: 'Secure Deal Flow', description: 'End-to-end negotiation with AI agents, escrow protection, and transparent terms.', color: 'bg-coral-light' },
  { icon: TrendingUp, title: 'Performance Analytics', description: 'Real-time campaign tracking, engagement metrics, and ROI dashboards.', color: 'bg-mustard-light' },
];

const testimonials = [
  { name: 'Emma Rodriguez', role: 'Lifestyle Influencer', quote: 'Matchflow helped me land 3 brand deals in my first week. The AI negotiation saved me hours!', avatar: '🧑‍🎨' },
  { name: 'Jake Chen', role: 'Marketing Director, NovaTech', quote: 'We found our perfect brand ambassadors in minutes instead of weeks. Game changer.', avatar: '👨‍💼' },
  { name: 'Priya Sharma', role: 'Food Creator', quote: 'The platform handles all the back-and-forth so I can focus on creating content.', avatar: '👩‍🍳' },
];

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="py-30 md:py-28 lg:py-12">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-pill bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                <Zap className="h-4 w-4" /> AI-Powered Marketplace
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
                Where <span className="text-primary">Creators</span> Meet Their Perfect <span className="text-secondary">Brand Match</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Matchflow uses AI agents to connect influencers with brands, negotiate deals, and manage campaigns — all in one seamless platform.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="rounded-pill text-base px-8">
                    Start Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/discover">
                  <Button variant="outline" size="lg" className="rounded-pill text-base px-8">
                    Discover
                  </Button>
                </Link>
              </div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <img src={heroImage} alt="Influencers and brands collaborating" width={1024} height={768} className="rounded-2xl shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-10 border-y bg-muted/30">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground mb-6 uppercase tracking-wider font-medium">Trusted by leading brands</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-muted-foreground/60">
            {['GlowUp', 'TechNova', 'FitFuel', 'StyleHaus', 'NomNom Co'].map((b) => (
              <span key={b} className="text-lg font-bold tracking-wide">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">How Matchflow Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">From discovery to deal close, our platform handles everything with AI-powered intelligence.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <div key={s.title} className={`${s.color} rounded-2xl p-8 animate-fade-in`} style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="bg-background/60 rounded-xl w-12 h-12 flex items-center justify-center mb-5">
                  <s.icon className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-sm text-foreground/70">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-foreground text-background">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16">The Numbers Speak</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">{s.value}</div>
                <div className="text-sm opacity-60">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16">What People Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={t.name} className="bg-card rounded-2xl p-8 border animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{t.avatar}</span>
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-muted-foreground">{t.role}</div>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-primary text-primary" />)}
                </div>
                <p className="text-sm text-muted-foreground italic">"{t.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary/10">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Find Your Match?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Join thousands of creators and brands already growing together on Matchflow.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/auth?mode=signup&role=influencer">
              <Button size="lg" className="rounded-pill px-8">I'm a Creator <Users className="ml-2 h-5 w-5" /></Button>
            </Link>
            <Link to="/auth?mode=signup&role=brand">
              <Button variant="outline" size="lg" className="rounded-pill px-8">I'm a Brand <ArrowRight className="ml-2 h-5 w-5" /></Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
