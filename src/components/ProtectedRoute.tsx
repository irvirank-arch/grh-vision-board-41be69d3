import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Demo mode: skip auth redirect when no backend is connected
  // Remove this block when connecting to your Django backend
  if (!isAuthenticated && !isLoading) {
    // For demo, allow access. In production: return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
