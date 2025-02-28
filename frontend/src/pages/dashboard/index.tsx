import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { FiCalendar, FiClock, FiCreditCard, FiTruck } from 'react-icons/fi';
import { MotionDiv } from '../../utils/motion';
import { 
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// Types pour les données
interface Reservation {
  id: number;
  vehicle_model: string;
  start_date: string;
  expected_end_date: string;
  status: string;
}

interface Payment {
  id: number;
  amount: number;
  method: string;
  date: string;
  status: string;
}

interface UsageData {
  name: string;
  value: number;
}

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  // États pour les données
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Données pour les graphiques (simulées)
  const usageData = [
    { month: 'Jan', usage: 30 },
    { month: 'Fév', usage: 45 },
    { month: 'Mar', usage: 38 },
    { month: 'Avr', usage: 50 },
    { month: 'Mai', usage: 65 },
    { month: 'Juin', usage: 78 },
  ];

  const vehicleUsage: UsageData[] = [
    { name: 'Voitures', value: 65 },
    { name: 'Motos', value: 25 },
    { name: 'Bateaux', value: 10 },
  ];

  // Protection de la route et chargement des données
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }
    
    if (!isLoading && user && user.is_admin) {
      router.push('/admin');
      return;
    }
    
    if (user) {
      // Simuler le chargement des données (remplacer par des appels API réels)
      setTimeout(() => {
        setReservations([
          { 
            id: 1, 
            vehicle_model: 'Tesla Model 3', 
            start_date: '2023-05-15', 
            expected_end_date: '2023-05-18',
            status: 'completed'
          },
          { 
            id: 2, 
            vehicle_model: 'BMW i8', 
            start_date: '2023-06-05', 
            expected_end_date: '2023-06-08',
            status: 'confirmed'
          },
          { 
            id: 3, 
            vehicle_model: 'Audi e-tron', 
            start_date: '2023-06-20', 
            expected_end_date: '2023-06-25',
            status: 'pending'
          }
        ]);
        
        setPayments([
          { id: 1, amount: 150, method: 'credit_card', date: '2023-05-12', status: 'completed' },
          { id: 2, amount: 250, method: 'paypal', date: '2023-06-01', status: 'completed' },
          { id: 3, amount: 300, method: 'credit_card', date: '2023-06-15', status: 'pending' }
        ]);
        
        setLoading(false);
      }, 1000);
    }
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

  if (isLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen-minus-header">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Chargement de votre tableau de bord...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Hero Section */}
      <MotionDiv 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-3xl p-8 text-white mb-8 shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Bienvenue, {user?.username}!</h1>
          <p className="opacity-90 mb-6">Voici un aperçu de vos activités récentes et de vos statistiques d&pos;utilisation.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <MotionDiv 
              whileHover={{ scale: 1.03 }}
            >
              <div className="bg-white bg-opacity-20 p-4 rounded-xl backdrop-filter backdrop-blur-sm flex items-center">
                <div className="rounded-full bg-white bg-opacity-30 p-3 mr-4">
                  <FiCalendar size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-white text-opacity-80 text-sm">Réservations actives</p>
                  <h3 className="text-2xl font-bold">{reservations.filter(r => r.status === 'confirmed').length}</h3>
                </div>
              </div>
            </MotionDiv>
            
            <MotionDiv 
              whileHover={{ scale: 1.03 }}
            >
              <div className="bg-white bg-opacity-20 p-4 rounded-xl backdrop-filter backdrop-blur-sm flex items-center">
                <div className="rounded-full bg-white bg-opacity-30 p-3 mr-4">
                  <FiClock size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-white text-opacity-80 text-sm">En attente</p>
                  <h3 className="text-2xl font-bold">{reservations.filter(r => r.status === 'pending').length}</h3>
                </div>
              </div>
            </MotionDiv>
            
            <MotionDiv 
              whileHover={{ scale: 1.03 }}
            >
              <div className="bg-white bg-opacity-20 p-4 rounded-xl backdrop-filter backdrop-blur-sm flex items-center">
                <div className="rounded-full bg-white bg-opacity-30 p-3 mr-4">
                  <FiTruck size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-white text-opacity-80 text-sm">Total des locations</p>
                  <h3 className="text-2xl font-bold">{reservations.length}</h3>
                </div>
              </div>
            </MotionDiv>
            
            <MotionDiv 
              whileHover={{ scale: 1.03 }}
            >
              <div className="bg-white bg-opacity-20 p-4 rounded-xl backdrop-filter backdrop-blur-sm flex items-center">
                <div className="rounded-full bg-white bg-opacity-30 p-3 mr-4">
                  <FiCreditCard size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-white text-opacity-80 text-sm">Dépenses totales</p>
                  <h3 className="text-2xl font-bold">{payments.reduce((acc, curr) => acc + curr.amount, 0)}€</h3>
                </div>
              </div>
            </MotionDiv>
          </div>
        </div>
      </MotionDiv>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Reservations Table */}
        <MotionDiv 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-white rounded-3xl p-6 shadow-sm lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Vos réservations</h2>
              <button 
                onClick={() => router.push('/dashboard/reservations')}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
              >
                Voir tout
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Véhicule</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date début</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date fin</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {reservations.slice(0, 3).map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{reservation.vehicle_model}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(reservation.start_date)}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(reservation.expected_end_date)}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                          {getStatusText(reservation.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {reservations.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-gray-500 text-sm">
                        Aucune réservation trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </MotionDiv>

        {/* Usage Stats */}
        <MotionDiv 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Types de véhicules utilisés</h2>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={vehicleUsage}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Usage']}
                    contentStyle={{ borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" fill="#6366F1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium text-gray-700 mb-2">Votre préféré</h3>
              <div className="flex items-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                  <FiTruck size={24} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Tesla Model 3</p>
                  <p className="text-sm text-gray-500">3 locations cette année</p>
                </div>
              </div>
            </div>
          </div>
        </MotionDiv>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Usage Chart */}
        <MotionDiv 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="bg-white rounded-3xl p-6 shadow-sm lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Votre activité sur les 6 derniers mois</h2>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={usageData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(value) => [`${value} heures`, 'Utilisation']}
                    contentStyle={{ borderRadius: '8px' }}
                  />
                  <defs>
                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="usage" 
                    stroke="#6366F1" 
                    strokeWidth={2}
                    fill="url(#colorUsage)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </MotionDiv>

        {/* Recent Payments */}
        <MotionDiv 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Paiements récents</h2>
              <button 
                onClick={() => router.push('/dashboard/payments')}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
              >
                Voir tout
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {payments.slice(0, 3).map((payment) => (
                <div key={payment.id} className="flex items-center p-3 border border-gray-100 rounded-xl">
                  <div className="rounded-full bg-indigo-100 p-3 mr-4">
                    <FiCreditCard size={18} className="text-indigo-600" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-medium text-gray-900">
                      {payment.method === 'credit_card' ? 'Carte de crédit' : payment.method === 'paypal' ? 'PayPal' : 'Virement bancaire'}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(payment.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{payment.amount}€</p>
                    <p className={`text-xs ${payment.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {payment.status === 'completed' ? 'Payé' : 'En attente'}
                    </p>
                  </div>
                </div>
              ))}
              {payments.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-4">
                  Aucun paiement récent
                </div>
              )}
            </div>
          </div>
        </MotionDiv>
      </div>

      {/* Quick Actions */}
      <MotionDiv 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Actions rapides</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MotionDiv 
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 cursor-pointer" onClick={() => router.push('/vehicles')}>
                <div className="rounded-full bg-green-100 p-4 w-14 h-14 flex items-center justify-center mb-4">
                  <FiTruck size={24} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Louer un véhicule</h3>
                <p className="text-gray-500 text-sm mb-4">Parcourez notre flotte et réservez votre prochain véhicule</p>
                <div className="flex items-center text-green-600 font-medium text-sm">
                  <span>Explorer</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </MotionDiv>
            
            <MotionDiv 
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 cursor-pointer"
              onClick={() => router.push('/dashboard/reservations')}>
                <div className="rounded-full bg-blue-100 p-4 w-14 h-14 flex items-center justify-center mb-4">
                  <FiCalendar size={24} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Vos réservations</h3>
                <p className="text-gray-500 text-sm mb-4">Gérez vos réservations actuelles et passées</p>
                <div className="flex items-center text-blue-600 font-medium text-sm">
                  <span>Gérer</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </MotionDiv>
            
            <MotionDiv 
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 cursor-pointer"
              onClick={() => router.push('/subscription-plans')}>
                <div className="rounded-full bg-purple-100 p-4 w-14 h-14 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Abonnements</h3>
                <p className="text-gray-500 text-sm mb-4">Découvrez nos formules d&apos;abonnement avantageuses</p>
                <div className="flex items-center text-purple-600 font-medium text-sm">
                  <span>Découvrir</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </MotionDiv>
            
            <MotionDiv 
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 cursor-pointer"
              onClick={() => router.push('/dashboard/profile')}>
                <div className="rounded-full bg-amber-100 p-4 w-14 h-14 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Votre profil</h3>
                <p className="text-gray-500 text-sm mb-4">Mettez à jour vos informations personnelles</p>
                <div className="flex items-center text-amber-600 font-medium text-sm">
                  <span>Modifier</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </MotionDiv>
          </div>
        </div>
      </MotionDiv>
    </DashboardLayout>
  );
};

export default Dashboard;