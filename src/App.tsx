import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/fertilization" element={<SmartFertilization />} />
          <Route path="/finance" element={<FinancialPlanning />} />
          <Route path="/supply-chain" element={<SupplyChain />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/area-calculator" element={<AreaCalculator />} />
        </Routes>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;