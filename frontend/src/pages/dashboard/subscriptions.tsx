import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { motion } from 'framer-motion';

// Types pour les données
type SubscriptionStatus = 'active' | 'expired' | 'canceled' | 'pending_renewal';

interface Subscription {
  id: number;
  plan_name: string;
  start_date: string;
  end_date: string;
  price: number;
  status: SubscriptionStatus;
  auto_renew: boolean;
  features: string[];
}

const SubscriptionsPage = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }

    // Simuler le chargement des données (remplacer par appel API réel)
    setTimeout(() => {
      setSubscriptions([
        {
          id: 1,
          plan_name: 'Premium Mensuel',
          start_date: '2023-07-01',
          end_date: '2023-08-01',
          price: 99.99,
          status: 'active',
          auto_renew: true,
          features: [
            'Accès à tous les véhicules premium',
            'Kilométrage illimité',
            'Support prioritaire 24/7'
          ]
        },
        {
          id: 2,
          plan_name: 'Eco Trimestriel',
          start_date: '2023-04-15',
          end_date: '2023-07-15',
          price: 199.99,
          status: 'pending_renewal',
          auto_renew: true,
          features: [
            'Accès aux véhicules électriques',
            'Kilométrage limité à 1000km/mois',
            'Support standard'
          ]
        },
        {
          id: 3,
          plan_name: 'Business Annuel',
          start_date: '2022-08-01',
          end_date: '2023-08-01',
          price: 1299.99,
          status: 'canceled',
          auto_renew: false,
          features: [
            'Accès à tous les types de véhicules',
            'Kilométrage illimité',
            'Support prioritaire 24/7',
            'Assurance tous risques incluse'
          ]
        }
      ]);
      setLoading(false);
    }, 1000);
  }, [user, isLoading, router]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending_renewal': return 'bg-yellow-100 text-yellow-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = (status: string) => {
    switch(status) {
      case 'active': return 'Actif';
      case 'pending_renewal': return 'Renouvellement en attente';
      case 'canceled': return 'Annulé';
      case 'expired': return 'Expiré';
      default: return status;
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

  const getRemainingDays = (endDateStr: string) => {
    const endDate = new Date(endDateStr);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const toggleAutoRenew = (id: number) => {
    // Dans une implémentation réelle, appeler l'API pour changer l'état de renouvellement automatique
    const updatedSubscriptions = subscriptions.map(sub =>
      sub.id === id ? { ...sub, auto_renew: !sub.auto_renew } : sub
    );
    // Utiliser une assertion de type pour aider TypeScript à comprendre que le résultat est bien de type Subscription[]
    setSubscriptions(updatedSubscriptions as Subscription[]);
  };

  const cancelSubscription = (id: number) => {
    // Dans une implémentation réelle, appeler l'API pour annuler l'abonnement
    const updatedSubscriptions = subscriptions.map(sub =>
      sub.id === id ? { ...sub, status: 'canceled' as SubscriptionStatus, auto_renew: false } : sub
    );
    setSubscriptions(updatedSubscriptions);
  };

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vos abonnements</h1>
        <p className="text-gray-600 mt-1">Gérez vos abonnements actifs et passés</p>
        </div>
      </motion.div>

      {/* Abonnements */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Chargement de vos abonnements...</p>
          </div>
        </div>
      ) : subscriptions.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-indigo-100">
              <FiRefreshCw className="h-12 w-12 text-indigo-500" />
            </div>
          </div>
          <h3 className="mt-6 text-lg font-medium text-gray-900">Aucun abonnement trouvé</h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">
            Vous n&pos;avez actuellement aucun abonnement actif ou passé. Découvrez nos plans pour profiter de nos meilleurs véhicules.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/subscription-plans')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Explorer les abonnements
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {subscriptions.map((subscription, index) => (
            <motion.div 
              key={subscription.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  <div className="p-6 lg:w-2/3">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{subscription.plan_name}</h3>
                        <span className={`mt-2 inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                          {getStatusText(subscription.status)}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{subscription.price.toFixed(2)}€</p>
                    </div>
                    
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-500">Date de début</span>
                        <span className="text-sm font-medium">{formatDate(subscription.start_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Date de fin</span>
                        <span className="text-sm font-medium">{formatDate(subscription.end_date)}</span>
                      </div>
                      
                      {subscription.status === 'active' && (
                        <div className="mt-4">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-indigo-600 h-2.5 rounded-full" 
                              style={{ 
                                width: `${Math.max(0, Math.min(100, 100 - (getRemainingDays(subscription.end_date) / 30) * 100))}%` 
                              }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {getRemainingDays(subscription.end_date) <= 0
                              ? 'Expire aujourd\'hui!'
                              : `Expire dans ${getRemainingDays(subscription.end_date)} jours`}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-2">Inclus dans votre abonnement:</h4>
                      <ul className="space-y-1">
                        {subscription.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <FiCheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-6 lg:w-1/3 flex flex-col justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Gestion de l&pos;abonnement</h4>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 mr-2">Renouvellement automatique</span>
                          {subscription.auto_renew ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Activé
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              Désactivé
                            </span>
                          )}
                        </div>
                        
                        {subscription.status === 'active' && (
                          <button
                            onClick={() => toggleAutoRenew(subscription.id)}
                            className="text-xs text-indigo-600 hover:text-indigo-800"
                          >
                            {subscription.auto_renew ? 'Désactiver' : 'Activer'}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      <button
                        onClick={() => router.push(`/dashboard/subscriptions/${subscription.id}`)}
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        Voir les détails
                      </button>
                      
                      {subscription.status === 'active' && (
                        <button
                          onClick={() => cancelSubscription(subscription.id)}
                          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                        >
                          Annuler l&apos;abonnement
                        </button>
                      )}
                      
                      {subscription.status === 'expired' || subscription.status === 'canceled' ? (
                        <button
                          onClick={() => router.push('/subscription-plans')}
                          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                        >
                          Souscrire à nouveau
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex justify-center mt-8">
              <button
                onClick={() => router.push('/subscription-plans')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Découvrir d&apos;autres abonnements
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SubscriptionsPage;
