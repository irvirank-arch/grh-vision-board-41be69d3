import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            {/* Placeholder routes */}
            <Route
              path="/agents"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <div className="text-center py-20 text-muted-foreground">Module Agents — à venir</div>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruitment"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <div className="text-center py-20 text-muted-foreground">Module Recrutement — à venir</div>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <div className="text-center py-20 text-muted-foreground">Module Congés — à venir</div>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/missions"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <div className="text-center py-20 text-muted-foreground">Module Missions — à venir</div>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attestations"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <div className="text-center py-20 text-muted-foreground">Module Attestations — à venir</div>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <div className="text-center py-20 text-muted-foreground">Paramètres — à venir</div>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
