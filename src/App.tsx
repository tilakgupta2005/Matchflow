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
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/profile-edit" element={<ProfileEdit />} />
            <Route path="/brand-profile-edit" element={<BrandProfileEdit />} />
            <Route path="/discover" element={<Discovery />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/negotiation/:dealId" element={<Negotiation />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
