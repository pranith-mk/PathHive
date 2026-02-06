import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom"; 
import { AuthProvider } from "@/contexts/AuthContext";
// 👇 DELETE THESE IMPORTS (We use them in PathDetails.tsx instead)
// import { AIAssistant, AIAssistantTrigger } from "@/components/ai/AIAssistant";
// import { useState } from "react"; 

import PathEditor from "@/pages/PathEditor";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

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
import Settings from "@/pages/Settings";

const queryClient = new QueryClient();

// 👇 DELETE THIS ENTIRE WRAPPER COMPONENT
// const AIAssistantWrapper = () => { ... }

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
              
              {/* This route uses :id, which is correct! */}
              <Route path="/path/:id" element={<PathDetails />} />
              
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create" element={<CreatePath />} />
              
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/creator/:creatorId" element={<CreatorDashboard />} />
              <Route path="*" element={<NotFound />} />

              <Route path="/create-path" element={<ProtectedRoute><PathEditor /></ProtectedRoute>} />
              <Route path="/path/:id/edit" element={<ProtectedRoute><PathEditor /></ProtectedRoute>} />

              <Route path="/settings" element={<Settings />} />
              
            </Routes>

            {/* 👇 DELETE THIS LINE */}
            {/* <AIAssistantWrapper /> */}
          
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;