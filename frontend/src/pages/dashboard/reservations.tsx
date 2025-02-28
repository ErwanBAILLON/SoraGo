import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { FiCalendar, FiClock, FiEye, FiX, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';

// Types pour les données
interface Reservation {
  id: number;
  vehicle_model: string;
  start_date: string;
  expected_end_date: string;
  status: string;
  brand?: string;
  image?: string;
}

const ReservationsPage = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }

    // Simuler le chargement des données (remplacer par appel API réel)
    setTimeout(() => {
      setReservations([
        { 
          id: 1, 
          vehicle_model: 'Tesla Model 3', 
          start_date: '2023-07-15', 
          expected_end_date: '2023-07-18',
          status: 'confirmed',
          brand: 'Tesla',
          image: '/images/tesla-model-3.jpg'
        },
        { 
          id: 2, 
          vehicle_model: 'BMW i8', 
          start_date: '2023-06-05', 
          expected_end_date: '2023-06-08',
          status: 'completed',
          brand: 'BMW',
          image: '/images/bmw-i8.jpg'
        },
        { 
          id: 3, 
          vehicle_model: 'Audi e-tron', 
          start_date: '2023-08-20', 
          expected_end_date: '2023-08-25',
          status: 'pending',
          brand: 'Audi',
          image: '/images/audi-etron.jpg'
        },
        { 
          id: 4, 
          vehicle_model: 'Mercedes EQC', 
          start_date: '2023-07-10', 
          expected_end_date: '2023-07-12',
          status: 'canceled',
          brand: 'Mercedes',
          image: '/images/mercedes-eqc.jpg'
        },
        { 
          id: 5, 
          vehicle_model: 'Porsche Taycan', 
          start_date: '2023-09-05', 
          expected_end_date: '2023-09-10',
          status: 'pending',
          brand: 'Porsche',
          image: '/images/porsche-taycan.jpg'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, [user, isLoading, router]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = (status: string) => {
    switch(status) {
      case 'completed': return 'Terminée';
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'canceled': return 'Annulée';
      case 'in_progress': return 'En cours';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getFilteredReservations = () => {
    const now = new Date();
    
    switch(activeTab) {
      case 'upcoming':
        return reservations.filter(r => 
          (r.status === 'confirmed' || r.status === 'pending') && 
          new Date(r.start_date) >= now
        );
      case 'past':
        return reservations.filter(r => 
          r.status === 'completed' || 
          (r.status === 'canceled') ||
          new Date(r.expected_end_date) < now
        );
      case 'all':
      default:
        return reservations;
    }
  };

  const handleCancelReservation = (id: number) => {
    // Dans une implémentation réelle, appeler l'API pour annuler la réservation
    const updatedReservations = reservations.map(r => 
      r.id === id ? { ...r, status: 'canceled' } : r
    );
    setReservations(updatedReservations);
  };

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mes réservations</h1>
          <p className="text-gray-600 mt-1">Consultez et gérez vos réservations de véhicules</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          {['upcoming', 'past', 'all'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
            >
              {tab === 'upcoming' ? 'À venir' : tab === 'past' ? 'Passées' : 'Toutes'}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Chargement de vos réservations...</p>
          </div>
        </div>
      ) : (
        <>
          {getFilteredReservations().length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-indigo-100">
                <FiCalendar className="h-12 w-12 text-indigo-500" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune réservation trouvée</h3>
              <p className="mt-2 text-gray-500">
                {activeTab === 'upcoming' 
                  ? "Vous n'avez pas de réservations à venir."
                  : activeTab === 'past'
                  ? "Vous n'avez pas de réservations passées."
                  : "Vous n'avez pas encore effectué de réservations."}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/vehicles')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Réserver un véhicule
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getFilteredReservations().map(reservation => (
                <motion.div 
                  key={reservation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="relative h-40 bg-gray-200">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60"></div>
                      {/* Image placeholder (remplacer par vraies images) */}
                      <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-white">
                        {reservation.brand?.charAt(0) || 'V'}
                      </div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-lg font-semibold">{reservation.vehicle_model}</h3>
                        <p className="text-sm opacity-90">{reservation.brand}</p>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                          {getStatusText(reservation.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <FiCalendar className="mr-1.5" />
                          <span>{formatDate(reservation.start_date)} - {formatDate(reservation.expected_end_date)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FiClock className="mr-1.5" />
                          <span>3 jours</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-4">
                        <button 
                          onClick={() => router.push(`/dashboard/reservations/${reservation.id}`)}
                          className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <FiEye className="mr-2" />
                          Détails
                        </button>
                        
                        {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                          <button 
                            onClick={() => handleCancelReservation(reservation.id)}
                            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                          >
                            <FiX className="mr-2" />
                            Annuler
                          </button>
                        )}
                        
                        {reservation.status === 'pending' && user?.is_admin && (
                          <button 
                            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                          >
                            <FiCheck className="mr-2" />
                            Confirmer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default ReservationsPage;