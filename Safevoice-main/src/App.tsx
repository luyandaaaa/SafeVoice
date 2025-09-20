import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { VoiceProvider } from "@/contexts/VoiceContext";
import { AuthPage } from "@/components/auth/AuthPage";
import { SafeVoiceLayout } from "@/components/SafeVoiceLayout";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { AIChat } from "@/components/chat/AIChat";
import { Card } from "@/components/ui/card";
import NotFound from "./pages/NotFound";
import { ReportIncident } from "@/components/report/ReportIncident";
import { LegalAssistance } from "@/components/legal/LegalAssistance";
import { Community } from "@/components/community/Community";

import { EvidenceVault } from "@/components/evidence/EvidenceVault";
import { SafetyMap } from "@/components/map/SafetyMap";
import Resources from "@/components/resources/Resources";
import { Settings } from "@/components/settings/Settings";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

// Route Component Wrapper
const RouteWrapper = ({ children }: { children: React.ReactNode }) => (
  <SafeVoiceLayout>
    <Card className="h-full shadow-soft">
      {children}
    </Card>
  </SafeVoiceLayout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <LanguageProvider>
          <VoiceProvider>
            <BrowserRouter>
              <Routes>
                {/* Redirect root to dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Authentication */}
                <Route path="/auth" element={<AuthPage />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <RouteWrapper>
                      <Dashboard />
                    </RouteWrapper>
                  </ProtectedRoute>
                } />
                
                <Route path="/chat" element={
                  <ProtectedRoute>
                    <RouteWrapper>
                      <AIChat />
                    </RouteWrapper>
                  </ProtectedRoute>
                } />
                
                <Route path="/report" element={
                  <ProtectedRoute>
                    <RouteWrapper>
                      <ReportIncident />
                    </RouteWrapper>
                  </ProtectedRoute>
                } />
                
                <Route path="/map" element={
                  <ProtectedRoute>
                    <RouteWrapper>
                      <SafetyMap />
                    </RouteWrapper>
                  </ProtectedRoute>
                } />
                
                <Route path="/evidence" element={
                  <ProtectedRoute>
                    <RouteWrapper>
                      <EvidenceVault />
                    </RouteWrapper>
                  </ProtectedRoute>
                } />
                
                <Route path="/legal" element={
                  <ProtectedRoute>
                    <RouteWrapper>
                      <LegalAssistance />
                    </RouteWrapper>
                  </ProtectedRoute>
                } />
                

                
                <Route path="/community" element={
                  <ProtectedRoute>
                    <RouteWrapper>
                      <Community />
                    </RouteWrapper>
                  </ProtectedRoute>
                } />
                
                <Route path="/resources" element={
                  <ProtectedRoute>
                    <RouteWrapper>
                      <Resources />
                    </RouteWrapper>
                  </ProtectedRoute>
                } />
<Route path="/settings" element={
  <ProtectedRoute>
    <RouteWrapper>
      <Settings />
    </RouteWrapper>
  </ProtectedRoute>
} />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </VoiceProvider>
        </LanguageProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
