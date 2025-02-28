import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Tableau de bord administrateur
            </h1>
            <div>
              <span className="mr-4">Bonjour, {user?.username}</span>
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
                <h2 className="text-lg font-semibold mb-4">Actions administrateur</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg shadow p-4 hover:shadow-md cursor-pointer" 
                       onClick={() => router.push('/admin/users')}>
                    <h3 className="font-semibold">Gestion des utilisateurs</h3>
                    <p className="text-gray-500">Afficher et gérer les utilisateurs</p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow p-4 hover:shadow-md cursor-pointer"
                       onClick={() => router.push('/admin/vehicles')}>
                    <h3 className="font-semibold">Gestion des véhicules</h3>
                    <p className="text-gray-500">Afficher et gérer les véhicules</p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow p-4 hover:shadow-md cursor-pointer"
                       onClick={() => router.push('/admin/subscriptions')}>
                    <h3 className="font-semibold">Gestion des abonnements</h3>
                    <p className="text-gray-500">Afficher et gérer les plans d&apos;abonnement</p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow p-4 hover:shadow-md cursor-pointer"
                       onClick={() => router.push('/admin/reservations')}>
                    <h3 className="font-semibold">Gestion des réservations</h3>
                    <p className="text-gray-500">Afficher et gérer les réservations</p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow p-4 hover:shadow-md cursor-pointer"
                       onClick={() => router.push('/admin/payments')}>
                    <h3 className="font-semibold">Gestion des paiements</h3>
                    <p className="text-gray-500">Afficher et gérer les paiements</p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow p-4 hover:shadow-md cursor-pointer"
                       onClick={() => router.push('/admin/stats')}>
                    <h3 className="font-semibold">Statistiques</h3>
                    <p className="text-gray-500">Voir les statistiques de l&apos;application</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
