import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FiLock, FiAlertCircle, FiMail } from 'react-icons/fi';

const LoginPage: NextPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, user, isLoading } = useAuth();
  const router = useRouter();

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    if (!isLoading && user) {
      if (!user.is_admin) {
        router.push('/dashboard');
      } else {
        router.push('/admin/dashboard');
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Si l'utilisateur est déjà connecté, ne rien afficher pendant la redirection
  if (user && !user.is_admin) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      <div className="absolute top-0 right-0 w-2/3 h-64 bg-sora-blue rounded-bl-full opacity-10 transform translate-y-12"></div>
      
      <div className="z-10 w-full max-w-4xl p-8 flex rounded-2xl shadow-2xl bg-white overflow-hidden">
        {/* Formulaire de connexion */}
        <div className="w-full md:w-1/2 p-5">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-sora-gray mb-2">Bienvenue chez SoraGo</h1>
            <p className="text-gray-500">Connectez-vous pour accéder à votre espace client</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiAlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-sora-blue/70" />
              </div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg 
                           bg-white text-sora-gray placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-sora-blue/50 focus:border-sora-blue
                           transition-all duration-200"
                placeholder="Adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-sora-blue/70" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg 
                           bg-white text-sora-gray placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-sora-blue/50 focus:border-sora-blue
                           transition-all duration-200"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="w-4 h-4 appearance-none border border-gray-300 rounded 
                            checked:bg-sora-blue checked:border-transparent
                            focus:outline-none focus:ring-2 focus:ring-sora-blue/50
                            cursor-pointer"
                  style={{
                    backgroundImage: 'url("data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27white%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z%27/%3e%3c/svg%3e")',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-sora-blue hover:text-sora-blue/80 transition-colors duration-200">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium 
                         rounded-lg text-white bg-sora-blue hover:bg-sora-blue/90 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sora-blue 
                         transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion en cours...
                </div>
              ) : 'Se connecter'}
            </button>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Vous n&apos;avez pas de compte ?{' '}
                <Link href="/auth/register" className="font-medium text-sora-blue hover:text-sora-blue/80 transition-colors duration-200">
                  S&apos;inscrire
                </Link>
              </p>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            <Link href="/auth/admin" className="text-xs text-gray-400 hover:text-sora-blue transition-colors">
              Accès Administration
            </Link>
          </div>
        </div>
        
        {/* Côté illustration */}
        <div className="hidden md:block w-1/2 bg-sora-blue rounded-r-2xl p-8 text-white relative">
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="pattern" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M-3,3 l6,-6 M0,10 l10,-10 M7,13 l6,-6" strokeWidth="2" stroke="currentColor" fill="none" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#pattern)" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6">Réservez facilement votre véhicule</h2>
            <p className="mb-8">Accédez à une large gamme de véhicules de qualité et réservez en quelques clics.</p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Tarifs attractifs et sans surprise</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Sélection variée de véhicules</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Support client 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
