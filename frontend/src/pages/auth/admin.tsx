import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FiUser, FiLock, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';

const AdminLoginPage: NextPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, user, isLoading } = useAuth();
  const router = useRouter();

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    if (!isLoading && user) {
      if (user.is_admin) {
        router.push('/admin/dashboard');
      } else {
        // Rediriger les non-admins vers la page client
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      // La redirection est gérée dans le useEffect ci-dessus
    } catch (err) {
      console.error(err);
      setError('Email ou mot de passe incorrect');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Afficher un chargement pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Si l'utilisateur est déjà connecté en tant qu'admin, ne rien afficher pendant la redirection
  if (user && user.is_admin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="w-full bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/auth/login" className="flex items-center text-gray-700 hover:text-sora-blue transition-colors">
            <FiArrowLeft className="mr-2" />
            <span>Retour à la connexion client</span>
          </Link>
          <div className="text-gray-800 font-semibold">SoraGo Admin</div>
        </div>
      </div>
      
      <div className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-sora-gray">Administration</h1>
            <p className="mt-2 text-sm text-gray-500">
              Connectez-vous pour accéder à l&apos;interface d&apos;administration
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiAlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="relative">
                <label htmlFor="email-address" className="sr-only">
                  Adresse e-mail
                </label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-sora-blue/70" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-t-md relative block w-full pl-10 py-3 
                             border border-gray-200 bg-white text-sora-gray placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-sora-blue/50 focus:border-sora-blue
                             focus:z-10 sm:text-sm"
                  placeholder="Adresse e-mail administrateur"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Mot de passe
                </label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-sora-blue/70" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-b-md relative block w-full pl-10 py-3 
                             border border-gray-200 bg-white text-sora-gray placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-sora-blue/50 focus:border-sora-blue
                             focus:z-10 sm:text-sm"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent 
                           text-sm font-medium rounded-md text-white bg-sora-blue hover:bg-sora-blue/90 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sora-blue
                           transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Connexion en cours...
                  </>
                ) : 'Se connecter'}
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              Pour la démonstration, utilisez <br />
              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">admin@example.com</span> / <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
