import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom"; // Removed unused BrowserRouter
import { AuthProvider } from "@/contexts/AuthContext";
import { AIAssistant, AIAssistantTrigger } from "@/components/ai/AIAssistant";
import { useState } from "react";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Browse from "./pages/Browse";
import PathDetails from "./pages/PathDetails";
import Dashboard from "./pages/Dashboard";
import CreatePath from "./pages/CreatePath";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreatorDashboard from "./pages/CreatorDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AIAssistantWrapper = () => {
  const [showAI, setShowAI] = useState(false);
  const location = useLocation();
  
  // Hide AI assistant on auth pages
  const hideOnAuthPages = ['/login', '/register'].includes(location.pathname);
  
  if (hideOnAuthPages) return null;
  
  return (
    <>
      {!showAI && <AIAssistantTrigger onClick={() => setShowAI(true)} />}
      <AIAssistant isOpen={showAI} onClose={() => setShowAI(false)} />
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/browse" element={<Browse />} />
              <Route path="/path/:id" element={<PathDetails />} />
              
              {/* Note: In previous steps we linked to /dashboard, 
                  you might want to point this to Browse temporarily if Dashboard isn't ready */}
              <Route path="/dashboard" element={<Dashboard />} />
              
              
              <Route path="/create" element={<CreatePath />} />
              
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/creator/:creatorId" element={<CreatorDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AIAssistantWrapper />
          
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;