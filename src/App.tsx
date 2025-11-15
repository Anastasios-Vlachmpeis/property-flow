import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ListingsManager from "./pages/ListingsManager";
import PricingIntelligence from "./pages/PricingIntelligence";
import GuestHub from "./pages/GuestHub";
import Auth from "./pages/Auth";
import OperationsCleaning from "./pages/OperationsCleaning";
import OperationsOffboarding from "./pages/OperationsOffboarding";
import Integrations from "./pages/Integrations";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/listings" element={<ProtectedRoute><ListingsManager /></ProtectedRoute>} />
          <Route path="/pricing" element={<ProtectedRoute><PricingIntelligence /></ProtectedRoute>} />
          <Route path="/guest-hub" element={<ProtectedRoute><GuestHub /></ProtectedRoute>} />
          
          <Route path="/operations/cleaning" element={<ProtectedRoute><OperationsCleaning /></ProtectedRoute>} />
          <Route path="/operations/offboarding" element={<ProtectedRoute><OperationsOffboarding /></ProtectedRoute>} />
          <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
