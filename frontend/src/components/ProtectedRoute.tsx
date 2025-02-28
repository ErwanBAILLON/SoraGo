import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
      if (!user) {
        router.push('/auth/login');
      }
      // Si la page est réservée aux admins et que l'utilisateur n'est pas admin, rediriger
      else if (adminOnly && !user.is_admin) {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router, adminOnly]);

  // Afficher un état de chargement pendant la vérification
  if (isLoading || !user || (adminOnly && !user.is_admin)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
