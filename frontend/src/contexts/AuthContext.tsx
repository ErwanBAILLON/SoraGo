import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: {
    username: string;
    lastname: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Charger l'utilisateur depuis le localStorage au démarrage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data.user);
        setToken(data.data.token);
        
        // Stocker dans le localStorage
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('token', data.data.token);
        
        // Rediriger en fonction du rôle
        if (data.data.user.is_admin) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
        
        return { success: true, message: 'Connexion réussie' };
      } else {
        return { success: false, message: data.message || 'Échec de la connexion' };
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return { success: false, message: 'Erreur de connexion au serveur' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    lastname: string;
    email: string;
    phone?: string;
    password: string;
  }) => {
    try {
      setIsLoading(true);
      console.log(API_URL);
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data.user);
        setToken(data.data.token);
        
        // Stocker dans le localStorage
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('token', data.data.token);
        
        // Rediriger vers le tableau de bord (les nouveaux utilisateurs ne sont jamais admin par défaut)
        router.push('/dashboard');
        
        return { success: true, message: 'Inscription réussie' };
      } else {
        return { success: false, message: data.message || 'Échec de l\'inscription' };
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      return { success: false, message: 'Erreur de connexion au serveur' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Supprimer du localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Réinitialiser l'état
    setUser(null);
    setToken(null);
    
    // Rediriger vers la page de connexion
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
