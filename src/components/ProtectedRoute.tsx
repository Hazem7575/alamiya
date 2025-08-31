import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';

interface ProtectedRouteProps {
  children: ReactNode;
  requirePermission?: string;
  requireAnyPermission?: string[];
  requireAllPermissions?: string[];
}

export default function ProtectedRoute({ 
  children, 
  requirePermission,
  requireAnyPermission,
  requireAllPermissions 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          {/* Spinner */}
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div 
              className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-primary/40 rounded-full animate-spin"
              style={{ animationDelay: '150ms' }}
            ></div>
          </div>
          
          {/* Text */}
          <div className="text-center">
            <p className="text-lg font-medium text-foreground/90">Verifying account</p>
            <p className="text-sm text-muted-foreground mt-1">Please wait a moment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check permissions if required
  if (requirePermission && !hasPermission(requirePermission)) {
    return <Navigate to="/" replace />;
  }

  if (requireAnyPermission && !hasAnyPermission(requireAnyPermission)) {
    return <Navigate to="/" replace />;
  }

  if (requireAllPermissions && !hasAllPermissions(requireAllPermissions)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}