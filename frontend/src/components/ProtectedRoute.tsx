import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth/login');
      } else if (adminOnly && !user.is_admin) {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router, adminOnly]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || (adminOnly && !user.is_admin)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
