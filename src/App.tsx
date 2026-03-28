import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import ProfileSetup from "./pages/ProfileSetup";
import ProfileEdit from "./pages/ProfileEdit";
import BrandProfileEdit from "./pages/BrandProfileEdit";
import Discovery from "./pages/Discovery";
import Dashboard from "./pages/Dashboard";
import Negotiation from "./pages/Negotiation";
import Admin from "./pages/Admin";
import Campaigns from "./pages/Campaigns";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { supabase } from "./lib/supabase";

const queryClient = new QueryClient();

const App = () => {
  const initializeUser = useStore((s) => s.initializeUser);
  const fetchInfluencerProfiles = useStore((s) => s.fetchInfluencerProfiles);
  const fetchCampaigns = useStore((s) => s.fetchCampaigns);
  const fetchDeals = useStore((s) => s.fetchDeals);
  const isLoading = useStore((s) => s.isLoading);

  useEffect(() => {
    initializeUser();
    fetchInfluencerProfiles();
    fetchCampaigns();
    fetchDeals();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        useStore.getState().setUser(null);
      } else if (session?.user) {
        useStore.getState().initializeUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce-[0.2s]"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce-[0.4s]"></div>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
            <Route path="/profile-edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
            <Route path="/brand-profile-edit" element={<ProtectedRoute><BrandProfileEdit /></ProtectedRoute>} />
            <Route path="/discover" element={<Discovery />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/negotiation/:dealId" element={<ProtectedRoute><Negotiation /></ProtectedRoute>} />
            <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
