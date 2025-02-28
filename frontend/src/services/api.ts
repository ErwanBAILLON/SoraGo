import axios from 'axios';

/**
 * Base API configuration for the application
 * This will be expanded when integrating with a real backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Création d'une instance axios avec configuration de base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses (y compris le rafraîchissement du token)
api.interceptors.response.use(
  (response) => {
    // Vérifier si un nouveau token est présent dans l'en-tête de la réponse
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      localStorage.setItem('auth_token', newToken);
    }
    return response;
  },
  (error) => {
    // Gérer les erreurs (comme le token expiré)
    if (error.response && error.response.status === 401) {
      // Si le token est expiré ou invalide, on peut déconnecter l'utilisateur
      localStorage.removeItem('auth_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;
