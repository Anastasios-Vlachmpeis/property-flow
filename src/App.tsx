import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ListingsManager from "./pages/ListingsManager";
import PricingIntelligence from "./pages/PricingIntelligence";
import MessagingHub from "./pages/MessagingHub";
import OperationsOnboarding from "./pages/OperationsOnboarding";
import OperationsCleaning from "./pages/OperationsCleaning";
import OperationsOffboarding from "./pages/OperationsOffboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/listings" element={<ListingsManager />} />
          <Route path="/pricing" element={<PricingIntelligence />} />
          <Route path="/messaging" element={<MessagingHub />} />
          <Route path="/operations/onboarding" element={<OperationsOnboarding />} />
          <Route path="/operations/cleaning" element={<OperationsCleaning />} />
          <Route path="/operations/offboarding" element={<OperationsOffboarding />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
