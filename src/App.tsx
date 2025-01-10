import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SmartFertilization from "./pages/SmartFertilization";
import FinancialPlanning from "./pages/FinancialPlanning";
import SupplyChain from "./pages/SupplyChain";
import Weather from "./pages/Weather";
import AreaCalculator from "./pages/AreaCalculator";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => (
  <TooltipProvider>
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/fertilization" element={<ProtectedRoute><SmartFertilization /></ProtectedRoute>} />
      <Route path="/finance" element={<ProtectedRoute><FinancialPlanning /></ProtectedRoute>} />
      <Route path="/supply-chain" element={<ProtectedRoute><SupplyChain /></ProtectedRoute>} />
      <Route path="/weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
      <Route path="/area-calculator" element={<ProtectedRoute><AreaCalculator /></ProtectedRoute>} />
    </Routes>
  </TooltipProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AppRoutes />
      <Toaster />
      <Sonner />
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;