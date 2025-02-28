import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { FiCreditCard, FiDownload, FiFilter } from 'react-icons/fi';
import { motion } from 'framer-motion';

// Types pour les données
interface Payment {
  id: number;
  amount: number;
  method: 'credit_card' | 'paypal' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  date: string;
  associatedWith?: 'reservation' | 'subscription';
  details?: {
    vehicleModel?: string;
    subscriptionPlan?: string;
    reservationDates?: string;
  }
}

const PaymentsPage = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, completed, pending, refunded

  // Pour le filtrage par date
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }

    // Simuler le chargement des données (remplacer par appel API réel)
    setTimeout(() => {
      setPayments([
        {
          id: 1,
          amount: 250,
          method: 'credit_card',
          status: 'completed',
          date: '2023-07-10',
          associatedWith: 'reservation',
          details: {
            vehicleModel: 'Tesla Model 3',
            reservationDates: '15 Juillet - 18 Juillet 2023'
          }
        },
        {
          id: 2,
          amount: 120,
          method: 'paypal',
          status: 'completed',
          date: '2023-06-05',
          associatedWith: 'reservation',
          details: {
            vehicleModel: 'BMW i8',
            reservationDates: '05 Juin - 08 Juin 2023'
          }
        },
        {
          id: 3,
          amount: 99.99,
          method: 'bank_transfer',
          status: 'pending',
          date: '2023-08-15',
          associatedWith: 'subscription',
          details: {
            subscriptionPlan: 'Premium Mensuel'
          }
        },
        {
          id: 4,
          amount: 150,
          method: 'credit_card',
          status: 'refunded',
          date: '2023-05-20',
          associatedWith: 'reservation',
          details: {
            vehicleModel: 'Audi e-tron',
            reservationDates: '25 Mai - 28 Mai 2023'
          }
        },
        {
          id: 5,
          amount: 399.99,
          method: 'credit_card',
          status: 'completed',
          date: '2023-07-01',
          associatedWith: 'subscription',
          details: {
            subscriptionPlan: 'Premium Trimestriel'
          }
        }
      ]);
      setLoading(false);
    }, 1000);
  }, [user, isLoading, router]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = (status: string) => {
    switch(status) {
      case 'completed': return 'Payé';
      case 'pending': return 'En attente';
      case 'failed': return 'Échoué';
      case 'refunded': return 'Remboursé';
      default: return status;
    }
  };

  const getMethodText = (method: string) => {
    switch(method) {
      case 'credit_card': return 'Carte de crédit';
      case 'paypal': return 'PayPal';
      case 'bank_transfer': return 'Virement bancaire';
      default: return method;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getFilteredPayments = () => {
    let filtered = [...payments];

    // Filtrer par statut
    if (filter !== 'all') {
      filtered = filtered.filter(payment => payment.status === filter);
    }

    // Filtrer par date
    if (startDate) {
      filtered = filtered.filter(payment => new Date(payment.date) >= new Date(startDate));
    }
    
    if (endDate) {
      filtered = filtered.filter(payment => new Date(payment.date) <= new Date(endDate));
    }

    return filtered;
  };

  const getTotalAmount = (status: string = 'all') => {
    if (status === 'all') {
      return payments
        .filter(p => p.status === 'completed')
        .reduce((sum, payment) => sum + payment.amount, 0);
    }
    return payments
      .filter(p => p.status === status)
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-gray-900">Historique des paiements</h1>
          <p className="text-gray-600 mt-1">Consultez l&apos;historique de vos paiements et factures</p>
        </motion.div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <FiCreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total payé</p>
                <p className="text-xl font-semibold">{getTotalAmount().toFixed(2)}€</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <FiCreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Paiements complétés</p>
                <p className="text-xl font-semibold">{payments.filter(p => p.status === 'completed').length}</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <FiCreditCard className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">En attente</p>
                <p className="text-xl font-semibold">{getTotalAmount('pending').toFixed(2)}€</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <FiCreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Remboursements</p>
                <p className="text-xl font-semibold">{getTotalAmount('refunded').toFixed(2)}€</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filtres et tableau de paiements */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bg-white rounded-xl shadow-sm mb-8 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <FiFilter className="text-gray-400" />
              <h3 className="text-gray-700 font-medium">Filtres</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  id="status-filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="completed">Payés</option>
                  <option value="pending">En attente</option>
                  <option value="refunded">Remboursés</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  id="start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin
                </label>
                <input
                  type="date"
                  id="end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Liste des paiements */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Historique des transactions</h3>
            <button 
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none"
            >
              <FiDownload className="mr-1.5 h-4 w-4" />
              Exporter
            </button>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-600">Chargement de vos paiements...</p>
                </div>
              </div>
            ) : (
              <>
                {getFilteredPayments().length === 0 ? (
                  <div className="text-center py-16">
                    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-indigo-100">
                      <FiCreditCard className="h-12 w-12 text-indigo-500" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun paiement trouvé</h3>
                    <p className="mt-2 text-gray-500">Ajustez vos filtres ou essayez une nouvelle recherche.</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Référence
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Montant
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Méthode
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Détails
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredPayments().map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">#{payment.id.toString().padStart(5, '0')}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(payment.date)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{payment.amount.toFixed(2)}€</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                <FiCreditCard className="h-4 w-4 text-indigo-600" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{getMethodText(payment.method)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {payment.associatedWith === 'reservation' 
                                ? payment.details?.vehicleModel 
                                : payment.details?.subscriptionPlan}
                            </div>
                            <div className="text-xs text-gray-500">
                              {payment.associatedWith === 'reservation'
                                ? payment.details?.reservationDates
                                : payment.associatedWith === 'subscription'
                                  ? 'Abonnement'
                                  : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                              {getStatusText(payment.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => router.push(`/dashboard/payments/${payment.id}`)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Voir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default PaymentsPage;
