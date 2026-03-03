import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
import Activities from "./pages/Activities";
import Profile from "./pages/Profile";
import Enterprise from "./pages/Enterprise";
import Wellness from "./pages/Wellness";
import HealthHub from "./pages/HealthHub";
import SpotifyCallback from "./pages/SpotifyCallback";
import AdminDashboard from "./pages/AdminDashboard";
import Therapists from "./pages/Therapists";
import Community from "./pages/Community";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Pricing from "./pages/Pricing";
import MobileNavigation from "./components/MobileNavigation";
import OnboardingTutorial from "./components/OnboardingTutorial";
import DarkModeToggle from "./components/DarkModeToggle";
import LanguageSelector from "./components/LanguageSelector";
import EscalationQueue from "./components/EscalationQueue";
import PeerSupport from "./pages/PeerSupport";
import PeerProfileSetup from "./pages/PeerProfileSetup";
import Achievements from "./pages/Achievements";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const showMobileNav = !["/", "/auth", "/callback", "/admin", "/onboarding", "/pricing"].includes(location.pathname);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('onboarding_completed');
    const isAuthPage = location.pathname === '/' || location.pathname === '/auth';
    
    if (!onboardingCompleted && !isAuthPage) {
      setShowOnboarding(true);
    }
  }, [location.pathname]);

  return (
    <div className="relative">
      {showOnboarding && (
        <OnboardingTutorial onComplete={() => setShowOnboarding(false)} />
      )}
      
      {/* Global controls */}
      <div className="fixed top-4 right-4 z-40 flex gap-2">
        <LanguageSelector />
        <DarkModeToggle />
      </div>

      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/enterprise" element={<Enterprise />} />
        <Route path="/wellness" element={<Wellness />} />
        <Route path="/health-hub" element={<HealthHub />} />
        <Route path="/therapists" element={<Therapists />} />
        <Route path="/community" element={<Community />} />
        <Route path="/peer-support" element={<PeerSupport />} />
        <Route path="/peer-support/setup" element={<PeerProfileSetup />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/callback" element={<SpotifyCallback />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/escalation" element={<ProtectedEscalation />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showMobileNav && <MobileNavigation />}
    </div>
  );
};

// Simple client-side guard for clinician/admin routes
function ProtectedEscalation() {
  // Server-side JWT cookie now protects the escalation endpoints.
  // Let `EscalationQueue` handle redirecting to `/auth` on 401.
  return <EscalationQueue />
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
